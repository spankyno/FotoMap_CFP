import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import tokml from "tokml";
import JSZip from "jszip";
import { PhotoData } from "../types";

export const exportToExcel = (photos: PhotoData[]) => {
  const data = photos.map((p) => ({
    Nombre: p.name,
    Tamaño: (p.size / 1024).toFixed(2) + " KB",
    Fecha: p.date || "N/A",
    Latitud: p.lat,
    Longitud: p.lng,
    Altitud: p.alt || "",
    Cámara: p.make || "",
    Modelo: p.model || "",
    ISO: p.iso || "",
    Velocidad: p.speed || "",
    Apertura: p.aperture || "",
  }));

  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Fotos");
  const wbout = write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "fotomap_export.xlsx");
};

export const toGeoJSON = (photos: PhotoData[]) => {
  return {
    type: "FeatureCollection",
    features: photos
      .filter((p) => p.lat !== null && p.lng !== null)
      .map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
        properties: {
          name: p.name,
          date: p.date,
          alt: p.alt,
          make: p.make,
          model: p.model,
        },
      })),
  };
};

export const exportToGeoJSON = (photos: PhotoData[]) => {
  const blob = new Blob([JSON.stringify(toGeoJSON(photos))], { type: "application/json" });
  saveAs(blob, "fotomap.geojson");
};

export const exportToKML = (photos: PhotoData[]) => {
  const kml = tokml(toGeoJSON(photos));
  const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
  saveAs(blob, "fotomap.kml");
};

// ── Shapefile writer nativo para el navegador (sin dependencias de Node.js) ───
// Implementa el formato ESRI Shapefile (punto 2D) + DBF + PRJ + SHX
// Especificación: https://www.esri.com/content/dam/esrisites/sitecore-archive/Files/Pdfs/library/whitepapers/pdfs/shapefile.pdf

function writeShp(points: { x: number; y: number }[]): ArrayBuffer {
  const recordLen = 28;          // 8 cabecera + 20 contenido (tipo+X+Y)
  const fileLen = 100 + recordLen * points.length;
  const buf = new ArrayBuffer(fileLen);
  const v = new DataView(buf);

  // Cabecera de archivo (100 bytes, big-endian salvo versión y tipo)
  v.setInt32(0, 9994);           // file code
  v.setInt32(24, fileLen / 2);   // file length en words de 16 bits
  v.setInt32(28, 1000, true);    // version
  v.setInt32(32, 1, true);       // shape type: Point

  // Bounding box
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const xmin = points.length ? Math.min(...xs) : 0;
  const ymin = points.length ? Math.min(...ys) : 0;
  const xmax = points.length ? Math.max(...xs) : 0;
  const ymax = points.length ? Math.max(...ys) : 0;
  v.setFloat64(36, xmin, true);
  v.setFloat64(44, ymin, true);
  v.setFloat64(52, xmax, true);
  v.setFloat64(60, ymax, true);

  // Registros
  let offset = 100;
  points.forEach((p, i) => {
    v.setInt32(offset, i + 1);        // record number (1-based, big-endian)
    v.setInt32(offset + 4, 10);       // content length en words (20 bytes / 2)
    v.setInt32(offset + 8, 1, true);  // shape type Point
    v.setFloat64(offset + 12, p.x, true);
    v.setFloat64(offset + 20, p.y, true);
    offset += recordLen;
  });
  return buf;
}

function writeShx(count: number): ArrayBuffer {
  const fileLen = 100 + count * 8;
  const buf = new ArrayBuffer(fileLen);
  const v = new DataView(buf);
  v.setInt32(0, 9994);
  v.setInt32(24, fileLen / 2);
  v.setInt32(28, 1000, true);
  v.setInt32(32, 1, true);
  for (let i = 0; i < count; i++) {
    v.setInt32(100 + i * 8, (100 + i * 28) / 2); // offset en words
    v.setInt32(100 + i * 8 + 4, 10);              // content length en words
  }
  return buf;
}

function writeDbf(rows: Record<string, string | number | null>[]): ArrayBuffer {
  if (rows.length === 0) return new ArrayBuffer(0);
  const fields = Object.keys(rows[0]);
  const fieldSize = 64; // tamaño fijo de campo de texto
  const headerSize = 32 + fields.length * 32 + 1;
  const recordSize = 1 + fields.length * fieldSize;
  const buf = new ArrayBuffer(headerSize + recordSize * rows.length + 1);
  const v = new DataView(buf);
  const enc = new TextEncoder();

  v.setUint8(0, 0x03); // dBASE III
  const now = new Date();
  v.setUint8(1, now.getFullYear() - 1900);
  v.setUint8(2, now.getMonth() + 1);
  v.setUint8(3, now.getDate());
  v.setUint32(4, rows.length, true);
  v.setUint16(8, headerSize, true);
  v.setUint16(10, recordSize, true);
  v.setUint8(32 + fields.length * 32, 0x0D); // header terminator

  // Descriptores de campos
  fields.forEach((name, i) => {
    const nameBytes = enc.encode(name.substring(0, 10));
    nameBytes.forEach((b, j) => v.setUint8(32 + i * 32 + j, b));
    v.setUint8(32 + i * 32 + 11, 0x43); // 'C' = character
    v.setUint8(32 + i * 32 + 16, fieldSize);
  });

  // Registros
  let offset = headerSize;
  rows.forEach(row => {
    v.setUint8(offset, 0x20); // delete flag (space = not deleted)
    offset++;
    fields.forEach(f => {
      const val = row[f] === null || row[f] === undefined ? '' : String(row[f]);
      const bytes = enc.encode(val.substring(0, fieldSize).padEnd(fieldSize, ' '));
      bytes.forEach(b => { v.setUint8(offset, b); offset++; });
    });
  });

  v.setUint8(offset, 0x1A); // EOF
  return buf;
}

const WGS84_PRJ = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]';

export const exportToShapefile = async (photos: PhotoData[]) => {
  const valid = photos.filter(p => p.lat !== null && p.lng !== null);
  const points = valid.map(p => ({ x: p.lng as number, y: p.lat as number }));
  const rows = valid.map(p => ({
    nombre: p.name,
    fecha: p.date ?? '',
    altitud: p.alt ?? '',
    camara: p.make ?? '',
    modelo: p.model ?? '',
  }));

  const zip = new JSZip();
  zip.file("fotomap.shp", writeShp(points));
  zip.file("fotomap.shx", writeShx(points.length));
  zip.file("fotomap.dbf", writeDbf(rows));
  zip.file("fotomap.prj", WGS84_PRJ);

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  saveAs(blob, "fotomap_shp.zip");
};

// ─── Tile providers sin restricción de Referer ───────────────────────────────
// OpenStreetMap bloquea peticiones desde HTML estático (sin Referer válido).
// CartoDB/Stadia no requieren Referer y son libres para uso público.
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

// ─── Mapa compartible SIN miniaturas (marcadores simples) ────────────────────
export const generateShareableHTML = (photos: PhotoData[]) => {
  const validPhotos = photos.filter((p) => p.lat !== null && p.lng !== null);
  const markersJS = validPhotos.map((p) => {
    const popup = `
      <div style="min-width:180px;font-family:sans-serif">
        <b style="font-size:13px">${escHtml(p.name)}</b><br>
        ${p.date ? `<span style="color:#888;font-size:11px">${escHtml(p.date)}</span><br>` : ""}
        ${p.make || p.model ? `<span style="font-size:11px">📷 ${escHtml((p.make || "") + " " + (p.model || ""))}</span><br>` : ""}
        <span style="font-size:11px">📍 ${p.lat!.toFixed(5)}, ${p.lng!.toFixed(5)}</span>
      </div>`.replace(/`/g, "\\`");

    return `L.marker([${p.lat}, ${p.lng}]).addTo(map).bindPopup(\`${popup}\`);`;
  }).join("\n        ");

  const center = validPhotos.length > 0
    ? `[${validPhotos[0].lat}, ${validPhotos[0].lng}]`
    : "[40.4168, -3.7038]";

  const html = buildHTMLShell({
    title: "FotoMap – Marcadores",
    bodyExtra: "",
    scriptExtra: `
        const map = L.map('map').setView(${center}, 6);
        L.tileLayer('${TILE_URL}', {
            attribution: '${TILE_ATTR}',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        ${markersJS}

        const allMarkers = L.featureGroup(
            ${JSON.stringify(validPhotos.map((p) => [p.lat, p.lng]))}
            .map(([lat, lng]) => L.marker([lat, lng]))
        );
        if (${validPhotos.length} > 0) map.fitBounds(allMarkers.getBounds(), { padding: [40, 40] });
    `,
  });

  saveAs(new Blob([html], { type: "text/html" }), "fotomap_marcadores.html");
};

// ─── Mapa compartible CON miniaturas embebidas en Base64 ─────────────────────
export const generateShareableHTMLWithThumbs = (photos: PhotoData[]) => {
  const validPhotos = photos.filter((p) => p.lat !== null && p.lng !== null);

  const markersJS = validPhotos.map((p) => {
    const imgSrc = p.thumbnail || "";
    const imgTag = imgSrc
      ? `<img src="${imgSrc}" style="width:100%;max-width:200px;border-radius:6px;margin-bottom:6px;display:block" />`
      : "";
    const popup = `
      <div style="min-width:200px;font-family:sans-serif">
        ${imgTag}
        <b style="font-size:13px">${escHtml(p.name)}</b><br>
        ${p.date ? `<span style="color:#888;font-size:11px">${escHtml(p.date)}</span><br>` : ""}
        ${p.make || p.model ? `<span style="font-size:11px">📷 ${escHtml((p.make || "") + " " + (p.model || ""))}</span><br>` : ""}
        <span style="font-size:11px">📍 ${p.lat!.toFixed(5)}, ${p.lng!.toFixed(5)}</span>
      </div>`.replace(/`/g, "\\`").replace(/\n/g, "");

    return `L.marker([${p.lat}, ${p.lng}]).addTo(map).bindPopup(\`${popup}\`, {maxWidth: 220});`;
  }).join("\n        ");

  const center = validPhotos.length > 0
    ? `[${validPhotos[0].lat}, ${validPhotos[0].lng}]`
    : "[40.4168, -3.7038]";

  const html = buildHTMLShell({
    title: "FotoMap – Con miniaturas",
    bodyExtra: "",
    scriptExtra: `
        const map = L.map('map').setView(${center}, 6);
        L.tileLayer('${TILE_URL}', {
            attribution: '${TILE_ATTR}',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        ${markersJS}

        const allMarkers = L.featureGroup(
            ${JSON.stringify(validPhotos.map((p) => [p.lat, p.lng]))}
            .map(([lat, lng]) => L.marker([lat, lng]))
        );
        if (${validPhotos.length} > 0) map.fitBounds(allMarkers.getBounds(), { padding: [40, 40] });
    `,
  });

  saveAs(new Blob([html], { type: "text/html" }), "fotomap_con_miniaturas.html");
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function escHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildHTMLShell({ title, bodyExtra, scriptExtra }: { title: string; bodyExtra: string; scriptExtra: string }): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; }
    #map { height: 100vh; width: 100vw; }
    .leaflet-popup-content-wrapper { border-radius: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  ${bodyExtra}
  <script>
    ${scriptExtra}
  </script>
</body>
</html>`;
}

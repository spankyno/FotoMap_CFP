import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import tokml from "tokml";
import shpwrite from "shp-write";
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

export const exportToShapefile = (photos: PhotoData[]) => {
  // shpwrite.download() usa location.href con data URI, bloqueado en navegadores modernos.
  // Usamos zip() que devuelve un Uint8Array y lo descargamos con file-saver.
  const zipData = shpwrite.zip(toGeoJSON(photos), { folder: "fotomap_shp", types: { point: "fotomap" } });
  const blob = new Blob([zipData], { type: "application/zip" });
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

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
        geometry: {
          type: "Point",
          coordinates: [p.lng, p.lat],
        },
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
  const geojson = toGeoJSON(photos);
  const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
  saveAs(blob, "fotomap.geojson");
};

export const exportToKML = (photos: PhotoData[]) => {
  const geojson = toGeoJSON(photos);
  const kml = tokml(geojson);
  const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
  saveAs(blob, "fotomap.kml");
};

export const exportToShapefile = (photos: PhotoData[]) => {
  const geojson = toGeoJSON(photos);
  // shpwrite.download expects a geojson FeatureCollection
  shpwrite.download(geojson, { folder: 'fotomap_shp', types: { point: 'fotomap' } });
};

export const generateShareableHTML = (photos: PhotoData[]) => {
  const geojson = toGeoJSON(photos);
  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>FOTOMAP - Mapa Compartido</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; }
        #map { height: 100vh; width: 100vw; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        const geojsonData = ${JSON.stringify(geojson)};
        const map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const layer = L.geoJSON(geojsonData, {
            onEachFeature: (feature, layer) => {
                layer.bindPopup('<b>' + feature.properties.name + '</b><br>' + (feature.properties.date || ''));
            }
        }).addTo(map);

        if (geojsonData.features.length > 0) {
            map.fitBounds(layer.getBounds());
        }
    </script>
</body>
</html>
  `;
  const blob = new Blob([htmlTemplate], { type: "text/html" });
  saveAs(blob, "fotomap_shareable.html");
};

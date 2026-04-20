import ExifReader from "exifreader";
import { PhotoData } from "../types";

export const processPhoto = async (file: File): Promise<PhotoData | null> => {
  try {
    const data = await ExifReader.load(file);
    
    // Extract GPS
    // GPSLatitude/GPSLongitude.description gives an unsigned decimal degree value.
    // We must apply the hemisphere reference (N/S, E/W) to get the correct sign.
    const rawLat = data.GPSLatitude ? (data.GPSLatitude.description as any) : null;
    const rawLng = data.GPSLongitude ? (data.GPSLongitude.description as any) : null;
    // .description devuelve "North latitude" / "West longitude" (texto largo),
    // hay que usar .value[0] que sí devuelve "N", "S", "E" o "W"
    const latRef = data.GPSLatitudeRef ? (data.GPSLatitudeRef.value as any)[0] : 'N';
    const lngRef = data.GPSLongitudeRef ? (data.GPSLongitudeRef.value as any)[0] : 'E';
    const lat = typeof rawLat === 'number' ? (latRef === 'S' ? -rawLat : rawLat) : null;
    const lng = typeof rawLng === 'number' ? (lngRef === 'W' ? -rawLng : rawLng) : null;
    const alt = data.GPSAltitude ? parseFloat(data.GPSAltitude.description) : null;
    
    // Extract Metadata
    const date = data.DateTimeOriginal ? data.DateTimeOriginal.description : (data.DateTime ? data.DateTime.description : null);
    const make = data.Make ? data.Make.description : null;
    const model = data.Model ? data.Model.description : null;
    const iso = data.ISOSpeedRatings ? parseInt(data.ISOSpeedRatings.description) : null;
    const speed = data.ExposureTime ? data.ExposureTime.description : null;
    const aperture = data.FNumber ? data.FNumber.description : null;

    // Generar miniatura pequeña (galería/marcadores) y versión grande (visor)
    const [thumbnail, fullImage] = await Promise.all([
      generateResized(file, 200, 0.75),
      generateResized(file, 1920, 0.92),
    ]);

    return {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      lat,
      lng,
      alt,
      date,
      make,
      model,
      iso,
      speed,
      aperture,
      thumbnail,
      fullImage,
      file
    };
  } catch (err) {
    console.error(`Error processing ${file.name}:`, err);
    return null;
  }
};

/**
 * Redimensiona una imagen al tamaño máximo indicado manteniendo el ratio.
 * @param file   Archivo de imagen original
 * @param maxPx  Lado máximo (ancho o alto) en píxeles
 * @param quality Calidad JPEG (0–1)
 */
const generateResized = (file: File, maxPx: number, quality: number): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Solo reducir, nunca ampliar
        if (width > maxPx || height > maxPx) {
          if (width >= height) {
            height = Math.round((height * maxPx) / width);
            width = maxPx;
          } else {
            width = Math.round((width * maxPx) / height);
            height = maxPx;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

import ExifReader from "exifreader";
import { PhotoData } from "../types";

export const processPhoto = async (file: File): Promise<PhotoData | null> => {
  try {
    const data = await ExifReader.load(file);
    
    // Extract GPS
    const lat = data.GPSLatitude ? (data.GPSLatitude.description as any) : null;
    const lng = data.GPSLongitude ? (data.GPSLongitude.description as any) : null;
    const alt = data.GPSAltitude ? parseFloat(data.GPSAltitude.description) : null;
    
    // Extract Metadata
    const date = data.DateTimeOriginal ? data.DateTimeOriginal.description : (data.DateTime ? data.DateTime.description : null);
    const make = data.Make ? data.Make.description : null;
    const model = data.Model ? data.Model.description : null;
    const iso = data.ISOSpeedRatings ? parseInt(data.ISOSpeedRatings.description) : null;
    const speed = data.ExposureTime ? data.ExposureTime.description : null;
    const aperture = data.FNumber ? data.FNumber.description : null;

    // Generate Thumbnail
    const thumbnail = await generateThumbnail(file);

    return {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      lat: typeof lat === 'number' ? lat : null,
      lng: typeof lng === 'number' ? lng : null,
      alt,
      date,
      make,
      model,
      iso,
      speed,
      aperture,
      thumbnail,
      file
    };
  } catch (err) {
    console.error(`Error processing ${file.name}:`, err);
    return null;
  }
};

const generateThumbnail = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

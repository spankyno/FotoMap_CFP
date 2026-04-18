import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAppStore } from "../../stores/useAppStore";
import { processPhoto } from "../../utils/exif";
import { Upload, FilePlus, AlertCircle } from "lucide-react";
import { Card } from "../ui/card";
import { toast } from "sonner";

export const Dropzone = () => {
  const { addPhotos, addLog } = useAppStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    addLog(`Iniciando procesamiento de ${acceptedFiles.length} archivos...`);
    
    let processedCount = 0;
    let validCount = 0;
    let invalidCount = 0;

    const results = [];
    for (const file of acceptedFiles) {
      if (file.type.startsWith("image/")) {
        const data = await processPhoto(file);
        if (data) {
          if (data.lat !== null && data.lng !== null) {
            results.push(data);
            validCount++;
          } else {
            addLog(`Imagen sin GPS: ${file.name}`);
            invalidCount++;
          }
        }
      } else {
        addLog(`Archivo no válido: ${file.name}`);
      }
      processedCount++;
    }

    addPhotos(results);
    addLog(`Procesamiento finalizado. Válidas: ${validCount}, Sin GPS: ${invalidCount}`);
    
    if (validCount > 0) {
        toast.success(`Cargadas ${validCount} imágenes con geolocalización.`);
    }
    if (invalidCount > 0) {
        toast.warning(`${invalidCount} imágenes no tenían datos GPS.`);
    }
  }, [addPhotos, addLog]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
    },
  } as any);

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragActive ? "border-primary bg-primary/10" : "border-border bg-card/50 hover:border-primary/50"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-6 h-6 mx-auto mb-2 text-primary" />
      <p className="text-sm font-semibold text-foreground">Arrastrar imágenes o carpetas</p>
      <p className="text-[11px] text-muted-foreground mt-1">
        JPG/PNG con metadatos EXIF
      </p>
    </div>
  );
};

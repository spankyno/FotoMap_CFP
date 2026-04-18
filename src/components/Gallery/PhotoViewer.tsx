import React, { useEffect } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useAppStore } from "../../stores/useAppStore";
import { X } from "lucide-react";

export const PhotoViewer = () => {
  const { selectedPhoto, setSelectedPhoto } = useAppStore();

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhoto(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setSelectedPhoto]);

  if (!selectedPhoto) return null;

  return (
    <DialogPrimitive.Root open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm"
        />

        {/* Popup: ocupa toda la pantalla, centra la imagen */}
        <DialogPrimitive.Popup
          className="fixed inset-0 z-[1000] flex items-center justify-center outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            Visualización de foto: {selectedPhoto.name}
          </DialogPrimitive.Title>

          {/* Imagen — ocupa hasta el 95% del viewport en cada eje */}
          <img
            src={selectedPhoto.thumbnail || ""}
            alt={selectedPhoto.name}
            className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain shadow-2xl rounded-sm"
            referrerPolicy="no-referrer"
          />

          {/* Botón cerrar */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm z-50"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

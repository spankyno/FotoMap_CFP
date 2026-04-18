import React from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { useAppStore } from "../../stores/useAppStore";
import { X } from "lucide-react";

export const PhotoViewer = () => {
  const { selectedPhoto, setSelectedPhoto } = useAppStore();

  if (!selectedPhoto) return null;

  return (
    <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden bg-black/95 border-none shadow-none flex items-center justify-center"
      >
        <DialogTitle className="sr-only">Visualización de foto: {selectedPhoto.name}</DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={selectedPhoto.thumbnail || ""}
            alt={selectedPhoto.name}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm z-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

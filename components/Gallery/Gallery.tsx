import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import { Card } from "../ui/card";
import { Camera, MapPin, Calendar, ZoomIn, LayoutGrid, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export const Gallery = () => {
  const { photos, setViewMode, setFocusedPhotoId, setSelectedPhoto } = useAppStore();

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
        <LayoutGrid className="w-12 h-12 opacity-20" />
        <p className="text-lg font-medium tracking-tight">Carga algunas fotos para empezar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-8">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.03, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card className="group relative overflow-hidden bg-zinc-900/50 border-zinc-800/50 hover:border-primary/50 transition-all duration-500 rounded-xl">
            {photo.thumbnail ? (
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={photo.thumbnail} 
                  alt={photo.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button 
                        onClick={() => {
                            if (photo.lat) {
                                setFocusedPhotoId(photo.id);
                                setViewMode("map");
                            } else {
                                toast.error("Esta foto no tiene coordenadas GPS");
                            }
                        }}
                        className="p-3 rounded-full bg-white/10 hover:bg-primary text-white hover:text-primary-foreground transition-all hover:scale-110 active:scale-95"
                        title="Ver en el mapa"
                    >
                        <MapPin className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setSelectedPhoto(photo)}
                        className="p-3 rounded-full bg-white/10 hover:bg-zinc-100 text-white hover:text-black transition-all hover:scale-110 active:scale-95"
                        title="Ampliar foto"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-muted flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="p-3 space-y-2">
              <h4 className="text-[11px] font-bold truncate pr-4" title={photo.name}>{photo.name}</h4>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{photo.date?.split(' ')[0].replace(/:/g, '/') || 'S/F'}</span>
                </div>
                {photo.lat && (
                    <div className="flex items-center gap-1 text-[9px] text-primary/70">
                        <MapPin className="w-3 h-3" />
                        <span>GPS OK</span>
                    </div>
                )}
              </div>
            </div>
            {!photo.lat && (
                <div className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-500 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

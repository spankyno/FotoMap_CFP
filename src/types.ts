export interface PhotoData {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  lat: number | null;
  lng: number | null;
  alt: number | null;
  date: string | null;
  make: string | null;
  model: string | null;
  iso: number | null;
  speed: string | null;
  aperture: string | null;
  thumbnail: string | null;  // Base64 pequeña (200px) — para galería y marcadores
  fullImage: string | null;  // Base64 grande (1920px) — para el visor
  file: File;
}

export interface AppState {
  photos: PhotoData[];
  isValidating: boolean;
  logs: string[];
  viewMode: "map" | "gallery";
  showHeatmap: boolean;
  showRoute: boolean;
  baseLayer: string;
  focusedPhotoId: string | null;
  selectedPhoto: PhotoData | null;
  
  addPhotos: (photos: PhotoData[]) => void;
  setPhotos: (photos: PhotoData[]) => void;
  addLog: (log: string) => void;
  setViewMode: (mode: "map" | "gallery") => void;
  setShowHeatmap: (show: boolean) => void;
  setShowRoute: (show: boolean) => void;
  setBaseLayer: (layer: string) => void;
  setFocusedPhotoId: (id: string | null) => void;
  setSelectedPhoto: (photo: PhotoData | null) => void;
}

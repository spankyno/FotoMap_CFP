import { create } from "zustand";
import { AppState, PhotoData } from "../types";

export const useAppStore = create<AppState>((set) => ({
  photos: [],
  isValidating: false,
  logs: [],
  viewMode: "map",
  showHeatmap: false,
  showRoute: false,
  baseLayer: "osm",

  addPhotos: (newPhotos) => set((state) => ({ photos: [...state.photos, ...newPhotos] })),
  setPhotos: (photos) => set({ photos }),
  addLog: (log) => set((state) => ({ logs: [`[${new Date().toLocaleTimeString()}] ${log}`, ...state.logs].slice(0, 100) })),
  setViewMode: (viewMode) => set({ viewMode }),
  setShowHeatmap: (showHeatmap) => set({ showHeatmap }),
  setShowRoute: (showRoute) => set({ showRoute }),
  setBaseLayer: (baseLayer) => set({ baseLayer }),
  focusedPhotoId: null,
  selectedPhoto: null,
  setFocusedPhotoId: (focusedPhotoId) => set({ focusedPhotoId }),
  setSelectedPhoto: (selectedPhoto) => set({ selectedPhoto }),
}));

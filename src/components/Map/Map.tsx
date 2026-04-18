import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "./MarkerClusterGroup";
import HeatmapLayer from "./HeatmapLayer";
import { useAppStore } from "../../stores/useAppStore";
import { useUser } from "@clerk/clerk-react";
import { PhotoData } from "../../types";
import { Card } from "../ui/card";
import { Camera, MapPin, Calendar, ZoomIn } from "lucide-react";

// @ts-ignore
import icon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Ajusta el mapa a los bounds cuando cambia la lista de fotos
const MapEvents = ({ photos }: { photos: PhotoData[] }) => {
  const map = useMap();
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const validPhotos = photos.filter((p) => p.lat !== null && p.lng !== null);
    if (validPhotos.length > 0 && validPhotos.length !== prevLengthRef.current) {
      prevLengthRef.current = validPhotos.length;
      const bounds = L.latLngBounds(validPhotos.map((p) => [p.lat as number, p.lng as number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [photos, map]);

  return null;
};

// Componente dedicado al flyTo — usa useMap() garantizando que el mapa ya está montado
const FlyToFocused = ({
  validPhotos,
  markersRef,
}: {
  validPhotos: PhotoData[];
  markersRef: React.MutableRefObject<{ [key: string]: L.Marker }>;
}) => {
  const map = useMap();
  const { focusedPhotoId, setFocusedPhotoId } = useAppStore();

  useEffect(() => {
    if (!focusedPhotoId) return;

    const photo = validPhotos.find((p) => p.id === focusedPhotoId);
    if (photo && photo.lat !== null && photo.lng !== null) {
      map.flyTo([photo.lat, photo.lng], 18, {
        duration: 1.5,
        easeLinearity: 0.25,
      });

      // Abrir popup tras esperar a que termine la animación
      const popupTimer = setTimeout(() => {
        const marker = markersRef.current[photo.id];
        if (marker) marker.openPopup();
      }, 1600);

      const clearTimer = setTimeout(() => setFocusedPhotoId(null), 6000);

      return () => {
        clearTimeout(popupTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [focusedPhotoId, validPhotos, map, setFocusedPhotoId, markersRef]);

  return null;
};

export const MapView = () => {
  const { photos, showHeatmap, showRoute, focusedPhotoId, setSelectedPhoto } = useAppStore();
  const { isSignedIn } = useUser();

  const allValidPhotos = useMemo(() => photos.filter((p) => p.lat !== null && p.lng !== null), [photos]);
  
  const validPhotos = useMemo(() => {
    if (!isSignedIn && allValidPhotos.length > 50) {
        return allValidPhotos.slice(0, 50);
    }
    return allValidPhotos;
  }, [allValidPhotos, isSignedIn]);

  const markersLimitReached = !isSignedIn && allValidPhotos.length > 50;

  // Ref compartido entre MapView y FlyToFocused para acceder a los markers
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const sortedPhotos = useMemo(() => {
    return [...validPhotos].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return (
        new Date(a.date.replace(/:/g, "-").replace(" ", "T")).getTime() -
        new Date(b.date.replace(/:/g, "-").replace(" ", "T")).getTime()
      );
    });
  }, [validPhotos]);

  const routePoints = useMemo(
    () => sortedPhotos.map((p) => [p.lat as number, p.lng as number] as [number, number]),
    [sortedPhotos]
  );

  const heatmapPoints = useMemo(
    () => validPhotos.map((p) => [p.lat as number, p.lng as number, 1] as [number, number, number]),
    [validPhotos]
  );

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={6}
        className="h-full w-full outline-hidden"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="IGN España (WMTS)">
            <TileLayer
              url="https://www.ign.es/wmts/mapa-raster?request=getTile&layer=MTN&tilematrixset=GoogleMapsCompatible&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image/jpeg"
              attribution="&copy; Instituto Geográfico Nacional"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Clustering">
            <MarkerClusterGroup>
              {validPhotos.map((photo) => (
                <Marker
                  key={photo.id}
                  position={[photo.lat as number, photo.lng as number]}
                  icon={focusedPhotoId === photo.id ? RedIcon : DefaultIcon}
                  ref={(el) => {
                    if (el) markersRef.current[photo.id] = el;
                  }}
                >
                  <Popup className="custom-popup">
                    <Card className="border-0 shadow-none bg-transparent">
                      {photo.thumbnail && (
                        <div
                          className="cursor-pointer group/popup relative overflow-hidden rounded-md mb-2 border border-border"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <img
                            src={photo.thumbnail}
                            alt={photo.name}
                            className="w-full h-auto transition-transform duration-300 group-hover/popup:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover/popup:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover/popup:opacity-100">
                            <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      )}
                      <div className="space-y-1 text-xs">
                        <h4 className="font-bold text-sm mb-1 truncate">{photo.name}</h4>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{photo.date || "Sin fecha"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {photo.lat?.toFixed(5)}, {photo.lng?.toFixed(5)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground pt-1 border-t border-border mt-1">
                          <Camera className="w-3 h-3 mt-0.5" />
                          <div className="grid grid-cols-2 gap-x-2">
                            <span>
                              {photo.make} {photo.model}
                            </span>
                            <span>ISO: {photo.iso}</span>
                            <span>f/{photo.aperture}</span>
                            <span>{photo.speed}s</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </LayersControl.Overlay>

          {showHeatmap && (
            <LayersControl.Overlay checked name="Heatmap Density">
              <HeatmapLayer points={heatmapPoints} />
            </LayersControl.Overlay>
          )}

          {showRoute && sortedPhotos.length > 1 && (
            <LayersControl.Overlay checked name="Recorrido">
              <Polyline positions={routePoints} color="#ef4444" weight={3} opacity={0.7} dashArray="5, 10" />
            </LayersControl.Overlay>
          )}
        </LayersControl>

        {/* Componentes internos que requieren contexto del mapa */}
        <MapEvents photos={validPhotos} />
        <FlyToFocused validPhotos={validPhotos} markersRef={markersRef} />
      </MapContainer>

      {markersLimitReached && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001]">
            <div className="bg-amber-500/90 backdrop-blur-sm text-amber-950 px-4 py-2 rounded-full shadow-lg border border-amber-400 flex items-center gap-2 text-xs font-bold animate-in fade-in zoom-in duration-300">
                <span>⚠️ Límite de 50 fotos para invitados (Total: {allValidPhotos.length})</span>
                <button className="underline hover:no-underline ml-1">Regístrate para ver todas</button>
            </div>
        </div>
      )}
    </div>
  );
};

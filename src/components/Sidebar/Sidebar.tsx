import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import { useUser } from "../../auth/AuthContext";
import { Button } from "../ui/button";
import { 
  Map as MapIcon, 
  LayoutGrid, 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Globe, 
  Share2, 
  Route, 
  Flame,
  LogOut,
  Settings,
  Layers,
  Archive
} from "lucide-react";
import { 
  exportToExcel, 
  exportToGeoJSON, 
  exportToKML, 
  exportToShapefile, 
  generateShareableHTML 
} from "../../utils/export";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

import { Dropzone } from "../Dashboard/Dropzone";
import { LogPanel } from "../Dashboard/LogPanel";

export const Sidebar = () => {
  const { 
    photos, 
    showHeatmap, 
    setShowHeatmap, 
    showRoute, 
    setShowRoute
  } = useAppStore();

  const { isSignedIn } = useUser();

  const handleExport = (type: string) => {
    if (photos.length === 0) {
      toast.error("No hay fotos cargadas para exportar.");
      return;
    }

    // Advanced exports restricted to registered users
    if (!isSignedIn && type !== 'excel') {
        toast.error("Esta exportación requiere estar registrado.");
        return;
    }

    switch (type) {
      case "excel": exportToExcel(photos); break;
      case "geojson": exportToGeoJSON(photos); break;
      case "kml": exportToKML(photos); break;
      case "shp": exportToShapefile(photos); break;
      case "html": generateShareableHTML(photos); break;
    }
    toast.success(`Exportación ${type.toUpperCase()} generada.`);
  };

  return (
    <div className="w-80 h-full border-r border-border bg-[#1e293b] flex flex-col p-5 gap-5 overflow-y-auto z-20">
      <Dropzone />

      <div className="space-y-3">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            Capas del Mapa
        </h3>
        <div className="space-y-3 bg-card/30 p-3 rounded-lg border border-border/50 relative overflow-hidden">
          {!isSignedIn && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Badge variant="secondary" className="text-[9px] bg-[#020617] border-white/10 uppercase tracking-tighter">Solo usuarios</Badge>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label htmlFor="heatmap" className="text-[13px] cursor-pointer flex items-center gap-2 font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Mapa de Calor
            </Label>
            <Switch 
              id="heatmap" 
              checked={showHeatmap} 
              onCheckedChange={setShowHeatmap} 
              className="scale-75"
              disabled={!isSignedIn}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="route" className="text-[13px] cursor-pointer flex items-center gap-2 font-medium">
                <Route className="w-3.5 h-3.5 text-sky-400" />
                Recorrido Cronológico
            </Label>
            <Switch 
              id="route" 
              checked={showRoute} 
              onCheckedChange={setShowRoute}
              className="scale-75"
              disabled={!isSignedIn}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" />
            Log de Procesamiento
        </h3>
        <LogPanel />
      </div>

      <div className="space-y-3 mt-auto">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            Exportar Proyecto
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" className="bg-[#0f172a] border-border/50 hover:bg-[#334155] text-[11px] h-9 gap-2" onClick={() => handleExport("excel")}>
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />
            Excel
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className={`bg-[#0f172a] border-border/50 hover:bg-[#334155] text-[11px] h-9 gap-2 transition-opacity ${!isSignedIn ? 'opacity-40 grayscale' : ''}`} 
            onClick={() => handleExport("geojson")}
          >
            <FileJson className="w-3.5 h-3.5 text-sky-400" />
            GeoJSON
            {!isSignedIn && <div className="absolute top-0 right-0 w-2 h-2 bg-zinc-500 rounded-full -mr-1 -mt-1" />}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className={`bg-[#0f172a] border-border/50 hover:bg-[#334155] text-[11px] h-9 gap-2 transition-opacity ${!isSignedIn ? 'opacity-40 grayscale' : ''}`} 
            onClick={() => handleExport("kml")}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            KML
            {!isSignedIn && <div className="absolute top-0 right-0 w-2 h-2 bg-zinc-500 rounded-full -mr-1 -mt-1" />}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className={`bg-[#0f172a] border-border/50 hover:bg-[#334155] text-[11px] h-9 gap-2 transition-opacity ${!isSignedIn ? 'opacity-40 grayscale' : ''}`} 
            onClick={() => handleExport("shp")}
          >
            <Archive className="w-3.5 h-3.5 text-purple-400" />
            Shapefile
            {!isSignedIn && <div className="absolute top-0 right-0 w-2 h-2 bg-zinc-500 rounded-full -mr-1 -mt-1" />}
          </Button>
          <Button 
            variant="default" 
            className={`col-span-2 bg-[#38bdf8] text-[#020617] hover:bg-[#38bdf8]/90 font-bold h-10 gap-2 shadow-lg shadow-sky-500/10 transition-all ${!isSignedIn ? 'opacity-40 grayscale blur-[0.5px]' : ''}`} 
            onClick={() => handleExport("html")}
          >
            <Share2 className="w-4 h-4" />
            Generar Mapa Compartible
          </Button>
        </div>
      </div>
    </div>
  );
};

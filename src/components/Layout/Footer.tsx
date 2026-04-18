import React from "react";
import { Mail, Info, ExternalLink, Globe, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";

export const Footer = ({ onOpenAbout }: { onOpenAbout: () => void }) => {
  return (
    <footer className="bg-[#0f172a] border-t border-border/50 py-8 px-6 text-zinc-400">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Copyright & Info */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-tight">FotoMap Viewer</h4>
            <p className="text-sm leading-relaxed">
              Visualiza tus recuerdos geolocalizados en un mapa interactivo. 
              Extrae datos EXIF, genera rutas y exporta tus proyectos fácilmente.
            </p>
            <p className="text-xs font-medium text-zinc-500">
              Aitor Sánchez Gutiérrez © 2026 - Reservados todos los derechos
            </p>
          </div>

          {/* Links Seccion 1 */}
          <div className="flex flex-col gap-3 text-sm">
            <h5 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Autor & Proyecto</h5>
            <div className="flex items-center gap-2">
                <span className="text-zinc-500">Autor:</span>
                <span className="text-zinc-200">Aitor Sánchez Gutiérrez</span>
            </div>
            <a href="mailto:https://blog.cottage627@passinbox.com" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              blog.cottage627@passinbox.com
            </a>
            <button 
                onClick={onOpenAbout}
                className="flex items-center gap-2 hover:text-sky-400 transition-colors text-left"
            >
              <Info className="w-3.5 h-3.5" />
              Acerca de FotoMap
            </button>
          </div>

          {/* External Links */}
          <div className="flex flex-col gap-3 text-sm">
            <h5 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Enlaces de Interés</h5>
            <a href="https://blog.cottage627@passinbox.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
              <Globe className="w-3.5 h-3.5" />
              Blog Personal
            </a>
            <a href="https://aitor-blog-contacto.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              Contacto
            </a>
            <a href="https://aitorhub.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Más Aplicaciones
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px]">
          <div className="flex gap-4">
            <span>TypeScript</span>
            <span>React</span>
            <span>Tailwind CSS</span>
            <span>Clerk Auth</span>
            <span>Leaflet</span>
          </div>
          <div className="flex items-center gap-1">
            Diseñado con <span className="text-red-500 mx-0.5">❤️</span> por Aitor Sánchez
          </div>
        </div>
      </div>
    </footer>
  );
};

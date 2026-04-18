import React from "react";
import { useUser } from "@clerk/clerk-react";
import { 
  Cpu, 
  Map, 
  UserCheck, 
  UserX, 
  Layers, 
  Code2, 
  Database, 
  Zap, 
  ShieldCheck, 
  ArrowLeft,
  LayoutDashboard
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export const AboutPage = ({ onClose }: { onClose: () => void }) => {
  const { isSignedIn } = useUser();

  const techStack = [
    {
      title: "React 18 + Vite",
      description: "Núcleo de la aplicación. Proporciona una interfaz reactiva, rápida y optimizada para la mejor experiencia de usuario.",
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      tag: "Framework"
    },
    {
      title: "Tailwind CSS",
      description: "Sistema de diseño basado en utilidades que garantiza una UI moderna, coherente y totalmente responsive.",
      icon: <LayoutDashboard className="w-5 h-5 text-sky-400" />,
      tag: "Styling"
    },
    {
      title: "Clerk Authentication",
      description: "Gestión de identidades segura y escalable. Maneja el login social y la persistencia de sesiones protegidas.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      tag: "Seguridad"
    },
    {
      title: "React Leaflet",
      description: "Integración de mapas interactivos. Permite la renderización de miles de marcadores con alto rendimiento.",
      icon: <Map className="w-5 h-5 text-blue-400" />,
      tag: "Mapping"
    },
    {
      title: "Zustand",
      description: "Gestión de estado global ligera. Controla los datos de las fotos y las preferencias del usuario sincrónicamente.",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      tag: "State management"
    },
    {
      title: "Cloudflare D1 / R2",
      description: "Infraestructura Cloud para almacenamiento de proyectos (SQL) y binarios de alto volumen (Objetos).",
      icon: <Database className="w-5 h-5 text-orange-400" />,
      tag: "Backend"
    }
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-[#020617] overflow-y-auto text-zinc-300 font-sans selection:bg-primary/20">
      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4 -ml-2 text-zinc-500 hover:text-white"
                onClick={onClose}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la App
            </Button>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">Acerca de <span className="text-primary italic">FotoMap</span></h1>
            <p className="text-lg text-zinc-500 max-w-2xl">
              Una herramienta avanzada de análisis geoespacial fotográfico diseñada para convertir colecciones de imágenes en mapas interactivos y datos estructurados.
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-2 border-primary/30 text-primary bg-primary/5 text-sm uppercase tracking-widest font-bold">Version 1.2.0</Badge>
        </div>

        {/* Tech Stack Grid */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Code2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Stack Tecnológico</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, idx) => (
              <Card key={idx} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    {tech.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base text-zinc-100">{tech.title}</CardTitle>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{tech.tag}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-400">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Feature Tiers */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
          {/* Guest Tier */}
          <div className={`p-8 rounded-3xl border ${!isSignedIn ? 'border-amber-500/20 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/30'} flex flex-col`}>
             <div className="flex items-center gap-3 mb-6">
               <UserX className="w-6 h-6 text-zinc-500" />
               <h3 className="text-xl font-bold text-white tracking-tight">Usuarios No Registrados</h3>
             </div>
             <ul className="space-y-4 mb-8 flex-1">
               <li className="flex items-start gap-3 text-sm">
                 <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                 <span className="text-zinc-300">Carga de fotos local y extracción EXIF básica.</span>
               </li>
               <li className="flex items-start gap-3 text-sm">
                 <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                 <span className="text-zinc-300">Exportación a formato <strong>Excel (.xlsx)</strong>.</span>
               </li>
               <li className="flex items-start gap-3 text-sm opacity-60">
                 <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 truncate">!</div>
                 <span className="text-zinc-400">Visualización limitada a <strong>50 fotografías</strong> en el mapa.</span>
               </li>
               <li className="flex items-start gap-3 text-sm opacity-30 line-through">
                 <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center flex-shrink-0 mt-0.5 truncate">✕</div>
                 <span className="text-zinc-500">Capas de calor y recorrido cronológico.</span>
               </li>
             </ul>
          </div>

          {/* Registered Tier */}
          <div className={`p-8 rounded-3xl border ${isSignedIn ? 'border-primary/30 bg-primary/5' : 'border-zinc-800 bg-zinc-900/30'} flex flex-col`}>
             <div className="flex items-center gap-3 mb-6">
               <UserCheck className="w-6 h-6 text-primary" />
               <h3 className="text-xl font-bold text-white tracking-tight">Usuarios Registrados</h3>
             </div>
             <ul className="space-y-4 mb-8 flex-1">
               <li className="flex items-start gap-3 text-sm">
                 <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                 <span className="text-zinc-300">Capacidad de visualizar <strong>ilimitadas fotos</strong> simultáneas.</span>
               </li>
               <li className="flex items-start gap-3 text-sm">
                 <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                 <span className="text-zinc-300">Exportación avanzada: <strong>JSON, KML y Shapefile (GIS)</strong>.</span>
               </li>
               <li className="flex items-start gap-3 text-sm">
                 <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                 <span className="text-zinc-300">Activación de <strong>Capas de Calor</strong> y <strong>Rutas Cronológicas</strong>.</span>
               </li>
               <li className="flex items-start gap-3 text-sm">
                 <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                 <span className="text-zinc-300">Generación de <strong>Mapas Web Compartibles (HTML)</strong>.</span>
               </li>
               <li className="flex items-start gap-3 text-sm">
                 <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                 <span className="text-zinc-300">Próximamente: Persistencia de proyectos en la nube (D1).</span>
               </li>
             </ul>
             {!isSignedIn && (
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12">
                   Registrarse ahora
                </Button>
             )}
          </div>
        </section>

        {/* Footer Area */}
        <div className="text-center">
            <p className="text-zinc-500 text-sm mb-6 underline underline-offset-8 decoration-zinc-800">Diseñado y Desarrollado por Aitor Sánchez Gutiérrez</p>
            <div className="flex justify-center gap-8 text-zinc-400">
               <a href="https://blog.cottage627@passinbox.com" className="hover:text-white transition-colors"><ShieldCheck className="w-5 h-5" /></a>
               <a href="https://aitor-blog-contacto.vercel.app/" className="hover:text-white transition-colors"><Zap className="w-5 h-5" /></a>
            </div>
        </div>

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAppStore } from "./stores/useAppStore";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { MapView } from "./components/Map/Map";
import { Gallery } from "./components/Gallery/Gallery";
import { PhotoViewer } from "./components/Gallery/PhotoViewer";
import { Footer } from "./components/Layout/Footer";
import { AboutPage } from "./components/About/AboutPage";
import { ScrollArea } from "./components/ui/scroll-area";
import { Toaster } from "./components/ui/sonner";
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useAuth
} from "@clerk/clerk-react";
import { Button } from "./components/ui/button";
import { LogIn } from "lucide-react";
import { useState } from "react";

export default function App() {
  const { viewMode, photos, setViewMode } = useAppStore();
  const { isSignedIn } = useAuth();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden">
      {/* Top Navigation */}
      <header className="h-[60px] bg-card border-b border-border flex items-center justify-between px-6 z-100">
        <div className="flex items-center gap-2.5 font-extrabold text-xl tracking-tighter text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          FOTOMAP
        </div>

        <nav className="flex bg-background p-1 rounded-lg gap-1">
          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === "map" ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mapa
          </button>
          <button
            onClick={() => setViewMode("gallery")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === "gallery" ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Galería
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="gap-2 text-xs font-bold border-border/50 hover:bg-primary hover:text-primary-foreground transition-all">
                <LogIn className="w-3.5 h-3.5" />
                Ingresar
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border-2 border-primary/20 hover:border-primary/50 transition-all",
                  userButtonPopoverCard: "bg-card border border-border shadow-xl",
                  userButtonPopoverActionButton: "hover:bg-accent",
                  userButtonPopoverActionButtonText: "text-foreground",
                  userButtonPopoverFooter: "hidden"
                }
              }}
            />
          </SignedIn>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 overflow-hidden bg-[#111] flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            {viewMode === "map" ? (
              <div className="h-full w-full relative">
                <MapView />
              </div>
            ) : (
              <ScrollArea className="h-full w-full bg-zinc-950/50">
                <Gallery />
                <Footer onOpenAbout={() => setShowAbout(true)} />
              </ScrollArea>
            )}
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="h-10 border-t border-border px-6 flex items-center justify-between text-[11px] text-muted-foreground bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
            <div className="flex gap-4">
                <span>Imágenes: {photos.length}</span>
                <span>GPS: {photos.filter((p) => p.lat).length}</span>
                <span>Storage: {(photos.reduce((acc, p) => acc + p.size, 0) / (1024 * 1024)).toFixed(1)} MB (Local)</span>
            </div>
            <button onClick={() => setShowAbout(true)} className="hover:text-primary underline underline-offset-4 decoration-border">Acerca de</button>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isSignedIn ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`} />
          {isSignedIn ? "Autenticado vía Clerk" : "Modo Invitado (Límite: 50 fotos)"}
        </div>
      </footer>

      {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}

      <Toaster position="bottom-right" theme="dark" />
      <PhotoViewer />
    </div>
  );
}

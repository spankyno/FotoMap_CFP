import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import { ScrollArea } from "../ui/scroll-area";
import { Terminal } from "lucide-react";

export const LogPanel = () => {
  const { logs } = useAppStore();

  return (
    <ScrollArea className="bg-[#020617] border border-border rounded-lg p-3 h-36 font-mono text-[11px] leading-relaxed">
      {logs.length === 0 ? (
        <div className="text-muted-foreground italic opacity-50">Esperando actividad...</div>
      ) : (
        logs.map((log, i) => (
          <div 
            key={i} 
            className={`mb-1.5 break-all ${
              log.includes("finalizado") || log.includes("Válidas") || log.includes("completado") 
                ? "text-green-400" 
                : log.includes("sin GPS") || log.includes("Archivo no válido")
                ? "text-yellow-400"
                : "text-blue-300"
            }`}
          >
            <span className="opacity-30 mr-2 text-[9px] uppercase tracking-tighter">
              [{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
            </span>
            {log}
          </div>
        ))
      )}
    </ScrollArea>
  );
};

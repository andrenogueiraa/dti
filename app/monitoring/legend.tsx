"use client";

import { cn } from "@/lib/utils";

export function MonitoringLegend() {
  return (
    <div className="absolute top-2 right-2 z-40 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
      <div className="space-y-2 text-xs">
        <div className="font-semibold text-sm mb-2">Legenda</div>

        {/* Marcadores */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 flex-shrink-0" />
            <span className="text-muted-foreground">Último Doc Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-transparent border-2 border-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">Próxima Sprint</span>
          </div>
        </div>

        <div className="border-t pt-2 mt-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-green-500 flex-shrink-0" />
              <span className="text-muted-foreground">Verde: Dentro da zona</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-yellow-500 flex-shrink-0" />
              <span className="text-muted-foreground">Amarelo: Atenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-red-500 flex-shrink-0" />
              <span className="text-muted-foreground">Vermelho: Risco</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


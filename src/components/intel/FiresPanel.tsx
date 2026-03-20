import type { FireHotspot } from "@/lib/intelTypes";
import { Flame } from "lucide-react";

export function FiresPanel({ data }: { data: FireHotspot[] }) {
  if (!data.length) {
    return (
      <div className="glass-panel p-4 flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-mono">🔥 Fires — no active events</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3 space-y-2 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-orange-400" />
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Active Fires & Wildfires
        </h3>
        <span className="text-[10px] font-mono text-orange-400 ml-auto">{data.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {data.slice(0, 15).map((fire, i) => (
          <div
            key={i}
            className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-muted/30 transition-colors"
          >
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-orange-500/15 text-orange-400 border-orange-500/30 flex-shrink-0">
              {fire.satellite}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{fire.country || "Unknown location"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">
                  {fire.latitude.toFixed(2)}°, {fire.longitude.toFixed(2)}°
                </span>
                {fire.acq_date && (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(fire.acq_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

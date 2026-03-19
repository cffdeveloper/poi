import type { Flight } from "@/lib/intelTypes";
import { Plane } from "lucide-react";

export function FlightsPanel({ data }: { data: Flight[] }) {
  if (!data.length) {
    return (
      <div className="glass-panel p-4 flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-mono">Aviation — awaiting data</span>
      </div>
    );
  }

  const countries = new Set(data.map((f) => f.country));
  const avgAlt = Math.round(data.filter(f => !f.on_ground).reduce((s, f) => s + f.altitude, 0) / data.filter(f => !f.on_ground).length);
  const airborne = data.filter((f) => !f.on_ground).length;

  return (
    <div className="glass-panel p-3 space-y-2 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-2">
        <Plane className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Live Aviation</h3>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center px-2 py-1.5 rounded bg-muted/30 border border-border/50">
          <div className="text-sm font-mono font-bold text-foreground">{airborne}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Airborne</div>
        </div>
        <div className="text-center px-2 py-1.5 rounded bg-muted/30 border border-border/50">
          <div className="text-sm font-mono font-bold text-foreground">{countries.size}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Countries</div>
        </div>
        <div className="text-center px-2 py-1.5 rounded bg-muted/30 border border-border/50">
          <div className="text-sm font-mono font-bold text-foreground">{avgAlt.toLocaleString()}'</div>
          <div className="text-[9px] text-muted-foreground uppercase">Avg Alt</div>
        </div>
      </div>

      {/* Flight list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <table className="w-full">
          <thead>
            <tr className="text-[9px] font-mono text-muted-foreground uppercase">
              <th className="text-left py-1 px-1">Callsign</th>
              <th className="text-left py-1 px-1">Origin</th>
              <th className="text-right py-1 px-1">Alt (ft)</th>
              <th className="text-right py-1 px-1">Spd (kts)</th>
              <th className="text-right py-1 px-1">Hdg</th>
            </tr>
          </thead>
          <tbody>
            {data.filter(f => !f.on_ground).slice(0, 20).map((f, i) => (
              <tr key={i} className="text-[11px] font-mono border-t border-border/20 hover:bg-muted/20 transition-colors">
                <td className="py-1 px-1 text-primary font-semibold">{f.callsign || "—"}</td>
                <td className="py-1 px-1 text-foreground">{f.country}</td>
                <td className="py-1 px-1 text-right text-foreground">{f.altitude.toLocaleString()}</td>
                <td className="py-1 px-1 text-right text-foreground">{f.velocity}</td>
                <td className="py-1 px-1 text-right text-muted-foreground">{f.heading}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

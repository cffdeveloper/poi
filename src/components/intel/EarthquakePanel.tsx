import type { Earthquake } from "@/lib/intelTypes";
import { Activity } from "lucide-react";

function magColor(m: number): string {
  if (m >= 6.5) return "text-destructive bg-destructive/15 border-destructive/30";
  if (m >= 5.0) return "text-accent bg-accent/15 border-accent/30";
  if (m >= 4.0) return "text-primary bg-primary/15 border-primary/30";
  return "text-muted-foreground bg-muted border-border";
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function EarthquakePanel({ data }: { data: Earthquake[] }) {
  if (!data.length) {
    return (
      <div className="glass-panel p-4 flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-mono">Seismic — no significant events</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3 space-y-2 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Seismic Activity</h3>
        <span className="text-[10px] font-mono text-primary ml-auto">{data.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {data.slice(0, 12).map((eq, i) => (
          <a
            key={i}
            href={eq.url}
            target="_blank"
            rel="noopener"
            className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-muted/30 transition-colors"
          >
            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${magColor(eq.magnitude)}`}>
              {eq.magnitude.toFixed(1)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{eq.place}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{timeAgo(eq.time)}</span>
                {eq.tsunami > 0 && (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/30">
                    TSUNAMI
                  </span>
                )}
                {eq.felt && <span className="text-[10px] text-muted-foreground">Felt: {eq.felt}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

import type { ConflictEvent } from "@/lib/intelTypes";
import { Swords } from "lucide-react";

export function ConflictsPanel({ data }: { data: ConflictEvent[] }) {
  if (!data.length) {
    return (
      <div className="glass-panel p-4 flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-mono">⚔ Conflicts — no active events</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3 space-y-2 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-2">
        <Swords className="w-3.5 h-3.5 text-red-400" />
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Conflict & Security Events
        </h3>
        <span className="text-[10px] font-mono text-red-400 ml-auto">{data.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {data.slice(0, 15).map((ev, i) => (
          <a
            key={i}
            href={ev.url}
            target="_blank"
            rel="noopener"
            className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-muted/30 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {ev.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20">
                  {ev.source}
                </span>
                {ev.country && (
                  <span className="text-[10px] text-muted-foreground">{ev.country}</span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

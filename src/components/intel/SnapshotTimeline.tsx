import { Clock, Loader2 } from "lucide-react";
import { InlineMarkdown } from "@/components/InlineMarkdown";

export function SnapshotTimeline({ snapshots, loading }: { snapshots: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-xs font-mono font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> HISTORICAL SNAPSHOTS
        </h2>
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-xs font-mono text-muted-foreground">Loading history...</span>
        </div>
      </div>
    );
  }

  if (!snapshots.length) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-xs font-mono font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> HISTORICAL SNAPSHOTS
        </h2>
        <p className="text-[10px] font-mono text-muted-foreground">
          No history yet — snapshots are saved each time the AI analyzes this scope.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <h2 className="text-xs font-mono font-bold text-foreground mb-3 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-primary" /> HISTORICAL SNAPSHOTS
        <span className="text-[8px] font-mono text-muted-foreground ml-auto">{snapshots.length} records</span>
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {snapshots.map((snap) => {
          const date = new Date(snap.created_at);
          const gapCount = Array.isArray(snap.gaps) ? snap.gaps.length : 0;
          const alertCount = Array.isArray(snap.alerts) ? snap.alerts.length : 0;

          return (
            <div key={snap.id} className="p-2 rounded bg-muted/20 border border-border/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-primary">
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="flex items-center gap-2">
                  {gapCount > 0 && (
                    <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-accent/10 text-accent">
                      {gapCount} gaps
                    </span>
                  )}
                  {alertCount > 0 && (
                    <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-destructive/10 text-destructive">
                      {alertCount} alerts
                    </span>
                  )}
                </div>
              </div>
              {snap.analysis && (
                <div className="text-[9px] font-mono text-muted-foreground line-clamp-2">
                  <InlineMarkdown content={snap.analysis.slice(0, 150) + "..."} />
                </div>
              )}
              {snap.summary && (
                <div className="text-[9px] font-mono text-muted-foreground line-clamp-2">
                  <InlineMarkdown content={snap.summary.slice(0, 150) + "..."} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

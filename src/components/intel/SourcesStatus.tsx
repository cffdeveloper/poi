import type { IntelFeed } from "@/lib/intelTypes";
import { CheckCircle, XCircle } from "lucide-react";

export function SourcesStatus({ status, timestamp }: { status: Record<string, boolean>; timestamp: string }) {
  const total = Object.keys(status).length;
  const active = Object.values(status).filter(Boolean).length;
  const time = new Date(timestamp);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${active === total ? "bg-emerald-400" : "bg-accent"} animate-pulse`} />
        <span className="text-[10px] font-mono text-muted-foreground">
          {active}/{total} sources active
        </span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {Object.entries(status).map(([key, ok]) => (
          <span
            key={key}
            className={`inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded border ${
              ok
                ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                : "text-destructive bg-destructive/10 border-destructive/20"
            }`}
          >
            {ok ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
            {key}
          </span>
        ))}
      </div>
      <span className="text-[10px] font-mono text-muted-foreground ml-auto">
        Last scan: {time.toLocaleTimeString()}
      </span>
    </div>
  );
}

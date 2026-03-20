import type { StepsBlock } from "@/lib/blockTypes";
import { Route, CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react";
import { InlineMarkdown } from "@/components/InlineMarkdown";

const statusConfig = {
  critical: { icon: AlertCircle, color: "text-red-400", line: "bg-red-400/40", dot: "bg-red-400", bg: "bg-red-500/8" },
  active: { icon: Clock, color: "text-primary", line: "bg-primary/40", dot: "bg-primary", bg: "bg-primary/8" },
  pending: { icon: Circle, color: "text-muted-foreground", line: "bg-border", dot: "bg-muted-foreground/50", bg: "bg-muted/20" },
  complete: { icon: CheckCircle2, color: "text-emerald-400", line: "bg-emerald-400/40", dot: "bg-emerald-400", bg: "bg-emerald-500/8" },
};

export function StepsBlockView({ data }: { data: StepsBlock["data"] }) {
  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-3">
        <Route className="w-4 h-4 text-primary/70" />
        <h3 className="text-xs font-mono font-semibold text-foreground tracking-wide">{data.title}</h3>
      </div>
      <div className="space-y-0">
        {data.items.map((step, i) => {
          const config = statusConfig[step.status] || statusConfig.pending;
          const Icon = config.icon;
          const isLast = i === data.items.length - 1;

          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${config.bg} border border-current/20`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                {!isLast && <div className={`w-px flex-1 my-1 ${config.line}`} />}
              </div>
              <div className={`flex-1 pb-5`}>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-xs font-mono font-bold ${config.color}`}>{step.phase}</h4>
                  <span className="text-[9px] font-mono text-muted-foreground/60 px-1.5 py-0.5 rounded bg-muted/30 tracking-wide">
                    {step.duration}
                  </span>
                </div>
                <ul className="space-y-1 mt-1.5">
                  {step.tasks.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-card-foreground/80 leading-relaxed">
                      <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${config.dot} opacity-60`} />
                      <InlineMarkdown content={task} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

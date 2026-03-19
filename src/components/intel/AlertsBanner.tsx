import type { Alert } from "@/lib/intelTypes";
import { AlertTriangle, TrendingDown, Zap, Radio, Info, Plane } from "lucide-react";

const levelConfig: Record<string, { icon: React.ElementType; bg: string; border: string; text: string; dot: string }> = {
  critical: { icon: AlertTriangle, bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", dot: "bg-destructive" },
  high: { icon: TrendingDown, bg: "bg-accent/10", border: "border-accent/30", text: "text-accent", dot: "bg-accent" },
  medium: { icon: Zap, bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", dot: "bg-primary" },
  info: { icon: Info, bg: "bg-muted", border: "border-border", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

const domainIcon: Record<string, React.ElementType> = {
  seismic: AlertTriangle,
  markets: TrendingDown,
  space: Zap,
  aviation: Plane,
};

export function AlertsBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1">
        <Radio className="w-3 h-3 text-destructive animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Priority Alerts — {alerts.length} active
        </span>
      </div>
      <div className="space-y-1">
        {alerts.slice(0, 5).map((alert, i) => {
          const cfg = levelConfig[alert.level] || levelConfig.info;
          const Icon = domainIcon[alert.domain] || cfg.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 px-3 py-2 rounded-md border ${cfg.bg} ${cfg.border} animate-fade-in-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0 animate-pulse`} />
              <Icon className={`w-3.5 h-3.5 mt-0.5 ${cfg.text} flex-shrink-0`} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium ${cfg.text} leading-tight`}>{alert.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{alert.detail}</p>
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text} flex-shrink-0 border ${cfg.border}`}>
                {alert.level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

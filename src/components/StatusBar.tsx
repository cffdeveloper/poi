import { Activity, Cpu, Zap, Globe, Clock, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const stats = [
  { label: "System Status", value: "ONLINE", icon: Activity, color: "text-emerald-400" },
  { label: "AI Model", value: "Gemini 3 Flash", icon: Cpu, color: "text-primary" },
  { label: "Latency", value: "~1.2s", icon: Zap, color: "text-accent" },
  { label: "Domains", value: "∞", icon: Globe, color: "text-primary" },
];

export function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/30">
      <div className="flex items-center gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-1.5">
              <Icon className={`w-3.5 h-3.5 ${s.color}`} />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{s.label}</span>
              <span className={`text-[10px] font-mono font-semibold ${s.color}`}>{s.value}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-mono text-emerald-400">SECURE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>
    </div>
  );
}

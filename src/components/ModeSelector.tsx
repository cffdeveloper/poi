import { Brain, Search, BarChart3, Target } from "lucide-react";
import type { AnalysisMode } from "@/hooks/useMaverickChat";

const modes: { id: AnalysisMode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "general", label: "General", icon: Brain, desc: "Open intelligence" },
  { id: "research", label: "Research", icon: Search, desc: "Deep analysis" },
  { id: "analyze", label: "Analyze", icon: BarChart3, desc: "Data & patterns" },
  { id: "strategize", label: "Strategy", icon: Target, desc: "Plans & frameworks" },
];

export function ModeSelector({
  mode,
  onChange,
}: {
  mode: AnalysisMode;
  onChange: (m: AnalysisMode) => void;
}) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 w-fit">
      {modes.map((m) => {
        const Icon = m.icon;
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            title={m.desc}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-mono transition-all duration-200 ${
              active
                ? "bg-secondary text-primary shadow-sm glow-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 transition-colors ${active ? "text-primary" : ""}`} />
            <span className="hidden sm:inline">{m.label}</span>
            <span className="sm:hidden">{m.label.slice(0, 3)}</span>
          </button>
        );
      })}
    </div>
  );
}

import { Brain, Search, BarChart3, Target } from "lucide-react";
import type { AnalysisMode } from "@/hooks/useNexusChat";

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
    <div className="flex gap-1.5">
      {modes.map((m) => {
        const Icon = m.icon;
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              active
                ? "bg-primary/15 text-primary glow-border"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

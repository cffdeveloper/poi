import type { InfrastructureAsset } from "@/lib/intelTypes";
import { Cable, Ship, Landmark, Radiation, Navigation } from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  cable: Cable,
  pipeline: Navigation,
  waterway: Ship,
  base: Landmark,
  nuclear: Radiation,
};

const typeColors: Record<string, string> = {
  cable: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  pipeline: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  waterway: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  base: "text-green-400 bg-green-400/10 border-green-400/20",
  nuclear: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

const statusColors: Record<string, string> = {
  active: "text-emerald-400",
  operational: "text-emerald-400",
  monitored: "text-amber-400",
  "elevated-risk": "text-red-400",
  "reduced-flow": "text-orange-400",
  "drought-restricted": "text-orange-400",
  offline: "text-red-500",
};

export function InfrastructurePanel({ data }: { data: InfrastructureAsset[] }) {
  if (!data.length) {
    return (
      <div className="glass-panel p-4 flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-mono">Infrastructure — no data</span>
      </div>
    );
  }

  const grouped = {
    waterway: data.filter(d => d.type === "waterway"),
    cable: data.filter(d => d.type === "cable"),
    pipeline: data.filter(d => d.type === "pipeline"),
    base: data.filter(d => d.type === "base"),
    nuclear: data.filter(d => d.type === "nuclear"),
  };

  return (
    <div className="glass-panel p-3 space-y-2 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-2">
        <Cable className="w-3.5 h-3.5 text-cyan-400" />
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Global Infrastructure
        </h3>
        <span className="text-[10px] font-mono text-cyan-400 ml-auto">{data.length} assets</span>
      </div>

      {/* Summary chips */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(grouped).map(([type, items]) => {
          if (!items.length) return null;
          const Icon = typeIcons[type] || Cable;
          return (
            <span key={type} className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border ${typeColors[type] || ""}`}>
              <Icon className="w-2.5 h-2.5" />
              {items.length} {type}s
            </span>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {data.map((asset, i) => {
          const Icon = typeIcons[asset.type] || Cable;
          const statusColor = statusColors[asset.status || ""] || "text-muted-foreground";
          return (
            <div
              key={i}
              className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-muted/30 transition-colors"
            >
              <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${typeColors[asset.type]?.split(" ")[0] || "text-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{asset.name}</span>
                  {asset.status && (
                    <span className={`text-[9px] font-mono uppercase ${statusColor}`}>
                      {asset.status}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{asset.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

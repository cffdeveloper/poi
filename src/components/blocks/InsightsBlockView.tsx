import type { InsightsBlock } from "@/lib/blockTypes";
import { Lightbulb } from "lucide-react";
import { InlineMarkdown } from "@/components/InlineMarkdown";

function scoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
  if (score >= 6) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
  if (score >= 4) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
  return "text-muted-foreground border-border bg-muted/30";
}

function tagColor(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes("critical") || t.includes("urgent")) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (t.includes("high") || t.includes("important")) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (t.includes("opportunity") || t.includes("positive")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return "bg-primary/10 text-primary/80 border-primary/20";
}

export function InsightsBlockView({ data }: { data: InsightsBlock["data"] }) {
  const sorted = [...data.items].sort((a, b) => b.score - a.score);

  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-primary/70" />
        <h3 className="text-xs font-mono font-semibold text-foreground tracking-wide">{data.title}</h3>
      </div>
      <div className="space-y-2">
        {sorted.map((item, i) => (
          <div
            key={i}
            className="glass-panel flex items-start gap-3 p-3.5 hover:glow-border transition-all duration-300"
          >
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold ${scoreColor(item.score)}`}>
              {item.score}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="text-xs text-card-foreground leading-relaxed">
                <InlineMarkdown content={item.text} />
              </div>
              <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded-full border tracking-wider uppercase ${tagColor(item.tag)}`}>
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

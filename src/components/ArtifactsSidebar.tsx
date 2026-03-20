import { useMemo } from "react";
import type { Message } from "@/hooks/useMaverickChat";
import { parseBlocks, extractBlocks } from "@/lib/parseBlocks";
import type { StructuredBlock } from "@/lib/blockTypes";
import { BarChart3, Scale, Layers, Lightbulb, Route, Gauge, PanelRightClose, FileText } from "lucide-react";

const blockIcon: Record<string, React.ElementType> = {
  metrics: BarChart3,
  comparison: Scale,
  framework: Layers,
  insights: Lightbulb,
  steps: Route,
  score: Gauge,
};

const blockLabel: Record<string, string> = {
  metrics: "Metrics",
  comparison: "Comparison",
  framework: "Framework",
  insights: "Insights",
  steps: "Roadmap",
  score: "Assessment",
};

function getBlockTitle(block: StructuredBlock): string {
  const d = block.data as any;
  return d?.title || blockLabel[block.type] || "Block";
}

export function ArtifactsSidebar({
  messages,
  open,
  onClose,
}: {
  messages: Message[];
  open: boolean;
  onClose: () => void;
}) {
  const artifacts = useMemo(() => {
    const all: { block: StructuredBlock; msgIndex: number }[] = [];
    messages.forEach((msg, i) => {
      if (msg.role !== "assistant") return;
      const segments = parseBlocks(msg.content);
      const blocks = extractBlocks(segments);
      blocks.forEach((block) => all.push({ block, msgIndex: i }));
    });
    return all;
  }, [messages]);

  if (!open) return null;

  return (
    <div className="w-72 border-l border-border/40 bg-background/80 backdrop-blur-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary/70" />
          <h2 className="text-xs font-mono font-semibold text-foreground tracking-wide">ARTIFACTS</h2>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 border border-primary/15">
            {artifacts.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {artifacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground font-mono">
              No artifacts yet. Start a query to generate structured intelligence.
            </p>
          </div>
        ) : (
          artifacts.map((a, i) => {
            const Icon = blockIcon[a.block.type] || FileText;
            return (
              <div
                key={i}
                className="glass-panel p-3 space-y-1.5 hover:glow-border transition-all cursor-default"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">
                    {blockLabel[a.block.type]}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 font-medium leading-snug">
                  {getBlockTitle(a.block)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

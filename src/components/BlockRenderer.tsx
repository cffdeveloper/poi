import type { ContentSegment } from "@/lib/blockTypes";
import { MetricsBlockView } from "./blocks/MetricsBlockView";
import { ComparisonBlockView } from "./blocks/ComparisonBlockView";
import { FrameworkBlockView } from "./blocks/FrameworkBlockView";
import { InsightsBlockView } from "./blocks/InsightsBlockView";
import { StepsBlockView } from "./blocks/StepsBlockView";
import { ScoreBlockView } from "./blocks/ScoreBlockView";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function BlockRenderer({ segments }: { segments: ContentSegment[] }) {
  return (
    <div className="space-y-1">
      {segments.map((seg, i) => {
        switch (seg.type) {
          case "text":
            return (
              <div key={i} className="prose-maverick text-[13px] text-card-foreground leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-base font-bold text-primary font-mono tracking-wide mt-5 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-bold text-primary font-mono tracking-wide uppercase mt-4 mb-1.5">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground font-mono tracking-wide mt-3 mb-1">{children}</h3>,
                    strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-card-foreground/90">{children}</em>,
                    code: ({ children, className }) => {
                      const isBlock = className?.includes("language-");
                      if (isBlock) {
                        return <code className="text-xs font-mono text-card-foreground">{children}</code>;
                      }
                      return <code className="px-1.5 py-0.5 rounded bg-muted text-primary/90 text-[11px] font-mono border border-border/30">{children}</code>;
                    },
                    pre: ({ children }) => <pre className="my-3 p-3 rounded-md bg-muted/50 border border-border/40 overflow-x-auto">{children}</pre>,
                    ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
                    ol: ({ children }) => <ol className="space-y-1 my-2 list-decimal list-inside">{children}</ol>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-2 text-card-foreground">
                        <span className="text-primary/40 mt-2 w-1 h-1 rounded-full bg-primary/40 flex-shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),
                    p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                    a: ({ children, href }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener">{children}</a>,
                    hr: () => <hr className="my-4 border-border/30" />,
                  }}
                >
                  {seg.content}
                </ReactMarkdown>
              </div>
            );
          case "metrics":
            return <MetricsBlockView key={i} data={seg.data as any} />;
          case "comparison":
            return <ComparisonBlockView key={i} data={seg.data as any} />;
          case "framework":
            return <FrameworkBlockView key={i} data={seg.data as any} />;
          case "insights":
            return <InsightsBlockView key={i} data={seg.data as any} />;
          case "steps":
            return <StepsBlockView key={i} data={seg.data as any} />;
          case "score":
            return <ScoreBlockView key={i} data={seg.data as any} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

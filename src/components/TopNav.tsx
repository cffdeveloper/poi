import { RotateCcw } from "lucide-react";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";

export function TopNav({ onClear, hasMessages }: { onClear: () => void; hasMessages: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border/40 glass-panel-strong z-10">
      <div className="flex items-center gap-4">
        <BrandHexMark size="lg" />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl md:text-[2rem]">
              <BrandWordmark />
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/12 text-primary border border-primary/25 tracking-wider">
              v1.0
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {hasMessages && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-transparent hover:border-border/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{
          background: "hsl(155 70% 45% / 0.08)",
          borderColor: "hsl(155 70% 45% / 0.2)"
        }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(155 70% 45%)" }} />
          <span className="text-[10px] font-mono font-semibold tracking-wide" style={{ color: "hsl(155 70% 55%)" }}>ACTIVE</span>
        </div>
      </div>
    </header>
  );
}

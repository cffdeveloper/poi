import { Hexagon, RotateCcw } from "lucide-react";

export function TopNav({ onClear, hasMessages }: { onClear: () => void; hasMessages: boolean }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Hexagon className="w-8 h-8 text-primary" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold font-mono tracking-widest text-primary glow-text">
            NEXUS
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
            AI Intelligence Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {hasMessages && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Session
          </button>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">ACTIVE</span>
        </div>
      </div>
    </header>
  );
}

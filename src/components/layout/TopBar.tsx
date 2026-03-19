import { Hexagon, PanelLeftClose, PanelLeft, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export function TopBar({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border/50 glass-panel-strong shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-1 rounded hover:bg-muted/30 transition-colors text-muted-foreground">
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <Hexagon className="w-5 h-5 text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold tracking-wider text-foreground">
              NEXUS <span className="text-primary">ATLAS</span>
            </h1>
            <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
              World Industry Intelligence
            </p>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-border/50 bg-card/50">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-muted-foreground">20 INDUSTRIES</span>
          <span className="text-[9px] font-mono text-emerald-400">LIVE</span>
        </div>
      </div>
    </header>
  );
}

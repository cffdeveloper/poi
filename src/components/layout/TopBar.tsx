import { PanelLeftClose, PanelLeft, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { GeoSelector } from "@/components/intel/GeoSelector";
import { useGeoContext } from "@/contexts/GeoContext";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";

export function TopBar({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  const { isGlobal, geoString } = useGeoContext();

  return (
    <header className="min-h-11 h-11 border-b border-border/50 bg-card/60 flex items-center px-2 gap-2.5 shrink-0">
      <button onClick={toggleSidebar} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
        {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
      </button>

      <Link to="/" className="flex items-center gap-2 min-w-0">
        <BrandHexMark size="md" />
        <span className="text-[15px] sm:text-base truncate">
          <BrandWordmark />
        </span>
      </Link>

      <span className="text-[10px] text-muted-foreground hidden md:block">
        {isGlobal ? "Global" : `Intel → ${geoString}`}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <GeoSelector />
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">
          <span className="text-[9px] text-muted-foreground">20 IND</span>
          <span className="w-px h-3 bg-border/50" />
          <Activity className="w-3 h-3 text-accent animate-pulse" />
          <span className="text-[9px] text-accent font-semibold">LIVE</span>
        </div>
      </div>
    </header>
  );
}

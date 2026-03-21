import { PanelLeftClose, PanelLeft, Activity, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GeoSelector } from "@/components/intel/GeoSelector";
import { useGeoContext } from "@/contexts/GeoContext";
import { useAuth } from "@/contexts/AuthContext";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";

export function TopBar({ sidebarOpen, toggleSidebar }: { sidebarOpen: boolean; toggleSidebar: () => void }) {
  const { isGlobal, geoString } = useGeoContext();
  const { profile, signOut } = useAuth();

  return (
    <header className="min-h-11 h-11 border-b border-border/50 bg-card/60 flex items-center px-2 gap-2.5 shrink-0">
      <button onClick={toggleSidebar} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
        {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
      </button>

      <Link to="/" className="flex items-center gap-2 min-w-0">
        <BrandHexMark size="sm" />
        <span className="text-[13px] sm:text-[0.9rem] truncate">
          <BrandWordmark />
        </span>
      </Link>

      <span className="text-[10px] text-muted-foreground hidden md:block">
        {isGlobal ? "Global" : `Intel → ${geoString}`}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {profile?.display_name && (
          <span className="text-[9px] font-mono text-muted-foreground hidden sm:block truncate max-w-[120px]">
            {profile.display_name}
          </span>
        )}
        <ThemeToggle />
        <GeoSelector />
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">
          <span className="text-[9px] text-muted-foreground">30 IND</span>
          <span className="w-px h-3 bg-border/50" />
          <Activity className="w-3 h-3 text-accent animate-pulse" />
          <span className="text-[9px] text-accent font-semibold">LIVE</span>
        </div>
        <button
          onClick={signOut}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

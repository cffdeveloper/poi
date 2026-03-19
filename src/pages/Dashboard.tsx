import { Link } from "react-router-dom";
import { industries } from "@/lib/industryData";
import { ArrowRight, TrendingUp, Zap, Bell, BellOff } from "lucide-react";
import { WorldMap } from "@/components/intel/WorldMap";
import { useAlertNotifications } from "@/hooks/useAlertNotifications";
import { useState } from "react";

export default function Dashboard() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const { requestNotificationPermission } = useAlertNotifications([], alertsEnabled);

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
    setAlertsEnabled(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="glass-panel p-6 glow-border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold text-foreground mb-1">
              World Industry <span className="text-primary">Money Flows</span> Atlas
            </h1>
            <p className="text-xs font-mono text-muted-foreground max-w-2xl">
              Real-time intelligence across 20 industries, 70+ money flows. Live data feeds, AI-powered gap detection,
              cross-industry connections, and proactive alerts — updated every few minutes.
            </p>
          </div>
          <button
            onClick={alertsEnabled ? () => setAlertsEnabled(false) : handleEnableNotifications}
            className={`p-2 rounded border transition-colors ${alertsEnabled ? 'border-primary/30 text-primary bg-primary/5' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}
            title={alertsEnabled ? "Disable alerts" : "Enable alerts"}
          >
            {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <Link to="/intel" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 text-primary text-xs font-mono hover:bg-primary/20 transition-colors border border-primary/20">
            <Zap className="w-3 h-3" /> Live Intel Feed
          </Link>
          <Link to="/cross-intel" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-muted/50 text-foreground text-xs font-mono hover:bg-muted transition-colors border border-border/50">
            <TrendingUp className="w-3 h-3" /> Cross-Industry AI
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Industries</p>
          <p className="text-2xl font-mono font-bold text-foreground">20</p>
        </div>
        <div className="glass-panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Money Flows</p>
          <p className="text-2xl font-mono font-bold text-foreground">{industries.reduce((a, i) => a + i.subFlows.length, 0)}</p>
        </div>
        <div className="glass-panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Data Sources</p>
          <p className="text-2xl font-mono font-bold text-primary">10+</p>
        </div>
        <div className="glass-panel p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Refresh Rate</p>
          <p className="text-2xl font-mono font-bold text-foreground">3min</p>
        </div>
      </div>

      {/* World Map */}
      <WorldMap />

      {/* Industry grid */}
      <div>
        <h2 className="text-sm font-mono font-bold text-foreground mb-3 flex items-center gap-2">
          ALL INDUSTRIES
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {industries.map((ind) => (
            <Link
              key={ind.slug}
              to={`/industry/${ind.slug}`}
              className="glass-panel p-4 hover:glow-border transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{ind.icon}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xs font-mono font-bold text-foreground mb-1">{ind.name}</h3>
              <p className="text-[10px] font-mono text-muted-foreground line-clamp-2">{ind.description}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] font-mono text-primary">{ind.subFlows.length} flows</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

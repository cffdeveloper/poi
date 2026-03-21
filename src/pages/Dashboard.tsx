import { Link } from "react-router-dom";
import { BrandWordmark } from "@/components/BrandWordmark";
import { industries } from "@/lib/industryData";
import { ArrowRight, TrendingUp, Zap, Bell, BellOff, Activity, Database, Radio, BarChart3 } from "lucide-react";
import { WorldMap } from "@/components/intel/WorldMap";
import { useAlertNotifications } from "@/hooks/useAlertNotifications";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const { requestNotificationPermission } = useAlertNotifications([], alertsEnabled);
  const [dbStats, setDbStats] = useState({ rawData: 0, insights: 0, matches: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [{ count: raw }, { count: ins }, { count: mat }] = await Promise.all([
        supabase.from("raw_market_data").select("*", { count: "exact", head: true }),
        supabase.from("intel_insights").select("*", { count: "exact", head: true }),
        supabase.from("intel_matches").select("*", { count: "exact", head: true }),
      ]);
      setDbStats({ rawData: raw || 0, insights: ins || 0, matches: mat || 0 });
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
    setAlertsEnabled(true);
  };

  const totalFlows = industries.reduce((a, i) => a + i.subFlows.length, 0);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Ticker tape */}
      <div className="glass-panel px-3 py-1.5 overflow-hidden relative">
        <div className="ticker-tape">
          {industries.map(ind => (
            <span key={ind.slug} className="flex items-center gap-1">
              <span>{ind.icon}</span>
              <span className="text-foreground font-semibold">{ind.name}</span>
              <span className="text-primary">{ind.subFlows.length} flows</span>
              <span className="text-muted-foreground">·</span>
            </span>
          ))}
          {industries.map(ind => (
            <span key={`dup-${ind.slug}`} className="flex items-center gap-1">
              <span>{ind.icon}</span>
              <span className="text-foreground font-semibold">{ind.name}</span>
              <span className="text-primary">{ind.subFlows.length} flows</span>
              <span className="text-muted-foreground">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="glass-panel p-4 glow-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/3 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">
                <BrandWordmark />
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">v2.0</span>
              <span className="flex items-center gap-1 text-[9px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground mb-0.5 tracking-tight">
              World Industry <span className="text-gradient-primary">Money Flows</span> Intelligence
            </h1>
            <p className="text-[11px] text-muted-foreground max-w-xl">
              Autonomous 3-tier intelligence engine. Real-time data from 11+ sources. AI-powered gap detection across {industries.length} industries and {totalFlows}+ money flows.
            </p>
          </div>
          <button
            onClick={alertsEnabled ? () => setAlertsEnabled(false) : handleEnableNotifications}
            className={`p-1.5 rounded border transition-colors ${alertsEnabled ? 'border-primary/30 text-primary bg-primary/5' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}
          >
            {alertsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Link to="/intel" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 text-primary text-[11px] hover:bg-primary/20 transition-colors border border-primary/20">
            <Radio className="w-3 h-3" /> Live Feed
          </Link>
          <Link to="/cross-intel" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted/50 text-foreground text-[11px] hover:bg-muted transition-colors border border-border/50">
            <TrendingUp className="w-3 h-3" /> Cross-Intel AI
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {[
          { label: "INDUSTRIES", value: industries.length, icon: BarChart3 },
          { label: "MONEY FLOWS", value: totalFlows, icon: Activity },
          { label: "DATA SOURCES", value: "11+", icon: Database, accent: true },
          { label: "RAW DATA PTS", value: dbStats.rawData.toLocaleString(), icon: Database },
          { label: "INSIGHTS", value: dbStats.insights.toLocaleString(), icon: Zap, accent: true },
          { label: "MATCHES", value: dbStats.matches.toLocaleString(), icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <stat.icon className={`w-3 h-3 ${stat.accent ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className={`text-lg font-bold tabular-nums ${stat.accent ? 'text-primary' : 'text-foreground'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* World Map */}
      <WorldMap />

      {/* Industry grid */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="terminal-header text-[10px]">ALL INDUSTRIES</span>
          <span className="text-[9px] text-muted-foreground">{industries.length} sectors · {totalFlows} flows</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {industries.map((ind) => (
            <Link
              key={ind.slug}
              to={`/industry/${ind.slug}`}
              className="glass-panel p-3 hover:glow-border transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-xl">{ind.icon}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-[11px] font-bold text-foreground mb-0.5 leading-tight">{ind.name}</h3>
              <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">{ind.description}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[9px] text-primary font-semibold">{ind.subFlows.length} flows</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[9px] text-muted-foreground">{ind.subFlows.slice(0, 2).map(s => s.shortName).join(", ")}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useIntelFeed } from "@/hooks/useIntelFeed";
import { AlertsBanner } from "@/components/intel/AlertsBanner";
import { CryptoPanel } from "@/components/intel/CryptoPanel";
import { EarthquakePanel } from "@/components/intel/EarthquakePanel";
import { FlightsPanel } from "@/components/intel/FlightsPanel";
import { ForexPanel } from "@/components/intel/ForexPanel";
import { WeatherPanel } from "@/components/intel/WeatherPanel";
import { SpacePanel } from "@/components/intel/SpacePanel";
import { FiresPanel } from "@/components/intel/FiresPanel";
import { ConflictsPanel } from "@/components/intel/ConflictsPanel";
import { InfrastructurePanel } from "@/components/intel/InfrastructurePanel";
import { SourcesStatus } from "@/components/intel/SourcesStatus";
import { Hexagon, RefreshCw, Loader2 } from "lucide-react";

const NexusDashboard = () => {
  const { feed, loading, error, lastRefresh, refresh } = useIntelFeed();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% 0%, hsl(185 100% 50% / 0.03) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-border/50 glass-panel-strong">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Hexagon className="w-5 h-5 text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold tracking-wider text-foreground">
                NEXUS <span className="text-primary">INTEL</span>
              </h1>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                Proactive Intelligence Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {feed?.sources_status && (
              <SourcesStatus status={feed.sources_status} timestamp={feed.timestamp} />
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="p-1.5 rounded border border-border/50 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {loading && !feed ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <div>
                  <p className="text-xs font-mono text-foreground">Scanning intelligence sources...</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Connecting to 10+ real-time data feeds</p>
                </div>
              </div>
            </div>
          ) : error && !feed ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-xs font-mono text-destructive">Feed error: {error}</p>
                <button onClick={refresh} className="text-xs text-primary hover:underline font-mono">
                  Retry
                </button>
              </div>
            </div>
          ) : feed ? (
            <>
              {/* Priority alerts */}
              <AlertsBanner alerts={feed.alerts} />

              {/* Weather strip */}
              <WeatherPanel data={feed.intel.weather} />

              {/* Main grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" style={{ minHeight: 0 }}>
                <div className="xl:row-span-2 min-h-[300px]">
                  <CryptoPanel data={feed.intel.crypto} />
                </div>
                <div className="min-h-[250px]">
                  <EarthquakePanel data={feed.intel.earthquakes} />
                </div>
                <div className="xl:row-span-2 min-h-[300px]">
                  <SpacePanel
                    launches={feed.intel.spacex}
                    iss={feed.intel.iss}
                    spaceWeather={feed.intel.space_weather}
                    apod={feed.intel.apod}
                  />
                </div>
                <div className="min-h-[250px]">
                  <FlightsPanel data={feed.intel.flights} />
                </div>
                <div className="min-h-[200px]">
                  <ForexPanel data={feed.intel.forex} />
                </div>
                {/* NEW PANELS */}
                <div className="min-h-[250px]">
                  <FiresPanel data={feed.intel.fires || []} />
                </div>
                <div className="min-h-[250px]">
                  <ConflictsPanel data={feed.intel.conflicts || []} />
                </div>
                <div className="xl:col-span-2 min-h-[300px]">
                  <InfrastructurePanel data={feed.intel.infrastructure || []} />
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-border/50 bg-card/50">
          <span className="text-[9px] font-mono text-muted-foreground">
            Auto-refresh: 60s • All sources: free public APIs • No API keys required
          </span>
          {lastRefresh && (
            <span className="text-[9px] font-mono text-muted-foreground">
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </footer>
      </div>
    </div>
  );
};

export default NexusDashboard;

import { useIntelFeed } from "@/hooks/useIntelFeed";
import { AlertsBanner } from "@/components/intel/AlertsBanner";
import { CryptoPanel } from "@/components/intel/CryptoPanel";
import { EarthquakePanel } from "@/components/intel/EarthquakePanel";
import { FlightsPanel } from "@/components/intel/FlightsPanel";
import { ForexPanel } from "@/components/intel/ForexPanel";
import { WeatherPanel } from "@/components/intel/WeatherPanel";
import { SpacePanel } from "@/components/intel/SpacePanel";
import { SourcesStatus } from "@/components/intel/SourcesStatus";
import { RefreshCw, Loader2 } from "lucide-react";

export default function IntelDashboard() {
  const { feed, loading, error, lastRefresh, refresh } = useIntelFeed();

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-foreground">LIVE INTEL FEED</h1>
          <p className="text-[9px] font-mono text-muted-foreground">Real-time data from 10+ public APIs • Auto-refresh 60s</p>
        </div>
        <div className="flex items-center gap-3">
          {feed?.sources_status && <SourcesStatus status={feed.sources_status} timestamp={feed.timestamp} />}
          <button onClick={refresh} disabled={loading} className="p-1.5 rounded border border-border/50 hover:bg-muted/30 transition-colors text-muted-foreground disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {loading && !feed ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error && !feed ? (
        <div className="text-center py-20">
          <p className="text-xs font-mono text-destructive">Feed error: {error}</p>
          <button onClick={refresh} className="text-xs text-primary hover:underline font-mono mt-2">Retry</button>
        </div>
      ) : feed ? (
        <>
          <AlertsBanner alerts={feed.alerts} />
          <WeatherPanel data={feed.intel.weather} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="xl:row-span-2"><CryptoPanel data={feed.intel.crypto} /></div>
            <div><EarthquakePanel data={feed.intel.earthquakes} /></div>
            <div className="xl:row-span-2">
              <SpacePanel launches={feed.intel.spacex} iss={feed.intel.iss} spaceWeather={feed.intel.space_weather} apod={feed.intel.apod} />
            </div>
            <div><FlightsPanel data={feed.intel.flights} /></div>
            <div><ForexPanel data={feed.intel.forex} /></div>
          </div>
        </>
      ) : null}
    </div>
  );
}

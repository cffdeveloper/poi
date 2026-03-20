import { useIntelFeed } from "@/hooks/useIntelFeed";
import { AlertsBanner } from "@/components/intel/AlertsBanner";
import { CryptoPanel } from "@/components/intel/CryptoPanel";
import { ForexPanel } from "@/components/intel/ForexPanel";
import { CommoditiesPanel } from "@/components/intel/CommoditiesPanel";
import { SupplyChainPanel } from "@/components/intel/SupplyChainPanel";
import { VCPanel } from "@/components/intel/VCPanel";
import { MarketSignalsPanel } from "@/components/intel/MarketSignalsPanel";
import { SourcesStatus } from "@/components/intel/SourcesStatus";
import { RefreshCw, Loader2 } from "lucide-react";

export default function IntelDashboard() {
  const { feed, loading, error, lastRefresh, refresh } = useIntelFeed();

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-foreground">LIVE MARKET FEED</h1>
          <p className="text-[9px] font-mono text-muted-foreground">Real-time market data • Auto-refresh 60s</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="xl:row-span-2"><CryptoPanel data={feed.intel.crypto} /></div>
            <div><CommoditiesPanel data={feed.intel.commodities} /></div>
            <div className="xl:row-span-2"><VCPanel data={feed.intel.vc_signals} /></div>
            <div><ForexPanel data={feed.intel.forex} /></div>
            <div><SupplyChainPanel data={feed.intel.supply_chain} /></div>
            <div className="xl:col-span-2"><MarketSignalsPanel data={feed.intel.market_signals} /></div>
          </div>
        </>
      ) : null}
    </div>
  );
}

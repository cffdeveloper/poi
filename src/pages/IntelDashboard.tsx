import { useIntelFeed } from "@/hooks/useIntelFeed";
import { AlertsBanner } from "@/components/intel/AlertsBanner";
import { CryptoPanel } from "@/components/intel/CryptoPanel";
import { ForexPanel } from "@/components/intel/ForexPanel";
import { CommoditiesPanel } from "@/components/intel/CommoditiesPanel";
import { SupplyChainPanel } from "@/components/intel/SupplyChainPanel";
import { VCPanel } from "@/components/intel/VCPanel";
import { MarketSignalsPanel } from "@/components/intel/MarketSignalsPanel";
import { SourcesStatus } from "@/components/intel/SourcesStatus";
import { RefreshCw, Loader2, Radio } from "lucide-react";

export default function IntelDashboard() {
  const { feed, loading, error, lastRefresh, refresh } = useIntelFeed();

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-primary" />
          <span className="terminal-header text-[10px]">LIVE MARKET FEED</span>
          <span className="text-[9px] text-muted-foreground">11+ sources · auto-refresh 60s</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          {feed?.sources_status && <SourcesStatus status={feed.sources_status} timestamp={feed.timestamp} />}
          <button onClick={refresh} disabled={loading} className="p-1 rounded border border-border/50 hover:bg-muted/30 transition-colors text-muted-foreground disabled:opacity-50">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {loading && !feed ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : error && !feed ? (
        <div className="text-center py-20">
          <p className="text-[11px] text-destructive">Feed error: {error}</p>
          <button onClick={refresh} className="text-[11px] text-primary hover:underline mt-2">Retry</button>
        </div>
      ) : feed ? (
        <>
          <AlertsBanner alerts={feed.alerts} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
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

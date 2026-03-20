import { useParams, Navigate, Link } from "react-router-dom";
import { getSubFlow } from "@/lib/industryData";
import { ArrowLeft, TrendingUp, Lightbulb, RefreshCw, Loader2, AlertTriangle, Database } from "lucide-react";
import { useSubFlowIntel } from "@/hooks/useSubFlowIntel";
import { useIndustryNews } from "@/hooks/useIndustryNews";
import { useSocialIntel } from "@/hooks/useSocialIntel";
import { useSnapshots } from "@/hooks/useSnapshots";
import { useCachedIntel } from "@/hooks/useCachedIntel";
import { useGeoContext } from "@/contexts/GeoContext";
import { NewsFeed } from "@/components/intel/NewsFeed";
import { SocialIntelPanel } from "@/components/intel/SocialIntelPanel";
import { SnapshotTimeline } from "@/components/intel/SnapshotTimeline";
import { ClickableItem } from "@/components/intel/ClickableItem";
import { BlockMarkdown, InlineMarkdown } from "@/components/InlineMarkdown";

export default function SubFlowPage() {
  const { slug, subFlowId } = useParams<{ slug: string; subFlowId: string }>();
  const result = slug && subFlowId ? getSubFlow(slug, subFlowId) : undefined;
  const { geoString } = useGeoContext();
  const { data, loading, refresh } = useSubFlowIntel(
    result?.subFlow.name || "",
    result?.subFlow.keywords || [],
    result?.industry.name || "",
    geoString
  );
  const { articles, loading: newsLoading } = useIndustryNews(result?.subFlow.keywords || []);
  const { data: socialData, loading: socialLoading } = useSocialIntel(
    result?.industry.name || "", result?.subFlow.name || null, result?.subFlow.keywords || [], geoString
  );
  const scopeKey = result ? `${result.industry.name}::${result.subFlow.name}` : "";
  const { snapshots, loading: snapsLoading } = useSnapshots("subflow", scopeKey);
  const { report: cachedReport } = useCachedIntel("subflow", scopeKey);

  if (!result) return <Navigate to="/" replace />;
  const { industry, subFlow } = result;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Breadcrumb + Header */}
      <div className="glass-panel p-5 glow-border">
        <Link to={`/industry/${industry.slug}`} className="inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:underline mb-2">
          <ArrowLeft className="w-3 h-3" /> {industry.icon} {industry.name}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono text-primary">{subFlow.id}</span>
            <h1 className="text-lg font-mono font-bold text-foreground">{subFlow.name}</h1>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{subFlow.description}</p>
          </div>
          <button onClick={refresh} disabled={loading} className="p-1.5 rounded border border-border/50 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="mt-3 p-3 rounded bg-muted/20 border border-border/30">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Money Flow</p>
          <p className="text-[10px] font-mono text-foreground leading-relaxed">{subFlow.moneyFlow}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Analysis */}
        <ClickableItem
          title={`${subFlow.name} — Full Market Analysis`}
          detail={cachedReport?.analysis || data?.analysis}
          industryName={industry.name}
          subFlowName={subFlow.name}
          className="glass-panel p-4 hover:glow-border transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> AI DEEP ANALYSIS
            </h2>
            <div className="flex items-center gap-2">
              {cachedReport?.created_at && (
                <span className="text-[7px] font-mono text-muted-foreground flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" /> {new Date(cachedReport.created_at).toLocaleString()}
                </span>
              )}
              <span className="text-[8px] font-mono text-muted-foreground/50">Click for deep dive →</span>
            </div>
          </div>
          {loading && !data && !cachedReport ? (
            <div className="flex items-center gap-2 py-6">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Analyzing {subFlow.name}...</span>
            </div>
          ) : (cachedReport?.summary || data?.analysis) ? (
            <div className="text-[11px] font-mono text-card-foreground leading-relaxed line-clamp-6">
              <BlockMarkdown content={cachedReport?.summary || data?.analysis || ""} />
            </div>
          ) : (
            <p className="text-xs font-mono text-muted-foreground">Auto-intel will generate report on next cycle.</p>
          )}
        </ClickableItem>

        {/* Gaps & Opportunities */}
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-accent mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> GAPS & OPPORTUNITIES
          </h2>
          {data?.gaps && data.gaps.length > 0 ? (
            <div className="space-y-2">
              {data.gaps.map((gap: any, i: number) => (
                <ClickableItem
                  key={i}
                  title={gap.title}
                  detail={gap.detail}
                  industryName={industry.name}
                  subFlowName={subFlow.name}
                  className="p-2 rounded bg-accent/5 border border-accent/20 hover:border-accent/50 transition-colors"
                >
                  <p className="text-[10px] font-mono font-bold text-accent">{gap.title}</p>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    <InlineMarkdown content={gap.detail || ""} />
                  </div>
                </ClickableItem>
              ))}
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 py-6">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Identifying gaps...</span>
            </div>
          ) : (
            <p className="text-xs font-mono text-muted-foreground">No gaps detected yet.</p>
          )}
        </div>

        {/* Social Intelligence */}
        <SocialIntelPanel data={socialData} loading={socialLoading} industryName={industry.name} subFlowName={subFlow.name} />

        {/* Real News Feed */}
        <NewsFeed articles={articles} loading={newsLoading} industryName={industry.name} subFlowName={subFlow.name} />

        {/* Key Alerts */}
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-destructive mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> KEY ALERTS
          </h2>
          {data?.alerts && data.alerts.length > 0 ? (
            <div className="space-y-2">
              {data.alerts.map((alert: any, i: number) => (
                <ClickableItem
                  key={i}
                  title={alert.title}
                  detail={alert.detail}
                  industryName={industry.name}
                  subFlowName={subFlow.name}
                  className={`p-2 rounded border hover:opacity-80 transition-opacity ${alert.level === 'critical' ? 'bg-destructive/10 border-destructive/30' : alert.level === 'high' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/20 border-border/20'}`}
                >
                  <p className="text-[10px] font-mono font-bold text-foreground">{alert.title}</p>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    <InlineMarkdown content={alert.detail || ""} />
                  </div>
                </ClickableItem>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-muted-foreground">No critical alerts.</p>
          )}
        </div>
      </div>

      {/* Live Data Section */}
      {data?.liveData && (
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-foreground mb-3">LIVE DATA FEEDS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(data.liveData).map(([key, val]: [string, any]) => (
              <ClickableItem
                key={key}
                title={`${key.replace(/_/g, ' ')} — Detailed Analysis`}
                industryName={industry.name}
                subFlowName={subFlow.name}
                className="p-2 rounded bg-muted/20 border border-border/20 hover:border-primary/30 transition-colors"
              >
                <p className="text-[9px] font-mono text-muted-foreground uppercase">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm font-mono font-bold text-foreground">{typeof val === 'number' ? val.toLocaleString() : String(val)}</p>
              </ClickableItem>
            ))}
          </div>
        </div>
      )}

      {/* Historical Snapshots */}
      <SnapshotTimeline snapshots={snapshots} loading={snapsLoading} />
    </div>
  );
}

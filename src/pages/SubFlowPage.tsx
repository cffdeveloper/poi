import { useParams, Navigate, Link } from "react-router-dom";
import { getSubFlow } from "@/lib/industryData";
import { ArrowLeft, TrendingUp, Newspaper, Lightbulb, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { useSubFlowIntel } from "@/hooks/useSubFlowIntel";

export default function SubFlowPage() {
  const { slug, subFlowId } = useParams<{ slug: string; subFlowId: string }>();
  const result = slug && subFlowId ? getSubFlow(slug, subFlowId) : undefined;
  const { data, loading, refresh } = useSubFlowIntel(
    result?.subFlow.name || "",
    result?.subFlow.keywords || [],
    result?.industry.name || ""
  );

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
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1.5 rounded border border-border/50 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </button>
        </div>
        {/* Money flow visualization */}
        <div className="mt-3 p-3 rounded bg-muted/20 border border-border/30">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Money Flow</p>
          <p className="text-[10px] font-mono text-foreground leading-relaxed">{subFlow.moneyFlow}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Analysis */}
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-primary mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> AI DEEP ANALYSIS
          </h2>
          {loading && !data ? (
            <div className="flex items-center gap-2 py-6">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Analyzing {subFlow.name}...</span>
            </div>
          ) : data?.analysis ? (
            <p className="text-[11px] font-mono text-card-foreground leading-relaxed whitespace-pre-wrap">{data.analysis}</p>
          ) : (
            <p className="text-xs font-mono text-muted-foreground">Analysis loading...</p>
          )}
        </div>

        {/* Gaps & Opportunities */}
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-accent mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> GAPS & OPPORTUNITIES
          </h2>
          {data?.gaps && data.gaps.length > 0 ? (
            <div className="space-y-2">
              {data.gaps.map((gap: any, i: number) => (
                <div key={i} className="p-2 rounded bg-accent/5 border border-accent/20">
                  <p className="text-[10px] font-mono font-bold text-accent">{gap.title}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{gap.detail}</p>
                </div>
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

        {/* News */}
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-foreground mb-2 flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5" /> LATEST NEWS
          </h2>
          {data?.news && data.news.length > 0 ? (
            <div className="space-y-2">
              {data.news.map((item: any, i: number) => (
                <div key={i} className="p-2 rounded bg-muted/20 border border-border/20">
                  <p className="text-[10px] font-mono font-bold text-foreground">{item.title}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.summary}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-muted-foreground">Loading news...</p>
          )}
        </div>

        {/* Key Alerts */}
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-destructive mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> KEY ALERTS
          </h2>
          {data?.alerts && data.alerts.length > 0 ? (
            <div className="space-y-2">
              {data.alerts.map((alert: any, i: number) => (
                <div key={i} className={`p-2 rounded border ${alert.level === 'critical' ? 'bg-destructive/10 border-destructive/30' : alert.level === 'high' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/20 border-border/20'}`}>
                  <p className="text-[10px] font-mono font-bold text-foreground">{alert.title}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{alert.detail}</p>
                </div>
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
              <div key={key} className="p-2 rounded bg-muted/20 border border-border/20">
                <p className="text-[9px] font-mono text-muted-foreground uppercase">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm font-mono font-bold text-foreground">{typeof val === 'number' ? val.toLocaleString() : String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

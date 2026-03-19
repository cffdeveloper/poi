import { useParams, Link, Navigate } from "react-router-dom";
import { getIndustryBySlug } from "@/lib/industryData";
import { ArrowRight, TrendingUp, Loader2 } from "lucide-react";
import { useIndustryIntel } from "@/hooks/useIndustryIntel";
import { useIndustryNews } from "@/hooks/useIndustryNews";
import { useSnapshots } from "@/hooks/useSnapshots";
import { NewsFeed } from "@/components/intel/NewsFeed";
import { SnapshotTimeline } from "@/components/intel/SnapshotTimeline";

export default function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? getIndustryBySlug(slug) : undefined;
  const keywords = industry?.subFlows.flatMap(sf => sf.keywords).slice(0, 10) || [];
  const { data, loading } = useIndustryIntel(industry?.name || "", keywords);
  const { articles, loading: newsLoading } = useIndustryNews(keywords);
  const { snapshots, loading: snapsLoading } = useSnapshots("industry", industry?.name || "");

  if (!industry) return <Navigate to="/" replace />;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 glow-border">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{industry.icon}</span>
          <div>
            <h1 className="text-lg font-mono font-bold text-foreground">{industry.name}</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Industry {industry.id} • {industry.subFlows.length} Money Flows
            </p>
          </div>
        </div>
        <p className="text-xs font-mono text-muted-foreground">{industry.description}</p>
      </div>

      {/* AI Industry Brief */}
      <div className="glass-panel p-4">
        <h2 className="text-xs font-mono font-bold text-primary mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> AI INDUSTRY BRIEF
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs font-mono text-muted-foreground">Analyzing {industry.name} landscape...</span>
          </div>
        ) : data?.analysis ? (
          <p className="text-xs font-mono text-card-foreground leading-relaxed whitespace-pre-wrap">{data.analysis}</p>
        ) : (
          <p className="text-xs font-mono text-muted-foreground">Analysis unavailable — will retry on next refresh.</p>
        )}
      </div>

      {/* Live News Feed */}
      <NewsFeed articles={articles} loading={newsLoading} />

      {/* Sub-flows grid */}
      <div>
        <h2 className="text-xs font-mono font-bold text-foreground mb-3">MONEY FLOWS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {industry.subFlows.map((sf) => (
            <Link
              key={sf.id}
              to={`/industry/${industry.slug}/${sf.id}`}
              className="glass-panel p-4 hover:glow-border transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-mono text-primary">{sf.id}</span>
                  <h3 className="text-sm font-mono font-bold text-foreground">{sf.name}</h3>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mb-2">{sf.description}</p>
              <div className="p-2 rounded bg-muted/30 border border-border/30">
                <p className="text-[9px] font-mono text-muted-foreground leading-relaxed">{sf.moneyFlow}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* News from AI analysis */}
      {data?.news && data.news.length > 0 && (
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-foreground mb-3">AI-DETECTED DEVELOPMENTS</h2>
          <div className="space-y-2">
            {data.news.map((item: any, i: number) => (
              <div key={i} className="p-2 rounded bg-muted/20 border border-border/20">
                <p className="text-xs font-mono text-foreground">{item.title}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Snapshots */}
      <SnapshotTimeline snapshots={snapshots} loading={snapsLoading} />
    </div>
  );
}

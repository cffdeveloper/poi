import { useParams, Link, Navigate } from "react-router-dom";
import { getIndustryBySlug } from "@/lib/industryData";
import { ArrowRight, TrendingUp, Loader2, Users, Handshake } from "lucide-react";
import { useIndustryIntel } from "@/hooks/useIndustryIntel";
import { useIndustryNews } from "@/hooks/useIndustryNews";
import { useSocialIntel } from "@/hooks/useSocialIntel";
import { useSnapshots } from "@/hooks/useSnapshots";
import { useGeoContext } from "@/contexts/GeoContext";
import { NewsFeed } from "@/components/intel/NewsFeed";
import { SocialIntelPanel } from "@/components/intel/SocialIntelPanel";
import { SnapshotTimeline } from "@/components/intel/SnapshotTimeline";
import { ClickableItem } from "@/components/intel/ClickableItem";

export default function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? getIndustryBySlug(slug) : undefined;
  const keywords = industry?.subFlows.flatMap(sf => sf.keywords).slice(0, 10) || [];
  const { geoString } = useGeoContext();
  const { data, loading } = useIndustryIntel(industry?.name || "", keywords, geoString);
  const { articles, loading: newsLoading } = useIndustryNews(keywords);
  const { data: socialData, loading: socialLoading } = useSocialIntel(industry?.name || "", null, keywords, geoString);
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

      {/* AI Industry Brief — clickable */}
      <ClickableItem
        title={`${industry.name} — Full Industry Intelligence Report`}
        detail={data?.analysis}
        industryName={industry.name}
        className="glass-panel p-4 hover:glow-border transition-all"
      >
        <h2 className="text-xs font-mono font-bold text-primary mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> AI INDUSTRY BRIEF
          <span className="text-[8px] font-mono text-muted-foreground/50 ml-auto">Click for deep dive →</span>
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs font-mono text-muted-foreground">Analyzing {industry.name} landscape...</span>
          </div>
        ) : data?.analysis ? (
          <p className="text-xs font-mono text-card-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">{data.analysis}</p>
        ) : (
          <p className="text-xs font-mono text-muted-foreground">Analysis unavailable — will retry on next refresh.</p>
        )}
      </ClickableItem>

      {/* Key Players */}
      {data?.players && data.players.length > 0 && (
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" /> KEY PLAYERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.players.map((player: any, i: number) => (
              <ClickableItem
                key={i}
                title={player.name}
                detail={`Role: ${player.role}\nRecent: ${player.recent_activity}\nStrategy: ${player.strategy}\nPartners: ${player.partnerships || 'N/A'}`}
                industryName={industry.name}
                className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-mono font-bold text-foreground">{player.name}</p>
                  <span className="text-[8px] font-mono text-muted-foreground/50">→ dive</span>
                </div>
                <p className="text-[10px] font-mono text-primary mt-0.5">{player.role}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5 line-clamp-2">{player.recent_activity}</p>
              </ClickableItem>
            ))}
          </div>
        </div>
      )}

      {/* Recent Deals & Events */}
      {data?.deals && data.deals.length > 0 && (
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Handshake className="w-3.5 h-3.5 text-primary" /> RECENT DEALS & EVENTS
          </h2>
          <div className="space-y-2">
            {data.deals.map((deal: any, i: number) => (
              <ClickableItem
                key={i}
                title={`${deal.type}: ${deal.parties}`}
                detail={deal.significance}
                industryName={industry.name}
                className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{deal.type}</span>
                  <p className="text-xs font-mono text-foreground flex-1">{deal.parties}</p>
                  {deal.value && <span className="text-[10px] font-mono text-primary font-bold">{deal.value}</span>}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">{deal.significance}</p>
                {deal.date && <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5">{deal.date}</p>}
              </ClickableItem>
            ))}
          </div>
        </div>
      )}

      {/* Live News Feed */}
      <NewsFeed articles={articles} loading={newsLoading} industryName={industry.name} />

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

      {/* News from AI analysis — clickable */}
      {data?.news && data.news.length > 0 && (
        <div className="glass-panel p-4">
          <h2 className="text-xs font-mono font-bold text-foreground mb-3">AI-DETECTED DEVELOPMENTS</h2>
          <div className="space-y-2">
            {data.news.map((item: any, i: number) => (
              <ClickableItem
                key={i}
                title={item.title}
                detail={item.summary}
                industryName={industry.name}
                className="p-2 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
              >
                <p className="text-xs font-mono text-foreground">{item.title}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.summary}</p>
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

import { useState } from "react";
import { Loader2, Zap, Users, TrendingUp, AlertTriangle, Radio, Twitter } from "lucide-react";
import { ClickableItem } from "./ClickableItem";

interface SocialIntelPanelProps {
  data: any;
  loading: boolean;
  industryName?: string;
  subFlowName?: string;
}

export function SocialIntelPanel({ data, loading, industryName, subFlowName }: SocialIntelPanelProps) {
  const [tab, setTab] = useState<"breaking" | "players" | "opportunities">("breaking");

  if (loading && !data) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-xs font-mono font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-primary animate-pulse" /> LIVE SOCIAL INTELLIGENCE
        </h2>
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-[9px] font-mono text-muted-foreground">Scraping X, Reddit, HN, GDELT for real-time signals...</span>
        </div>
      </div>
    );
  }

  const synthesis = data?.synthesis;
  if (!synthesis) return null;

  const breaking = synthesis.breaking || [];
  const players = synthesis.player_activity || [];
  const opportunities = synthesis.opportunities_from_signals || [];
  const sentiment = synthesis.social_sentiment || {};
  const freshness = synthesis.freshness_score || 0;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-primary" /> LIVE SOCIAL INTELLIGENCE
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
            freshness >= 70 ? "bg-emerald-500/20 text-emerald-400" : 
            freshness >= 40 ? "bg-amber-500/20 text-amber-400" : 
            "bg-red-500/20 text-red-400"
          }`}>
            FRESHNESS: {freshness}%
          </span>
          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
            sentiment.overall === "bullish" ? "bg-emerald-500/20 text-emerald-400" :
            sentiment.overall === "bearish" ? "bg-red-500/20 text-red-400" :
            "bg-muted/30 text-muted-foreground"
          }`}>
            {(sentiment.overall || "neutral").toUpperCase()}
          </span>
          <span className="text-[8px] font-mono text-muted-foreground">
            {data?.signals_collected || 0} signals
          </span>
        </div>
      </div>

      {/* Sentiment tags */}
      {(sentiment.hot_topics?.length > 0 || sentiment.emerging_terms?.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(sentiment.hot_topics || []).slice(0, 4).map((t: string, i: number) => (
            <span key={`hot-${i}`} className="text-[7px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              🔥 {t}
            </span>
          ))}
          {(sentiment.emerging_terms || []).slice(0, 3).map((t: string, i: number) => (
            <span key={`em-${i}`} className="text-[7px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground">
              ✨ {t}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {[
          { key: "breaking" as const, icon: Zap, label: "BREAKING", count: breaking.length },
          { key: "players" as const, icon: Users, label: "PLAYERS", count: players.length },
          { key: "opportunities" as const, icon: TrendingUp, label: "OPPORTUNITIES", count: opportunities.length },
        ].map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-[8px] font-mono px-2 py-1 rounded flex items-center gap-1 transition-colors ${
              tab === key ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-2.5 h-2.5" /> {label} ({count})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {tab === "breaking" && breaking.map((item: any, i: number) => (
          <ClickableItem
            key={i}
            title={item.headline}
            detail={item.detail}
            industryName={industryName}
            subFlowName={subFlowName}
            className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start gap-2">
              <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${
                item.impact === "high" ? "bg-red-500" : item.impact === "medium" ? "bg-amber-500" : "bg-emerald-500"
              }`} />
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold text-foreground leading-snug">{item.headline}</p>
                <p className="text-[9px] font-mono text-muted-foreground mt-1">{item.detail}</p>
                <div className="flex items-center gap-2 mt-1">
                  {item.players_involved?.slice(0, 3).map((p: string, j: number) => (
                    <span key={j} className="text-[7px] font-mono px-1 py-0.5 rounded bg-primary/10 text-primary">{p}</span>
                  ))}
                  {item.source && <span className="text-[7px] font-mono text-muted-foreground">via {item.source}</span>}
                </div>
              </div>
            </div>
          </ClickableItem>
        ))}

        {tab === "players" && players.map((item: any, i: number) => (
          <ClickableItem
            key={i}
            title={item.player}
            detail={`${item.activity}. ${item.implications}`}
            industryName={industryName}
            subFlowName={subFlowName}
            className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
          >
            <p className="text-[10px] font-mono font-bold text-primary">{item.player}</p>
            <p className="text-[9px] font-mono text-foreground mt-1">{item.activity}</p>
            <p className="text-[8px] font-mono text-muted-foreground mt-1 italic">→ {item.implications}</p>
            {item.source && <span className="text-[7px] font-mono text-muted-foreground mt-1 block">Source: {item.source}</span>}
          </ClickableItem>
        ))}

        {tab === "opportunities" && opportunities.map((item: any, i: number) => (
          <ClickableItem
            key={i}
            title={item.title}
            detail={item.detail}
            industryName={industryName}
            subFlowName={subFlowName}
            className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-mono font-bold text-foreground">{item.title}</p>
              <span className={`shrink-0 text-[7px] font-mono px-1.5 py-0.5 rounded ${
                item.urgency === "act_now" ? "bg-red-500/20 text-red-400" :
                item.urgency === "this_week" ? "bg-amber-500/20 text-amber-400" :
                "bg-muted/30 text-muted-foreground"
              }`}>
                {(item.urgency || "").replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground mt-1">{item.detail}</p>
            {item.source_signal && <span className="text-[7px] font-mono text-primary/60 mt-1 block">Signal: {item.source_signal}</span>}
          </ClickableItem>
        ))}
      </div>

      {/* Source breakdown */}
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-border/20">
        <span className="text-[7px] font-mono text-muted-foreground">Sources:</span>
        {data?.sources && Object.entries(data.sources).map(([key, val]) => (
          <span key={key} className="text-[7px] font-mono text-muted-foreground">
            {key}: {val as number}
          </span>
        ))}
        {data?.countries_scraped?.length > 0 && (
          <span className="text-[7px] font-mono text-primary/60">
            | {data.countries_scraped.length} countries: {data.countries_scraped.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

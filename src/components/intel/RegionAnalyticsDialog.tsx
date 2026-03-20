import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import { Loader2, Globe, TrendingUp, AlertTriangle, Zap, BarChart3, ArrowRight, ExternalLink } from "lucide-react";
import { industries } from "@/lib/industryData";
import { useNavigate } from "react-router-dom";

interface RegionData {
  name: string;
  code: string;
  lat: number;
  lng: number;
  industries: string[];
  tradeVolume: string;
  disruptions: string[];
}

interface RegionAnalyticsDialogProps {
  open: boolean;
  onClose: () => void;
  region: RegionData | null;
}

interface InsightRow {
  id: string;
  title: string;
  detail: string | null;
  insight_type: string;
  score: number | null;
  urgency: string | null;
  source_industry: string | null;
  created_at: string;
  geo_context: string[] | null;
}

interface MatchRow {
  id: string;
  title: string;
  description: string | null;
  match_type: string;
  confidence: number | null;
  estimated_value: string | null;
  industries: string[] | null;
  created_at: string;
}

export function RegionAnalyticsDialog({ open, onClose, region }: RegionAnalyticsDialogProps) {
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!region) return;
    setLoading(true);
    setInsights([]);
    setMatches([]);
    setAiReport("");

    try {
      // Fetch insights related to this region's industries
      const { data: insightData } = await supabase
        .from("intel_insights")
        .select("*")
        .in("source_industry", region.industries)
        .eq("still_relevant", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (insightData) setInsights(insightData as InsightRow[]);

      // Fetch matches related to this region's industries
      const { data: matchData } = await supabase
        .from("intel_matches")
        .select("*")
        .overlaps("industries", region.industries)
        .order("created_at", { ascending: false })
        .limit(10);

      if (matchData) setMatches(matchData as MatchRow[]);
    } catch (e) {
      console.error("Region analytics fetch error:", e);
    } finally {
      setLoading(false);
    }

    // Generate AI deep-dive for this region
    setReportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("deep-dive", {
        body: {
          topic: `${region.name} Regional Intelligence Briefing`,
          context: `Comprehensive analysis of ${region.name} (${region.code}) covering: trade volume ${region.tradeVolume}, key industries: ${region.industries.join(", ")}, current disruptions: ${region.disruptions.join(", ")}. Include market signals, political stability, supply chain risks, investment opportunities, and cross-industry connections.`,
          industryName: region.industries[0] || "",
          subFlowName: "",
        },
      });
      if (error) throw error;
      setAiReport(data?.report || "");
    } catch (e) {
      console.error("Region AI report error:", e);
    } finally {
      setReportLoading(false);
    }
  }, [region]);

  useEffect(() => {
    if (open && region) fetchData();
  }, [open, region, fetchData]);

  if (!region) return null;

  const reportSegments = aiReport ? parseBlocks(aiReport) : [];
  const regionIndustries = industries.filter(i => region.industries.includes(i.slug));

  const urgencyColor = (u: string | null) => {
    if (u === "critical") return "text-destructive";
    if (u === "high") return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background border-border p-0">
        {/* Hero header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-background to-accent/5">
          <DialogHeader>
            <DialogTitle className="text-base font-mono font-bold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {region.name} — REGIONAL INTELLIGENCE
            </DialogTitle>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">
              Trade Volume: <span className="text-foreground font-semibold">{region.tradeVolume}</span> • {region.industries.length} tracked industries • Live analysis
            </p>
          </DialogHeader>

          {/* Disruption alerts */}
          {region.disruptions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {region.disruptions.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded bg-destructive/10 border border-destructive/20">
                  <Zap className="w-3 h-3 text-destructive" />
                  <span className="text-[10px] font-mono text-destructive">{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Industry cards grid */}
          <div>
            <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-primary" />
              KEY INDUSTRIES IN REGION
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {regionIndustries.map(ind => (
                <button
                  key={ind.slug}
                  onClick={() => { onClose(); navigate(`/industry/${ind.slug}`); }}
                  className="group glass-panel p-2.5 text-left hover:border-primary/40 transition-all"
                >
                  <div className="text-base mb-1">{ind.icon}</div>
                  <div className="text-[10px] font-mono font-semibold text-foreground group-hover:text-primary transition-colors truncate">{ind.name}</div>
                  <div className="text-[8px] font-mono text-muted-foreground">{ind.subFlows.length} flows</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live insights */}
          {loading ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Loading regional intelligence...</span>
            </div>
          ) : (
            <>
              {insights.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    LATEST SIGNALS ({insights.length})
                  </h3>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                    {insights.map(ins => (
                      <div key={ins.id} className="glass-panel p-2.5 flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${ins.urgency === "critical" ? "bg-destructive animate-pulse" : ins.urgency === "high" ? "bg-primary" : "bg-muted-foreground/40"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-mono font-semibold text-foreground truncate">{ins.title}</div>
                          {ins.detail && (
                            <div className="text-[9px] font-mono text-muted-foreground line-clamp-2 mt-0.5">{ins.detail}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {ins.source_industry && <span className="text-[8px] font-mono text-primary/70">{ins.source_industry}</span>}
                            {ins.urgency && <span className={`text-[8px] font-mono ${urgencyColor(ins.urgency)}`}>⚡ {ins.urgency}</span>}
                            {ins.score && <span className="text-[8px] font-mono text-accent">score: {ins.score}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matches.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-accent" />
                    CROSS-INDUSTRY CONNECTIONS ({matches.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matches.slice(0, 6).map(m => (
                      <div key={m.id} className="glass-panel p-2.5">
                        <div className="text-[10px] font-mono font-semibold text-foreground truncate">{m.title}</div>
                        {m.description && (
                          <div className="text-[9px] font-mono text-muted-foreground line-clamp-2 mt-0.5">{m.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          {m.confidence && <span className="text-[8px] font-mono text-primary">conf: {Math.round(m.confidence * 100)}%</span>}
                          {m.estimated_value && <span className="text-[8px] font-mono text-accent">{m.estimated_value}</span>}
                          <span className="text-[8px] font-mono text-muted-foreground">{m.match_type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI deep-dive report */}
          <div>
            <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary" />
              AI REGIONAL BRIEFING
            </h3>
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-[10px] font-mono text-muted-foreground">Generating {region.name} intelligence briefing...</p>
                <p className="text-[8px] font-mono text-muted-foreground/50">Cross-referencing all industries, disruptions, and market signals</p>
              </div>
            ) : reportSegments.length > 0 ? (
              <div className="glass-panel p-4">
                <BlockRenderer segments={reportSegments} />
              </div>
            ) : (
              <p className="text-[10px] font-mono text-muted-foreground text-center py-6">
                No AI briefing available yet. The system is collecting data for this region.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

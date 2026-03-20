import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import {
  Loader2,
  Globe,
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart3,
  ArrowRight,
  Activity,
  Radio,
  GitBranch,
} from "lucide-react";
import { industries } from "@/lib/industryData";
import { useNavigate } from "react-router-dom";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import { getFlowsTouchingRegion, regionIntelScore, type MapFlow } from "@/lib/mapRegionData";

export interface RegionData {
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

  const industryNames = useMemo(() => {
    if (!region) return [] as string[];
    return industries.filter((i) => region.industries.includes(i.slug)).map((i) => i.name);
  }, [region]);

  const flowsCorridor = useMemo< MapFlow[]>(() => (region ? getFlowsTouchingRegion(region.name) : []), [region]);

  const intelScore = useMemo(() => {
    if (!region) return 0;
    return regionIntelScore(region.disruptions.length, flowsCorridor.length);
  }, [region, flowsCorridor.length]);

  const fetchData = useCallback(async () => {
    if (!region) return;
    setLoading(true);
    setInsights([]);
    setMatches([]);
    setAiReport("");

    const names = industries.filter((i) => region.industries.includes(i.slug)).map((i) => i.name);
    const corridorCount = getFlowsTouchingRegion(region.name).length;

    try {
      if (names.length > 0) {
        const { data: insightData } = await supabase
          .from("intel_insights")
          .select("*")
          .in("source_industry", names)
          .eq("still_relevant", true)
          .order("created_at", { ascending: false })
          .limit(20);

        if (insightData) setInsights(insightData as InsightRow[]);

        const { data: matchData } = await supabase
          .from("intel_matches")
          .select("*")
          .overlaps("industries", names)
          .order("created_at", { ascending: false })
          .limit(10);

        if (matchData) setMatches(matchData as MatchRow[]);
      }
    } catch (e) {
      console.error("Region analytics fetch error:", e);
    } finally {
      setLoading(false);
    }

    setReportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("deep-dive", {
        body: {
          topic: `${region.name} — Regional intelligence command brief`,
          context: `Macro-region: ${region.name} (${region.code}). Trade: ${region.tradeVolume}. Tracked industries (slugs): ${region.industries.join(", ")}. Active disruptions: ${region.disruptions.join("; ")}. Trade corridors touching this region: ${corridorCount}. Produce a decisive executive brief: capital flows, policy/regulatory risk, sector rotation, and 3–5 actionable theses.`,
          industryName: names[0] || region.name,
          subFlowName: "",
          geoContext: region.name,
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
  const regionIndustries = industries.filter((i) => region.industries.includes(i.slug));

  const urgencyColor = (u: string | null) => {
    if (u === "critical") return "text-destructive";
    if (u === "high") return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-5xl max-h-[92vh] flex flex-col gap-0 overflow-hidden bg-background border-border p-0 shadow-2xl shadow-primary/10 data-[state=open]:duration-300"
      >
        {/* Command-center header */}
        <div className="relative shrink-0 px-6 pt-6 pb-5 border-b border-border/50 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

          <DialogHeader className="relative">
            <div className="flex flex-wrap items-start gap-3 gap-y-2">
              <span className="inline-flex items-center gap-1.5 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                <Radio className="w-3 h-3 animate-pulse" />
                {region.code}
              </span>
              <span className="rounded border border-border/60 bg-muted/30 px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
                {region.lat.toFixed(1)}°, {region.lng.toFixed(1)}°
              </span>
            </div>
            <DialogTitle className="text-lg font-mono font-bold text-foreground flex items-center gap-2 mt-2 pr-8">
              <Globe className="w-5 h-5 text-primary shrink-0" />
              <span>{region.name}</span>
              <span className="text-[10px] font-normal text-muted-foreground font-mono tracking-wide">
                — REGIONAL INTEL COMMAND
              </span>
            </DialogTitle>
            <p className="text-[10px] font-mono text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Live cross-reference of tracked industries, trade corridors, intel signals, and an AI brief tuned to this geography.
            </p>
          </DialogHeader>

          {/* KPI strip */}
          <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">Trade volume</p>
              <p className="text-sm font-mono font-bold text-primary">{region.tradeVolume}</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">Intel pulse</p>
              <p className="text-sm font-mono font-bold text-foreground">{intelScore}/100</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">Corridors</p>
              <p className="text-sm font-mono font-bold text-accent">{flowsCorridor.length} active</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">Industries</p>
              <p className="text-sm font-mono font-bold text-foreground">{industryNames.length} tracked</p>
            </div>
          </div>

          {region.disruptions.length > 0 && (
            <div className="relative mt-3 flex flex-wrap gap-2">
              {region.disruptions.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/25"
                >
                  <Zap className="w-3 h-3 text-destructive shrink-0" />
                  <span className="text-[10px] font-mono text-destructive">{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-6">
          {/* Trade corridors — from global flow map */}
          {flowsCorridor.length > 0 && (
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GitBranch className="w-3 h-3 text-primary" />
                Trade corridors (this region)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {flowsCorridor.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/30 bg-muted/10 px-3 py-2"
                  >
                    <div className="min-w-0 flex items-center gap-1.5 text-[10px] font-mono text-foreground">
                      <span className="truncate text-primary/90">{f.from}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 text-muted-foreground" />
                      <span className="truncate text-primary/90">{f.to}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[9px] font-mono font-semibold text-foreground">{f.volume}</div>
                      <div className="text-[8px] font-mono text-muted-foreground">{f.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Industry grid */}
          <div>
            <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-primary" />
              Key industries in {region.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {regionIndustries.map((ind) => (
                <button
                  key={ind.slug}
                  onClick={() => {
                    onClose();
                    navigate(`/industry/${ind.slug}`);
                  }}
                  className="group glass-panel p-2.5 text-left hover:border-primary/50 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.35)] transition-all"
                >
                  <div className="text-base mb-1">{ind.icon}</div>
                  <div className="text-[10px] font-mono font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {ind.name}
                  </div>
                  <div className="text-[8px] font-mono text-muted-foreground">{ind.subFlows.length} flows</div>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Pulling signals from intelligence graph…</span>
            </div>
          ) : (
            <>
              {insights.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-primary" />
                    Latest signals ({insights.length})
                  </h3>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {insights.map((ins) => (
                      <div key={ins.id} className="glass-panel p-2.5 flex items-start gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            ins.urgency === "critical"
                              ? "bg-destructive animate-pulse"
                              : ins.urgency === "high"
                                ? "bg-primary"
                                : "bg-muted-foreground/40"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-mono font-semibold text-foreground truncate">{ins.title}</div>
                          {ins.detail && (
                            <div className="text-[9px] font-mono text-muted-foreground line-clamp-3 mt-0.5 min-w-0">
                              <InlineMarkdown content={ins.detail} />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {ins.source_industry && (
                              <span className="text-[8px] font-mono text-primary/70">{ins.source_industry}</span>
                            )}
                            {ins.urgency && (
                              <span className={`text-[8px] font-mono ${urgencyColor(ins.urgency)}`}>⚡ {ins.urgency}</span>
                            )}
                            {ins.score != null && (
                              <span className="text-[8px] font-mono text-accent">score: {ins.score}</span>
                            )}
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
                    Cross-industry connections ({matches.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matches.slice(0, 6).map((m) => (
                      <div key={m.id} className="glass-panel p-2.5">
                        <div className="text-[10px] font-mono font-semibold text-foreground truncate">{m.title}</div>
                        {m.description && (
                          <div className="text-[9px] font-mono text-muted-foreground line-clamp-2 mt-0.5 min-w-0 [&_p]:inline">
                            <InlineMarkdown content={m.description} />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {m.confidence != null && (
                            <span className="text-[8px] font-mono text-primary">conf: {Math.round(m.confidence * 100)}%</span>
                          )}
                          {m.estimated_value && (
                            <span className="text-[8px] font-mono text-accent">{m.estimated_value}</span>
                          )}
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
              AI regional briefing (structured)
            </h3>
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 rounded-lg border border-dashed border-primary/20 bg-primary/5">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-[10px] font-mono text-muted-foreground">Generating {region.name} command brief…</p>
                <p className="text-[8px] font-mono text-muted-foreground/50 text-center max-w-md">
                  Weaving corridors, disruptions, and industry signals into a single structured report
                </p>
              </div>
            ) : reportSegments.length > 0 ? (
              <div className="glass-panel p-4 min-w-0 max-w-full border border-border/40">
                <BlockRenderer segments={reportSegments} />
              </div>
            ) : (
              <p className="text-[10px] font-mono text-muted-foreground text-center py-8 rounded-lg border border-border/30 bg-muted/5">
                No AI briefing yet — run more intel jobs or try again shortly.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

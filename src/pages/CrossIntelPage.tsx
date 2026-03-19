import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { industries } from "@/lib/industryData";
import { Loader2, Network, RefreshCw, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";

type CrossIntel = {
  gaps: { title: string; detail: string; industries: string[] }[];
  connections: { title: string; detail: string; from: string; to: string }[];
  alerts: { title: string; detail: string; level: string }[];
  summary: string;
};

export default function CrossIntelPage() {
  const [data, setData] = useState<CrossIntel | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntel = useCallback(async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("cross-intel", {
        body: {
          industries: industries.map(i => ({
            name: i.name,
            subFlows: i.subFlows.map(sf => sf.name),
            keywords: i.subFlows.flatMap(sf => sf.keywords).slice(0, 5),
          })),
        },
      });
      if (error) throw error;
      setData(result as CrossIntel);
    } catch (e) {
      console.error("Cross-intel error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIntel(); }, [fetchIntel]);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-foreground flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" /> CROSS-INDUSTRY INTELLIGENCE
          </h1>
          <p className="text-[9px] font-mono text-muted-foreground">
            AI analyzes all 20 industries to find gaps, connections, and opportunities across sectors
          </p>
        </div>
        <button onClick={fetchIntel} disabled={loading} className="p-1.5 rounded border border-border/50 hover:bg-muted/30 text-muted-foreground disabled:opacity-50">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        </button>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-mono text-muted-foreground">AI is analyzing 20 industries and 70+ money flows...</p>
        </div>
      ) : data ? (
        <>
          {/* Summary */}
          <div className="glass-panel p-4 glow-border">
            <h2 className="text-xs font-mono font-bold text-primary mb-2">EXECUTIVE SUMMARY</h2>
            <p className="text-[11px] font-mono text-card-foreground leading-relaxed whitespace-pre-wrap">{data.summary}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cross-Industry Gaps */}
            <div className="glass-panel p-4">
              <h2 className="text-xs font-mono font-bold text-accent mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> CROSS-INDUSTRY GAPS
              </h2>
              <div className="space-y-2">
                {data.gaps?.map((gap, i) => (
                  <div key={i} className="p-2 rounded bg-accent/5 border border-accent/20">
                    <p className="text-[10px] font-mono font-bold text-accent">{gap.title}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{gap.detail}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {gap.industries.map((ind, j) => (
                        <span key={j} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{ind}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connections */}
            <div className="glass-panel p-4">
              <h2 className="text-xs font-mono font-bold text-primary mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> CROSS-INDUSTRY CONNECTIONS
              </h2>
              <div className="space-y-2">
                {data.connections?.map((conn, i) => (
                  <div key={i} className="p-2 rounded bg-primary/5 border border-primary/20">
                    <p className="text-[10px] font-mono font-bold text-foreground">{conn.title}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{conn.detail}</p>
                    <div className="flex items-center gap-1 mt-1 text-[8px] font-mono text-primary">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10">{conn.from}</span>
                      <span>→</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10">{conn.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="glass-panel p-4 lg:col-span-2">
              <h2 className="text-xs font-mono font-bold text-destructive mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> PROACTIVE ALERTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.alerts?.map((alert, i) => (
                  <div key={i} className={`p-2 rounded border ${alert.level === 'critical' ? 'bg-destructive/10 border-destructive/30' : alert.level === 'high' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/20 border-border/20'}`}>
                    <p className="text-[10px] font-mono font-bold text-foreground">{alert.title}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs font-mono text-muted-foreground text-center py-20">Failed to load cross-industry intel. Try refreshing.</p>
      )}
    </div>
  );
}

import { useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGeoContext } from "@/contexts/GeoContext";
import { industries } from "@/lib/industryData";
import { allPickedOptions, buildSubFlowKey, findPickedByKey, type PickedSubFlow } from "@/lib/customIntelTypes";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import { streamChat } from "@/lib/streaming";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Shuffle, ArrowRight, Send, RefreshCw, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

type Scope = { pool: Set<string>; primary: Set<string>; secondary: Set<string> };

function cloneScope(s: Scope): Scope {
  return {
    pool: new Set(s.pool),
    primary: new Set(s.primary),
    secondary: new Set(s.secondary),
  };
}

function moveKey(key: string, scope: Scope, to: "pool" | "primary" | "secondary") {
  scope.pool.delete(key);
  scope.primary.delete(key);
  scope.secondary.delete(key);
  if (to === "pool") scope.pool.add(key);
  if (to === "primary") scope.primary.add(key);
  if (to === "secondary") scope.secondary.add(key);
}

export default function CustomIntelPage() {
  const { geoString, geoScopeId, isGlobal } = useGeoContext();

  const options = useMemo(() => allPickedOptions(), []);
  const byIndustry = useMemo(() => {
    const m = new Map<string, PickedSubFlow[]>();
    for (const p of options) {
      const arr = m.get(p.industrySlug) || [];
      arr.push(p);
      m.set(p.industrySlug, arr);
    }
    return m;
  }, [options]);

  const [industrySlug, setIndustrySlug] = useState(industries[0]?.slug || "");
  const subOptions = byIndustry.get(industrySlug) || [];

  const [scope, setScope] = useState<Scope>(() => ({
    pool: new Set(),
    primary: new Set(),
    secondary: new Set(),
  }));
  const { pool, primary, secondary } = scope;

  const [freeText, setFreeText] = useState("");
  const [freeTextMode, setFreeTextMode] = useState<"primary" | "generic">("primary");

  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStreaming, setChatStreaming] = useState("");

  const [moneyFlowPick, setMoneyFlowPick] = useState<string>("");

  const updateScope = useCallback((fn: (draft: Scope) => void) => {
    setScope((prev) => {
      const next = cloneScope(prev);
      fn(next);
      return next;
    });
  }, []);

  const addToPool = useCallback(() => {
    if (!industrySlug || !subOptions[0]) return;
    const first = subOptions[0];
    const key = buildSubFlowKey(industrySlug, first.subFlow.id);
    updateScope((d) => {
      if (d.primary.has(key) || d.secondary.has(key)) return;
      d.pool.add(key);
    });
  }, [industrySlug, subOptions, updateScope]);

  const addSpecificToPool = useCallback(
    (key: string) => {
      updateScope((d) => {
        if (d.primary.has(key) || d.secondary.has(key)) return;
        d.pool.add(key);
      });
    },
    [updateScope],
  );

  const shuffleRoles = useCallback(() => {
    const all = [...pool, ...primary, ...secondary];
    if (all.length === 0) return;
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const nPri = Math.max(1, Math.min(3, Math.ceil(shuffled.length / 3)));
    const pri = new Set(shuffled.slice(0, nPri));
    const sec = new Set(shuffled.slice(nPri));
    setScope({ pool: new Set(), primary: pri, secondary: sec });
  }, [pool, primary, secondary]);

  const runIntel = useCallback(async () => {
    const selectedCount = pool.size + primary.size + secondary.size;
    if (!freeText.trim() && selectedCount === 0) {
      setError("Add subcategories to pool/primary/secondary or enter text context.");
      return;
    }
    setError(null);
    setLoading(true);
    setReport("");
    setChatMessages([]);

    const toPayload = (keys: Set<string>) =>
      [...keys]
        .map((k) => findPickedByKey(k))
        .filter(Boolean)
        .map((p) => ({
          industryName: p!.industryName,
          subFlowName: p!.subFlow.name,
          moneyFlow: p!.subFlow.moneyFlow,
        }));

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("custom-intel", {
        body: {
          primarySubflows: toPayload(primary),
          secondarySubflows: toPayload(new Set([...secondary, ...pool])),
          freeTextPrimary: freeText.trim(),
          freeTextMode,
          geoContext: isGlobal ? "global" : geoString,
          geoScopeId: geoScopeId || "global",
        },
      });
      if (fnErr) throw fnErr;
      const r = (data as { report?: string; error?: string })?.report || "";
      if (!r && (data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setReport(r || "No report body returned.");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [freeText, freeTextMode, pool, primary, secondary, geoString, geoScopeId, isGlobal]);

  const sendFollowUp = useCallback(() => {
    const q = chatInput.trim();
    if (!q || !report) return;
    setChatInput("");

    const scopeSummary = [
      `Geo: ${isGlobal ? "global" : geoString}`,
      `Primary subflows: ${[...primary].map((k) => findPickedByKey(k)?.subFlow.shortName).filter(Boolean).join(", ") || "—"}`,
      `Secondary subflows: ${[...secondary].map((k) => findPickedByKey(k)?.subFlow.shortName).filter(Boolean).join(", ") || "—"}`,
      freeText.trim() ? `Text context (${freeTextMode}): ${freeText.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const systemPreamble = `You are continuing a custom Maverick intel session.

SCOPE:
${scopeSummary}

FULL PRIOR BRIEF (ground truth for this session):
---
${report.slice(0, 120_000)}
---

Answer the user's follow-up with the same structured block style when analytical. Stay anchored to primary vs secondary linkage.`;

    setChatMessages((prev) => [...prev, { role: "user", content: q }]);

    let acc = "";
    setChatStreaming("");

    streamChat({
      mode: "research",
      messages: [{ role: "user", content: `${systemPreamble}\n\n---\nUSER FOLLOW-UP:\n${q}` }],
      onDelta: (t) => {
        acc += t;
        setChatStreaming(acc);
      },
      onDone: () => {
        setChatMessages((prev) => [...prev, { role: "assistant", content: acc }]);
        setChatStreaming("");
      },
      onError: (err) => {
        setChatMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err || "failed"}` }]);
        setChatStreaming("");
      },
    });
  }, [chatInput, report, isGlobal, geoString, primary, secondary, freeText, freeTextMode]);

  const segments = report ? parseBlocks(report) : [];
  const totalSelected = pool.size + primary.size + secondary.size;

  const chip = (key: string) => {
    const p = findPickedByKey(key);
    if (!p) return null;
    return (
      <div
        key={key}
        className="flex items-center gap-1.5 flex-wrap px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-[10px] font-mono"
      >
        <span className="text-muted-foreground truncate max-w-[140px]">{p.industryName}</span>
        <span className="text-foreground font-bold">{p.subFlow.shortName}</span>
        <button
          type="button"
          className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary hover:bg-primary/25"
          onClick={() => updateScope((d) => moveKey(key, d, "primary"))}
        >
          Primary
        </button>
        <button
          type="button"
          className="text-[9px] px-1.5 py-0.5 rounded bg-accent/15 text-accent hover:bg-accent/25"
          onClick={() => updateScope((d) => moveKey(key, d, "secondary"))}
        >
          Secondary
        </button>
        <button
          type="button"
          onClick={() => updateScope((d) => moveKey(key, d, "pool"))}
          className="text-[9px] px-1.5 py-0.5 rounded bg-background/80 text-muted-foreground hover:text-foreground border border-border/40"
        >
          Pool
        </button>
        <button
          type="button"
          onClick={() =>
            updateScope((d) => {
              d.pool.delete(key);
              d.primary.delete(key);
              d.secondary.delete(key);
            })
          }
          className="opacity-60 hover:opacity-100 ml-auto p-0.5"
          aria-label="Remove from custom scope"
          title="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-24">
      {/* Hero — matches Industry / SubFlow header pattern */}
      <div className="glass-panel p-5 glow-border">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-2.5 shrink-0">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-mono font-bold text-foreground tracking-tight">Custom Intel Lab</h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1">
                Scoped brief · primary vs secondary lanes · structured output
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                Pool sub-flows, promote to <span className="text-primary font-semibold">Primary</span>, route context to{" "}
                <span className="text-accent font-semibold">Secondary</span>, then generate a Maverick brief and follow-ups — same card
                pipeline as Deep Dive.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 shrink-0">
            <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">Region</p>
            <p className="text-[11px] font-mono font-bold text-foreground">{isGlobal ? "Global" : geoString}</p>
          </div>
        </div>
      </div>

      {/* Builder */}
      <div className="glass-panel p-5 glow-border space-y-5">
        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                <span className="text-[10px] text-primary">01</span> Build pool
              </h2>
              <span className="text-[9px] font-mono text-muted-foreground">{pool.size} in pool</span>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-mono text-muted-foreground uppercase tracking-wide">Industry</Label>
              <Select value={industrySlug} onValueChange={setIndustrySlug}>
                <SelectTrigger className="h-9 text-xs font-mono bg-background/80 border-border/60">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.slug} value={ind.slug} className="text-xs font-mono">
                      {ind.icon} {ind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-mono text-muted-foreground uppercase tracking-wide">Money flow</Label>
              <Select
                key={`${industrySlug}-${subOptions.length}`}
                value={moneyFlowPick || undefined}
                onValueChange={(v) => {
                  if (v) {
                    addSpecificToPool(v);
                    setMoneyFlowPick("");
                  }
                }}
              >
                <SelectTrigger className="h-9 text-xs font-mono bg-background/80 border-border/60">
                  <SelectValue placeholder="Choose money flow…" />
                </SelectTrigger>
                <SelectContent>
                  {subOptions.map((o) => (
                    <SelectItem
                      key={o.subFlow.id}
                      value={buildSubFlowKey(o.industrySlug, o.subFlow.id)}
                      className="text-xs font-mono"
                    >
                      {o.subFlow.shortName} — {o.subFlow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-mono" onClick={addToPool} type="button">
                Add first in industry
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-[10px] font-mono gap-1"
                type="button"
                onClick={shuffleRoles}
                disabled={totalSelected === 0}
              >
                <Shuffle className="w-3 h-3" />
                Randomize roles
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                <span className="text-[10px] text-primary">02</span> Text context
              </h2>
              <span className="text-[9px] font-mono text-muted-foreground">Optional</span>
            </div>
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder='e.g. solo dev stack, subcontractor niche, or macro scenario…'
              className="min-h-[100px] text-xs font-mono bg-background/80 border-border/60"
            />
            <RadioGroup
              value={freeTextMode}
              onValueChange={(v) => setFreeTextMode(v as "primary" | "generic")}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="primary" id="ft-primary" className="border-border/60" />
                <Label htmlFor="ft-primary" className="text-[10px] font-mono text-muted-foreground cursor-pointer font-normal">
                  Text is primary lens
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="generic" id="ft-generic" className="border-border/60" />
                <Label htmlFor="ft-generic" className="text-[10px] font-mono text-muted-foreground cursor-pointer font-normal">
                  Text is generic context
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="border-t border-border/40 pt-5">
          <h2 className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5 mb-3">
            <span className="text-[10px] text-primary">03</span> Role lanes
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border/40 bg-muted/10 p-3">
              <p className="text-[10px] font-mono font-bold text-muted-foreground">Pool ({pool.size})</p>
              <p className="text-[9px] font-mono text-muted-foreground/80 mb-2">Unprioritized</p>
              <div className="flex flex-wrap gap-1.5 min-h-[48px]">
                {[...pool].map((k) => chip(k))}
                {pool.size === 0 && <span className="text-[10px] font-mono text-muted-foreground">—</span>}
              </div>
            </div>
            <div className="rounded-lg border border-primary/35 bg-primary/5 p-3">
              <p className="text-[10px] font-mono font-bold text-primary flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Primary ({primary.size})
              </p>
              <p className="text-[9px] font-mono text-primary/80 mb-2">Core lens</p>
              <div className="flex flex-wrap gap-1.5 min-h-[48px]">
                {[...primary].map((k) => chip(k))}
                {primary.size === 0 && <span className="text-[10px] font-mono text-muted-foreground">—</span>}
              </div>
            </div>
            <div className="rounded-lg border border-accent/35 bg-accent/5 p-3">
              <p className="text-[10px] font-mono font-bold text-accent">Secondary ({secondary.size})</p>
              <p className="text-[9px] font-mono text-accent/80 mb-2">Supporting signals</p>
              <div className="flex flex-wrap gap-1.5 min-h-[48px]">
                {[...secondary].map((k) => chip(k))}
                {secondary.size === 0 && <span className="text-[10px] font-mono text-muted-foreground">—</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between border-t border-border/40 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[10px] font-mono"
              type="button"
              onClick={() => setScope({ pool: new Set(), primary: new Set(), secondary: new Set() })}
              disabled={totalSelected === 0}
            >
              Clear all
            </Button>
            <span className="text-[9px] font-mono text-muted-foreground">{totalSelected} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="h-9 text-xs font-mono gap-2 px-4" onClick={runIntel} disabled={loading} type="button">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Run custom intel
            </Button>
            {report && (
              <Button variant="outline" className="h-9 text-xs font-mono gap-1.5 px-3" type="button" onClick={runIntel} disabled={loading}>
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-[11px] font-mono text-destructive border border-destructive/30 rounded-md px-3 py-2 bg-destructive/5">{error}</p>
        )}
      </div>

      {loading && (
        <div className="glass-panel p-12 flex flex-col items-center gap-3 border border-border/40">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-mono font-bold text-foreground">Generating custom intelligence brief…</p>
          <p className="text-[10px] font-mono text-muted-foreground text-center max-w-md">
            Cross-linking primary / secondary with your region scope.
          </p>
        </div>
      )}

      {!loading && segments.length > 0 && (
        <div className="glass-panel p-5 glow-border space-y-3">
          <h2 className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> BRIEF
          </h2>
          <BlockRenderer segments={segments} />
        </div>
      )}

      {report && !loading && (
        <div className="glass-panel p-5 glow-border space-y-3">
          <h2 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wide">Follow-up</h2>
          <p className="text-[9px] font-mono text-muted-foreground -mt-1">Continue the session — answers use the same structured blocks when analytical.</p>
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {chatMessages.map((m, i) => {
              const msgSegments = m.role === "assistant" ? parseBlocks(m.content) : null;
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-md px-3 py-2 text-[11px] font-mono leading-relaxed whitespace-pre-wrap border",
                    m.role === "user"
                      ? "bg-muted/25 border-border/40 text-foreground ml-2 md:ml-8"
                      : "bg-primary/5 border-primary/20 text-foreground mr-2 md:mr-6",
                  )}
                >
                  <span className="text-muted-foreground">{m.role === "user" ? "You · " : "Maverick · "}</span>
                  {msgSegments ? <BlockRenderer segments={msgSegments} /> : m.content}
                </div>
              );
            })}
            {chatStreaming && (
              <div className="rounded-md px-3 py-2 text-[11px] font-mono whitespace-pre-wrap bg-primary/5 text-foreground mr-2 md:mr-6 border border-primary/20">
                <span className="text-muted-foreground">Maverick · </span>
                <BlockRenderer segments={parseBlocks(chatStreaming)} />
              </div>
            )}
          </div>
          <div className="flex gap-2 items-end pt-1">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Deeper cut, challenge an assumption, or request another angle…"
              className="min-h-[72px] text-xs font-mono flex-1 bg-background/80 border-border/60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendFollowUp();
                }
              }}
            />
            <Button type="button" className="shrink-0 h-[72px] w-11 px-0 font-mono" onClick={sendFollowUp} disabled={!chatInput.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

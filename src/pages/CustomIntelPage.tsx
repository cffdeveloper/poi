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
          // Pool items are treated as unprioritized context (secondary) unless promoted.
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
        className="flex items-center gap-1.5 flex-wrap px-3 py-2 rounded-xl border border-border/60 bg-background/70 text-xs shadow-sm"
      >
        <span className="text-muted-foreground truncate max-w-[160px]">{p.industryName}</span>
        <span className="text-foreground font-semibold">{p.subFlow.shortName}</span>
        <button
          type="button"
          className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          onClick={() => updateScope((d) => moveKey(key, d, "primary"))}
        >
          Primary
        </button>
        <button
          type="button"
          className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20"
          onClick={() => updateScope((d) => moveKey(key, d, "secondary"))}
        >
          Secondary
        </button>
        <button
          type="button"
          onClick={() => updateScope((d) => moveKey(key, d, "pool"))}
          className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
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
          className="opacity-60 hover:opacity-100 ml-auto"
          aria-label="Remove from custom scope"
          title="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="glass-panel p-6 glow-border overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3">
              <Layers className="w-6 h-6 text-primary shrink-0" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Custom Intel Lab</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-4xl">
                Build your own scope: create a pool, promote what matters to <span className="text-primary font-medium">Primary</span>, keep
                signal lanes in <span className="text-accent font-medium">Secondary</span>, then run a targeted brief and follow-up.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Region</p>
            <p className="text-sm font-medium text-foreground">{isGlobal ? "Global" : geoString}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-background/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 1 — Build your pool</p>
              <span className="text-xs text-muted-foreground">{pool.size} in pool</span>
            </div>
            <div className="space-y-3">
              <select
                className="text-sm bg-background border border-border rounded-md px-3 py-2 max-w-[240px]"
                value={industrySlug}
                onChange={(e) => setIndustrySlug(e.target.value)}
              >
                {industries.map((ind) => (
                  <option key={ind.slug} value={ind.slug}>
                    {ind.icon} {ind.name}
                  </option>
                ))}
              </select>
              <select
                className="text-sm bg-background border border-border rounded-md px-3 py-2 w-full"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) addSpecificToPool(v);
                  e.target.selectedIndex = 0;
                }}
              >
                <option value="">Choose money flow…</option>
                {subOptions.map((o) => (
                  <option key={o.subFlow.id} value={buildSubFlowKey(o.industrySlug, o.subFlow.id)}>
                    {o.subFlow.shortName} — {o.subFlow.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-sm h-9" onClick={addToPool} type="button">
                  Add first flow in industry
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-sm h-9 gap-1"
                  type="button"
                  onClick={shuffleRoles}
                  disabled={totalSelected === 0}
                >
                  <Shuffle className="w-3 h-3" />
                  Randomize roles
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-background/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 2 — Define your context</p>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder='e.g. "Solo developer: React, edge functions, payments integrations" or "Civil works subcontractor focusing on roads"'
              className="min-h-[90px] text-sm bg-background/80"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="freeTextMode"
                  checked={freeTextMode === "primary"}
                  onChange={() => setFreeTextMode("primary")}
                />
                text is primary
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="freeTextMode"
                  checked={freeTextMode === "generic"}
                  onChange={() => setFreeTextMode("generic")}
                />
                text is generic context
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Step 3 — Assign role lanes
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border/50 p-3 bg-background/40">
              <div className="mb-2">
                <p className="text-sm font-semibold text-muted-foreground">Pool ({pool.size})</p>
                <p className="text-xs text-muted-foreground">Unprioritized candidates</p>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[56px]">
                {[...pool].map((k) => chip(k))}
                {pool.size === 0 && <span className="text-sm text-muted-foreground">Empty</span>}
              </div>
            </div>
            <div className="rounded-2xl border border-primary/30 p-3 bg-primary/5">
              <div className="mb-2">
                <p className="text-sm font-semibold text-primary flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Primary ({primary.size})
                </p>
                <p className="text-xs text-primary/80">Your core position / outcome lens</p>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[56px]">
                {[...primary].map((k) => chip(k))}
                {primary.size === 0 && <span className="text-sm text-muted-foreground">Optional</span>}
              </div>
            </div>
            <div className="rounded-2xl border border-accent/30 p-3 bg-accent/5">
              <div className="mb-2">
                <p className="text-sm font-semibold text-accent">Secondary ({secondary.size})</p>
                <p className="text-xs text-accent/80">Signals supporting your primary thesis</p>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[56px]">
                {[...secondary].map((k) => chip(k))}
                {secondary.size === 0 && <span className="text-sm text-muted-foreground">None</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 items-center justify-between border-t border-border/50 pt-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm h-9"
              type="button"
              onClick={() => setScope({ pool: new Set(), primary: new Set(), secondary: new Set() })}
              disabled={totalSelected === 0}
            >
              Clear all selections
            </Button>
            <span className="text-xs text-muted-foreground">{totalSelected} total selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="text-sm gap-2 h-10 px-5" onClick={runIntel} disabled={loading} type="button">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Run custom deep intel
            </Button>
            {report && (
              <Button variant="outline" className="text-sm gap-1 h-10 px-4" type="button" onClick={runIntel} disabled={loading}>
                <RefreshCw className="w-3 h-3" />
                Refresh brief
              </Button>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      </div>

      {loading && (
        <div className="glass-panel p-10 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-base text-foreground font-medium">Generating your custom intelligence brief…</p>
          <p className="text-sm text-muted-foreground">Cross-linking primary/secondary context with your region focus.</p>
        </div>
      )}

      {!loading && segments.length > 0 && (
        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-base font-semibold text-primary flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> Brief
          </h2>
          <BlockRenderer segments={segments} />
        </div>
      )}

      {report && !loading && (
        <div className="glass-panel p-5 space-y-3 border border-border/50">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Follow-up</h3>
          <div className="space-y-2 max-h-[320px] overflow-y-auto text-sm">
            {chatMessages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg px-3 py-2 whitespace-pre-wrap",
                  m.role === "user" ? "bg-muted/40 text-foreground ml-4" : "bg-primary/5 text-foreground mr-4 border border-primary/15",
                )}
              >
                <span className="text-muted-foreground">{m.role === "user" ? "You: " : "Maverick: "}</span>
                {m.content}
              </div>
            ))}
            {chatStreaming && (
              <div className="rounded-lg px-3 py-2 whitespace-pre-wrap bg-primary/5 text-foreground mr-4 border border-primary/15 text-sm">
                <span className="text-muted-foreground">Maverick: </span>
                {chatStreaming}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question, request a deeper cut on one linkage, or challenge an assumption…"
              className="min-h-[64px] text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendFollowUp();
                }
              }}
            />
            <Button type="button" className="shrink-0 text-sm h-auto px-4" onClick={sendFollowUp} disabled={!chatInput.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

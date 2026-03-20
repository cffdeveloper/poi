import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const sb = createClient(supabaseUrl, serviceKey);

    // 1. Get recent insights and matches that need enrichment
    const { data: recentInsights } = await sb.from("intel_insights")
      .select("*")
      .eq("still_relevant", true)
      .order("created_at", { ascending: false })
      .limit(30);

    const { data: recentMatches } = await sb.from("intel_matches")
      .select("*")
      .eq("status", "new")
      .order("confidence", { ascending: false })
      .limit(10);

    if (!recentMatches?.length && !recentInsights?.length) {
      return new Response(JSON.stringify({ message: "Nothing to process", timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Ask AI to cross-reference, enrich, and find deeper connections
    const systemPrompt = `You are an intel consolidation engine. You take existing market insights and matches and:
1. Find DEEPER connections between them that weren't obvious before
2. Identify which insights are NOW MORE URGENT based on new data
3. Create ACTION PLANS for the highest-value opportunities
4. Flag which insights should be marked as no longer relevant
5. Find NEW gaps by combining multiple existing insights

Return JSON:
{
  "new_insights": [{ "insight_type": "string", "title": "string", "detail": "string", "source_industry": "string", "related_industries": ["string"], "geo_context": ["string"], "estimated_value": "string", "urgency": "string", "score": 0-100, "tags": ["string"] }],
  "enriched_matches": [{ "match_id": "uuid", "new_action_items": [{"step": "string", "priority": "string"}], "new_challenges": [{"challenge": "string", "mitigation": "string"}], "updated_confidence": 0-100 }],
  "stale_insight_ids": ["uuid of insights no longer relevant"]
}`;

    const userPrompt = `EXISTING INSIGHTS:\n${JSON.stringify(recentInsights?.slice(0, 20))}\n\nOPEN MATCHES:\n${JSON.stringify(recentMatches)}\n\nFind deeper connections, create action plans, and identify stale insights. Every new insight MUST have dollar values.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "{}";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let result: any;
    try {
      result = JSON.parse(content);
    } catch {
      console.error("Parse error:", content.substring(0, 200));
      result = { new_insights: [], enriched_matches: [], stale_insight_ids: [] };
    }

    let newInserts = 0;
    let matchUpdates = 0;
    let staleMarked = 0;

    // 3. Insert new discovered insights
    for (const ins of (result.new_insights || [])) {
      const { error } = await sb.from("intel_insights").insert({
        insight_type: ins.insight_type || "opportunity",
        title: ins.title || "Untitled",
        detail: ins.detail || "",
        source_industry: ins.source_industry || null,
        related_industries: ins.related_industries || [],
        geo_context: ins.geo_context || ["global"],
        estimated_value: ins.estimated_value || null,
        urgency: ins.urgency || "medium-term",
        score: ins.score || 50,
        tags: [...(ins.tags || []), "auto-discovered"],
        raw_data: { source: "intel-capture", discovered_at: new Date().toISOString() },
      });
      if (!error) newInserts++;
    }

    // 4. Enrich existing matches with action items
    for (const em of (result.enriched_matches || [])) {
      if (!em.match_id) continue;
      const { error } = await sb.from("intel_matches").update({
        action_items: em.new_action_items || [],
        challenges: em.new_challenges || [],
        confidence: em.updated_confidence || 70,
        status: "enriched",
        updated_at: new Date().toISOString(),
      }).eq("id", em.match_id);
      if (!error) matchUpdates++;
    }

    // 5. Mark stale insights
    for (const id of (result.stale_insight_ids || [])) {
      const { error } = await sb.from("intel_insights").update({ still_relevant: false }).eq("id", id);
      if (!error) staleMarked++;
    }

    // 6. Store a snapshot of this analysis run
    await sb.from("intel_snapshots").insert({
      scope_type: "system",
      scope_key: "intel-capture-run",
      summary: `Discovered ${newInserts} new insights, enriched ${matchUpdates} matches, marked ${staleMarked} stale`,
      analysis: content,
      gaps: result.new_insights || [],
      alerts: [],
    });

    return new Response(JSON.stringify({
      new_insights: newInserts,
      matches_enriched: matchUpdates,
      stale_marked: staleMarked,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("Intel capture error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

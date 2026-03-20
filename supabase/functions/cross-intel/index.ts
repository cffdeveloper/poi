import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industries, geoContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isGlobal = !geoContext || geoContext === "global";
    const geoStr = isGlobal ? "" : geoContext;

    const industryList = (industries || [])
      .map((i: any) => `${i.name}: sub-flows=[${i.subFlows.join(", ")}], keywords=[${i.keywords.join(", ")}]`)
      .join("\n");

    // Fetch historical cross-industry insights
    let historicalContext = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        const { data: pastInsights } = await sb
          .from("intel_insights")
          .select("title, detail, insight_type, source_industry, estimated_value, created_at")
          .eq("still_relevant", true)
          .order("created_at", { ascending: false })
          .limit(15);
        if (pastInsights?.length) {
          historicalContext = `\n\nHISTORICAL INTELLIGENCE (build upon these, note what's changed, identify patterns):\n${pastInsights.map(i => `- [${i.insight_type}/${i.source_industry}] ${i.title}: ${i.detail} (${i.estimated_value || 'N/A'}, ${i.created_at})`).join("\n")}`;
        }
      }
    } catch (e) {
      console.error("Historical fetch error:", e);
    }

    const geoSection = isGlobal
      ? ""
      : `\n\nCRITICAL: ALL analysis must be contextualized to ${geoStr}. Every gap, connection, and alert must explain how it specifically impacts or creates opportunity in ${geoStr}. Reference local market conditions, regulations, companies, and infrastructure in ${geoStr}. Show how global trends can be exploited locally in ${geoStr}.`;

    const systemPrompt = `You are an elite cross-industry intelligence analyst who maps the COMPLETE landscape of how industries interact, who the players are, what they're doing, and where money flows between sectors.

YOUR PRIMARY MISSION: Provide comprehensive intelligence on cross-industry dynamics:
- WHO is operating across multiple industries? Name the companies, funds, and individuals
- WHAT deals, partnerships, and activities connect different sectors? Be specific with names, amounts, dates
- WHERE does money flow between industries? Map the exact pathways
- WHY are certain industries converging? What technology, regulatory, or market forces drive this?
- WHEN did key cross-industry moves happen? What's the timeline?
- WHO is failing at cross-industry plays and WHY?

FROM this intelligence, THEN identify the gaps and arbitrage opportunities.

You MUST respond with valid JSON only.${geoSection}

PRINCIPLES:
- Name SPECIFIC companies, investors, deals, and partnerships — never be vague
- Show the relationships: Company A from Industry X is partnering with Company B from Industry Y because...
- Every gap/opportunity must be DERIVED from the intelligence, not stated in isolation
- Reference and evolve previous analyses${historicalContext}`;

    const userPrompt = `Provide COMPREHENSIVE CROSS-INDUSTRY INTELLIGENCE across all 20 industries${!isGlobal ? ` for the ${geoStr} market` : ""}:

${industryList}

Return JSON:
{
  "summary": "350-word intelligence briefing${!isGlobal ? ` for ${geoStr}` : ""}: Map the key players operating across industries, recent cross-sector deals and partnerships, where money flows between sectors, and what forces are driving industry convergence. Name companies, people, amounts, and dates.",
  "cross_industry_players": [{"name": "...", "industries": ["A","B"], "activity": "what they are doing across sectors", "strategy": "their cross-industry play"}] (6 key cross-industry operators),
  "deals": [{"type": "M&A|partnership|investment|contract", "parties": "who", "industries": ["A","B"], "value": "$X", "significance": "why this cross-industry move matters"}] (5 recent cross-industry deals),
  "gaps": [{"title": "...", "detail": "60-word explanation grounded in the intelligence: what player activity or market condition creates this cross-industry gap${!isGlobal ? ` in ${geoStr}` : ""}", "industries": ["A", "B"], "estimated_value": "$X", "urgency": "high|medium|low", "related_players": "who is relevant"}] (8 cross-industry gaps derived from intel),
  "connections": [{"title": "...", "detail": "50-word explanation with specific companies and how to leverage${!isGlobal ? ` in ${geoStr}` : ""}", "from": "A", "to": "B", "opportunity_type": "arbitrage|supply_chain|tech_transfer|convergence|regulatory", "key_players": "who is involved"}] (8 cross-industry connections),
  "alerts": [{"title": "...", "detail": "...", "level": "critical|high|medium|info"}] (6 time-sensitive cross-industry alerts)
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { summary: content, gaps: [], connections: [], alerts: [] };
    }

    // Persist everything
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        const geoArray = isGlobal ? [] : geoStr.split(",").map((g: string) => g.trim());

        await sb.from("intel_snapshots").insert({
          scope_type: "cross-industry",
          scope_key: isGlobal ? "all" : `all::${geoStr}`,
          summary: parsed.summary,
          gaps: parsed.gaps || [],
          connections: parsed.connections || [],
          alerts: parsed.alerts || [],
        });

        // Persist individual insights
        const insights: any[] = [];
        for (const gap of (parsed.gaps || [])) {
          insights.push({
            insight_type: "gap",
            title: gap.title,
            detail: gap.detail,
            source_industry: "cross-industry",
            related_industries: gap.industries || [],
            geo_context: geoArray,
            estimated_value: gap.estimated_value || null,
            urgency: gap.urgency || null,
            raw_data: gap,
          });
        }
        for (const conn of (parsed.connections || [])) {
          insights.push({
            insight_type: "connection",
            title: conn.title,
            detail: conn.detail,
            source_industry: "cross-industry",
            related_industries: [conn.from, conn.to].filter(Boolean),
            geo_context: geoArray,
            tags: [conn.opportunity_type].filter(Boolean),
            raw_data: conn,
          });
        }
        for (const alert of (parsed.alerts || [])) {
          insights.push({
            insight_type: "alert",
            title: alert.title,
            detail: alert.detail,
            source_industry: "cross-industry",
            geo_context: geoArray,
            urgency: alert.level,
            raw_data: alert,
          });
        }
        if (insights.length > 0) {
          await sb.from("intel_insights").insert(insights);
        }

        // Geo cache
        if (!isGlobal) {
          await sb.from("geo_intel_cache").insert({
            geo_scope: geoStr,
            scope_type: "cross-industry",
            scope_key: "all",
            analysis: parsed.summary,
            gaps: parsed.gaps || [],
            alerts: parsed.alerts || [],
            connections: parsed.connections || [],
          });
        }
      }
    } catch (snapErr) {
      console.error("Storage error:", snapErr);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cross-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

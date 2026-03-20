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
    const { industry, subFlow, keywords, detailed, geoContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const keywordStr = (keywords || []).slice(0, 8).join(", ");
    const scope = subFlow ? `the "${subFlow}" money flow within the ${industry} industry` : `the ${industry} industry broadly`;
    const isGlobal = !geoContext || geoContext === "global";
    const geoStr = isGlobal ? "" : geoContext;

    // Fetch historical insights from DB for context
    let historicalContext = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        const { data: pastInsights } = await sb
          .from("intel_insights")
          .select("title, detail, insight_type, estimated_value, created_at")
          .eq("source_industry", industry)
          .eq("still_relevant", true)
          .order("created_at", { ascending: false })
          .limit(10);
        if (pastInsights?.length) {
          historicalContext = `\n\nHISTORICAL INSIGHTS FROM PREVIOUS ANALYSES (reference these, build on them, note changes):\n${pastInsights.map(i => `- [${i.insight_type}] ${i.title}: ${i.detail} (Value: ${i.estimated_value || 'N/A'}, Date: ${i.created_at})`).join("\n")}`;
        }
      }
    } catch (e) {
      console.error("Historical fetch error:", e);
    }

    const geoPromptSection = isGlobal
      ? ""
      : `\n\nCRITICAL GEO-CONTEXT: The user is focused on ${geoStr}. ALL analysis MUST be contextualized to this specific market:
- How does each global trend affect ${geoStr} specifically?
- What are the local regulations, market conditions, and cultural factors in ${geoStr}?
- What are the specific local players, competitors, and market sizes in ${geoStr}?
- How can global opportunities be adapted and exploited in ${geoStr}?
- What cross-border opportunities exist between ${geoStr} and global markets?
- What infrastructure, talent, and capital availability exists in ${geoStr}?
- Reference specific local companies, government programs, and market data for ${geoStr}.
Every single insight and gap must be actionable in the context of ${geoStr}.`;

    const systemPrompt = `You are an elite industry intelligence analyst with deep knowledge of every sector on earth. Your PRIMARY job is to provide COMPREHENSIVE INTELLIGENCE on every relevant player, activity, partnership, regulation, and movement in an industry — WHO is doing WHAT, with WHOM, WHY, WHEN, and WHERE. Your SECONDARY job is to derive money-making gaps from that intelligence.

INTELLIGENCE COMES FIRST. You must paint a complete picture of:
- KEY PLAYERS: Name every major company, startup, government body, NGO, investor, and individual driving this space. What are they doing? What's their strategy? Who are they partnering with? What have they announced recently?
- ACTIVITIES & DEALS: Recent mergers, acquisitions, funding rounds, product launches, regulatory filings, patent applications, government tenders, contracts awarded, partnerships signed. Name names, cite amounts, give dates.
- COMPETITIVE LANDSCAPE: Who competes with whom? What's each player's market share? Who's winning and losing? What strategies are working vs failing? Who just entered or exited?
- REGULATORY ENVIRONMENT: What laws, policies, standards, or regulations are changing? Who's lobbying? What compliance requirements exist? What government programs or subsidies are available?
- MONEY FLOWS: Where exactly does money move in this industry? Who pays whom? What are the margins at each step? Where are the biggest cost centers? Where are the highest-margin segments?
- TECHNOLOGY & INNOVATION: What new technologies are being adopted? Who's building them? What R&D is happening? What patents were recently filed?
- TALENT & WORKFORCE: Who's hiring? What skills are in demand? Where are talent gaps? Key C-suite moves?

THEN from all this intelligence, identify the gaps and opportunities that emerge naturally.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON.${geoPromptSection}

KEY PRINCIPLES:
- Name SPECIFIC companies, people, dollar amounts, and dates — never be vague
- Every gap must emerge from the intelligence, not be stated in isolation
- Connect the dots: show WHY a gap exists based on what the players are doing (or not doing)
- Cross-reference with adjacent industries when relevant
- Reference and build upon previous analyses when available${historicalContext}`;

    const userPrompt = detailed
      ? `Provide COMPREHENSIVE INTELLIGENCE on ${scope}.${!isGlobal ? ` Focus on the ${geoStr} market specifically.` : ""} Keywords: ${keywordStr}.

Return JSON with these exact keys:
{
  "analysis": "400-word deep intelligence briefing${!isGlobal ? ` contextualized to ${geoStr}` : ""}: Who are the major players and what are they doing? What deals, launches, and partnerships happened recently? What regulatory changes are underway? Where is money flowing and where is it stuck? Name companies, people, amounts, and dates.",
  "players": [{"name": "Company/Person name", "role": "what they do in this space", "recent_activity": "what they have done recently", "strategy": "their apparent strategy", "partnerships": "who they work with"}] (8-10 key players),
  "news": [{"title": "...", "summary": "40-word summary covering who did what, when, why, and what it means${!isGlobal ? ` for ${geoStr}` : ""}"}] (6 recent developments with full context),
  "deals": [{"type": "funding|M&A|partnership|contract|IPO|regulatory", "parties": "who is involved", "value": "$X", "date": "when", "significance": "why it matters"}] (4-6 recent deals/events),
  "gaps": [{"title": "...", "detail": "60-word explanation grounded in intelligence above: What specific player activity or market condition creates this gap? Its estimated market value and how to exploit it${!isGlobal ? ` in ${geoStr}` : ""}", "value": "$X estimate", "urgency": "high|medium|low", "capital_needed": "low|medium|high", "related_players": "who is relevant"}] (6 exploitable gaps derived from the intel),
  "alerts": [{"title": "...", "detail": "...", "level": "critical|high|medium|info"}] (4 time-sensitive alerts),
  "liveData": {"metric_name": value} (8 relevant quantitative metrics${!isGlobal ? ` for ${geoStr}` : ""})
}`
      : `Give comprehensive intelligence on ${scope}.${!isGlobal ? ` Focus on the ${geoStr} market.` : ""} Keywords: ${keywordStr}.

Return JSON:
{
  "analysis": "250-word intelligence briefing${!isGlobal ? ` for ${geoStr}` : ""}: Who are the key players? What are they doing? What deals happened? Where does money flow? What gaps emerge from this landscape?",
  "players": [{"name": "...", "role": "...", "recent_activity": "..."}] (5 key players),
  "news": [{"title": "...", "summary": "..."}] (3 developments with full context on who/what/why),
  "gaps": [{"title": "...", "detail": "...", "value": "$X estimate"}] (3 gaps derived from the intel)
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
      parsed = { analysis: content, news: [], gaps: [], alerts: [], liveData: {} };
    }

    // Persist snapshot + individual insights
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        const geoArray = isGlobal ? [] : geoStr.split(",").map((g: string) => g.trim());

        // Store snapshot
        await sb.from("intel_snapshots").insert({
          scope_type: subFlow ? "subflow" : "industry",
          scope_key: subFlow ? `${industry}::${subFlow}` : industry,
          analysis: parsed.analysis,
          gaps: parsed.gaps || [],
          alerts: parsed.alerts || [],
          live_data: parsed.liveData || {},
          news: parsed.news || [],
        });

        // Store individual insights for persistent learning
        const insights: any[] = [];

        // Store players as intel
        for (const player of (parsed.players || [])) {
          insights.push({
            insight_type: "player",
            title: player.name,
            detail: `${player.role}. Recent: ${player.recent_activity}. Strategy: ${player.strategy}. Partners: ${player.partnerships || 'N/A'}`,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            tags: ["player", "intelligence"],
            raw_data: player,
          });
        }

        // Store deals
        for (const deal of (parsed.deals || [])) {
          insights.push({
            insight_type: "deal",
            title: `${deal.type}: ${deal.parties}`,
            detail: `${deal.significance}. Value: ${deal.value || 'undisclosed'}. Date: ${deal.date || 'recent'}`,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            estimated_value: deal.value || null,
            tags: ["deal", deal.type || "unknown"],
            raw_data: deal,
          });
        }

        for (const gap of (parsed.gaps || [])) {
          insights.push({
            insight_type: "gap",
            title: gap.title,
            detail: gap.detail,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            estimated_value: gap.value || null,
            urgency: gap.urgency || null,
            tags: [gap.capital_needed ? `capital:${gap.capital_needed}` : "", gap.related_players || ""].filter(Boolean),
            raw_data: gap,
          });
        }

        for (const alert of (parsed.alerts || [])) {
          insights.push({
            insight_type: "alert",
            title: alert.title,
            detail: alert.detail,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            urgency: alert.level,
            raw_data: alert,
          });
        }

        for (const news of (parsed.news || [])) {
          insights.push({
            insight_type: "trend",
            title: news.title,
            detail: news.summary,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            raw_data: news,
          });
        }

        if (insights.length > 0) {
          await sb.from("intel_insights").insert(insights);
        }

        // Also cache for geo
        if (!isGlobal) {
          await sb.from("geo_intel_cache").insert({
            geo_scope: geoStr,
            scope_type: subFlow ? "subflow" : "industry",
            scope_key: subFlow ? `${industry}::${subFlow}` : industry,
            analysis: parsed.analysis,
            gaps: parsed.gaps || [],
            alerts: parsed.alerts || [],
            market_data: parsed.liveData || {},
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
    console.error("industry-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

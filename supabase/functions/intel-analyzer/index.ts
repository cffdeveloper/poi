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

    // 1. Fetch recent raw data (last 24h)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: rawData } = await sb.from("raw_market_data")
      .select("source, data_type, geo_scope, payload, tags")
      .gte("created_at", dayAgo)
      .order("created_at", { ascending: false })
      .limit(200);

    // 2. Fetch existing insights to avoid duplicates
    const { data: existingInsights } = await sb.from("intel_insights")
      .select("title, insight_type, created_at")
      .eq("still_relevant", true)
      .order("created_at", { ascending: false })
      .limit(50);

    // 3. Summarize raw data for AI
    const dataSummary = {
      crypto: rawData?.filter(r => r.data_type === "crypto_price").slice(0, 15).map(r => r.payload),
      forex: rawData?.filter(r => r.data_type === "forex_rate").slice(0, 20).map(r => r.payload),
      news: rawData?.filter(r => r.data_type === "news_signal").slice(0, 20).map(r => r.payload),
      economics: rawData?.filter(r => r.data_type === "economic_indicator").slice(0, 30).map(r => r.payload),
    };

    const existingTitles = existingInsights?.map(i => i.title).join("; ") || "none yet";

    // 4. Ask AI to find gaps and opportunities
    const systemPrompt = `You are a proactive market intelligence engine. Your ONLY job is to find MONEY-MAKING GAPS and OPPORTUNITIES by cross-referencing data across industries, geographies, and time periods.

Rules:
- Every insight MUST have a dollar value estimate (TAM/SAM or revenue potential)
- Cross-reference across industries: if education needs water tech, SAY SO
- Look for arbitrage: price differences, regulatory gaps, supply-demand mismatches
- Flag timing: why NOW is the moment to act
- Be specific: name companies, products, markets, not vague trends
- DO NOT repeat these existing insights: ${existingTitles}

Return ONLY valid JSON array of objects, each with:
{
  "insight_type": "gap|opportunity|arbitrage|trend|warning",
  "title": "specific actionable title",
  "detail": "2-3 sentences explaining the opportunity, how to exploit it, and cross-industry connections",
  "source_industry": "primary industry",
  "related_industries": ["list of related industries"],
  "geo_context": ["country codes or 'global'"],
  "estimated_value": "$X million/billion",
  "urgency": "immediate|short-term|medium-term",
  "score": 0-100,
  "tags": ["relevant", "tags"]
}

Return 5-10 insights. Focus on ACTIONABLE gaps, not general observations.`;

    const userPrompt = `Analyze this real-time market data and find exploitable gaps and opportunities:

CRYPTO MARKETS: ${JSON.stringify(dataSummary.crypto?.slice(0, 10))}

FOREX RATES: ${JSON.stringify(dataSummary.forex?.slice(0, 15))}

NEWS SIGNALS: ${JSON.stringify(dataSummary.news?.slice(0, 15))}

ECONOMIC INDICATORS: ${JSON.stringify(dataSummary.economics?.slice(0, 20))}

Find cross-industry connections, supply-demand mismatches, regulatory arbitrage, and timing opportunities. Every insight must have a specific dollar value and actionable steps.`;

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
      return new Response(JSON.stringify({ error: "Rate limited", retry: true }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "[]";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let insights: any[];
    try {
      insights = JSON.parse(content);
      if (!Array.isArray(insights)) insights = [insights];
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 200));
      insights = [];
    }

    // 5. Store insights (System 3 - Intel Capture)
    let stored = 0;
    for (const insight of insights) {
      const { error } = await sb.from("intel_insights").insert({
        insight_type: insight.insight_type || "opportunity",
        title: insight.title || "Untitled",
        detail: insight.detail || "",
        source_industry: insight.source_industry || null,
        related_industries: insight.related_industries || [],
        geo_context: insight.geo_context || ["global"],
        estimated_value: insight.estimated_value || null,
        urgency: insight.urgency || "medium-term",
        score: insight.score || 50,
        tags: insight.tags || [],
        raw_data: { source: "intel-analyzer", analyzed_at: new Date().toISOString() },
      });
      if (!error) stored++;
      else console.error("Insert insight error:", error.message);
    }

    // 6. Create intel_matches for high-confidence cross-industry opportunities
    const highValue = insights.filter(i => (i.score || 0) >= 70 && (i.related_industries?.length || 0) > 1);
    let matches = 0;
    for (const h of highValue) {
      const { error } = await sb.from("intel_matches").insert({
        match_type: h.insight_type || "opportunity",
        title: h.title,
        description: h.detail,
        industries: [h.source_industry, ...(h.related_industries || [])].filter(Boolean),
        geo_context: h.geo_context || ["global"],
        estimated_value: h.estimated_value,
        confidence: h.score || 70,
        action_items: [],
        challenges: [],
      });
      if (!error) matches++;
    }

    return new Response(JSON.stringify({
      analyzed: rawData?.length || 0,
      insights_found: insights.length,
      insights_stored: stored,
      matches_created: matches,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("Intel analyzer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

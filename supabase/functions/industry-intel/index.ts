import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, subFlow, keywords, detailed } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const keywordStr = (keywords || []).slice(0, 8).join(", ");
    const scope = subFlow ? `the "${subFlow}" money flow within the ${industry} industry` : `the ${industry} industry broadly`;

    const systemPrompt = `You are a world-class industry intelligence analyst. You analyze global industries, money flows, market dynamics, and identify gaps, opportunities, and emerging trends. You MUST respond with valid JSON only — no markdown, no explanation outside the JSON.`;

    const userPrompt = detailed
      ? `Analyze ${scope}. Keywords: ${keywordStr}.

Return JSON with these exact keys:
{
  "analysis": "A 200-word deep analysis of current state, trends, disruptions, key players, and outlook for this specific money flow. Be specific with data points, percentages, and company names where possible.",
  "news": [{"title": "...", "summary": "30-word summary"}] (5 recent relevant developments),
  "gaps": [{"title": "...", "detail": "50-word explanation of the gap/opportunity"}] (4 gaps or underserved areas),
  "alerts": [{"title": "...", "detail": "...", "level": "critical|high|medium|info"}] (3 key alerts),
  "liveData": {"metric_name": value} (6 relevant quantitative metrics with realistic current values — e.g., market_size_usd_billions, growth_rate_pct, top_player_market_share, avg_margin_pct, etc.)
}`
      : `Give a high-level industry brief for ${scope}. Keywords: ${keywordStr}.

Return JSON:
{
  "analysis": "150-word overview of the industry's current state, key trends, and major players.",
  "news": [{"title": "...", "summary": "..."}] (3 recent developments),
  "gaps": [{"title": "...", "detail": "..."}] (2 major gaps)
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
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please wait" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { analysis: content, news: [], gaps: [], alerts: [], liveData: {} };
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

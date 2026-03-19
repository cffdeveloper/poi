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
    const { industries } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const industryList = (industries || [])
      .map((i: any) => `${i.name}: sub-flows=[${i.subFlows.join(", ")}], keywords=[${i.keywords.join(", ")}]`)
      .join("\n");

    const systemPrompt = `You are a cross-industry intelligence analyst. You analyze connections between different industries, identify gaps where one industry's money flow could benefit another, and detect emerging cross-sector opportunities. You MUST respond with valid JSON only.`;

    const userPrompt = `Analyze these 20 industries and their money flows for cross-industry intelligence:

${industryList}

Return JSON with:
{
  "summary": "200-word executive summary of the global cross-industry landscape, key macro trends affecting multiple sectors, and the biggest opportunities at industry intersections.",
  "gaps": [{"title": "...", "detail": "50-word explanation", "industries": ["Industry A", "Industry B"]}] (6 cross-industry gaps where value is being lost between sectors),
  "connections": [{"title": "...", "detail": "40-word explanation of the connection", "from": "Industry A", "to": "Industry B"}] (6 strong connections between different industries that create opportunities),
  "alerts": [{"title": "...", "detail": "...", "level": "critical|high|medium|info"}] (5 proactive alerts about cross-industry risks or emerging disruptions)
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
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
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

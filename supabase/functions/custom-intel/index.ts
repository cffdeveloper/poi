import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { temporalIntelRules } from "../_shared/temporalPrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLOCK_INSTRUCTIONS = `
## STRUCTURED OUTPUT

Use the same block syntax as Maverick deep-dives (:::metrics, :::insights, :::framework, :::comparison, :::steps, :::score).
Put narrative BETWEEN blocks. JSON inside blocks must be valid.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      primarySubflows = [],
      secondarySubflows = [],
      freeTextPrimary = "",
      freeTextMode = "primary",
      geoContext = "global",
    } = body;

    const isGlobalGeo = !geoContext || geoContext === "global";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const primaryLines = (primarySubflows as { industryName: string; subFlowName: string; moneyFlow?: string }[])
      .map((p) => `- ${p.industryName} → ${p.subFlowName}${p.moneyFlow ? ` (${p.moneyFlow})` : ""}`)
      .join("\n");

    const secondaryLines = (secondarySubflows as { industryName: string; subFlowName: string; moneyFlow?: string }[])
      .map((s) => `- ${s.industryName} → ${s.subFlowName}${s.moneyFlow ? ` (${s.moneyFlow})` : ""}`)
      .join("\n");

    const hasPrimary = (primarySubflows as unknown[]).length > 0 || (String(freeTextPrimary || "").trim() && freeTextMode === "primary");

    const systemPrompt = `You are Maverick, an elite cross-domain intelligence engine. The user has defined a CUSTOM scope with optional PRIMARY focus areas and SECONDARY lenses.

${BLOCK_INSTRUCTIONS}

RULES FOR THIS MODE:
1. ${hasPrimary ? "If primary exists, it defines success: tie every major insight back to primary implications unless it's direct risk." : "No explicit primary selected: treat all selected non-primary lanes as one generic basket and infer a single center of gravity from that basket."}
2. SECONDARY is not "general market trivia." Explain what is happening OUT THERE and why it matters to the center of gravity (explicit primary if present, inferred generic basket if not).
3. Explicitly map linkages: "Because X moved in [secondary], the focal scope faces Y opportunity / Z risk in ${isGlobalGeo ? "global markets" : geoContext}."
4. Name companies, policies, numbers, dates where plausible. Mark uncertainty.
5. Include forward-looking gaps and scenarios (not stale headlines as if current news).

${temporalIntelRules()}`;

    const userPrompt = `Generate a COMPREHENSIVE CUSTOM INTELLIGENCE BRIEF.

${freeTextPrimary && String(freeTextPrimary).trim() ? `## USER TEXT CONTEXT (${freeTextMode === "primary" ? "PRIMARY POSITION" : "GENERIC CONTEXT"})\n${String(freeTextPrimary).trim()}\n` : ""}

## PRIMARY SUBCATEGORIES (what to optimize for / strategic home base)
${primaryLines || "(none selected)"}

## SECONDARY SUBCATEGORIES (peripheral markets; if no primary, these become the generic focal basket)
${secondaryLines || "(none — use only primary scope)"}

## GEO FOCUS
${isGlobalGeo ? "Worldwide / global." : `Mandatory: ${geoContext}. Localize examples, regulators, channels, and sizing to this geography.`}

OUTPUT REQUIREMENTS:
1. Executive summary anchored on ${hasPrimary ? "PRIMARY" : "the inferred generic basket center"}, with SECONDARY as supporting scan.
2. Section: "Linkage matrix" — table or bullets: Secondary signal → Mechanism → ${hasPrimary ? "Primary impact" : "Generic basket impact"}.
3. Multiple structured blocks (metrics, insights, framework, comparison, steps, score).
4. "What to watch" — 5 concrete monitors across secondary areas tied to primary.
5. Gaps & market white space from THIS combined lens, in ${isGlobalGeo ? "global" : geoContext} context.

Be specific. No generic consulting filler.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const report = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("custom-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

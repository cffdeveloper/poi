import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLOCK_INSTRUCTIONS = `
## STRUCTURED OUTPUT BLOCKS

You are a world-class market opportunity analyst. Your responses MUST contain structured data blocks using this exact syntax:

### METRICS BLOCK
:::metrics
[{"label":"Addressable Market","value":"$4.2T","trend":"up","delta":"+12.3%"}]
:::

### COMPARISON BLOCK
:::comparison
{"title":"...","headers":["Criteria","A","B"],"rows":[["Revenue Potential","$2B","$500M"]],"verdict":"..."}
:::

### FRAMEWORK BLOCK
:::framework
{"title":"Opportunity Analysis","type":"swot","sections":[{"label":"Strengths","color":"emerald","items":["..."]}]}
:::

### INSIGHTS BLOCK
:::insights
{"title":"Key Findings","items":[{"text":"...","score":9,"tag":"High ROI"}]}
:::

### STEPS BLOCK
:::steps
{"title":"Exploitation Roadmap","items":[{"phase":"Phase 1","duration":"Weeks 1-4","tasks":["..."],"status":"critical"}]}
:::

### SCORE BLOCK
:::score
{"title":"Opportunity Score","score":7.8,"maxScore":10,"label":"Strong Play","summary":"...","breakdown":[{"category":"Market Size","score":9}]}
:::

RULES:
1. ALWAYS use 3-5 structured blocks per report
2. JSON must be valid
3. Put narrative text BETWEEN blocks
4. Be extremely specific with dollar amounts, margins, company names, market sizes
5. Score and rate EVERY opportunity
6. The ::: delimiters must be on their own line
7. NEVER label blocks before them — flow naturally into ::: syntax
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, context, industryName, subFlowName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are Maverick, an elite intelligence engine that produces COMPREHENSIVE industry reports worth $100,000. Your reports are intelligence-first: you map the ENTIRE landscape of players, activities, relationships, and money flows BEFORE identifying opportunities.

${BLOCK_INSTRUCTIONS}

Your reports MUST include:
1. Executive summary — a comprehensive intelligence picture: who are the key players, what are they doing, and what does the landscape look like
2. METRICS block with 6+ quantitative findings (market sizes, player revenues, deal sizes, funding data, growth rates, margins)
3. INSIGHTS block with 6+ scored findings — each MUST reference specific companies, people, or events. Score by both intelligence value AND ROI potential
4. FRAMEWORK block — FULL landscape analysis: Key Players (who they are, what they're doing, their strategies), Market Dynamics (forces, trends, regulations), Opportunities (gaps derived from intel), Threats (risks, competition, regulation)
5. COMPARISON block — compare KEY PLAYERS: their strategies, market positions, recent moves, strengths/weaknesses
6. STEPS block — concrete action plan with stakeholders to engage, partnerships to pursue, and capital requirements
7. SCORE block — overall opportunity score with breakdown: Intel Completeness, Market Size, Timing, Competition, Margins, Scalability, Risk

CRITICAL RULES:
- INTELLIGENCE FIRST: Every section must name specific companies, people, deals, amounts, and dates
- Map relationships: who works with whom, who competes with whom, who funds whom
- Show the complete value chain: who pays whom at each step, what are the margins
- Detail what has been tried before, BY WHOM, and specifically WHY it failed
- Cross-reference with adjacent industries — which players from other sectors are entering?
- Include regulatory landscape: what laws/policies matter, who's lobbying, what's changing`;

    const userPrompt = `Generate a COMPREHENSIVE INTELLIGENCE DEEP-DIVE on: "${topic}"

${industryName ? `Industry: ${industryName}` : ""}
${subFlowName ? `Money flow: ${subFlowName}` : ""}
${context ? `Context: ${context}` : ""}

INTELLIGENCE REQUIREMENTS (answer ALL):
- WHO are the top 10+ players in this space? (Companies, investors, individuals, government bodies)
- WHAT is each player doing? (Strategy, recent launches, deals, partnerships, hires)
- WHO partners with WHOM and WHY? (Map the relationship web)
- WHAT deals happened recently? (Funding, M&A, contracts — amounts, dates, parties)
- WHAT regulations/policies affect this space? (Who enforces them? What's changing?)
- WHERE does money flow? (Full value chain with margins at each step)
- WHO has tried this before? WHAT exactly did they do? WHY did they fail or succeed?
- WHAT technologies are being used/developed? By whom?
- WHAT talent/skills are needed? Who's hiring? What's the talent gap?

FROM ALL THIS INTELLIGENCE, DERIVE:
- What specific gaps exist and WHY (grounded in player activities)
- What's the minimum viable play vs the full play?
- Unit economics: CAC, LTV, margins based on comparable players
- Who are ideal partners and first customers?
- 12/24/36-month projections based on market trajectory

Be RUTHLESSLY specific. Name every name. Cite every number. No generic advice.`;

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
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const report = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("deep-dive error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

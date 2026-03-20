import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function safeFetch(url: string, timeout = 8000): Promise<any> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// Scrape GDELT for social media references and recent news
async function scrapeGDELT(keywords: string[], limit = 20): Promise<any[]> {
  const results: any[] = [];
  const query = encodeURIComponent(keywords.slice(0, 5).join(" OR "));
  
  // GDELT DOC API - latest articles mentioning keywords
  const docData = await safeFetch(
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=${limit}&format=json&sort=DateDesc`
  );
  if (docData?.articles) {
    for (const a of docData.articles) {
      results.push({
        type: "news",
        title: a.title,
        url: a.url,
        source: a.domain,
        date: a.seendate,
        country: a.sourcecountry,
        language: a.language,
        tone: a.tone,
      });
    }
  }

  // GDELT GKG (Global Knowledge Graph) for entity/theme extraction
  const gkgData = await safeFetch(
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=TimelineSourceCountry&format=json&TIMESPAN=72h`
  );
  if (gkgData) {
    results.push({ type: "trend_data", data: gkgData });
  }

  return results;
}

// Scrape Reddit for public discussions
async function scrapeReddit(keywords: string[]): Promise<any[]> {
  const results: any[] = [];
  const query = encodeURIComponent(keywords.slice(0, 3).join("+"));
  
  const data = await safeFetch(
    `https://www.reddit.com/search.json?q=${query}&sort=new&limit=15&t=week`,
    10000
  );
  
  if (data?.data?.children) {
    for (const post of data.data.children) {
      const d = post.data;
      results.push({
        type: "reddit",
        title: d.title,
        text: (d.selftext || "").slice(0, 300),
        subreddit: d.subreddit,
        score: d.score,
        comments: d.num_comments,
        url: `https://reddit.com${d.permalink}`,
        date: new Date(d.created_utc * 1000).toISOString(),
        author: d.author,
      });
    }
  }
  return results;
}

// Scrape Hacker News for tech discussions
async function scrapeHackerNews(keywords: string[]): Promise<any[]> {
  const results: any[] = [];
  const query = encodeURIComponent(keywords.slice(0, 3).join(" "));
  
  const data = await safeFetch(
    `https://hn.algolia.com/api/v1/search_by_date?query=${query}&tags=story&hitsPerPage=10`
  );
  
  if (data?.hits) {
    for (const hit of data.hits) {
      results.push({
        type: "hackernews",
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        points: hit.points,
        comments: hit.num_comments,
        date: hit.created_at,
        author: hit.author,
      });
    }
  }
  return results;
}

// Use AI to synthesize social signals into actionable intel
async function synthesizeSocialIntel(
  signals: any[],
  industry: string,
  subFlow: string | null,
  keywords: string[],
  geoContext: string,
  LOVABLE_API_KEY: string
): Promise<any> {
  const signalSummary = signals.slice(0, 30).map(s => {
    if (s.type === "news") return `[NEWS ${s.date}] ${s.title} (${s.source}, ${s.country})`;
    if (s.type === "reddit") return `[REDDIT r/${s.subreddit} ↑${s.score}] ${s.title}`;
    if (s.type === "hackernews") return `[HN ↑${s.points}] ${s.title}`;
    return `[${s.type}] ${JSON.stringify(s).slice(0, 150)}`;
  }).join("\n");

  const scope = subFlow ? `"${subFlow}" sub-flow in ${industry}` : industry;
  const isGlobal = !geoContext || geoContext === "global";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a real-time social media intelligence analyst. You analyze social signals (news, Reddit, HN, public posts) to extract CURRENT intelligence about industries. Focus on what is happening RIGHT NOW — in the last 24-72 hours. Never reference old data unless it directly impacts current events.

Your job:
1. Extract WHO is doing WHAT from these signals
2. Identify BREAKING developments and announcements
3. Spot emerging trends from social discussions
4. Identify sentiment shifts and controversies
5. Find company announcements, product launches, hiring signals
6. Detect regulatory changes being discussed
${!isGlobal ? `7. Contextualize everything to ${geoContext} — how does each signal affect this specific market?` : ""}

Return valid JSON only.`
        },
        {
          role: "user",
          content: `Analyze these LIVE social signals for ${scope}${!isGlobal ? ` (focused on ${geoContext} market)` : ""}:

${signalSummary}

Keywords context: ${keywords.join(", ")}

Return JSON:
{
  "breaking": [{"headline": "...", "detail": "50-word analysis of what happened and why it matters${!isGlobal ? ` for ${geoContext}` : ""}", "source": "where this came from", "timestamp": "when", "players_involved": ["company/person names"], "impact": "high|medium|low"}] (top 5 most important current developments),
  "player_activity": [{"player": "company/person name", "activity": "what they are doing/announced", "source": "signal source", "implications": "what this means for the industry"}] (8-10 active players spotted),
  "social_sentiment": {"overall": "bullish|bearish|mixed|neutral", "hot_topics": ["topic being discussed"], "controversies": ["any debates/issues"], "emerging_terms": ["new buzzwords/concepts appearing"]},
  "opportunities_from_signals": [{"title": "...", "detail": "how this social signal reveals an opportunity${!isGlobal ? ` in ${geoContext}` : ""}", "urgency": "act_now|this_week|this_month", "source_signal": "which signal triggered this"}] (3-5 opportunities),
  "freshness_score": 0-100 (how current and fresh is this intelligence)
}`
        }
      ],
    }),
  });

  if (!response.ok) return null;
  const aiData = await response.json();
  const content = aiData.choices?.[0]?.message?.content || "{}";
  try {
    return JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { industry, subFlow, keywords, geoContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Scrape all social sources in parallel
    const [gdeltSignals, redditSignals, hnSignals] = await Promise.all([
      scrapeGDELT(keywords || [], 20),
      scrapeReddit(keywords || []),
      scrapeHackerNews(keywords || []),
    ]);

    const allSignals = [...gdeltSignals, ...redditSignals, ...hnSignals];

    // Store raw signals in DB
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);

      const rows = allSignals
        .filter(s => s.type !== "trend_data")
        .slice(0, 50)
        .map(s => ({
          source: `social_${s.type}`,
          data_type: "social_signal",
          geo_scope: s.country || geoContext || "global",
          industry: industry || null,
          payload: s,
          tags: ["social", s.type, ...(keywords || []).slice(0, 3)],
        }));

      if (rows.length > 0) {
        await sb.from("raw_market_data").insert(rows);
      }
    } catch (e) {
      console.error("DB store error:", e);
    }

    // Synthesize with AI
    const synthesis = await synthesizeSocialIntel(
      allSignals,
      industry || "general",
      subFlow || null,
      keywords || [],
      geoContext || "global",
      LOVABLE_API_KEY
    );

    // Store synthesized insights
    if (synthesis) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, serviceKey);
        const geoArray = geoContext && geoContext !== "global" ? geoContext.split(",").map((g: string) => g.trim()) : [];

        const insights: any[] = [];
        for (const b of (synthesis.breaking || [])) {
          insights.push({
            insight_type: "breaking",
            title: b.headline,
            detail: b.detail,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            urgency: b.impact === "high" ? "critical" : b.impact,
            tags: ["social", "breaking", ...(b.players_involved || [])],
            raw_data: b,
          });
        }
        for (const p of (synthesis.player_activity || [])) {
          insights.push({
            insight_type: "player_activity",
            title: p.player,
            detail: `${p.activity}. Implications: ${p.implications}`,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            tags: ["social", "player", p.player],
            raw_data: p,
          });
        }
        if (insights.length > 0) {
          await sb.from("intel_insights").insert(insights);
        }
      } catch (e) {
        console.error("Insight store error:", e);
      }
    }

    return new Response(JSON.stringify({
      signals_collected: allSignals.length,
      sources: {
        gdelt: gdeltSignals.length,
        reddit: redditSignals.length,
        hackernews: hnSignals.length,
      },
      synthesis,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("social-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

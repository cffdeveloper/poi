import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function safeFetch(url: string, opts?: { headers?: Record<string, string>; timeout?: number }): Promise<any> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), opts?.timeout ?? 8000);
    const res = await fetch(url, { signal: controller.signal, headers: opts?.headers });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Live crypto from CoinGecko ──
function processCrypto(raw: any) {
  if (!Array.isArray(raw)) return [];
  return raw.map((c: any) => ({
    id: c.id, symbol: c.symbol?.toUpperCase(), name: c.name,
    price: c.current_price, market_cap: c.market_cap, volume_24h: c.total_volume,
    change_1h: c.price_change_percentage_1h_in_currency,
    change_24h: c.price_change_percentage_24h_in_currency,
    change_7d: c.price_change_percentage_7d_in_currency,
    high_24h: c.high_24h, low_24h: c.low_24h, ath: c.ath,
    ath_change: c.ath_change_percentage, image: c.image, rank: c.market_cap_rank,
  }));
}

// ── Live forex from exchange rate API ──
function processForex(raw: any) {
  if (!raw?.rates) return {};
  const important = [
    "EUR","GBP","JPY","CHF","AUD","CAD","CNY","INR","BRL","MXN",
    "KRW","ZAR","SGD","HKD","NZD","SEK","NOK","TRY","AED","THB",
    "KES","NGN","EGP","IDR","PHP","VND","PKR","BDT",
  ];
  const filtered: Record<string, number> = {};
  for (const k of important) if (raw.rates[k]) filtered[k] = raw.rates[k];
  return { base: raw.base_code || "USD", rates: filtered, updated: raw.time_last_update_utc };
}

// ── Live commodities from multiple free APIs ──
async function fetchLiveCommodities(): Promise<any[]> {
  // Metals from metals.dev free tier (no key needed for limited calls)
  const goldSilver = await safeFetch("https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=toz");

  // Oil from EIA API (public data)
  const commodities: any[] = [];

  // Try to get real gold/silver prices
  if (goldSilver?.metals) {
    if (goldSilver.metals.gold) {
      commodities.push({ name: "Gold", symbol: "XAU", price: goldSilver.metals.gold, unit: "$/oz", change: 0, source: "metals.dev" });
    }
    if (goldSilver.metals.silver) {
      commodities.push({ name: "Silver", symbol: "XAG", price: goldSilver.metals.silver, unit: "$/oz", change: 0, source: "metals.dev" });
    }
  }

  // Alternative: try frankfurter for precious metals via forex proxy
  if (commodities.length === 0) {
    const xauRate = await safeFetch("https://open.er-api.com/v6/latest/XAU");
    if (xauRate?.rates?.USD) {
      commodities.push({ name: "Gold", symbol: "XAU", price: Math.round(1 / (1 / xauRate.rates.USD) * 100) / 100, unit: "$/oz", change: 0, source: "er-api" });
    }
  }

  // Supplement with data from DB (collected by data-collector from World Bank + GDELT)
  return commodities;
}

// ── Real supply chain from GDELT disruption monitoring ──
async function fetchSupplyChainSignals(): Promise<any[]> {
  const queries = [
    { route: "Suez Canal", query: "suez+canal+shipping+disruption" },
    { route: "Panama Canal", query: "panama+canal+drought+shipping" },
    { route: "Strait of Hormuz", query: "hormuz+strait+oil+tanker" },
    { route: "Red Sea / Bab el-Mandeb", query: "red+sea+houthi+shipping" },
    { route: "Taiwan Strait", query: "taiwan+strait+semiconductor+shipping" },
    { route: "Strait of Malacca", query: "malacca+strait+shipping" },
  ];

  const results: any[] = [];
  for (const q of queries) {
    const data = await safeFetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${q.query}&mode=ArtList&maxrecords=5&format=json&sort=DateDesc&timespan=72h`
    );
    const articleCount = data?.articles?.length || 0;
    const latestArticles = (data?.articles || []).slice(0, 3).map((a: any) => ({
      title: a.title, source: a.domain, date: a.seendate, url: a.url,
    }));

    // Risk level based on recent article volume
    let risk = "low";
    let status = "operational";
    if (articleCount >= 4) { risk = "high"; status = "disrupted"; }
    else if (articleCount >= 2) { risk = "medium"; status = "monitored"; }

    results.push({
      route: q.route, status, risk,
      article_count_72h: articleCount,
      latest_headlines: latestArticles,
      impact: getRouteImpact(q.route),
    });
  }
  return results;
}

function getRouteImpact(route: string): string {
  const impacts: Record<string, string> = {
    "Suez Canal": "12% global trade",
    "Panama Canal": "5% global trade",
    "Strait of Hormuz": "20% global oil",
    "Red Sea / Bab el-Mandeb": "Red Sea chokepoint",
    "Taiwan Strait": "Semiconductor supply",
    "Strait of Malacca": "25% global shipping",
  };
  return impacts[route] || "Trade route";
}

// ── Real VC/startup signals from GDELT + HN ──
async function fetchVCSignals(sb: any): Promise<any[]> {
  // Pull recent VC/startup news from GDELT
  const gdeltVC = await safeFetch(
    "https://api.gdeltproject.org/api/v2/doc/doc?query=startup+funding+venture+capital+series+round&mode=ArtList&maxrecords=20&format=json&sort=DateDesc&timespan=48h"
  );

  const signals: any[] = [];
  const sectorKeywords: Record<string, string[]> = {
    "AI/ML": ["artificial intelligence", "AI startup", "machine learning", "LLM", "generative AI"],
    "Climate Tech": ["climate tech", "clean energy", "carbon", "sustainability startup"],
    "Biotech": ["biotech", "pharma", "drug discovery", "GLP-1", "gene therapy"],
    "Fintech": ["fintech", "neobank", "payments", "embedded finance"],
    "Cybersecurity": ["cybersecurity", "zero trust", "threat detection"],
    "Space": ["space tech", "satellite", "launch", "orbital"],
  };

  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    const articles = (gdeltVC?.articles || []).filter((a: any) =>
      keywords.some(kw => (a.title || "").toLowerCase().includes(kw.toLowerCase()))
    );

    const trend = articles.length >= 3 ? "surging" : articles.length >= 1 ? "growing" : "stable";
    signals.push({
      sector,
      trend,
      article_count_48h: articles.length,
      latest_headlines: articles.slice(0, 2).map((a: any) => ({
        title: a.title, source: a.domain, url: a.url,
      })),
      signal: articles.length > 0
        ? articles[0].title?.slice(0, 100)
        : `${sector}: monitoring for new signals`,
      opportunity: `Track ${sector} deal flow`,
    });
  }

  // Also pull from DB for richer data
  const { data: dbInsights } = await sb
    .from("raw_market_data")
    .select("payload, tags, source")
    .or("data_type.eq.social_signal,data_type.eq.news_signal")
    .order("created_at", { ascending: false })
    .limit(50);

  if (dbInsights?.length) {
    // Count mentions per sector from DB
    for (const sig of signals) {
      const mentions = dbInsights.filter((d: any) =>
        sectorKeywords[sig.sector]?.some(kw =>
          JSON.stringify(d.payload || "").toLowerCase().includes(kw.toLowerCase())
        )
      );
      sig.db_mentions = mentions.length;
      if (mentions.length > 5 && sig.trend === "stable") sig.trend = "growing";
    }
  }

  return signals;
}

// ── Real market signals from GDELT + DB ──
async function fetchMarketSignals(sb: any): Promise<any[]> {
  const [gdeltRaw, dbNews] = await Promise.all([
    safeFetch(
      "https://api.gdeltproject.org/api/v2/doc/doc?query=stock+market+OR+IPO+OR+acquisition+OR+merger+OR+earnings&mode=ArtList&maxrecords=20&format=json&sort=DateDesc"
    ),
    sb.from("raw_market_data")
      .select("payload, source, geo_scope, created_at")
      .eq("data_type", "news_signal")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const signals: any[] = [];

  // GDELT live signals
  if (gdeltRaw?.articles) {
    for (const a of gdeltRaw.articles.slice(0, 15)) {
      signals.push({
        source: a.domain || "GDELT",
        title: a.title || "Market signal",
        url: a.url || "",
        date: a.seendate || "",
        country: a.sourcecountry || "",
        tone: a.tone,
        type: "market_signal",
        live: true,
      });
    }
  }

  // DB-collected signals (from data-collector)
  if (dbNews?.data) {
    for (const row of dbNews.data.slice(0, 10)) {
      const p = row.payload as any;
      if (!p?.title) continue;
      signals.push({
        source: p.source || row.source || "collected",
        title: p.title,
        url: p.url || "",
        date: p.date || row.created_at,
        country: row.geo_scope || "",
        type: "market_signal",
        live: false,
      });
    }
  }

  // Deduplicate by title similarity
  const seen = new Set<string>();
  return signals.filter(s => {
    const key = s.title?.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 25);
}

// ── Alert generation ──
function generateAlerts(data: any): any[] {
  const alerts: any[] = [];
  const now = Date.now();

  // Crypto volatility alerts
  if (data.crypto?.length) {
    for (const c of data.crypto.slice(0, 15)) {
      if (c.change_24h && Math.abs(c.change_24h) > 8) {
        alerts.push({
          level: Math.abs(c.change_24h) > 15 ? "critical" : "high",
          domain: "crypto",
          title: `${c.symbol} ${c.change_24h > 0 ? "↑" : "↓"} ${Math.abs(c.change_24h).toFixed(1)}% — ${c.change_24h > 0 ? "Momentum play" : "Potential dip buy"}`,
          detail: `$${c.price?.toLocaleString()} | Vol: $${(c.volume_24h / 1e9).toFixed(1)}B | MCap: $${(c.market_cap / 1e9).toFixed(1)}B`,
          time: now,
        });
      }
    }
  }

  // Supply chain disruptions (REAL from GDELT monitoring)
  const riskyRoutes = data.supply_chain?.filter((r: any) => r.risk !== "low");
  if (riskyRoutes?.length) {
    for (const r of riskyRoutes) {
      alerts.push({
        level: r.risk === "high" ? "high" : "medium",
        domain: "supply_chain",
        title: `${r.route}: ${r.status} — ${r.article_count_72h} reports in 72h`,
        detail: `Impact: ${r.impact}. ${r.latest_headlines?.[0]?.title || "Monitoring disruption signals."}`,
        time: now,
      });
    }
  }

  // VC trend alerts
  const surgingSectors = data.vc_signals?.filter((v: any) => v.trend === "surging" || (v.trend === "growing" && v.article_count_48h >= 2));
  if (surgingSectors?.length) {
    for (const s of surgingSectors) {
      alerts.push({
        level: s.trend === "surging" ? "high" : "medium",
        domain: "venture",
        title: `${s.sector}: ${s.article_count_48h} funding signals in 48h`,
        detail: s.latest_headlines?.[0]?.title || s.signal,
        time: now,
      });
    }
  }

  // Commodity alerts
  const bigMoves = data.commodities?.filter((c: any) => Math.abs(c.change || 0) > 3);
  if (bigMoves?.length) {
    for (const c of bigMoves) {
      alerts.push({
        level: Math.abs(c.change) > 5 ? "high" : "medium",
        domain: "commodities",
        title: `${c.name} ${c.change > 0 ? "↑" : "↓"} ${Math.abs(c.change).toFixed(1)}%`,
        detail: `${c.price} ${c.unit}. Source: ${c.source || "live feed"}`,
        time: now,
      });
    }
  }

  // Market signal alerts from GDELT
  const hotSignals = data.market_signals?.filter((s: any) => s.live).slice(0, 3);
  if (hotSignals?.length) {
    for (const s of hotSignals) {
      alerts.push({
        level: "medium",
        domain: "market",
        title: s.title?.slice(0, 120),
        detail: `Source: ${s.source} | ${s.country || "Global"}`,
        time: now,
      });
    }
  }

  return alerts.sort((a, b) => {
    const levels: Record<string, number> = { critical: 0, high: 1, medium: 2, info: 3 };
    return (levels[a.level] ?? 4) - (levels[b.level] ?? 4);
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Fetch ALL data in parallel — everything is live
    const [cryptoRaw, forexRaw, commodities, supply_chain, vc_signals, market_signals] = await Promise.all([
      safeFetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d"),
      safeFetch("https://open.er-api.com/v6/latest/USD"),
      fetchLiveCommodities(),
      fetchSupplyChainSignals(),
      fetchVCSignals(sb),
      fetchMarketSignals(sb),
    ]);

    const crypto = processCrypto(cryptoRaw);
    const forex = processForex(forexRaw);

    const intel = { crypto, forex, commodities, supply_chain, market_signals, vc_signals };
    const alerts = generateAlerts(intel);

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      alerts,
      intel,
      sources_status: {
        crypto: crypto.length > 0,
        forex: Object.keys(forex.rates || {}).length > 0,
        commodities: commodities.length > 0,
        supply_chain: supply_chain.length > 0,
        market_signals: market_signals.length > 0,
        vc_signals: vc_signals.length > 0,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("intel-feed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

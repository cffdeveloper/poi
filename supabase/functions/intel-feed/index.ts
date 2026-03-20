import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  } catch {
    return null;
  }
}

// ── Market-focused processors ──

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

function processForex(raw: any) {
  if (!raw?.rates) return {};
  const important = ["EUR","GBP","JPY","CHF","AUD","CAD","CNY","INR","BRL","MXN","KRW","ZAR","SGD","HKD","NZD","SEK","NOK","TRY","AED","THB"];
  const filtered: Record<string, number> = {};
  for (const k of important) if (raw.rates[k]) filtered[k] = raw.rates[k];
  return { base: raw.base_code || "USD", rates: filtered, updated: raw.time_last_update_utc };
}

function processCommodities(raw: any) {
  // World Bank commodity API or fallback data
  if (!raw) return getStaticCommodities();
  return raw;
}

function getStaticCommodities() {
  return [
    { name: "Crude Oil (WTI)", symbol: "WTI", price: 78.5, unit: "$/barrel", change: -1.2 },
    { name: "Gold", symbol: "XAU", price: 2650, unit: "$/oz", change: 0.8 },
    { name: "Silver", symbol: "XAG", price: 31.2, unit: "$/oz", change: -0.3 },
    { name: "Copper", symbol: "HG", price: 4.15, unit: "$/lb", change: 1.5 },
    { name: "Natural Gas", symbol: "NG", price: 2.85, unit: "$/MMBtu", change: -2.1 },
    { name: "Lithium", symbol: "LI", price: 12500, unit: "$/tonne", change: -5.4 },
    { name: "Wheat", symbol: "ZW", price: 580, unit: "$/bushel", change: 0.6 },
    { name: "Soybeans", symbol: "ZS", price: 1125, unit: "$/bushel", change: -0.9 },
  ];
}

// Supply chain disruption indicators
function getSupplyChainStatus() {
  return [
    { route: "Strait of Hormuz", status: "monitored", impact: "20% global oil", risk: "medium" },
    { route: "Suez Canal", status: "operational", impact: "12% global trade", risk: "low" },
    { route: "Strait of Malacca", status: "operational", impact: "25% global shipping", risk: "low" },
    { route: "Panama Canal", status: "drought-restricted", impact: "5% global trade", risk: "high" },
    { route: "Bab el-Mandeb", status: "elevated-risk", impact: "Red Sea chokepoint", risk: "high" },
    { route: "Taiwan Strait", status: "monitored", impact: "Semiconductor supply", risk: "medium" },
  ];
}

// Market trend signals from GDELT
function processMarketSignals(gdeltRaw: any) {
  const signals: any[] = [];
  if (gdeltRaw?.articles) {
    gdeltRaw.articles.slice(0, 15).forEach((a: any) => {
      signals.push({
        source: a.domain || "GDELT",
        title: a.title || "Market signal",
        url: a.url || "",
        date: a.seendate || "",
        country: a.sourcecountry || "",
        type: "market_signal",
      });
    });
  }
  return signals;
}

// Venture/startup funding signals
function getVCSignals() {
  return [
    { sector: "AI/ML", trend: "surging", signal: "Record VC funding, $65B+ in 2024", opportunity: "Infrastructure plays" },
    { sector: "Climate Tech", trend: "growing", signal: "Government subsidies expanding globally", opportunity: "Carbon credit markets" },
    { sector: "Biotech", trend: "recovering", signal: "GLP-1 revolution driving pharma M&A", opportunity: "Supply chain bottlenecks" },
    { sector: "Fintech", trend: "consolidating", signal: "Embedded finance eating banking margins", opportunity: "B2B payments" },
    { sector: "Space", trend: "emerging", signal: "Launch costs dropping 90% per decade", opportunity: "Satellite data services" },
    { sector: "Cybersecurity", trend: "accelerating", signal: "AI threats driving enterprise spend", opportunity: "SMB security gap" },
  ];
}

// ── Alert generation (market-focused) ──
function generateAlerts(data: any): any[] {
  const alerts: any[] = [];
  const now = Date.now();

  // Crypto volatility = trading opportunities
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

  // Supply chain disruptions = opportunity
  const riskyRoutes = data.supply_chain?.filter((r: any) => r.risk !== "low");
  if (riskyRoutes?.length) {
    for (const r of riskyRoutes) {
      alerts.push({
        level: r.risk === "high" ? "high" : "medium",
        domain: "supply_chain",
        title: `${r.route}: ${r.status} — Supply chain arbitrage opportunity`,
        detail: `Impact: ${r.impact}. Alternative routing and inventory plays may be profitable.`,
        time: now,
      });
    }
  }

  // VC trend alerts
  const surgingSectors = data.vc_signals?.filter((v: any) => v.trend === "surging" || v.trend === "accelerating");
  if (surgingSectors?.length) {
    for (const s of surgingSectors) {
      alerts.push({
        level: "high",
        domain: "venture",
        title: `${s.sector}: ${s.signal}`,
        detail: `Opportunity: ${s.opportunity}`,
        time: now,
      });
    }
  }

  // Commodity price moves
  const bigMoves = data.commodities?.filter((c: any) => Math.abs(c.change) > 3);
  if (bigMoves?.length) {
    for (const c of bigMoves) {
      alerts.push({
        level: Math.abs(c.change) > 5 ? "high" : "medium",
        domain: "commodities",
        title: `${c.name} ${c.change > 0 ? "↑" : "↓"} ${Math.abs(c.change).toFixed(1)}% — Commodity play`,
        detail: `${c.price} ${c.unit}. Check downstream industry impact.`,
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
    const SOURCES = {
      crypto: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d",
      forex: "https://open.er-api.com/v6/latest/USD",
      gdelt: "https://api.gdeltproject.org/api/v2/doc/doc?query=startup%20OR%20funding%20OR%20market%20OR%20acquisition%20OR%20IPO&mode=ArtList&maxrecords=15&format=json&sort=DateDesc",
    };

    const [cryptoRaw, forexRaw, gdeltRaw] = await Promise.all([
      safeFetch(SOURCES.crypto),
      safeFetch(SOURCES.forex),
      safeFetch(SOURCES.gdelt),
    ]);

    const crypto = processCrypto(cryptoRaw);
    const forex = processForex(forexRaw);
    const commodities = getStaticCommodities();
    const supply_chain = getSupplyChainStatus();
    const market_signals = processMarketSignals(gdeltRaw);
    const vc_signals = getVCSignals();

    const intel = { crypto, forex, commodities, supply_chain, market_signals, vc_signals };
    const alerts = generateAlerts(intel);

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      alerts,
      intel,
      sources_status: {
        crypto: crypto.length > 0,
        forex: Object.keys(forex.rates || {}).length > 0,
        commodities: true,
        supply_chain: true,
        market_signals: market_signals.length > 0,
        vc_signals: true,
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function safeFetch(url: string, timeout = 10000): Promise<any> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ── DATA SOURCES ──

async function collectCrypto(): Promise<any[]> {
  const data = await safeFetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d");
  if (!Array.isArray(data)) return [];
  return data.map((c: any) => ({
    source: "coingecko", data_type: "crypto_price", geo_scope: "global",
    payload: { id: c.id, symbol: c.symbol, name: c.name, price: c.current_price, market_cap: c.market_cap, volume: c.total_volume, change_24h: c.price_change_percentage_24h, change_7d: c.price_change_percentage_7d_in_currency, high_24h: c.high_24h, low_24h: c.low_24h, rank: c.market_cap_rank },
    tags: ["crypto", "market", c.symbol],
  }));
}

async function collectForex(): Promise<any[]> {
  const data = await safeFetch("https://open.er-api.com/v6/latest/USD");
  if (!data?.rates) return [];
  const important = ["EUR","GBP","JPY","CHF","AUD","CAD","CNY","INR","BRL","MXN","KRW","ZAR","SGD","HKD","NZD","SEK","NOK","TRY","AED","THB","KES","NGN","EGP","IDR","PHP","VND","PKR","BDT","COP","CLP","PEN","ARS","SAR","QAR","KWD","BHD","OMR","JOD","MAD","TZS","UGX","GHS","ETB","RWF"];
  const rows: any[] = [];
  for (const cur of important) {
    if (data.rates[cur]) {
      rows.push({
        source: "exchange-rates", data_type: "forex_rate", geo_scope: "global",
        payload: { base: "USD", currency: cur, rate: data.rates[cur], updated: data.time_last_update_utc },
        tags: ["forex", cur.toLowerCase()],
      });
    }
  }
  return rows;
}

async function collectGDELT(): Promise<any[]> {
  const queries = [
    "startup%20funding%20investment",
    "market%20gap%20opportunity%20business",
    "supply%20chain%20disruption",
    "regulatory%20change%20policy",
    "technology%20adoption%20innovation",
    "economic%20growth%20GDP",
  ];
  const rows: any[] = [];
  for (const q of queries) {
    const data = await safeFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=ArtList&maxrecords=10&format=json&sort=DateDesc`);
    if (data?.articles) {
      for (const a of data.articles.slice(0, 8)) {
        rows.push({
          source: "gdelt", data_type: "news_signal",
          geo_scope: a.sourcecountry || "global",
          payload: { title: a.title, url: a.url, domain: a.domain, date: a.seendate, country: a.sourcecountry, language: a.language, tone: a.tone },
          tags: ["news", "signal", q.split("%20")[0]],
        });
      }
    }
  }
  return rows;
}

async function collectWorldBank(): Promise<any[]> {
  const indicators = [
    { code: "NY.GDP.MKTP.CD", name: "GDP" },
    { code: "FP.CPI.TOTL.ZG", name: "Inflation" },
    { code: "SL.UEM.TOTL.ZS", name: "Unemployment" },
  ];
  const rows: any[] = [];
  for (const ind of indicators) {
    const data = await safeFetch(`https://api.worldbank.org/v2/country/all/indicator/${ind.code}?format=json&per_page=50&date=2022:2025&MRV=1`);
    if (Array.isArray(data) && data[1]) {
      for (const entry of data[1]) {
        if (entry.value !== null) {
          rows.push({
            source: "worldbank", data_type: "economic_indicator",
            geo_scope: entry.country?.id || "global",
            payload: { indicator: ind.name, code: ind.code, country: entry.country?.value, countryCode: entry.country?.id, value: entry.value, year: entry.date },
            tags: ["economics", ind.name.toLowerCase(), entry.country?.id?.toLowerCase()].filter(Boolean),
          });
        }
      }
    }
  }
  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Collect from all sources in parallel
    const [crypto, forex, gdelt, worldbank] = await Promise.all([
      collectCrypto(),
      collectForex(),
      collectGDELT(),
      collectWorldBank(),
    ]);

    const allRows = [...crypto, ...forex, ...gdelt, ...worldbank];
    let inserted = 0;

    // Batch insert in chunks of 50
    for (let i = 0; i < allRows.length; i += 50) {
      const chunk = allRows.slice(i, i + 50);
      const { error } = await sb.from("raw_market_data").insert(chunk);
      if (!error) inserted += chunk.length;
      else console.error("Insert error:", error.message);
    }

    // Clean old data (keep last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from("raw_market_data").delete().lt("created_at", weekAgo);

    return new Response(JSON.stringify({
      collected: allRows.length,
      inserted,
      sources: { crypto: crypto.length, forex: forex.length, gdelt: gdelt.length, worldbank: worldbank.length },
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Data collector error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

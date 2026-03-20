import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function safeFetch(url: string, timeout = 12000): Promise<any> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function safeTextFetch(url: string, timeout = 12000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════
// COUNTRY-SPECIFIC NEWS SOURCES REGISTRY
// Google News RSS supports 40+ country editions natively
// ═══════════════════════════════════════════════════════

interface CountryCfg {
  code: string;
  lang: string;
  ceid: string;
  outlets: string[];
  yt: string[];
  subs: string[];
}

// Comprehensive global source registry — every country gets localized feeds
const COUNTRIES: CountryCfg[] = [
  // ── AFRICA ──
  { code: "KE", lang: "en", ceid: "KE:en", outlets: ["citizen.digital","nation.africa","the-star.co.ke","standardmedia.co.ke","businessdailyafrica.com","capitalfm.co.ke","kbc.co.ke","kenyans.co.ke","tuko.co.ke","pulselive.co.ke","kenyanwallstreet.com","techweez.com","cio.co.ke","k24tv.co.ke","tv47.digital","hapakenya.com","sde.co.ke"], yt: ["citizentvkenya","NTVKenya","K24TV","KTNNewsKE","TV47Kenya","KBCChannel1"], subs: ["Kenya"] },
  { code: "NG", lang: "en", ceid: "NG:en", outlets: ["punchng.com","vanguardngr.com","premiumtimesng.com","thecable.ng","guardian.ng","nairametrics.com","businessday.ng","channelstv.com","legit.ng","dailypost.ng","saharareporters.com","techpoint.africa","techcabal.com"], yt: ["channelstelevision"], subs: ["Nigeria"] },
  { code: "ZA", lang: "en", ceid: "ZA:en", outlets: ["news24.com","timeslive.co.za","businesslive.co.za","dailymaverick.co.za","iol.co.za","ewn.co.za","fin24.com","moneyweb.co.za","techcentral.co.za","itweb.co.za","biznews.com"], yt: [], subs: ["southafrica"] },
  { code: "GH", lang: "en", ceid: "GH:en", outlets: ["graphic.com.gh","myjoyonline.com","citinewsroom.com","ghanaweb.com","3news.com","pulse.com.gh"], yt: ["JoyNewsOnTV"], subs: ["ghana"] },
  { code: "ET", lang: "en", ceid: "ET:en", outlets: ["addisstandard.com","thereporterethiopia.com","capitalethiopia.com"], yt: [], subs: ["Ethiopia"] },
  { code: "TZ", lang: "en", ceid: "TZ:en", outlets: ["thecitizen.co.tz","dailynews.co.tz","ippmedia.com"], yt: [], subs: ["tanzania"] },
  { code: "UG", lang: "en", ceid: "UG:en", outlets: ["monitor.co.ug","newvision.co.ug","independent.co.ug"], yt: [], subs: ["Uganda"] },
  { code: "RW", lang: "en", ceid: "RW:en", outlets: ["newtimes.co.rw","ktpress.rw","igihe.com"], yt: [], subs: [] },
  { code: "EG", lang: "en", ceid: "EG:en", outlets: ["egypttoday.com","dailynewsegypt.com","enterprise.press","ahram.org.eg","madamasr.com"], yt: [], subs: ["Egypt"] },
  { code: "MA", lang: "fr", ceid: "MA:fr", outlets: ["medias24.com","challenge.ma","leseco.ma","le360.ma"], yt: [], subs: [] },
  { code: "SN", lang: "fr", ceid: "SN:fr", outlets: ["seneweb.com","lequotidien.sn","pressafrik.com"], yt: [], subs: [] },
  { code: "CI", lang: "fr", ceid: "CI:fr", outlets: ["abidjan.net","fratmat.info"], yt: [], subs: [] },
  // ── AMERICAS ──
  { code: "US", lang: "en", ceid: "US:en", outlets: ["reuters.com","bloomberg.com","cnbc.com","wsj.com","nytimes.com","techcrunch.com","theverge.com","arstechnica.com","wired.com","fortune.com","inc.com","fastcompany.com","businessinsider.com","marketwatch.com","seekingalpha.com","venturebeat.com","crunchbase.com","axios.com","theinformation.com","protocol.com"], yt: ["Bloomberg","CNBC","YahooFinance"], subs: ["business","investing","stocks","technology","startups","wallstreetbets","CryptoCurrency","finance","economics","RealEstate","Entrepreneur","SupplyChain","fintech","energy"] },
  { code: "GB", lang: "en", ceid: "GB:en", outlets: ["ft.com","bbc.com","theguardian.com","telegraph.co.uk","cityam.com","thisismoney.co.uk","sifted.eu","uktech.news"], yt: ["BBCNews","SkyNews","FinancialTimes"], subs: ["ukbusiness","UKPersonalFinance"] },
  { code: "CA", lang: "en", ceid: "CA:en", outlets: ["bnnbloomberg.ca","financialpost.com","theglobeandmail.com","betakit.com"], yt: ["CBCNews"], subs: ["canada","PersonalFinanceCanada"] },
  { code: "BR", lang: "pt", ceid: "BR:pt-419", outlets: ["valor.globo.com","infomoney.com.br","exame.com","startse.com","neofeed.com.br"], yt: [], subs: ["brasil","investimentos"] },
  { code: "MX", lang: "es", ceid: "MX:es-419", outlets: ["elfinanciero.com.mx","expansion.mx","eleconomista.com.mx","forbes.com.mx"], yt: [], subs: ["mexico"] },
  { code: "CO", lang: "es", ceid: "CO:es-419", outlets: ["portafolio.co","larepublica.co","dinero.com"], yt: [], subs: [] },
  { code: "AR", lang: "es", ceid: "AR:es-419", outlets: ["ambito.com","infobae.com","cronista.com","iproup.com"], yt: [], subs: ["argentina"] },
  { code: "CL", lang: "es", ceid: "CL:es-419", outlets: ["df.cl","emol.com","latercera.com"], yt: [], subs: [] },
  // ── EUROPE ──
  { code: "DE", lang: "de", ceid: "DE:de", outlets: ["handelsblatt.com","manager-magazin.de","wiwo.de","gruenderszene.de","t3n.de"], yt: [], subs: ["de_IAmA","Finanzen"] },
  { code: "FR", lang: "fr", ceid: "FR:fr", outlets: ["lesechos.fr","latribune.fr","bfmtv.com","maddyness.com","frenchweb.fr"], yt: [], subs: ["france","vosfinances"] },
  { code: "NL", lang: "nl", ceid: "NL:nl", outlets: ["fd.nl","rtlnieuws.nl","bnr.nl","sprout.nl"], yt: [], subs: ["thenetherlands"] },
  { code: "CH", lang: "de", ceid: "CH:de", outlets: ["finews.com","handelszeitung.ch","nzz.ch","startupticker.ch"], yt: [], subs: [] },
  { code: "SE", lang: "sv", ceid: "SE:sv", outlets: ["di.se","breakit.se","svd.se"], yt: [], subs: [] },
  { code: "ES", lang: "es", ceid: "ES:es", outlets: ["expansion.com","cincodias.elpais.com","eleconomista.es"], yt: [], subs: [] },
  { code: "IT", lang: "it", ceid: "IT:it", outlets: ["ilsole24ore.com","milanofinanza.it","startupitalia.eu"], yt: [], subs: [] },
  { code: "PL", lang: "pl", ceid: "PL:pl", outlets: ["bankier.pl","money.pl","puls-biznesu.pl"], yt: [], subs: [] },
  { code: "IE", lang: "en", ceid: "IE:en", outlets: ["irishtimes.com","siliconrepublic.com","fora.ie"], yt: [], subs: [] },
  { code: "TR", lang: "tr", ceid: "TR:tr", outlets: ["bloomberght.com","dunya.com","webrazzi.com"], yt: [], subs: [] },
  // ── ASIA-PACIFIC ──
  { code: "IN", lang: "en", ceid: "IN:en", outlets: ["economictimes.indiatimes.com","livemint.com","moneycontrol.com","inc42.com","yourstory.com","entrackr.com","vccircle.com","businesstoday.in","ndtv.com","financialexpress.com"], yt: ["ETNOWlive"], subs: ["india","IndianStreetBets","IndiaTech"] },
  { code: "CN", lang: "zh", ceid: "CN:zh-Hans", outlets: ["scmp.com","caixin.com","36kr.com","technode.com","pandaily.com"], yt: [], subs: ["China"] },
  { code: "JP", lang: "ja", ceid: "JP:ja", outlets: ["nikkei.com","japantimes.co.jp","thebridge.jp"], yt: [], subs: ["japan"] },
  { code: "KR", lang: "ko", ceid: "KR:ko", outlets: ["koreaherald.com","kedglobal.com","koreajoongangdaily.joins.com","platum.kr"], yt: [], subs: [] },
  { code: "SG", lang: "en", ceid: "SG:en", outlets: ["straitstimes.com","businesstimes.com.sg","techinasia.com","e27.co","vulcanpost.com"], yt: [], subs: ["singapore"] },
  { code: "ID", lang: "id", ceid: "ID:id", outlets: ["kontan.co.id","bisnis.com","dailysocial.id","techinasia.com","katadata.co.id"], yt: [], subs: [] },
  { code: "PH", lang: "en", ceid: "PH:en", outlets: ["businessworld.com.ph","rappler.com","philstar.com","inquirer.net"], yt: [], subs: ["Philippines"] },
  { code: "TH", lang: "th", ceid: "TH:th", outlets: ["bangkokpost.com","nationthailand.com"], yt: [], subs: [] },
  { code: "VN", lang: "vi", ceid: "VN:vi", outlets: ["vnexpress.net","vietnamnet.vn","cafef.vn"], yt: [], subs: [] },
  { code: "AU", lang: "en", ceid: "AU:en", outlets: ["afr.com","smartcompany.com.au","startupdaily.net","itnews.com.au"], yt: [], subs: ["AusFinance","australia"] },
  { code: "NZ", lang: "en", ceid: "NZ:en", outlets: ["nzherald.co.nz","interest.co.nz","stuff.co.nz"], yt: [], subs: [] },
  { code: "PK", lang: "en", ceid: "PK:en", outlets: ["brecorder.com","profit.pakistantoday.com.pk","techjuice.pk"], yt: [], subs: [] },
  { code: "BD", lang: "en", ceid: "BD:en", outlets: ["thedailystar.net","tbsnews.net","dhakatribune.com"], yt: [], subs: [] },
  // ── MIDDLE EAST ──
  { code: "AE", lang: "en", ceid: "AE:en", outlets: ["gulfnews.com","khaleejtimes.com","arabianbusiness.com","zawya.com","magnitt.com","wamda.com"], yt: [], subs: ["dubai"] },
  { code: "SA", lang: "en", ceid: "SA:en", outlets: ["arabnews.com","saudigazette.com.sa","argaam.com"], yt: [], subs: [] },
  { code: "IL", lang: "en", ceid: "IL:en", outlets: ["calcalistech.com","geektime.com","globes.co.il","nocamels.com"], yt: [], subs: [] },
  { code: "QA", lang: "en", ceid: "QA:en", outlets: ["thepeninsulaqatar.com","gulf-times.com"], yt: [], subs: [] },
];

// ═══════════════════════════════════════════════════════
// CORE COLLECTORS
// ═══════════════════════════════════════════════════════

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

// ── GDELT — 16 industry queries ──
async function collectGDELT(): Promise<any[]> {
  const queries = [
    "startup%20funding%20investment", "market%20gap%20opportunity%20business",
    "supply%20chain%20disruption", "regulatory%20change%20policy",
    "technology%20adoption%20innovation", "economic%20growth%20GDP",
    "merger%20acquisition%20deal", "IPO%20listing%20stock%20exchange",
    "central%20bank%20interest%20rate", "trade%20agreement%20tariff",
    "cryptocurrency%20blockchain%20DeFi", "real%20estate%20property%20market",
    "energy%20transition%20renewable", "healthcare%20pharma%20biotech",
    "agriculture%20food%20supply", "fintech%20mobile%20money%20payments",
  ];
  const rows: any[] = [];
  for (const q of queries) {
    const data = await safeFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=ArtList&maxrecords=15&format=json&sort=DateDesc&timespan=1h`);
    if (data?.articles) {
      for (const a of data.articles.slice(0, 12)) {
        rows.push({
          source: "gdelt", data_type: "news_signal", geo_scope: a.sourcecountry || "global",
          payload: { title: a.title, url: a.url, domain: a.domain, date: a.seendate, country: a.sourcecountry, language: a.language, tone: a.tone },
          tags: ["news", "signal", q.split("%20")[0]],
        });
      }
    }
  }
  return rows;
}

// ═══════════════════════════════════════════════════════
// COUNTRY-SPECIFIC GOOGLE NEWS — scrapes ALL country editions
// This is the powerhouse: each country gets its own localized news
// ═══════════════════════════════════════════════════════
async function collectCountryNews(): Promise<any[]> {
  const rows: any[] = [];
  const industryQueries = [
    "business", "technology", "finance", "startup", "investment",
    "economy", "market", "trade", "energy", "agriculture",
  ];

  // Process countries in batches of 8 to avoid overwhelming
  for (let batch = 0; batch < COUNTRIES.length; batch += 8) {
    const countryBatch = COUNTRIES.slice(batch, batch + 8);
    const batchPromises = countryBatch.map(async (country) => {
      const countryRows: any[] = [];
      // Each country gets 3 industry-specific queries for breadth
      const queries = industryQueries.slice(0, 3);
      for (const q of queries) {
        const xml = await safeTextFetch(
          `https://news.google.com/rss/search?q=${q}&hl=${country.lang}&gl=${country.code}&ceid=${country.ceid}`,
          8000
        );
        if (!xml) continue;
        const items = xml.split("<item>").slice(1, 6); // top 5 per query
        for (const item of items) {
          const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") || "";
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || item.match(/<link\/>(.*?)(?:<|$)/)?.[1] || "";
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
          const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") || "";
          if (title) {
            countryRows.push({
              source: `gnews-${country.code}`, data_type: "country_news", geo_scope: country.code,
              payload: { title, url: link, date: pubDate, source, country: country.code, query: q },
              tags: ["news", "country", country.code.toLowerCase(), q],
            });
          }
        }
      }
      return countryRows;
    });
    const results = await Promise.all(batchPromises);
    rows.push(...results.flat());
  }
  return rows;
}

// ═══════════════════════════════════════════════════════
// COUNTRY-SPECIFIC REDDIT — scrapes all country subreddits
// ═══════════════════════════════════════════════════════
async function collectCountryReddit(): Promise<any[]> {
  const rows: any[] = [];
  const allSubs = COUNTRIES.flatMap(c => c.subs.map(s => ({ sub: s, code: c.code })));
  
  // Batch to avoid rate limits
  for (let i = 0; i < allSubs.length; i += 5) {
    const batch = allSubs.slice(i, i + 5);
    const promises = batch.map(async ({ sub, code }) => {
      const data = await safeFetch(`https://www.reddit.com/r/${sub}/hot.json?limit=8`, 8000);
      if (!data?.data?.children) return [];
      return data.data.children
        .filter((p: any) => !p.data.stickied && p.data.score > 5)
        .slice(0, 5)
        .map((post: any) => {
          const d = post.data;
          return {
            source: `reddit-${code}`, data_type: "social_signal", geo_scope: code,
            payload: { title: d.title, url: `https://reddit.com${d.permalink}`, subreddit: sub, score: d.score, comments: d.num_comments, author: d.author, created: new Date(d.created_utc * 1000).toISOString(), selftext: (d.selftext || "").substring(0, 300) },
            tags: ["social", "reddit", code.toLowerCase(), sub.toLowerCase()],
          };
        });
    });
    const results = await Promise.all(promises);
    rows.push(...results.flat());
  }
  return rows;
}

// ═══════════════════════════════════════════════════════
// YOUTUBE — scrapes channels from all countries via RSS
// YouTube RSS feeds are public and always up-to-date
// ═══════════════════════════════════════════════════════
async function collectYouTube(): Promise<any[]> {
  const rows: any[] = [];
  const allChannels = COUNTRIES.flatMap(c => c.yt.map(ch => ({ channel: ch, code: c.code })));

  for (let i = 0; i < allChannels.length; i += 5) {
    const batch = allChannels.slice(i, i + 5);
    const promises = batch.map(async ({ channel, code }) => {
      // YouTube RSS by channel handle
      const xml = await safeTextFetch(`https://www.youtube.com/feeds/videos.xml?user=${channel}`, 8000);
      if (!xml) return [];
      const entries = xml.split("<entry>").slice(1, 6);
      return entries.map(entry => {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] || "";
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || "";
        const views = entry.match(/<media:statistics views="(\d+)"/)?.[1] || "0";
        return {
          source: `youtube-${code}`, data_type: "video_signal", geo_scope: code,
          payload: { title, url: `https://youtube.com/watch?v=${videoId}`, channel, published, views: parseInt(views), country: code },
          tags: ["social", "youtube", code.toLowerCase(), channel.toLowerCase()],
        };
      }).filter((r: any) => r.payload.title);
    });
    const results = await Promise.all(promises);
    rows.push(...results.flat());
  }
  return rows;
}

// ── GLOBAL TOPIC GOOGLE NEWS (original broad queries) ──
async function collectGlobalTopicNews(): Promise<any[]> {
  const topics = [
    "technology+startup+funding", "stock+market+IPO", "cryptocurrency+bitcoin",
    "real+estate+investment", "agriculture+food+prices", "energy+oil+gas+renewable",
    "healthcare+pharma+biotech", "fintech+mobile+money", "supply+chain+logistics",
    "AI+artificial+intelligence", "telecom+5G+spectrum", "mining+metals+commodities",
    "banking+finance+regulation", "e-commerce+retail+marketplace",
    "construction+infrastructure", "education+edtech", "insurance+insurtech",
    "media+entertainment+streaming", "aviation+airline+airports", "textile+fashion+manufacturing",
  ];
  const rows: any[] = [];
  for (const topic of topics) {
    const xml = await safeTextFetch(`https://news.google.com/rss/search?q=${topic}&hl=en&gl=US&ceid=US:en`);
    if (!xml) continue;
    const items = xml.split("<item>").slice(1, 8);
    for (const item of items) {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") || "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || item.match(/<link\/>(.*?)(?:<|$)/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") || "";
      if (title) {
        rows.push({
          source: "google-news", data_type: "news_signal", geo_scope: "global",
          payload: { title, url: link, date: pubDate, source, topic: topic.replace(/\+/g, " ") },
          tags: ["news", "google", ...topic.split("+").slice(0, 3)],
        });
      }
    }
  }
  return rows;
}

// ── HACKER NEWS ──
async function collectHackerNews(): Promise<any[]> {
  const rows: any[] = [];
  const topStories = await safeFetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  if (!Array.isArray(topStories)) return [];
  const stories = await Promise.all(topStories.slice(0, 30).map((id: number) => safeFetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
  for (const s of stories) {
    if (!s?.title) continue;
    rows.push({
      source: "hackernews", data_type: "social_signal", geo_scope: "global",
      payload: { title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, score: s.score, comments: s.descendants || 0, author: s.by, created: new Date(s.time * 1000).toISOString() },
      tags: ["social", "hackernews", "tech"],
    });
  }
  return rows;
}

// ── DEV.TO ──
async function collectDevTo(): Promise<any[]> {
  const data = await safeFetch("https://dev.to/api/articles?top=1&per_page=20");
  if (!Array.isArray(data)) return [];
  return data.map((a: any) => ({
    source: "devto", data_type: "social_signal", geo_scope: "global",
    payload: { title: a.title, url: a.url, reactions: a.positive_reactions_count, comments: a.comments_count, author: a.user?.name, tags: a.tag_list, published: a.published_at },
    tags: ["social", "devto", ...(a.tag_list || []).slice(0, 3)],
  }));
}

// ── GITHUB TRENDING ──
async function collectGitHub(): Promise<any[]> {
  const data = await safeFetch("https://api.github.com/search/repositories?q=created:>2026-03-18&sort=stars&order=desc&per_page=15");
  if (!data?.items) return [];
  return data.items.map((r: any) => ({
    source: "github", data_type: "tech_signal", geo_scope: "global",
    payload: { name: r.full_name, description: (r.description || "").substring(0, 300), stars: r.stargazers_count, language: r.language, url: r.html_url, topics: r.topics?.slice(0, 5), created: r.created_at },
    tags: ["tech", "github", "trending", r.language?.toLowerCase()].filter(Boolean),
  }));
}

// ── WORLD BANK ──
async function collectWorldBank(): Promise<any[]> {
  const indicators = [
    { code: "NY.GDP.MKTP.CD", name: "GDP" },
    { code: "FP.CPI.TOTL.ZG", name: "Inflation" },
    { code: "SL.UEM.TOTL.ZS", name: "Unemployment" },
    { code: "BX.KLT.DINV.CD.WD", name: "FDI" },
  ];
  const rows: any[] = [];
  for (const ind of indicators) {
    const data = await safeFetch(`https://api.worldbank.org/v2/country/all/indicator/${ind.code}?format=json&per_page=50&date=2022:2025&MRV=1`);
    if (Array.isArray(data) && data[1]) {
      for (const entry of data[1]) {
        if (entry.value !== null) {
          rows.push({
            source: "worldbank", data_type: "economic_indicator", geo_scope: entry.country?.id || "global",
            payload: { indicator: ind.name, code: ind.code, country: entry.country?.value, countryCode: entry.country?.id, value: entry.value, year: entry.date },
            tags: ["economics", ind.name.toLowerCase(), entry.country?.id?.toLowerCase()].filter(Boolean),
          });
        }
      }
    }
  }
  return rows;
}

// ── SENTIMENT ──
async function collectSentiment(): Promise<any[]> {
  const rows: any[] = [];
  const [fng, gdeltTone] = await Promise.all([
    safeFetch("https://api.alternative.me/fng/?limit=1"),
    safeFetch("https://api.gdeltproject.org/api/v2/doc/doc?query=business%20OR%20finance%20OR%20technology&mode=ToneChart&format=json&timespan=1h"),
  ]);
  if (fng?.data?.[0]) {
    rows.push({
      source: "alternative-me", data_type: "market_sentiment", geo_scope: "global",
      payload: { value: fng.data[0].value, label: fng.data[0].value_classification, timestamp: fng.data[0].timestamp },
      tags: ["sentiment", "fear-greed", "crypto"],
    });
  }
  if (gdeltTone?.tone_chart) {
    rows.push({
      source: "gdelt-tone", data_type: "sentiment_signal", geo_scope: "global",
      payload: { tone_data: gdeltTone.tone_chart, measured_at: new Date().toISOString() },
      tags: ["sentiment", "global", "tone"],
    });
  }
  return rows;
}

// ═══════════════════════════════════════════════════════
// MAIN HANDLER — orchestrates all collection waves
// ═══════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Wave 1: Fast financial data
    const [crypto, forex, sentiment] = await Promise.all([
      collectCrypto(), collectForex(), collectSentiment(),
    ]);

    // Wave 2: Global news
    const [gdelt, globalTopicNews, hackerNews, devTo, github] = await Promise.all([
      collectGDELT(), collectGlobalTopicNews(), collectHackerNews(), collectDevTo(), collectGitHub(),
    ]);

    // Wave 3: Country-specific data (the big one — 45+ country editions)
    const [countryNews, countryReddit, youtubeSignals] = await Promise.all([
      collectCountryNews(), collectCountryReddit(), collectYouTube(),
    ]);

    // Wave 4: Economic indicators
    const [worldbank] = await Promise.all([collectWorldBank()]);

    const allRows = [
      ...crypto, ...forex, ...sentiment,
      ...gdelt, ...globalTopicNews, ...hackerNews, ...devTo, ...github,
      ...countryNews, ...countryReddit, ...youtubeSignals,
      ...worldbank,
    ];

    let inserted = 0;
    for (let i = 0; i < allRows.length; i += 100) {
      const chunk = allRows.slice(i, i + 100);
      const { error } = await sb.from("raw_market_data").insert(chunk);
      if (!error) inserted += chunk.length;
      else console.error("Insert error:", error.message);
    }

    // Clean old data (keep 3 days)
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from("raw_market_data").delete().lt("created_at", cutoff);

    const sources = {
      crypto: crypto.length, forex: forex.length, sentiment: sentiment.length,
      gdelt: gdelt.length, globalTopicNews: globalTopicNews.length,
      hackerNews: hackerNews.length, devTo: devTo.length, github: github.length,
      countryNews: countryNews.length, countryReddit: countryReddit.length,
      youtube: youtubeSignals.length, worldbank: worldbank.length,
      countries_covered: COUNTRIES.length,
      total_outlets_tracked: COUNTRIES.reduce((s, c) => s + c.outlets.length, 0),
    };

    return new Response(JSON.stringify({
      collected: allRows.length, inserted, sources,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Data collector error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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

function getWeekAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
}

// ── Processing functions ──

function processFlights(raw: any, rawEu: any) {
  const all = [...(raw?.states || []), ...(rawEu?.states || [])];
  const seen = new Set<string>();
  const unique = all.filter((s: any[]) => {
    if (!s[0] || seen.has(s[0])) return false;
    seen.add(s[0]);
    return true;
  });
  return unique
    .filter((s: any[]) => s[1] && s[2] && s[5] && s[6] && s[7])
    .slice(0, 60)
    .map((s: any[]) => ({
      callsign: (s[1] || "").trim(),
      country: s[2],
      longitude: s[5],
      latitude: s[6],
      altitude: Math.round((s[7] || 0) * 3.281),
      velocity: Math.round((s[9] || 0) * 1.944),
      heading: Math.round(s[10] || 0),
      on_ground: s[8],
    }));
}

function processEarthquakes(raw: any) {
  if (!raw?.features) return [];
  return raw.features.slice(0, 25).map((f: any) => ({
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: f.properties.time,
    tsunami: f.properties.tsunami,
    significance: f.properties.sig,
    type: f.properties.type,
    coordinates: f.geometry.coordinates,
    alert: f.properties.alert,
    felt: f.properties.felt,
    url: f.properties.url,
  }));
}

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
  const important = ["EUR","GBP","JPY","CHF","AUD","CAD","CNY","INR","BRL","MXN","KRW","RUB","ZAR","SGD","HKD"];
  const filtered: Record<string, number> = {};
  for (const k of important) if (raw.rates[k]) filtered[k] = raw.rates[k];
  return { base: raw.base_code || "USD", rates: filtered, updated: raw.time_last_update_utc };
}

function processWeather(data: any, city: string) {
  if (!data?.current) return null;
  return { city, temperature: data.current.temperature_2m, wind_speed: data.current.wind_speed_10m, weather_code: data.current.weather_code };
}

function processSpaceX(raw: any) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((l: any) => l.date_utc)
    .sort((a: any, b: any) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime())
    .slice(0, 8)
    .map((l: any) => ({ name: l.name, date: l.date_utc, rocket: l.rocket, details: l.details, flight_number: l.flight_number }));
}

function processSpaceWeather(raw: any) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 10).map((n: any) => ({
    type: n.messageType, body: n.messageBody?.substring(0, 300),
    url: n.messageURL, id: n.messageID, issued: n.messageIssueTime,
  }));
}

// ── NEW: NASA FIRMS fire hotspots ──
function processFires(raw: any): any[] {
  // FIRMS CSV returns text; we use the JSON endpoint from EONET instead
  if (!raw?.events) return [];
  return raw.events
    .filter((e: any) => e.categories?.some((c: any) => c.id === "wildfires"))
    .slice(0, 30)
    .map((e: any) => {
      const geo = e.geometry?.[0];
      return {
        latitude: geo?.coordinates?.[1] || 0,
        longitude: geo?.coordinates?.[0] || 0,
        brightness: 0,
        confidence: "high",
        acq_date: geo?.date || e.closed || "",
        satellite: "EONET",
        country: e.title,
      };
    })
    .filter((f: any) => f.latitude !== 0);
}

// ── NEW: GDELT conflict/protest events ──
function processConflicts(gdeltRaw: any): any[] {
  const events: any[] = [];
  // GDELT returns articles with event metadata
  if (gdeltRaw?.articles) {
    gdeltRaw.articles.slice(0, 20).forEach((a: any) => {
      events.push({
        source: a.domain || "GDELT",
        title: a.title || "Unknown event",
        url: a.url || "",
        date: a.seendate || "",
        country: a.sourcecountry || "",
        type: "conflict",
      });
    });
  }
  return events;
}

// ── NEW: Infrastructure data (static reference enriched) ──
function getInfrastructure(): any[] {
  return [
    { name: "Strait of Hormuz", type: "waterway", lat: 26.56, lng: 56.25, detail: "20% of global oil transit", status: "monitored" },
    { name: "Suez Canal", type: "waterway", lat: 30.46, lng: 32.35, detail: "12% global trade volume", status: "operational" },
    { name: "Strait of Malacca", type: "waterway", lat: 2.5, lng: 101.8, detail: "25% of global shipping", status: "operational" },
    { name: "Panama Canal", type: "waterway", lat: 9.08, lng: -79.68, detail: "5% of global trade", status: "drought-restricted" },
    { name: "Bab el-Mandeb", type: "waterway", lat: 12.58, lng: 43.33, detail: "Red Sea chokepoint", status: "elevated-risk" },
    { name: "TAT-14 Cable", type: "cable", lat: 51.0, lng: -1.0, detail: "US-Europe subsea cable", status: "active" },
    { name: "SEA-ME-WE 3", type: "cable", lat: 22.0, lng: 114.0, detail: "SE Asia to W Europe", status: "active" },
    { name: "PEACE Cable", type: "cable", lat: 31.2, lng: 29.9, detail: "Pakistan-E Africa-Europe", status: "active" },
    { name: "FLAG Atlantic", type: "cable", lat: 40.7, lng: -74.0, detail: "Transatlantic fiber", status: "active" },
    { name: "Druzhba Pipeline", type: "pipeline", lat: 52.0, lng: 30.0, detail: "Russia→Europe oil pipeline", status: "reduced-flow" },
    { name: "Nord Stream (damaged)", type: "pipeline", lat: 55.5, lng: 15.5, detail: "Baltic Sea gas pipeline", status: "offline" },
    { name: "TurkStream", type: "pipeline", lat: 41.5, lng: 29.0, detail: "Russia→Turkey gas", status: "operational" },
    { name: "Ramstein Air Base", type: "base", lat: 49.44, lng: 7.60, detail: "US Air Force HQ Europe", status: "active" },
    { name: "Diego Garcia", type: "base", lat: -7.32, lng: 72.42, detail: "US/UK Indian Ocean base", status: "active" },
    { name: "Camp Lemonnier", type: "base", lat: 11.55, lng: 43.15, detail: "US Africa Command", status: "active" },
    { name: "Natanz Facility", type: "nuclear", lat: 33.72, lng: 51.73, detail: "Iran enrichment site", status: "monitored" },
    { name: "Yongbyon Complex", type: "nuclear", lat: 39.80, lng: 125.75, detail: "DPRK nuclear site", status: "monitored" },
    { name: "Dimona", type: "nuclear", lat: 31.0, lng: 35.15, detail: "Israel nuclear research", status: "monitored" },
  ];
}

// ── Alert generation ──
function generateAlerts(data: any): any[] {
  const alerts: any[] = [];
  const now = Date.now();

  if (data.earthquakes?.length) {
    for (const eq of data.earthquakes.filter((e: any) => e.magnitude >= 5.0).slice(0, 3)) {
      const age = (now - eq.time) / 3600000;
      alerts.push({
        level: eq.magnitude >= 6.5 ? "critical" : "high", domain: "seismic",
        title: `M${eq.magnitude} Earthquake — ${eq.place}`,
        detail: `${age < 1 ? "<1h ago" : Math.round(age) + "h ago"}${eq.tsunami ? " | TSUNAMI WARNING" : ""}`,
        time: eq.time,
      });
    }
  }

  if (data.crypto?.length) {
    for (const c of data.crypto.slice(0, 10)) {
      if (c.change_24h && Math.abs(c.change_24h) > 8) {
        alerts.push({
          level: Math.abs(c.change_24h) > 15 ? "critical" : "high", domain: "markets",
          title: `${c.symbol} ${c.change_24h > 0 ? "surged" : "crashed"} ${Math.abs(c.change_24h).toFixed(1)}% in 24h`,
          detail: `Price: $${c.price?.toLocaleString()} | MCap: $${(c.market_cap / 1e9).toFixed(1)}B`,
          time: now,
        });
      }
    }
  }

  if (data.space_weather?.length) {
    alerts.push({ level: "medium", domain: "space", title: `${data.space_weather.length} space weather events this week`, detail: data.space_weather[0]?.type || "Solar activity", time: now });
  }

  if (data.flights?.length > 40) {
    alerts.push({ level: "info", domain: "aviation", title: `${data.flights.length} aircraft tracked`, detail: `${new Set(data.flights.map((f: any) => f.country)).size} countries`, time: now });
  }

  if (data.fires?.length > 5) {
    alerts.push({ level: "high", domain: "fires", title: `${data.fires.length} active wildfire events detected`, detail: "NASA EONET satellite monitoring", time: now });
  }

  if (data.conflicts?.length > 0) {
    alerts.push({ level: "medium", domain: "conflict", title: `${data.conflicts.length} conflict/security events`, detail: "GDELT global event monitoring", time: now });
  }

  const riskyWaterways = data.infrastructure?.filter((i: any) => i.type === "waterway" && i.status !== "operational");
  if (riskyWaterways?.length) {
    alerts.push({ level: "high", domain: "infrastructure", title: `${riskyWaterways.length} strategic waterways at elevated risk`, detail: riskyWaterways.map((w: any) => w.name).join(", "), time: now });
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
    const weekAgo = getWeekAgo();

    const SOURCES = {
      flights: "https://opensky-network.org/api/states/all?lamin=25&lamax=50&lomin=-130&lomax=-60",
      flights_eu: "https://opensky-network.org/api/states/all?lamin=35&lamax=60&lomin=-10&lomax=30",
      crypto: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d",
      earthquakes: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
      forex: "https://open.er-api.com/v6/latest/USD",
      iss: "http://api.open-notify.org/iss-now.json",
      space_weather: `https://api.nasa.gov/DONKI/notifications?startDate=${weekAgo}&type=all&api_key=DEMO_KEY`,
      apod: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
      spacex: "https://api.spacexdata.com/v4/launches/upcoming",
      // NEW SOURCES
      fires: "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=40",
      gdelt: "https://api.gdeltproject.org/api/v2/doc/doc?query=conflict%20OR%20protest%20OR%20military&mode=ArtList&maxrecords=20&format=json&sort=DateDesc",
      weather_ny: "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=temperature_2m,wind_speed_10m,weather_code&timezone=America/New_York",
      weather_london: "https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&current=temperature_2m,wind_speed_10m,weather_code&timezone=Europe/London",
      weather_tokyo: "https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.69&current=temperature_2m,wind_speed_10m,weather_code&timezone=Asia/Tokyo",
      weather_dubai: "https://api.open-meteo.com/v1/forecast?latitude=25.27&longitude=55.30&current=temperature_2m,wind_speed_10m,weather_code&timezone=Asia/Dubai",
      weather_sydney: "https://api.open-meteo.com/v1/forecast?latitude=-33.87&longitude=151.21&current=temperature_2m,wind_speed_10m,weather_code&timezone=Australia/Sydney",
    };

    const [
      flightsRaw, flightsEuRaw, cryptoRaw, earthquakesRaw, forexRaw, issRaw,
      spaceWeatherRaw, apodRaw, spacexRaw, firesRaw, gdeltRaw,
      weatherNY, weatherLondon, weatherTokyo, weatherDubai, weatherSydney,
    ] = await Promise.all([
      safeFetch(SOURCES.flights, 10000),
      safeFetch(SOURCES.flights_eu, 10000),
      safeFetch(SOURCES.crypto),
      safeFetch(SOURCES.earthquakes),
      safeFetch(SOURCES.forex),
      safeFetch(SOURCES.iss),
      safeFetch(SOURCES.space_weather),
      safeFetch(SOURCES.apod),
      safeFetch(SOURCES.spacex),
      safeFetch(SOURCES.fires),
      safeFetch(SOURCES.gdelt),
      safeFetch(SOURCES.weather_ny),
      safeFetch(SOURCES.weather_london),
      safeFetch(SOURCES.weather_tokyo),
      safeFetch(SOURCES.weather_dubai),
      safeFetch(SOURCES.weather_sydney),
    ]);

    const flights = processFlights(flightsRaw, flightsEuRaw);
    const crypto = processCrypto(cryptoRaw);
    const earthquakes = processEarthquakes(earthquakesRaw);
    const forex = processForex(forexRaw);
    const space_weather = processSpaceWeather(spaceWeatherRaw);
    const spacex = processSpaceX(spacexRaw);
    const fires = processFires(firesRaw);
    const conflicts = processConflicts(gdeltRaw);
    const infrastructure = getInfrastructure();

    const weather = [
      processWeather(weatherNY, "New York"),
      processWeather(weatherLondon, "London"),
      processWeather(weatherTokyo, "Tokyo"),
      processWeather(weatherDubai, "Dubai"),
      processWeather(weatherSydney, "Sydney"),
    ].filter(Boolean);

    const iss = issRaw?.iss_position
      ? { latitude: parseFloat(issRaw.iss_position.latitude), longitude: parseFloat(issRaw.iss_position.longitude) }
      : null;

    const apod = apodRaw?.url
      ? { title: apodRaw.title, url: apodRaw.url, explanation: apodRaw.explanation?.substring(0, 200), date: apodRaw.date, media_type: apodRaw.media_type }
      : null;

    const intel = { flights, crypto, earthquakes, forex, weather, iss, space_weather, apod, spacex, fires, conflicts, infrastructure };
    const alerts = generateAlerts(intel);

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      alerts,
      intel,
      sources_status: {
        flights: flights.length > 0,
        crypto: crypto.length > 0,
        earthquakes: earthquakes.length > 0,
        forex: Object.keys(forex.rates || {}).length > 0,
        weather: weather.length > 0,
        iss: iss !== null,
        space_weather: space_weather.length > 0,
        apod: apod !== null,
        spacex: spacex.length > 0,
        fires: fires.length > 0,
        conflicts: conflicts.length > 0,
        infrastructure: true,
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

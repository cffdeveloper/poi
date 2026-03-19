import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// All free, no-key-required public APIs
const SOURCES = {
  // Live flight data (OpenSky Network)
  flights: "https://opensky-network.org/api/states/all?lamin=25&lamax=55&lomin=-130&lomax=50",
  // Top crypto prices (CoinGecko)
  crypto: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d",
  // Significant earthquakes last 30 days (USGS)
  earthquakes: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
  // Forex rates
  forex: "https://open.er-api.com/v6/latest/USD",
  // ISS position
  iss: "http://api.open-notify.org/iss-now.json",
  // Solar flares / space weather (DONKI) - NASA free with DEMO_KEY
  space_weather: "https://api.nasa.gov/DONKI/notifications?startDate=${weekAgo}&type=all&api_key=DEMO_KEY",
  // NASA Astronomy Picture of the Day
  apod: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
  // Country data for geopolitics context
  countries_gdp: "https://restcountries.com/v3.1/all?fields=name,population,area,region,subregion,flags,capital,currencies,languages",
  // SpaceX upcoming launches
  spacex: "https://api.spacexdata.com/v4/launches/upcoming",
  // Open-Meteo global weather alerts for major cities
  weather_ny: "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=temperature_2m,wind_speed_10m,weather_code&timezone=America/New_York",
  weather_london: "https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&current=temperature_2m,wind_speed_10m,weather_code&timezone=Europe/London",
  weather_tokyo: "https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.69&current=temperature_2m,wind_speed_10m,weather_code&timezone=Asia/Tokyo",
  weather_dubai: "https://api.open-meteo.com/v1/forecast?latitude=25.27&longitude=55.30&current=temperature_2m,wind_speed_10m,weather_code&timezone=Asia/Dubai",
  weather_sydney: "https://api.open-meteo.com/v1/forecast?latitude=-33.87&longitude=151.21&current=temperature_2m,wind_speed_10m,weather_code&timezone=Australia/Sydney",
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

function processFlights(raw: any) {
  if (!raw?.states) return [];
  // Return top 50 flights with most data
  return raw.states
    .filter((s: any[]) => s[1] && s[2] && s[5] && s[6] && s[7])
    .slice(0, 60)
    .map((s: any[]) => ({
      callsign: (s[1] || "").trim(),
      country: s[2],
      longitude: s[5],
      latitude: s[6],
      altitude: Math.round((s[7] || 0) * 3.281), // meters to feet
      velocity: Math.round((s[9] || 0) * 1.944), // m/s to knots
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
    id: c.id,
    symbol: c.symbol?.toUpperCase(),
    name: c.name,
    price: c.current_price,
    market_cap: c.market_cap,
    volume_24h: c.total_volume,
    change_1h: c.price_change_percentage_1h_in_currency,
    change_24h: c.price_change_percentage_24h_in_currency,
    change_7d: c.price_change_percentage_7d_in_currency,
    high_24h: c.high_24h,
    low_24h: c.low_24h,
    ath: c.ath,
    ath_change: c.ath_change_percentage,
    image: c.image,
    rank: c.market_cap_rank,
  }));
}

function processForex(raw: any) {
  if (!raw?.rates) return {};
  const important = ["EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "CNY", "INR", "BRL", "MXN", "KRW", "RUB", "ZAR", "SGD", "HKD"];
  const filtered: Record<string, number> = {};
  for (const k of important) {
    if (raw.rates[k]) filtered[k] = raw.rates[k];
  }
  return { base: raw.base_code || "USD", rates: filtered, updated: raw.time_last_update_utc };
}

function processWeather(data: any, city: string) {
  if (!data?.current) return null;
  return {
    city,
    temperature: data.current.temperature_2m,
    wind_speed: data.current.wind_speed_10m,
    weather_code: data.current.weather_code,
  };
}

function processSpaceX(raw: any) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l: any) => l.date_utc)
    .sort((a: any, b: any) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime())
    .slice(0, 8)
    .map((l: any) => ({
      name: l.name,
      date: l.date_utc,
      rocket: l.rocket,
      details: l.details,
      flight_number: l.flight_number,
    }));
}

function processSpaceWeather(raw: any) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 10).map((n: any) => ({
    type: n.messageType,
    body: n.messageBody?.substring(0, 300),
    url: n.messageURL,
    id: n.messageID,
    issued: n.messageIssueTime,
  }));
}

function generateAlerts(data: any): any[] {
  const alerts: any[] = [];
  const now = Date.now();

  // Earthquake alerts
  if (data.earthquakes?.length) {
    const big = data.earthquakes.filter((e: any) => e.magnitude >= 5.0);
    for (const eq of big.slice(0, 3)) {
      const age = (now - eq.time) / 3600000;
      alerts.push({
        level: eq.magnitude >= 6.5 ? "critical" : "high",
        domain: "seismic",
        title: `M${eq.magnitude} Earthquake — ${eq.place}`,
        detail: `${age < 1 ? "Less than 1 hour ago" : Math.round(age) + "h ago"}${eq.tsunami ? " | TSUNAMI WARNING" : ""}`,
        time: eq.time,
      });
    }
  }

  // Crypto volatility alerts
  if (data.crypto?.length) {
    for (const c of data.crypto.slice(0, 10)) {
      if (c.change_24h && Math.abs(c.change_24h) > 8) {
        alerts.push({
          level: Math.abs(c.change_24h) > 15 ? "critical" : "high",
          domain: "markets",
          title: `${c.symbol} ${c.change_24h > 0 ? "surged" : "crashed"} ${Math.abs(c.change_24h).toFixed(1)}% in 24h`,
          detail: `Price: $${c.price?.toLocaleString()} | MCap: $${(c.market_cap / 1e9).toFixed(1)}B`,
          time: now,
        });
      }
    }
  }

  // Space weather
  if (data.space_weather?.length) {
    alerts.push({
      level: "medium",
      domain: "space",
      title: `${data.space_weather.length} space weather events this week`,
      detail: data.space_weather[0]?.type || "Solar activity detected",
      time: now,
    });
  }

  // Flight density
  if (data.flights?.length > 40) {
    alerts.push({
      level: "info",
      domain: "aviation",
      title: `${data.flights.length} aircraft tracked in monitored zone`,
      detail: `Active airspace — ${new Set(data.flights.map((f: any) => f.country)).size} countries`,
      time: now,
    });
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
    const spaceWeatherUrl = SOURCES.space_weather.replace("${weekAgo}", weekAgo);

    // Fetch ALL sources in parallel
    const [
      flightsRaw, cryptoRaw, earthquakesRaw, forexRaw, issRaw,
      spaceWeatherRaw, apodRaw, spacexRaw,
      weatherNY, weatherLondon, weatherTokyo, weatherDubai, weatherSydney,
    ] = await Promise.all([
      safeFetch(SOURCES.flights),
      safeFetch(SOURCES.crypto),
      safeFetch(SOURCES.earthquakes),
      safeFetch(SOURCES.forex),
      safeFetch(SOURCES.iss),
      safeFetch(spaceWeatherUrl),
      safeFetch(SOURCES.apod),
      safeFetch(SOURCES.spacex),
      safeFetch(SOURCES.weather_ny),
      safeFetch(SOURCES.weather_london),
      safeFetch(SOURCES.weather_tokyo),
      safeFetch(SOURCES.weather_dubai),
      safeFetch(SOURCES.weather_sydney),
    ]);

    const flights = processFlights(flightsRaw);
    const crypto = processCrypto(cryptoRaw);
    const earthquakes = processEarthquakes(earthquakesRaw);
    const forex = processForex(forexRaw);
    const space_weather = processSpaceWeather(spaceWeatherRaw);
    const spacex = processSpaceX(spacexRaw);

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

    const intel = { flights, crypto, earthquakes, forex, weather, iss, space_weather, apod, spacex };
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

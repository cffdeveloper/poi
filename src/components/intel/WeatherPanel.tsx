import type { WeatherCity } from "@/lib/intelTypes";
import { CloudSun } from "lucide-react";

const weatherDesc: Record<number, string> = {
  0: "Clear", 1: "Mostly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime Fog", 51: "Light Drizzle", 53: "Drizzle", 55: "Dense Drizzle",
  61: "Light Rain", 63: "Rain", 65: "Heavy Rain", 71: "Light Snow", 73: "Snow", 75: "Heavy Snow",
  80: "Rain Showers", 81: "Moderate Showers", 82: "Violent Showers",
  95: "Thunderstorm", 96: "Thunderstorm + Hail", 99: "Thunderstorm + Heavy Hail",
};

function getDesc(code: number): string {
  return weatherDesc[code] || "Unknown";
}

export function WeatherPanel({ data }: { data: WeatherCity[] }) {
  if (!data.length) {
    return (
      <div className="glass-panel p-4 flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-mono">Weather — awaiting data</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3 space-y-2">
      <div className="flex items-center gap-2">
        <CloudSun className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Global Weather</h3>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {data.map((w) => (
          <div key={w.city} className="text-center px-2 py-2 rounded bg-muted/30 border border-border/50">
            <div className="text-lg font-mono font-bold text-foreground">{Math.round(w.temperature)}°</div>
            <div className="text-[10px] font-semibold text-foreground mt-0.5">{w.city}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{getDesc(w.weather_code)}</div>
            <div className="text-[9px] text-muted-foreground">{Math.round(w.wind_speed)} km/h</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { SpaceXLaunch, ISSPosition, SpaceWeatherEvent, APOD } from "@/lib/intelTypes";
import { Rocket, Satellite, Sun, Image } from "lucide-react";

function formatDate(d: string): string {
  try {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

function daysUntil(d: string): string {
  const ms = new Date(d).getTime() - Date.now();
  const days = Math.ceil(ms / 86400000);
  if (days < 0) return "Passed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days}d`;
}

export function SpacePanel({
  launches,
  iss,
  spaceWeather,
  apod,
}: {
  launches: SpaceXLaunch[];
  iss: ISSPosition | null;
  spaceWeather: SpaceWeatherEvent[];
  apod: APOD | null;
}) {
  return (
    <div className="glass-panel p-3 space-y-3 h-full overflow-hidden flex flex-col">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Rocket className="w-3.5 h-3.5 text-primary" />
        Space & Aerospace
      </h3>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
        {/* ISS */}
        {iss && (
          <div className="px-2 py-1.5 rounded bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Satellite className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">ISS Position</span>
            </div>
            <div className="flex gap-4 mt-1">
              <span className="text-xs font-mono text-foreground">Lat: {iss.latitude.toFixed(2)}°</span>
              <span className="text-xs font-mono text-foreground">Lon: {iss.longitude.toFixed(2)}°</span>
            </div>
          </div>
        )}

        {/* Launches */}
        {launches.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-muted-foreground uppercase px-1">Upcoming Launches</div>
            {launches.slice(0, 5).map((l, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/20 transition-colors">
                <span className="text-[10px] font-mono text-accent font-semibold flex-shrink-0">{daysUntil(l.date)}</span>
                <span className="text-xs text-foreground truncate">{l.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">{formatDate(l.date)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Space Weather */}
        {spaceWeather.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-1">
              <Sun className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Space Weather</span>
            </div>
            {spaceWeather.slice(0, 3).map((sw, i) => (
              <div key={i} className="px-2 py-1 text-[11px] text-muted-foreground leading-tight">
                <span className="text-primary font-mono text-[10px]">{sw.type}</span>
                <p className="mt-0.5 line-clamp-2">{sw.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* APOD */}
        {apod && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-1">
              <Image className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">NASA APOD</span>
            </div>
            <a href={apod.url} target="_blank" rel="noopener" className="block px-2">
              {apod.media_type === "image" && (
                <img src={apod.url} alt={apod.title} className="w-full h-24 object-cover rounded border border-border/50 mb-1" />
              )}
              <p className="text-xs text-foreground font-medium">{apod.title}</p>
              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{apod.explanation}</p>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

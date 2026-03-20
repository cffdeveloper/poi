import { useState, useRef, useEffect } from "react";
import { useGeoContext } from "@/contexts/GeoContext";
import { CONTINENTS, COUNTRIES, getSubRegions, GeoOption, getGeoLabel } from "@/lib/geoData";
import { Globe, X, ChevronDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function GeoSelector() {
  const { selections, addSelection, removeSelection, clearSelections } = useGeoContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"continent" | "country" | "sub">("country");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedValues = new Set(selections.map(s => s.value));

  // Which sub-regions to show
  const selectedCountries = selections.filter(s => s.type === "country");
  const subRegions = selectedCountries.flatMap(c => getSubRegions(c.value));

  const filterOptions = (options: GeoOption[]) => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q));
  };

  const toggle = (opt: GeoOption) => {
    if (selectedValues.has(opt.value)) {
      removeSelection(opt.value);
    } else {
      addSelection(opt);
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all",
          selections.length > 0
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border/50 bg-card/50 text-muted-foreground hover:text-foreground hover:border-border"
        )}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="max-w-[200px] truncate">{getGeoLabel(selections)}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      {/* Selected tags */}
      {selections.length > 0 && !open && (
        <div className="absolute top-full left-0 mt-1 flex flex-wrap gap-1 z-50">
          {selections.slice(0, 5).map(s => (
            <span key={s.value} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-mono border border-primary/20">
              {s.label}
              <button onClick={(e) => { e.stopPropagation(); removeSelection(s.value); }} className="hover:text-destructive">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {selections.length > 5 && (
            <span className="text-[9px] font-mono text-muted-foreground px-1">+{selections.length - 5} more</span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 max-h-[400px] bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border/50">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/30 border border-border/30">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search locations..."
                className="flex-1 text-xs font-mono bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/50">
            {(["continent", "country", ...(subRegions.length ? ["sub" as const] : [])] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors",
                  tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "sub" ? "States/Counties/Provinces" : t === "continent" ? "Continents" : "Countries"}
              </button>
            ))}
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-[280px] p-1.5 space-y-0.5">
            {tab === "continent" && filterOptions(CONTINENTS).map(opt => (
              <button
                key={opt.value}
                onClick={() => toggle(opt)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded text-xs font-mono text-left transition-colors",
                  selectedValues.has(opt.value) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/30"
                )}
              >
                <MapPin className="w-3 h-3" />
                {opt.label}
                {selectedValues.has(opt.value) && <span className="ml-auto text-[9px] text-primary">✓</span>}
              </button>
            ))}

            {tab === "country" && (() => {
              const grouped: Record<string, GeoOption[]> = {};
              for (const c of filterOptions(COUNTRIES)) {
                const parent = c.parent || "other";
                if (!grouped[parent]) grouped[parent] = [];
                grouped[parent].push(c);
              }
              return Object.entries(grouped).map(([continent, countries]) => (
                <div key={continent}>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider px-2.5 py-1 mt-1">
                    {CONTINENTS.find(c => c.value === continent)?.label || continent}
                  </p>
                  {countries.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => toggle(opt)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono text-left transition-colors",
                        selectedValues.has(opt.value) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/30"
                      )}
                    >
                      <span className="text-[10px] w-6 text-muted-foreground">{opt.value}</span>
                      {opt.label}
                      {selectedValues.has(opt.value) && <span className="ml-auto text-[9px] text-primary">✓</span>}
                    </button>
                  ))}
                </div>
              ));
            })()}

            {tab === "sub" && subRegions.length > 0 && filterOptions(subRegions).map(opt => (
              <button
                key={opt.value}
                onClick={() => toggle(opt)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono text-left transition-colors",
                  selectedValues.has(opt.value) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/30"
                )}
              >
                <MapPin className="w-3 h-3" />
                {opt.label}
                {selectedValues.has(opt.value) && <span className="ml-auto text-[9px] text-primary">✓</span>}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border/50 flex items-center justify-between">
            <span className="text-[9px] font-mono text-muted-foreground">{selections.length} selected</span>
            <div className="flex gap-2">
              {selections.length > 0 && (
                <button onClick={clearSelections} className="text-[9px] font-mono text-destructive hover:underline">
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-[9px] font-mono text-primary hover:underline">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

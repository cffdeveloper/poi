import type { ForexData } from "@/lib/intelTypes";
import { ArrowRightLeft } from "lucide-react";

const flagMap: Record<string, string> = {
  EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CHF: "🇨🇭", AUD: "🇦🇺",
  CAD: "🇨🇦", CNY: "🇨🇳", INR: "🇮🇳", BRL: "🇧🇷", MXN: "🇲🇽",
  KRW: "🇰🇷", RUB: "🇷🇺", ZAR: "🇿🇦", SGD: "🇸🇬", HKD: "🇭🇰",
};

export function ForexPanel({ data }: { data: ForexData }) {
  if (!data.rates || !Object.keys(data.rates).length) {
    return (
      <div className="glass-panel p-4 flex items-center justify-center">
        <span className="text-xs text-muted-foreground font-mono">Forex — awaiting data</span>
      </div>
    );
  }

  const entries = Object.entries(data.rates);

  return (
    <div className="glass-panel p-3 space-y-2 h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Forex Rates</h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">Base: {data.base}</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 space-y-0.5">
        {entries.map(([code, rate]) => (
          <div key={code} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/30 transition-colors">
            <span className="text-sm">{flagMap[code] || "💱"}</span>
            <span className="text-xs font-mono font-semibold text-foreground w-8">{code}</span>
            <div className="flex-1 h-px bg-border/30" />
            <span className="text-xs font-mono text-foreground">{rate < 10 ? rate.toFixed(4) : rate < 1000 ? rate.toFixed(2) : rate.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

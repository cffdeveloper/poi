import type { CryptoAsset } from "@/lib/intelTypes";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function formatPrice(n: number): string {
  if (n >= 1000) return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 1) return "$" + n.toFixed(2);
  return "$" + n.toPrecision(4);
}

function formatMcap(n: number): string {
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(0) + "M";
  return "$" + n.toLocaleString();
}

function ChangeCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const isUp = value > 0;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono ${isUp ? "text-emerald-400" : value < 0 ? "text-destructive" : "text-muted-foreground"}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function CryptoPanel({ data }: { data: CryptoAsset[] }) {
  if (!data.length) return <PanelEmpty label="Crypto Markets" />;

  const totalMcap = data.reduce((s, c) => s + (c.market_cap || 0), 0);

  return (
    <div className="glass-panel p-3 space-y-2 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Crypto Markets</h3>
        <span className="text-[10px] font-mono text-primary">{formatMcap(totalMcap)} total</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
        {data.slice(0, 15).map((c) => (
          <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/30 transition-colors group">
            <span className="text-[9px] font-mono text-muted-foreground w-4">{c.rank}</span>
            {c.image && <img src={c.image} alt={c.symbol} className="w-4 h-4 rounded-full" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">{c.symbol}</span>
                <span className="text-[10px] text-muted-foreground truncate">{c.name}</span>
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="text-xs font-mono text-foreground">{formatPrice(c.price)}</div>
              <div className="flex gap-2 justify-end">
                <ChangeCell value={c.change_1h} />
                <ChangeCell value={c.change_24h} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelEmpty({ label }: { label: string }) {
  return (
    <div className="glass-panel p-4 flex items-center justify-center">
      <span className="text-xs text-muted-foreground font-mono">{label} — awaiting data</span>
    </div>
  );
}

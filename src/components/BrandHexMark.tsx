import { Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "w-8 h-8", outer: "w-8 h-8", inner: "w-6 h-6", strokeOut: 2, strokeIn: 2.65, dot: "w-1.5 h-1.5" },
  md: { box: "w-10 h-10", outer: "w-10 h-10", inner: "w-[2.125rem] h-[2.125rem]", strokeOut: 2.1, strokeIn: 2.8, dot: "w-2 h-2" },
  lg: { box: "w-12 h-12", outer: "w-12 h-12", inner: "w-10 h-10", strokeOut: 2.15, strokeIn: 2.9, dot: "w-2.5 h-2.5" },
} as const;

type Size = keyof typeof sizeMap;

/** High-contrast stacked hex — crisp strokes only, no glow or blur. */
export function BrandHexMark({ size = "md", className }: { size?: Size; className?: string }) {
  const s = sizeMap[size];

  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center", s.box, className)}
      aria-hidden
    >
      <Hexagon className={cn("absolute text-foreground", s.outer)} strokeWidth={s.strokeOut} />
      <Hexagon className={cn("relative text-primary", s.inner)} strokeWidth={s.strokeIn} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className={cn("rounded-full bg-accent", s.dot)} />
      </div>
    </div>
  );
}

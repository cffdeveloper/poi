import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  className?: string;
};

/**
 * Visible product name only — capital M, rest lowercase, tech display font.
 */
export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span className={cn("font-brand inline-flex items-baseline select-none leading-none", className)}>
      <span className="text-foreground font-bold tracking-tight pr-[0.02em] translate-y-px">M</span>
      <span className="text-primary lowercase font-semibold tracking-[0.02em] -ml-px">averick</span>
    </span>
  );
}

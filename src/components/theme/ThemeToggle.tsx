import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Matches app chrome: compact, clear affordance, no layout shift after hydration. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = resolvedTheme === "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-8 px-2 gap-1.5 border-border/60 bg-background/60 hover:bg-muted/80 text-foreground shrink-0",
        className,
      )}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={isLight}
      disabled={!mounted}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {!mounted ? (
        <span className="w-3.5 h-3.5" aria-hidden />
      ) : isLight ? (
        <>
          <Moon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-medium hidden sm:inline">Light</span>
        </>
      )}
    </Button>
  );
}

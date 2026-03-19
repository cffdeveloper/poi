import { Link, useLocation } from "react-router-dom";
import { industries } from "@/lib/industryData";
import { LayoutDashboard, Radio, Network, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Sidebar({ open }: { open: boolean }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/intel", label: "Live Intel Feed", icon: Radio },
    { to: "/cross-intel", label: "Cross-Industry AI", icon: Network },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto">
      <div className="p-2 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono transition-colors",
              location.pathname === item.to
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="px-2 py-1.5">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest px-2.5 mb-1">
          Industries
        </p>
      </div>

      <div className="px-2 space-y-0.5 pb-4">
        {industries.map((ind) => {
          const isActive = location.pathname.startsWith(`/industry/${ind.slug}`);
          const isExpanded = expanded === ind.slug || isActive;

          return (
            <div key={ind.slug}>
              <button
                onClick={() => setExpanded(isExpanded && !isActive ? null : ind.slug)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono transition-colors text-left",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <span className="text-sm">{ind.icon}</span>
                <span className="flex-1 truncate">{ind.name}</span>
                {isExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
              </button>

              {isExpanded && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-border/30 pl-2">
                  <Link
                    to={`/industry/${ind.slug}`}
                    className={cn(
                      "block px-2 py-1 rounded text-[10px] font-mono transition-colors",
                      location.pathname === `/industry/${ind.slug}`
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Overview
                  </Link>
                  {ind.subFlows.map((sf) => (
                    <Link
                      key={sf.id}
                      to={`/industry/${ind.slug}/${sf.id}`}
                      className={cn(
                        "block px-2 py-1 rounded text-[10px] font-mono transition-colors truncate",
                        location.pathname === `/industry/${ind.slug}/${sf.id}`
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {sf.shortName}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

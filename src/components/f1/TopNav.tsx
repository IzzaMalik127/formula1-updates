import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Sun, Home as HomeIcon, Users, Flag as FlagIcon, MapPin, CalendarDays, Newspaper, BarChart3 } from "lucide-react";
import { F1Logo } from "./F1Logo";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/constructors", label: "Constructors", icon: FlagIcon },
  { to: "/circuits", label: "Circuits", icon: MapPin },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
];

export function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container-f1 flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <F1Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((n) => {
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative rounded-md px-3 py-2 text-[11px] font-bold tracking-[0.18em] transition ${
                  active ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {n.label.toUpperCase()}
                <span
                  className={`pointer-events-none absolute inset-x-2 -bottom-1 h-[2px] origin-left rounded-full bg-primary transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                  style={{ boxShadow: "0 0 12px var(--f1-red-glow)" }}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-foreground/80 transition hover:border-primary/50 hover:bg-white/[0.06] hover:text-foreground" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <button className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-foreground/80 transition hover:border-primary/50 hover:bg-white/[0.06] hover:text-foreground sm:grid" aria-label="Theme">
            <Sun className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="lg:hidden border-t border-white/5 bg-background/40 backdrop-blur-xl" aria-label="Primary mobile">
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10.5px] font-bold tracking-[0.16em] transition ${
                  active
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/[0.03] text-foreground/70 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label.toUpperCase()}
                {active && (
                  <span
                    className="pointer-events-none absolute inset-x-4 -bottom-[3px] h-[2px] rounded-full bg-primary"
                    style={{ boxShadow: "0 0 10px var(--f1-red-glow)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

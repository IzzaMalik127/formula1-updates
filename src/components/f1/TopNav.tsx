import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Search,
  Home as HomeIcon,
  Users,
  Flag as FlagIcon,
  MapPin,
  CalendarDays,
  Newspaper,
  BarChart3,
  Trophy,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";
import { F1Logo } from "./F1Logo";
import { Flag } from "./Flag";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CIRCUITS, DRIVER_INFO, TEAMS } from "@/lib/f1-data";

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

type SearchItem = {
  id: string;
  label: string;
  subLabel?: string;
  to: string;
  icon?: React.ReactNode;
  keywords: string;
};

export function TopNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  // Cmd/Ctrl+K shortcut to open search.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo<SearchItem[]>(() => {
    const pages: SearchItem[] = [
      { id: "page-home", label: "Home", to: "/", icon: <HomeIcon className="h-4 w-4" />, keywords: "home" },
      { id: "page-drivers", label: "Drivers", to: "/drivers", icon: <Users className="h-4 w-4" />, keywords: "drivers standings" },
      { id: "page-constructors", label: "Constructors", to: "/constructors", icon: <Trophy className="h-4 w-4" />, keywords: "constructors teams standings" },
      { id: "page-circuits", label: "Circuits", to: "/circuits", icon: <MapPin className="h-4 w-4" />, keywords: "circuits tracks" },
      { id: "page-calendar", label: "Calendar", to: "/calendar", icon: <CalendarDays className="h-4 w-4" />, keywords: "calendar schedule races" },
      { id: "page-news", label: "News", to: "/news", icon: <Newspaper className="h-4 w-4" />, keywords: "news articles" },
      { id: "page-statistics", label: "Statistics", to: "/statistics", icon: <TrendingUp className="h-4 w-4" />, keywords: "statistics stats" },
    ];

    const teams: SearchItem[] = Object.values(TEAMS).map((t) => ({
      id: `team-${t.id}`,
      label: t.name,
      subLabel: "Team",
      to: "/constructors",
      icon: (
        <img
          src={t.logo}
          alt=""
          className="h-4 w-4 object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ),
      keywords: `${t.name} team constructor ${t.countryCode}`,
    }));

    const circuits: SearchItem[] = Object.values(CIRCUITS).map((c) => ({
      id: `circuit-${c.id}`,
      label: c.name,
      subLabel: c.country,
      to: "/circuits",
      icon: <Flag cc={c.countryCode} className="h-4 w-4" />,
      keywords: `${c.name} ${c.country} ${c.city} circuit track`,
    }));

    const drivers: SearchItem[] = Object.entries(DRIVER_INFO).map(([id, d]) => {
      const name = d.name;
      return {

        id: `driver-${id}`,
        label: name,
        subLabel: d.team,
        to: "/drivers",
        icon: d.headshot ? (
          <img
            src={d.headshot}
            alt=""
            className="h-4 w-4 rounded-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <Users className="h-4 w-4" />
        ),
        keywords: `${name} ${d.team} driver number ${d.number}`,
      };
    });

    return [...pages, ...teams, ...circuits, ...drivers];
  }, []);

  const runCommand = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <>
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
            <button
              onClick={() => setOpen(true)}
              className="group grid h-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] px-3 text-foreground/80 transition hover:border-primary/50 hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Search"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden text-[10px] font-medium tracking-wider text-foreground/50 sm:inline">⌘K</span>
              </div>
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

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search drivers, teams, circuits, pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {items.filter((i) => i.id.startsWith("page-")).map((item) => (
              <CommandItem
                key={item.id}
                value={item.keywords}
                onSelect={() => runCommand(item.to)}
                className="flex items-center gap-3"
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Teams">
            {items.filter((i) => i.id.startsWith("team-")).map((item) => (
              <CommandItem
                key={item.id}
                value={item.keywords}
                onSelect={() => runCommand(item.to)}
                className="flex items-center gap-3"
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.subLabel}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Circuits">
            {items.filter((i) => i.id.startsWith("circuit-")).map((item) => (
              <CommandItem
                key={item.id}
                value={item.keywords}
                onSelect={() => runCommand(item.to)}
                className="flex items-center gap-3"
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.subLabel}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Drivers">
            {items.filter((i) => i.id.startsWith("driver-")).map((item) => (
              <CommandItem
                key={item.id}
                value={item.keywords}
                onSelect={() => runCommand(item.to)}
                className="flex items-center gap-3"
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.subLabel}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}


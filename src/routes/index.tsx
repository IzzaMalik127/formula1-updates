import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronRight, Calendar, Clock, Ruler, RefreshCw, Timer, Trophy, Instagram, Youtube, Twitter, Music2, ArrowRight, Sun, Home as HomeIcon, Users, Flag as FlagIcon, MapPin, CalendarDays, Newspaper, BarChart3 } from "lucide-react";

import heroCars from "@/assets/hero-night.jpg.asset.json";
import circuitBg from "@/assets/circuit-bg.png.asset.json";
import f1LogoAsset from "@/assets/f1-logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "F1 Live — Standings, Races & Circuits" },
      { name: "description", content: "Live Formula 1 standings, race calendar, and circuits — the pulse of F1." },
      { property: "og:title", content: "F1 Live — Standings, Races & Circuits" },
      { property: "og:description", content: "Live Formula 1 standings, race calendar, and circuits." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

/* ---------- Types & fallback data ---------- */

type Driver = {
  pos: number;
  name: string;
  team: string;
  pts: number;
  wins: number;
  color: string;
  headshot?: string;
  countryCode?: string; // 2-letter ISO for flagcdn
};
type Constructor = {
  pos: number;
  name: string;
  pts: number;
  wins: number;
  color: string;
  logo?: string;
};
type Race = { day: string; month: string; name: string; circuit: string; cc: string };

// 3-letter (Ergast/OpenF1) → 2-letter ISO for flagcdn.com
const CC3_TO_CC2: Record<string, string> = {
  GBR: "gb", NED: "nl", MON: "mc", ESP: "es", MEX: "mx", AUS: "au", FRA: "fr",
  GER: "de", FIN: "fi", DEN: "dk", JPN: "jp", THA: "th", CHN: "cn", USA: "us",
  CAN: "ca", ITA: "it", BRA: "br", NZL: "nz", ARG: "ar", SUI: "ch", AUT: "at",
  BEL: "be", POL: "pl", RUS: "ru", SWE: "se", IRL: "ie", POR: "pt",
};
const NATIONALITY_TO_CC: Record<string, string> = {
  British: "gb", Dutch: "nl", Monegasque: "mc", Spanish: "es", Mexican: "mx",
  Australian: "au", French: "fr", German: "de", Finnish: "fi", Danish: "dk",
  Japanese: "jp", Thai: "th", Chinese: "cn", American: "us", Canadian: "ca",
  Italian: "it", Brazilian: "br", "New Zealander": "nz", Argentine: "ar",
};

// Official F1 headshot pattern hosted on formula1.com CDN
const F1_HEADSHOT: Record<string, string> = {
  "Lando Norris": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png",
  "Max Verstappen": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png",
  "Charles Leclerc": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png",
  "Carlos Sainz": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png",
  "Sergio Pérez": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/2col/image.png",
  "Oscar Piastri": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png",
  "Lewis Hamilton": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png",
  "George Russell": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png",
  "Fernando Alonso": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col/image.png",
};

const TEAM_META: Record<string, { color: string; logo?: string }> = {
  "Red Bull": { color: "#3671C6", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png" },
  "Red Bull Racing": { color: "#3671C6", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png" },
  "Ferrari": { color: "#E8002D", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png" },
  "McLaren": { color: "#FF8000", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png" },
  "Mercedes": { color: "#27F4D2", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png" },
  "Aston Martin": { color: "#229971", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png" },
  "Alpine F1 Team": { color: "#0093CC", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png" },
  "Williams": { color: "#64C4FF", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png" },
  "RB F1 Team": { color: "#6692FF", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png" },
  "Sauber": { color: "#52E252", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png" },
  "Haas F1 Team": { color: "#B6BABD", logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png" },
};

const FALLBACK_DRIVERS: Driver[] = [
  { pos: 1, name: "Max Verstappen", team: "Red Bull Racing", pts: 161, wins: 4, color: "#3671C6", headshot: F1_HEADSHOT["Max Verstappen"], countryCode: "nl" },
  { pos: 2, name: "Lando Norris",   team: "McLaren",          pts: 113, wins: 1, color: "#FF8000", headshot: F1_HEADSHOT["Lando Norris"], countryCode: "gb" },
  { pos: 3, name: "Charles Leclerc", team: "Ferrari",         pts: 98,  wins: 1, color: "#E8002D", headshot: F1_HEADSHOT["Charles Leclerc"], countryCode: "mc" },
  { pos: 4, name: "Carlos Sainz",   team: "Ferrari",           pts: 85,  wins: 1, color: "#E8002D", headshot: F1_HEADSHOT["Carlos Sainz"], countryCode: "es" },
  { pos: 5, name: "Sergio Pérez",   team: "Red Bull Racing",   pts: 83,  wins: 0, color: "#3671C6", headshot: F1_HEADSHOT["Sergio Pérez"], countryCode: "mx" },
];

const FALLBACK_CONSTRUCTORS: Constructor[] = [
  { pos: 1, name: "Red Bull Racing", pts: 268, wins: 4, color: "#3671C6", logo: TEAM_META["Red Bull Racing"].logo },
  { pos: 2, name: "Ferrari",         pts: 187, wins: 1, color: "#E8002D", logo: TEAM_META["Ferrari"].logo },
  { pos: 3, name: "McLaren",         pts: 155, wins: 1, color: "#FF8000", logo: TEAM_META["McLaren"].logo },
  { pos: 4, name: "Mercedes",        pts: 96,  wins: 0, color: "#27F4D2", logo: TEAM_META["Mercedes"].logo },
  { pos: 5, name: "Aston Martin",    pts: 40,  wins: 0, color: "#229971", logo: TEAM_META["Aston Martin"].logo },
];

const UPCOMING: Race[] = [
  { day: "26", month: "MAY", name: "Monaco Grand Prix",   circuit: "Circuit de Monaco, Monaco",             cc: "mc" },
  { day: "09", month: "JUN", name: "Canadian Grand Prix", circuit: "Circuit Gilles-Villeneuve, Canada",     cc: "ca" },
  { day: "23", month: "JUN", name: "Spanish Grand Prix",  circuit: "Circuit de Barcelona-Catalunya, Spain", cc: "es" },
  { day: "07", month: "JUL", name: "Austrian Grand Prix", circuit: "Red Bull Ring, Austria",                 cc: "at" },
];

/* ---------- Hooks ---------- */
function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hrs: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

function useLiveStandings() {
  const [drivers, setDrivers] = useState<Driver[]>(FALLBACK_DRIVERS);
  const [constructors, setConstructors] = useState<Constructor[]>(FALLBACK_CONSTRUCTORS);
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json", { signal: ac.signal }),
          fetch("https://api.jolpi.ca/ergast/f1/current/constructorStandings.json", { signal: ac.signal }),
        ]);
        if (!dRes.ok || !cRes.ok) return;
        const dJson = await dRes.json();
        const cJson = await cRes.json();
        const dList = dJson?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
        const cList = cJson?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
        if (dList.length) {
          setDrivers(dList.slice(0, 5).map((d: any, i: number) => {
            const name = `${d.Driver.givenName} ${d.Driver.familyName}`;
            const teamName = d.Constructors[0].name;
            return {
              pos: Number(d.position ?? i + 1),
              name,
              team: teamName,
              pts: Number(d.points),
              wins: Number(d.wins ?? 0),
              color: TEAM_META[teamName]?.color ?? "#E8002D",
              headshot: F1_HEADSHOT[name],
              countryCode: NATIONALITY_TO_CC[d.Driver.nationality] ?? CC3_TO_CC2[d.Driver.nationality] ?? undefined,
            };
          }));
        }
        if (cList.length) {
          setConstructors(cList.slice(0, 5).map((c: any, i: number) => ({
            pos: Number(c.position ?? i + 1),
            name: c.Constructor.name,
            pts: Number(c.points),
            wins: Number(c.wins),
            color: TEAM_META[c.Constructor.name]?.color ?? "#E8002D",
            logo: TEAM_META[c.Constructor.name]?.logo,
          })));
        }
      } catch { /* keep fallback */ }
    })();
    return () => ac.abort();
  }, []);
  return { drivers, constructors };
}

/* ---------- Small building blocks ---------- */

function F1Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={f1LogoAsset.url}
        alt="Formula 1"
        className="h-6 w-auto md:h-7 select-none"
        draggable={false}
      />
    </div>
  );
}

function Flag({ cc, className = "" }: { cc?: string; className?: string }) {
  if (!cc) return <div className={`bg-white/10 ${className}`} />;
  return (
    <img
      src={`https://flagcdn.com/w80/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 1x, https://flagcdn.com/w160/${cc}.png 2x`}
      alt={`${cc.toUpperCase()} flag`}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}

/* ---------- Navigation ---------- */
type NavItem = { key: string; label: string; icon: React.ComponentType<{ className?: string }> };
const NAV: NavItem[] = [
  { key: "HOME", label: "Home", icon: HomeIcon },
  { key: "DRIVERS", label: "Drivers", icon: Users },
  { key: "CONSTRUCTORS", label: "Constructors", icon: FlagIcon },
  { key: "CIRCUITS", label: "Circuits", icon: MapPin },
  { key: "CALENDAR", label: "Calendar", icon: CalendarDays },
  { key: "NEWS", label: "News", icon: Newspaper },
  { key: "STATISTICS", label: "Statistics", icon: BarChart3 },
];

function TopNav({ active, setActive }: { active: string; setActive: (k: string) => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container-f1 flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <F1Logo />
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((n) => {
            const isActive = active === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                className={`group relative rounded-md px-3 py-2 text-[11px] font-bold tracking-[0.18em] transition ${
                  isActive ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {n.label.toUpperCase()}
                <span
                  className={`pointer-events-none absolute inset-x-2 -bottom-1 h-[2px] origin-left rounded-full bg-primary transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                  style={{ boxShadow: "0 0 12px var(--f1-red-glow)" }}
                />
              </button>
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

      {/* Mobile: horizontal scrollable pill nav (no dropdown / no hamburger) */}
      <nav
        className="lg:hidden border-t border-white/5 bg-background/40 backdrop-blur-xl"
        aria-label="Primary mobile"
      >
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2">
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                className={`group relative flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10.5px] font-bold tracking-[0.16em] transition ${
                  isActive
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/[0.03] text-foreground/70 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label.toUpperCase()}
                {isActive && (
                  <span
                    className="pointer-events-none absolute inset-x-4 -bottom-[3px] h-[2px] rounded-full bg-primary"
                    style={{ boxShadow: "0 0 10px var(--f1-red-glow)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative">
      <div className="container-f1 pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
            <img src={heroCars.url} alt="Formula 1 cars at speed" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
            <div className="absolute left-6 top-6 opacity-20 md:left-10 md:top-10">
              <F1Logo className="scale-[2.5] origin-top-left" />
            </div>
          </div>
        </div>
        <div className="animate-fade-up mt-4 flex flex-wrap gap-3 md:-mt-16 md:ml-4 md:relative md:z-10">
          <button className="group flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-xs font-bold tracking-widest text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110">
            VIEW STANDINGS <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
          <button className="flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 py-3 text-xs font-bold tracking-widest text-foreground backdrop-blur transition hover:bg-white/10">
            EXPLORE RACES <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Next Race ---------- */
function CircuitOutline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 90 C 20 60, 40 40, 70 40 L 110 40 C 130 40, 140 55, 130 70 L 100 80 C 85 85, 90 100, 105 100 L 150 100 C 170 100, 180 85, 170 70 L 155 55" />
      <circle cx="170" cy="70" r="2.5" fill="#E10600" stroke="none" />
    </svg>
  );
}

function NextRaceCard() {
  const target = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    d.setHours(d.getHours() + 18, d.getMinutes() + 24, d.getSeconds() + 37);
    return d;
  }, []);
  const { days, hrs, mins, secs } = useCountdown(target);
  const cells = [
    { v: String(days).padStart(2, "0"), l: "DAYS" },
    { v: String(hrs).padStart(2, "0"), l: "HRS" },
    { v: String(mins).padStart(2, "0"), l: "MINS" },
    { v: String(secs).padStart(2, "0"), l: "SECS", accent: true },
  ];
  return (
    <section className="container-f1 mt-8">
      <div className="glass-card relative overflow-hidden p-5 md:p-7">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-40 md:block">
          <div className="h-full w-full" style={{ background: `url(${circuitBg.url}) center/cover` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>
        <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[0.2em] text-primary">NEXT RACE</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-12 shrink-0 overflow-hidden rounded-sm ring-1 ring-white/10">
                <Flag cc="mc" className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black tracking-tight md:text-2xl">MONACO GRAND PRIX</h2>
                <div className="truncate text-xs text-muted-foreground md:text-sm">Circuit de Monaco, Monaco</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground md:text-sm">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> 26 MAY 2024</div>
              <div className="hidden h-4 w-px bg-white/10 md:block" />
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> 15:00 GMT+2</div>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3">
            {cells.map((c) => (
              <div key={c.l} className="min-w-[62px] rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-center md:min-w-[72px]">
                <div className={`font-black tabular-nums ${c.accent ? "text-primary" : "text-foreground"} text-2xl md:text-3xl`}>{c.v}</div>
                <div className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">{c.l}</div>
              </div>
            ))}
          </div>

          <div className="hidden text-primary/80 md:block">
            <CircuitOutline className="h-24 w-40 text-foreground/70" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Standings ---------- */

function DriverPortrait({ d }: { d: Driver }) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2"
      style={{
        boxShadow: `0 0 0 1px ${d.color}55, 0 6px 18px ${d.color}22`,
        // @ts-expect-error CSS var
        "--tw-ring-color": `${d.color}66`,
        background: `radial-gradient(circle at 50% 40%, ${d.color}33, transparent 70%)`,
      }}
    >
      {d.headshot && !errored ? (
        <img
          src={d.headshot}
          alt={d.name}
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${d.color}55, ${d.color}22)` }} />
      )}
    </div>
  );
}

function DriverStandings({ drivers }: { drivers: Driver[] }) {
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest">DRIVER STANDINGS</h3>
        <Link to="/" className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary hover:brightness-125">VIEW ALL</Link>
      </div>
      <ul className="space-y-2">
        {drivers.map((d) => (
          <li
            key={d.pos}
            className="grid grid-cols-[22px_3px_44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg py-2 transition hover:bg-white/[0.03]"
          >
            <div className="text-center text-sm font-bold tabular-nums text-foreground/90">{d.pos}</div>
            <div className="h-9 w-[3px] rounded-full" style={{ background: d.color, boxShadow: `0 0 8px ${d.color}88` }} />
            <DriverPortrait d={d} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{d.name}</span>
                {d.countryCode && (
                  <span className="h-3 w-4 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-white/10">
                    <Flag cc={d.countryCode} className="h-full w-full" />
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-muted-foreground">{d.team}</div>
            </div>
            <div className="flex items-baseline gap-3 text-right">
              <div>
                <div className="text-sm font-bold tabular-nums">{d.pts}</div>
                <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">PTS</div>
              </div>
              <div className="hidden w-8 sm:block">
                <div className="text-sm font-bold tabular-nums">{d.wins}</div>
                <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">WINS</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConstructorLogo({ c }: { c: Constructor }) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
      style={{ boxShadow: `inset 0 0 0 1px ${c.color}33` }}
    >
      {c.logo && !errored ? (
        <img
          src={c.logo}
          alt={`${c.name} logo`}
          className="max-h-7 max-w-7 object-contain"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }} />
      )}
    </div>
  );
}

function ConstructorStandings({ constructors }: { constructors: Constructor[] }) {
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest">CONSTRUCTOR STANDINGS</h3>
        <Link to="/" className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary hover:brightness-125">VIEW ALL</Link>
      </div>
      <ul className="space-y-2">
        {constructors.map((c) => (
          <li
            key={c.pos}
            className="grid grid-cols-[22px_3px_40px_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg py-2 transition hover:bg-white/[0.03]"
          >
            <div className="text-center text-sm font-bold tabular-nums text-foreground/90">{c.pos}</div>
            <div className="h-9 w-[3px] rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}88` }} />
            <ConstructorLogo c={c} />
            <div className="min-w-0 truncate text-sm font-semibold">{c.name}</div>
            <div className="text-right">
              <div className="text-sm font-bold tabular-nums">{c.pts}</div>
              <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">PTS</div>
            </div>
            <div className="w-10 text-right">
              <div className="text-sm font-bold tabular-nums">{c.wins}</div>
              <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">WINS</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Upcoming + Featured Circuit ---------- */
function UpcomingRaces() {
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest">UPCOMING RACES</h3>
        <Link to="/" className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary hover:brightness-125">VIEW CALENDAR</Link>
      </div>
      <ul className="space-y-4">
        {UPCOMING.map((r) => (
          <li key={r.name} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4">
            <div className="rounded-md bg-white/[0.03] py-1.5 text-center">
              <div className="text-lg font-black leading-none text-primary">{r.day}</div>
              <div className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">{r.month}</div>
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{r.name}</div>
              <div className="truncate text-xs text-muted-foreground">{r.circuit}</div>
            </div>
            <div className="h-6 w-9 overflow-hidden rounded-sm ring-1 ring-white/10">
              <Flag cc={r.cc} className="h-full w-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturedCircuit() {
  const stats = [
    { icon: Ruler, v: "5.891", unit: "km", l: "TRACK LENGTH" },
    { icon: RefreshCw, v: "52", unit: "", l: "LAPS" },
    { icon: Timer, v: "1:27.097", unit: "", l: "LAP RECORD", sub: "M. Verstappen (2020)" },
    { icon: Trophy, v: "1950", unit: "", l: "FIRST GRAND PRIX" },
  ];
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 pb-3 md:p-6 md:pb-3">
        <h3 className="text-sm font-bold tracking-widest">FEATURED CIRCUIT</h3>
      </div>
      <div className="relative h-40 w-full overflow-hidden md:h-44">
        <img src={circuitBg.url} alt="Silverstone Circuit" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 backdrop-blur">
          <span className="h-3 w-4 overflow-hidden rounded-[2px] ring-1 ring-white/10">
            <Flag cc="gb" className="h-full w-full" />
          </span>
          <span className="text-[10px] font-bold tracking-widest">SILVERSTONE</span>
        </div>
      </div>
      <div className="px-5 pb-5 md:px-6 md:pb-6">
        <div className="-mt-6 flex items-center gap-3">
          <div className="h-8 w-11 shrink-0 overflow-hidden rounded-sm ring-1 ring-white/10">
            <Flag cc="gb" className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-lg font-black tracking-tight md:text-xl">SILVERSTONE CIRCUIT</h4>
            <div className="truncate text-xs text-muted-foreground">Silverstone, United Kingdom</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <s.icon className="mx-auto h-4 w-4 text-muted-foreground" />
              <div className="mt-2 text-lg font-black tabular-nums">
                {s.v}{s.unit && <span className="ml-0.5 text-[10px] font-semibold text-muted-foreground">{s.unit}</span>}
              </div>
              <div className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">{s.l}</div>
              {s.sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/5">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="container-f1 grid gap-8 py-10 md:grid-cols-5">
        <div className="md:col-span-1">
          <F1Logo />
          <p className="mt-4 text-xs text-muted-foreground">© 2024 Formula One World Championship Limited</p>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">QUICK LINKS</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["Home","Drivers","Constructors","Circuits"].map(x => <li key={x}><a href="#" className="hover:text-foreground">{x}</a></li>)}
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">ABOUT</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["News","Teams","Calendar","Regulations"].map(x => <li key={x}><a href="#" className="hover:text-foreground">{x}</a></li>)}
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">CONNECT</h5>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            {[Instagram, Twitter, Youtube, Music2].map((I, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 transition hover:border-primary hover:text-primary" aria-label="Social"><I className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">STAY IN THE PULSE</h5>
          <p className="mt-4 text-xs text-muted-foreground">Subscribe for the latest F1 updates</p>
          <form className="mt-3 flex overflow-hidden rounded-md border border-white/10 bg-white/[0.03]" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
            <button className="grid w-10 place-items-center bg-primary text-primary-foreground transition hover:brightness-110" aria-label="Subscribe"><ArrowRight className="h-4 w-4" /></button>
          </form>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
function HomePage() {
  const { drivers, constructors } = useLiveStandings();
  const [active, setActive] = useState("HOME");
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ background: "var(--gradient-hero)" }}>
      <TopNav active={active} setActive={setActive} />
      <main>
        <Hero />
        <NextRaceCard />
        <section className="container-f1 mt-8 grid gap-6 lg:grid-cols-2">
          <DriverStandings drivers={drivers} />
          <ConstructorStandings constructors={constructors} />
        </section>
        <section className="container-f1 mt-6 grid gap-6 lg:grid-cols-2">
          <UpcomingRaces />
          <FeaturedCircuit />
        </section>
      </main>
      <Footer />
    </div>
  );
}

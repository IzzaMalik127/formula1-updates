import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Menu, ChevronRight, Calendar, Clock, Ruler, RefreshCw, Timer, Trophy, Instagram, Youtube, Twitter, Music2, ArrowRight } from "lucide-react";

import heroCars from "@/assets/hero-cars.png.asset.json";
import circuitBg from "@/assets/circuit-bg.png.asset.json";
import driverNorris from "@/assets/driver-norris.png.asset.json";
import ferrariCar from "@/assets/ferrari-car.png.asset.json";
import redbullCar from "@/assets/redbull-car.png.asset.json";

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

/* ---------- Data (fallback matches mockup; live API hydrates when reachable) ---------- */

type Driver = { pos: number; name: string; team: string; pts: number; color: string; img?: string };
type Constructor = { pos: number; name: string; pts: number; wins: number; mark: string; color: string };
type Race = { day: string; month: string; name: string; circuit: string; flag: string };

const FALLBACK_DRIVERS: Driver[] = [
  { pos: 1, name: "Max Verstappen", team: "Red Bull Racing", pts: 161, color: "#3671C6" },
  { pos: 2, name: "Sergio Pérez",   team: "Red Bull Racing", pts: 107, color: "#3671C6" },
  { pos: 3, name: "Charles Leclerc", team: "Ferrari",         pts: 98,  color: "#E8002D", img: ferrariCar.url },
  { pos: 4, name: "Lando Norris",   team: "McLaren",          pts: 75,  color: "#FF8000", img: driverNorris.url },
  { pos: 5, name: "Carlos Sainz",   team: "Ferrari",           pts: 69,  color: "#E8002D" },
];

const FALLBACK_CONSTRUCTORS: Constructor[] = [
  { pos: 1, name: "Red Bull Racing", pts: 268, wins: 7, mark: "RB", color: "#3671C6" },
  { pos: 2, name: "Ferrari",         pts: 167, wins: 1, mark: "SF", color: "#E8002D" },
  { pos: 3, name: "McLaren",         pts: 131, wins: 0, mark: "MC", color: "#FF8000" },
  { pos: 4, name: "Mercedes",        pts: 88,  wins: 0, mark: "MB", color: "#27F4D2" },
  { pos: 5, name: "Aston Martin",    pts: 18,  wins: 0, mark: "AM", color: "#229971" },
];

const UPCOMING: Race[] = [
  { day: "26", month: "MAY", name: "Monaco Grand Prix",   circuit: "Circuit de Monaco, Monaco",             flag: "🇲🇨" },
  { day: "09", month: "JUN", name: "Canadian Grand Prix", circuit: "Circuit Gilles-Villeneuve, Canada",     flag: "🇨🇦" },
  { day: "23", month: "JUN", name: "Spanish Grand Prix",  circuit: "Circuit de Barcelona-Catalunya, Spain", flag: "🇪🇸" },
  { day: "07", month: "JUL", name: "Austrian Grand Prix", circuit: "Red Bull Ring, Austria",                 flag: "🇦🇹" },
];

/* ---------- Countdown ---------- */
function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hrs, mins, secs };
}

/* ---------- Live API (Jolpica-F1, Ergast-compatible) ---------- */
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
        const teamColor: Record<string, string> = {
          red_bull: "#3671C6", ferrari: "#E8002D", mclaren: "#FF8000", mercedes: "#27F4D2",
          aston_martin: "#229971", alpine: "#0093CC", williams: "#64C4FF", rb: "#6692FF",
          sauber: "#52E252", haas: "#B6BABD",
        };
        if (dList.length) {
          setDrivers(dList.slice(0, 5).map((d: any, i: number) => ({
            pos: Number(d.position ?? i + 1),
            name: `${d.Driver.givenName} ${d.Driver.familyName}`,
            team: d.Constructors[0].name,
            pts: Number(d.points),
            color: teamColor[d.Constructors[0].constructorId] ?? "#E8002D",
          })));
        }
        if (cList.length) {
          setConstructors(cList.slice(0, 5).map((c: any, i: number) => ({
            pos: Number(c.position ?? i + 1),
            name: c.Constructor.name,
            pts: Number(c.points),
            wins: Number(c.wins),
            mark: c.Constructor.name.slice(0, 2).toUpperCase(),
            color: teamColor[c.Constructor.constructorId] ?? "#E8002D",
          })));
        }
      } catch { /* keep fallback */ }
    })();
    return () => ac.abort();
  }, []);
  return { drivers, constructors };
}

/* ---------- Components ---------- */

function F1Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg viewBox="0 0 100 40" className="h-7 w-auto" aria-label="F1">
        <path d="M8 32 L20 8 L46 8 L44 14 L26 14 L22 22 L38 22 L36 28 L20 28 L18 32 Z" fill="#E10600"/>
        <path d="M52 8 L64 8 L58 32 L46 32 Z" fill="#E10600"/>
        <path d="M68 8 L96 8 L94 14 L74 14 L72 20 L88 20 L86 26 L70 26 L68 32 L56 32 Z" fill="#ffffff"/>
      </svg>
    </div>
  );
}

function TeamBadge({ mark, color }: { mark: string; color: string }) {
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 0 12px ${color}55` }}
    >
      {mark}
    </div>
  );
}

function DriverAvatar({ d }: { d: Driver }) {
  const initials = d.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10" style={{ background: `linear-gradient(135deg, ${d.color}44, ${d.color}22)` }}>
      {d.img ? (
        <img src={d.img} alt={d.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="grid h-full w-full place-items-center text-xs font-bold text-white/90">{initials}</div>
      )}
    </div>
  );
}

function CircuitOutline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 90 C 20 60, 40 40, 70 40 L 110 40 C 130 40, 140 55, 130 70 L 100 80 C 85 85, 90 100, 105 100 L 150 100 C 170 100, 180 85, 170 70 L 155 55" />
      <circle cx="170" cy="70" r="2.5" fill="#E10600" stroke="none" />
    </svg>
  );
}

function SilverstoneOutline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 80 C 20 50, 50 30, 80 40 L 120 55 C 140 60, 170 45, 185 60 C 200 75, 190 100, 165 105 L 110 110 C 80 112, 55 105, 40 95 Z" />
      <circle cx="185" cy="60" r="2.5" fill="#E10600" stroke="none" />
    </svg>
  );
}

/* ---------- Nav ---------- */
function TopNav() {
  const links = ["HOME", "STANDINGS", "RACES", "CIRCUITS", "STATS", "NEWS"];
  const [active, setActive] = useState("HOME");
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="container-f1 flex h-16 items-center justify-between gap-4">
        <F1Logo />
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <button key={l} onClick={() => setActive(l)} className="relative text-xs font-bold tracking-widest text-foreground/80 transition hover:text-foreground">
              {l}
              {active === l && <span className="absolute -bottom-2 left-1/2 h-0.5 w-6 -translate-x-1/2 bg-primary" />}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 transition hover:bg-white/5 hover:text-foreground" aria-label="Search"><Search className="h-4 w-4" /></button>
          <button onClick={() => setOpen(v => !v)} className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 transition hover:bg-white/5 hover:text-foreground lg:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <button className="hidden h-9 w-9 place-items-center rounded-full text-foreground/80 transition hover:bg-white/5 hover:text-foreground lg:grid" aria-label="Menu"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/5 bg-background/95 lg:hidden">
          <div className="container-f1 flex flex-col py-3">
            {links.map(l => (
              <button key={l} onClick={() => { setActive(l); setOpen(false); }} className="py-2 text-left text-xs font-bold tracking-widest text-foreground/80 hover:text-foreground">{l}</button>
            ))}
          </div>
        </div>
      )}
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
            {/* Faint F1 watermark */}
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
              <div className="grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded-sm border border-white/10 bg-white text-lg">🇲🇨</div>
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
function DriverStandings({ drivers }: { drivers: Driver[] }) {
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest">DRIVER STANDINGS</h3>
        <Link to="/" className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary hover:brightness-125">VIEW ALL</Link>
      </div>
      <ul className="space-y-3">
        {drivers.map((d) => (
          <li key={d.pos} className="grid grid-cols-[24px_4px_40px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg py-1.5 transition hover:bg-white/[0.02]">
            <div className="text-center text-sm font-bold tabular-nums text-foreground/90">{d.pos}</div>
            <div className="h-8 w-[3px] rounded-full" style={{ background: d.color }} />
            <DriverAvatar d={d} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{d.name}</div>
              <div className="truncate text-xs text-muted-foreground">{d.team}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold tabular-nums">{d.pts}</div>
              <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">PTS</div>
            </div>
          </li>
        ))}
      </ul>
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
      <ul className="space-y-3">
        {constructors.map((c) => (
          <li key={c.pos} className="grid grid-cols-[24px_40px_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg py-1.5 transition hover:bg-white/[0.02]">
            <div className="text-center text-sm font-bold tabular-nums text-foreground/90">{c.pos}</div>
            <TeamBadge mark={c.mark} color={c.color} />
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
            <div className="text-2xl">{r.flag}</div>
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
        <img src={circuitBg.url} alt="Silverstone" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute right-4 top-4 text-foreground/80">
          <SilverstoneOutline className="h-24 w-40" />
        </div>
      </div>
      <div className="px-5 pb-5 md:px-6 md:pb-6">
        <div className="-mt-6 flex items-center gap-3">
          <div className="grid h-8 w-10 place-items-center overflow-hidden rounded-sm border border-white/10 bg-white text-base">🇬🇧</div>
          <div>
            <h4 className="text-lg font-black tracking-tight md:text-xl">SILVERSTONE CIRCUIT</h4>
            <div className="text-xs text-muted-foreground">Silverstone, United Kingdom</div>
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
            {["Home","Standings","Races","Circuits"].map(x => <li key={x}><a href="#" className="hover:text-foreground">{x}</a></li>)}
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">ABOUT</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["News","Teams","Drivers","Regulations"].map(x => <li key={x}><a href="#" className="hover:text-foreground">{x}</a></li>)}
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
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ background: "var(--gradient-hero)" }}>
      <TopNav />
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
      {/* keep unused import active for potential team-color usage */}
      <img src={redbullCar.url} alt="" className="hidden" />
    </div>
  );
}

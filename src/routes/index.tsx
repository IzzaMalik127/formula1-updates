import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Calendar, Clock, Ruler, RefreshCw, Timer, Trophy, ArrowRight, MapPin } from "lucide-react";

import heroCars from "@/assets/hero-ferrari.jpg.asset.json";

import { AppShell } from "@/components/f1/AppShell";
import { F1Logo } from "@/components/f1/F1Logo";
import { Flag } from "@/components/f1/Flag";
import { DriverPortrait } from "@/components/f1/DriverPortrait";
import { ConstructorLogo } from "@/components/f1/ConstructorLogo";

import {
  driversOptions,
  constructorsOptions,
  scheduleOptions,
  lastRaceOptions,
  newsOptions,
  useDrivers,
  useConstructors,
  useSchedule,
  useLastRace,
  useNews,
} from "@/hooks/use-f1";
import {
  circuitByIdOrName,
  pickNextRace,
  pickUpcoming,
  type Driver,
  type Constructor,
  type ScheduleRace,
  type RaceResult,
  type NewsItem,
  type CircuitInfo,
} from "@/lib/f1-data";

export const Route = createFileRoute("/")({
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
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(driversOptions);
    queryClient.prefetchQuery(constructorsOptions);
    queryClient.prefetchQuery(scheduleOptions);
    queryClient.prefetchQuery(lastRaceOptions);
    queryClient.prefetchQuery(newsOptions);
  },
  component: HomePage,
});

/* ---------- Countdown ---------- */
function useCountdown(target?: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = target ? Math.max(0, target.getTime() - now) : 0;
  return {
    days: Math.floor(diff / 86400000),
    hrs: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
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
          <Link
            to="/drivers"
            className="group flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-xs font-bold tracking-widest text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            VIEW STANDINGS <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/calendar"
            className="flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 py-3 text-xs font-bold tracking-widest text-foreground backdrop-blur transition hover:bg-white/10"
          >
            EXPLORE RACES <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Next Race ---------- */
function formatDateLong(d: Date) {
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}
function formatTimeGmt(d: Date) {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} GMT`;
}

function NextRaceCard() {
  const { data: schedule } = useSchedule();
  const next = useMemo(() => (schedule ? pickNextRace(schedule) : undefined), [schedule]);
  const { days, hrs, mins, secs } = useCountdown(next?.startsAt);
  const circuit = next ? circuitByIdOrName(next.circuitId, next.circuitName) : undefined;

  const cells = [
    { v: String(days).padStart(2, "0"), l: "DAYS" },
    { v: String(hrs).padStart(2, "0"), l: "HRS" },
    { v: String(mins).padStart(2, "0"), l: "MINS" },
    { v: String(secs).padStart(2, "0"), l: "SECS", accent: true },
  ];

  return (
    <section className="container-f1 mt-8">
      <div className="glass-card relative overflow-hidden p-5 md:p-7">
        {circuit && (
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-40 md:block">
            <img src={circuit.heroImage} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </div>
        )}
        <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-[0.2em] text-primary">NEXT RACE · ROUND {next?.round ?? "—"}</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-12 shrink-0 overflow-hidden rounded-sm ring-1 ring-white/10">
                <Flag cc={next?.countryCode} className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black tracking-tight md:text-2xl">
                  {(next?.name ?? "Loading…").toUpperCase()}
                </h2>
                <div className="truncate text-xs text-muted-foreground md:text-sm">
                  {next ? `${next.circuitName}, ${next.locality}, ${next.country}` : "\u00A0"}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground md:text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> {next ? formatDateLong(next.startsAt) : "—"}
              </div>
              <div className="hidden h-4 w-px bg-white/10 md:block" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> {next ? formatTimeGmt(next.startsAt) : "—"}
              </div>
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

          {circuit && (
            <div className="hidden md:block">
              <img src={circuit.trackMap} alt={`${circuit.name} track map`} className="h-24 w-40 object-contain opacity-70" />
            </div>
          )}
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
        <Link to="/drivers" className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary hover:brightness-125">
          VIEW ALL <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="space-y-2">
        {drivers.slice(0, 5).map((d) => (
          <li
            key={d.driverId}
            className="grid grid-cols-[22px_3px_44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg py-2 transition hover:bg-white/[0.03]"
          >
            <div className="text-center text-sm font-bold tabular-nums text-foreground/90">{d.pos}</div>
            <div className="h-9 w-[3px] rounded-full" style={{ background: d.color, boxShadow: `0 0 8px ${d.color}88` }} />
            <DriverPortrait d={d} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{d.fullName}</span>
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

function ConstructorStandings({ constructors }: { constructors: Constructor[] }) {
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest">CONSTRUCTOR STANDINGS</h3>
        <Link to="/constructors" className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary hover:brightness-125">
          VIEW ALL <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="space-y-2">
        {constructors.slice(0, 5).map((c) => (
          <li
            key={c.constructorId}
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

/* ---------- Upcoming Races ---------- */
function UpcomingRaces({ schedule }: { schedule: ScheduleRace[] }) {
  const upcoming = pickUpcoming(schedule, 4);
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest">UPCOMING RACES</h3>
        <Link to="/calendar" className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary hover:brightness-125">
          VIEW CALENDAR <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="space-y-4">
        {upcoming.map((r) => {
          const d = r.startsAt;
          const day = String(d.getUTCDate()).padStart(2, "0");
          const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
          return (
            <li key={r.round} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4">
              <div className="rounded-md bg-white/[0.03] py-1.5 text-center">
                <div className="text-lg font-black leading-none text-primary">{day}</div>
                <div className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">{month}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{r.name}</div>
                <div className="truncate text-xs text-muted-foreground">{r.circuitName}, {r.country}</div>
              </div>
              <div className="h-6 w-9 overflow-hidden rounded-sm ring-1 ring-white/10">
                <Flag cc={r.countryCode} className="h-full w-full" />
              </div>
            </li>
          );
        })}
        {upcoming.length === 0 && (
          <li className="text-center text-xs text-muted-foreground py-6">Season complete — see you next year.</li>
        )}
      </ul>
    </div>
  );
}

/* ---------- Featured Circuit ---------- */
function FeaturedCircuit({ circuit }: { circuit: CircuitInfo }) {
  const stats = [
    { icon: Ruler, v: circuit.lengthKm.toFixed(3), unit: "km", l: "TRACK LENGTH" },
    { icon: RefreshCw, v: String(circuit.laps), unit: "", l: "LAPS" },
    { icon: Timer, v: circuit.lapRecord.time, unit: "", l: "LAP RECORD", sub: `${circuit.lapRecord.driver} (${circuit.lapRecord.year})` },
    { icon: Trophy, v: String(circuit.firstGp), unit: "", l: "FIRST GRAND PRIX" },
  ];
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 pb-3 md:p-6 md:pb-3">
        <h3 className="text-sm font-bold tracking-widest">FEATURED CIRCUIT</h3>
      </div>
      <div className="relative h-40 w-full overflow-hidden md:h-44 bg-[radial-gradient(ellipse_at_center,rgba(232,0,45,0.2),transparent_60%),linear-gradient(180deg,#0b0b10_0%,#050507_100%)]">
        <img
          src={circuit.heroImage}
          alt={circuit.name}
          className="absolute inset-0 h-full w-full object-contain p-5 drop-shadow-[0_6px_20px_rgba(232,0,45,0.25)]"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 backdrop-blur">
          <span className="h-3 w-4 overflow-hidden rounded-[2px] ring-1 ring-white/10">
            <Flag cc={circuit.countryCode} className="h-full w-full" />
          </span>
          <span className="text-[10px] font-bold tracking-widest">{circuit.city.toUpperCase()}</span>
        </div>
      </div>
      <div className="px-5 pb-5 md:px-6 md:pb-6">
        <div className="-mt-6 flex items-center gap-3">
          <div className="h-8 w-11 shrink-0 overflow-hidden rounded-sm ring-1 ring-white/10">
            <Flag cc={circuit.countryCode} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-lg font-black tracking-tight md:text-xl">{circuit.name.toUpperCase()}</h4>
            <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {circuit.city}, {circuit.country}
            </div>
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

/* ---------- Last Race Podium ---------- */
function LastRacePodium({ results, raceName }: { results: RaceResult[]; raceName?: string }) {
  const top3 = results.slice(0, 3);
  if (top3.length === 0) return null;
  const heights = ["h-24 md:h-28", "h-32 md:h-36", "h-20 md:h-24"];
  const order = [1, 0, 2]; // display: 2nd, 1st, 3rd
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest">LAST RACE PODIUM</h3>
        <span className="truncate text-xs text-muted-foreground">{raceName}</span>
      </div>
      <div className="grid grid-cols-3 items-end gap-3 md:gap-6">
        {order.map((idx) => {
          const r = top3[idx];
          if (!r) return <div key={idx} />;
          return (
            <div key={r.driverId} className="flex flex-col items-center">
              <DriverPortrait d={{ color: r.teamColor, fullName: r.driverName, headshot: r.headshot }} size={64} />
              <div className="mt-2 text-center">
                <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">P{r.pos}</div>
                <div className="text-sm font-bold">{r.driverName}</div>
                <div className="text-[11px] text-muted-foreground">{r.team}</div>
              </div>
              <div
                className={`mt-2 w-full rounded-t-md ${heights[idx]}`}
                style={{
                  background: `linear-gradient(180deg, ${r.teamColor}88, ${r.teamColor}22)`,
                  boxShadow: `0 -4px 24px ${r.teamColor}55`,
                }}
              >
                <div className="pt-2 text-center text-xl font-black tabular-nums text-foreground">
                  {r.pos === 1 ? "1" : r.pos === 2 ? "2" : "3"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Latest News strip ---------- */
function LatestNews({ items }: { items: NewsItem[] }) {
  const top = items.slice(0, 3);
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest">LATEST NEWS</h3>
        <Link to="/news" className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary hover:brightness-125">
          MORE <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      {top.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">News feed unavailable right now.</div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {top.map((n) => (
            <li key={n.link}>
              <a href={n.link} target="_blank" rel="noreferrer noopener" className="group block overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] transition hover:border-primary/40">
                <div className="relative aspect-[16/9] overflow-hidden bg-white/[0.03]">
                  {n.image ? (
                    <img src={n.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-transparent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent" />
                  <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold tracking-widest backdrop-blur">
                    {n.source.toUpperCase()}
                  </div>
                </div>
                <div className="p-3">
                  <div className="line-clamp-2 text-sm font-semibold group-hover:text-primary">{n.title}</div>
                  {n.publishedAt && (
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(n.publishedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Page ---------- */
function HomePage() {
  const { data: drivers = [] } = useDrivers();
  const { data: constructors = [] } = useConstructors();
  const { data: schedule = [] } = useSchedule();
  const { data: lastRace } = useLastRace();
  const { data: news = [] } = useNews();

  const next = useMemo(() => pickNextRace(schedule), [schedule]);
  const featuredCircuit = useMemo(() => {
    if (!next) return undefined;
    return circuitByIdOrName(next.circuitId, next.circuitName);
  }, [next]);

  return (
    <AppShell>
      <Hero />
      <NextRaceCard />
      <section className="container-f1 mt-8 grid gap-6 lg:grid-cols-2">
        <DriverStandings drivers={drivers} />
        <ConstructorStandings constructors={constructors} />
      </section>
      <section className="container-f1 mt-6 grid gap-6 lg:grid-cols-2">
        <UpcomingRaces schedule={schedule} />
        {featuredCircuit && <FeaturedCircuit circuit={featuredCircuit} />}
      </section>
      {lastRace?.results?.length ? (
        <section className="container-f1 mt-6">
          <LastRacePodium results={lastRace.results} raceName={lastRace.race?.name} />
        </section>
      ) : null}
      <section className="container-f1 mt-6">
        <LatestNews items={news} />
      </section>
    </AppShell>
  );
}

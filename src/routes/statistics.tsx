import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Trophy, Zap, Target, Flag as FlagIcon } from "lucide-react";
import { AppShell } from "@/components/f1/AppShell";
import { DriverPortrait } from "@/components/f1/DriverPortrait";
import { ConstructorLogo } from "@/components/f1/ConstructorLogo";
import { constructorsOptions, driversOptions, scheduleOptions, useConstructors, useDrivers, useSchedule } from "@/hooks/use-f1";
import type { Driver } from "@/lib/f1-data";

export const Route = createFileRoute("/statistics")({
  head: () => ({
    meta: [
      { title: "F1 Statistics — 2026 Season Stats" },
      { name: "description", content: "Formula 1 season statistics: wins, points leaders, team form, and more." },
      { property: "og:title", content: "F1 Statistics — 2026 Season Stats" },
      { property: "og:description", content: "Live 2026 F1 season statistics." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(driversOptions);
    queryClient.prefetchQuery(constructorsOptions);
    queryClient.prefetchQuery(scheduleOptions);
  },
  component: StatisticsPage,
});

function StatisticsPage() {
  const { data: drivers = [] } = useDrivers();
  const { data: constructors = [] } = useConstructors();
  const { data: schedule = [] } = useSchedule();

  const now = Date.now();
  const rounds = schedule.length;
  const completed = schedule.filter((r) => r.startsAt.getTime() < now).length;

  const topDriverByPts = drivers[0];
  const topDriverByWins = useMemo(() => [...drivers].sort((a, b) => b.wins - a.wins)[0], [drivers]);
  const topConstructor = constructors[0];
  const totalPoints = drivers.reduce((s, d) => s + d.pts, 0);

  const seasonPct = rounds ? Math.round((completed / rounds) * 100) : 0;
  const totalWins = drivers.reduce((s, d) => s + d.wins, 0);
  const gapToSecond = drivers[1] ? (drivers[0]?.pts ?? 0) - drivers[1].pts : 0;
  const teamGap = constructors[1] ? (constructors[0]?.pts ?? 0) - constructors[1].pts : 0;

  return (
    <AppShell>
      <section className="container-f1 pt-10">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] text-primary">SEASON STATS</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">2026 STATISTICS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Round {completed} of {rounds} complete</p>
          <div className="mt-4 max-w-md">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-muted-foreground">
              <span>SEASON PROGRESS</span>
              <span className="tabular-nums text-foreground">{seasonPct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700"
                style={{ width: `${seasonPct}%`, boxShadow: "0 0 14px var(--f1-red-glow)" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {topDriverByPts && (
            <HeroDriverCard
              badge="POINTS LEADER"
              icon={Trophy}
              driver={topDriverByPts}
              metric={`${topDriverByPts.pts}`}
              metricLabel="POINTS"
              foot={gapToSecond > 0 ? `+${gapToSecond} pts ahead of ${drivers[1]?.fullName}` : "Championship lead"}
              pct={100}
            />
          )}
          {topDriverByWins && (
            <HeroDriverCard
              badge="MOST WINS"
              icon={Zap}
              driver={topDriverByWins}
              metric={`${topDriverByWins.wins}`}
              metricLabel="WINS"
              foot={`${totalWins ? Math.round((topDriverByWins.wins / totalWins) * 100) : 0}% of all race wins this season`}
              pct={totalWins ? (topDriverByWins.wins / totalWins) * 100 : 0}
            />
          )}
          {topConstructor && (
            <div
              className="glass-card relative overflow-hidden p-5"
              style={{ background: `linear-gradient(135deg, ${topConstructor.color}1f, transparent 60%)` }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: topConstructor.color, boxShadow: `0 0 20px ${topConstructor.color}88` }} />
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">LEADING TEAM</div>
                <FlagIcon className="h-5 w-5 text-primary/60" />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <ConstructorLogo c={topConstructor} size={64} />
                <div className="min-w-0">
                  <div className="truncate text-lg font-black leading-tight">{topConstructor.name}</div>
                  <div className="text-xs text-muted-foreground">{topConstructor.wins} wins</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-3xl font-black tabular-nums leading-none" style={{ color: topConstructor.color }}>{topConstructor.pts}</div>
                  <div className="text-[10px] font-bold tracking-widest text-muted-foreground">POINTS</div>
                </div>
              </div>
              {topConstructor.car && (
                <img src={topConstructor.car} alt={`${topConstructor.name} car`} className="mt-3 h-16 w-full object-contain" loading="lazy" />
              )}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full" style={{ width: "100%", background: topConstructor.color, boxShadow: `0 0 10px ${topConstructor.color}88` }} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {teamGap > 0 ? `+${teamGap} pts clear of ${constructors[1]?.name}` : "Constructors' lead"}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <MiniStat icon={Target} label="POINTS SCORED" value={String(totalPoints)} sub="across the grid" />
          <MiniStat icon={Trophy} label="RACES DONE" value={`${completed}/${rounds}`} sub={`${rounds - completed} remaining`} />
          <MiniStat icon={Zap} label="RACE WINNERS" value={String(drivers.filter((d) => d.wins > 0).length)} sub="different drivers" />
        </div>


        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-5 md:p-6">
            <h3 className="text-sm font-bold tracking-widest">TOP 10 DRIVERS BY POINTS</h3>
            <ul className="mt-4 space-y-2">
              {drivers.slice(0, 10).map((d) => {
                const pct = topDriverByPts ? (d.pts / Math.max(1, topDriverByPts.pts)) * 100 : 0;
                return (
                  <li key={d.driverId} className="grid grid-cols-[24px_36px_minmax(0,1fr)_60px] items-center gap-3">
                    <div className="text-xs font-bold tabular-nums text-foreground/80">{d.pos}</div>
                    <DriverPortrait d={d} size={32} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold">{d.fullName}</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color, boxShadow: `0 0 8px ${d.color}88` }} />
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold tabular-nums">{d.pts}</div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="glass-card p-5 md:p-6">
            <h3 className="text-sm font-bold tracking-widest">CONSTRUCTORS' POINTS SHARE</h3>
            <ul className="mt-4 space-y-2">
              {constructors.map((c) => {
                const pct = topConstructor ? (c.pts / Math.max(1, topConstructor.pts)) * 100 : 0;
                return (
                  <li key={c.constructorId} className="grid grid-cols-[24px_36px_minmax(0,1fr)_60px] items-center gap-3">
                    <div className="text-xs font-bold tabular-nums text-foreground/80">{c.pos}</div>
                    <ConstructorLogo c={c} size={32} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold">{c.name}</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color, boxShadow: `0 0 8px ${c.color}88` }} />
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold tabular-nums">{c.pts}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function HeroDriverCard({
  badge,
  icon: Icon,
  driver,
  metric,
  metricLabel,
  foot,
  pct,
}: {
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  driver: Driver;
  metric: string;
  metricLabel: string;
  foot: string;
  pct: number;
}) {
  return (
    <div
      className="glass-card relative overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5"
      style={{ background: `linear-gradient(135deg, ${driver.color}1f, transparent 60%)` }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: driver.color, boxShadow: `0 0 20px ${driver.color}88` }} />
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground">{badge}</div>
        <Icon className="h-5 w-5 text-primary/60" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <DriverPortrait d={driver} size={64} />
        <div className="min-w-0">
          <div className="truncate text-lg font-black leading-tight">{driver.fullName}</div>
          <div className="truncate text-xs text-muted-foreground">{driver.team}</div>
          {driver.countryCode && (
            <img
              src={`https://flagcdn.com/w40/${driver.countryCode.toLowerCase()}.png`}
              alt={driver.nationality}
              className="mt-1 h-3 w-5 rounded-[2px] object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-black tabular-nums leading-none" style={{ color: driver.color }}>{metric}</div>
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground">{metricLabel}</div>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${Math.max(6, Math.min(100, pct))}%`, background: driver.color, boxShadow: `0 0 10px ${driver.color}88` }}
        />
      </div>
      <div className="mt-2 truncate text-xs text-muted-foreground">{foot}</div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card flex items-center justify-between p-4">
      <div>
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-black tabular-nums leading-none">{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </div>
      <Icon className="h-5 w-5 text-primary/60" />
    </div>
  );
}


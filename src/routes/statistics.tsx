import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Trophy, Zap, Target, Flag as FlagIcon } from "lucide-react";
import { AppShell } from "@/components/f1/AppShell";
import { DriverPortrait } from "@/components/f1/DriverPortrait";
import { ConstructorLogo } from "@/components/f1/ConstructorLogo";
import { constructorsOptions, driversOptions, scheduleOptions, useConstructors, useDrivers, useSchedule } from "@/hooks/use-f1";

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

  return (
    <AppShell>
      <section className="container-f1 pt-10">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] text-primary">SEASON STATS</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">2026 STATISTICS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Round {completed} of {rounds} complete</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Trophy} label="POINTS LEADER" value={topDriverByPts?.fullName ?? "—"} sub={`${topDriverByPts?.pts ?? 0} pts`} color={topDriverByPts?.color} />
          <StatCard icon={Zap} label="MOST WINS" value={topDriverByWins?.fullName ?? "—"} sub={`${topDriverByWins?.wins ?? 0} wins`} color={topDriverByWins?.color} />
          <StatCard icon={FlagIcon} label="LEADING TEAM" value={topConstructor?.name ?? "—"} sub={`${topConstructor?.pts ?? 0} pts`} color={topConstructor?.color} />
          <StatCard icon={Target} label="POINTS SCORED" value={String(totalPoints)} sub="across the grid" />
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

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="glass-card relative overflow-hidden p-5">
      {color && <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: color, boxShadow: `0 0 20px ${color}88` }} />}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 text-lg font-black leading-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <Icon className="h-6 w-6 text-primary/60" />
      </div>
    </div>
  );
}

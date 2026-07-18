import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/f1/AppShell";
import { Flag } from "@/components/f1/Flag";
import { DriverPortrait } from "@/components/f1/DriverPortrait";
import { ConstructorLogo } from "@/components/f1/ConstructorLogo";
import { driversOptions, constructorsOptions, useDrivers, useConstructors } from "@/hooks/use-f1";

export const Route = createFileRoute("/drivers")({
  head: () => ({
    meta: [
      { title: "F1 Drivers — Full 2026 Grid" },
      { name: "description", content: "Every driver in the 2026 Formula 1 grid with points, wins, teams, and nationalities." },
      { property: "og:title", content: "F1 Drivers — Full 2026 Grid" },
      { property: "og:description", content: "Full driver standings with real headshots and team info." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(driversOptions);
    queryClient.prefetchQuery(constructorsOptions);
  },
  component: DriversPage,
});

function DriversPage() {
  const { data: drivers = [], isLoading } = useDrivers();
  const { data: constructors = [] } = useConstructors();
  const [teamFilter, setTeamFilter] = useState<string>("ALL");

  const teams = useMemo(() => {
    const s = new Set(drivers.map((d) => d.team));
    return ["ALL", ...Array.from(s)];
  }, [drivers]);

  const filtered = teamFilter === "ALL" ? drivers : drivers.filter((d) => d.team === teamFilter);

  return (
    <AppShell>
      <section className="container-f1 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] text-primary">2026 SEASON</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">DRIVER STANDINGS</h1>
            <p className="mt-1 text-sm text-muted-foreground">Live from Jolpica F1 API · {drivers.length} drivers</p>
          </div>
          <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto">
            {teams.map((t) => (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-widest transition ${
                  teamFilter === t
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/[0.03] text-foreground/70 hover:text-foreground"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="mt-8 text-center text-sm text-muted-foreground">Loading drivers…</div>}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => {
            const ctor = constructors.find((c) => c.name === d.team);
            return (
              <li key={d.driverId} className="glass-card relative overflow-hidden p-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: d.color, boxShadow: `0 0 20px ${d.color}88` }} />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-muted-foreground">POSITION</div>
                    <div className="text-4xl font-black tabular-nums leading-none">{d.pos}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold tracking-widest text-muted-foreground">CAR</div>
                    <div className="text-3xl font-black tabular-nums" style={{ color: d.color }}>{d.number ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <DriverPortrait d={d} size={64} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-base font-black">{d.fullName}</span>
                      {d.countryCode && (
                        <span className="h-3 w-4 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-white/10">
                          <Flag cc={d.countryCode} className="h-full w-full" />
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{d.nationality}</div>
                    <div className="mt-1 flex items-center gap-2">
                      {ctor && <ConstructorLogo c={ctor} size={22} />}
                      <span className="truncate text-xs font-semibold" style={{ color: d.color }}>{d.team}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-center">
                    <div className="text-lg font-black tabular-nums">{d.pts}</div>
                    <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">POINTS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black tabular-nums">{d.wins}</div>
                    <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">WINS</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/f1/AppShell";
import { Flag } from "@/components/f1/Flag";
import { ConstructorLogo } from "@/components/f1/ConstructorLogo";
import { DriverPortrait } from "@/components/f1/DriverPortrait";
import { constructorsOptions, driversOptions, useConstructors, useDrivers } from "@/hooks/use-f1";

export const Route = createFileRoute("/constructors")({
  head: () => ({
    meta: [
      { title: "F1 Constructors — 2026 Team Standings" },
      { name: "description", content: "Full 2026 constructor standings with official team logos, drivers and points." },
      { property: "og:title", content: "F1 Constructors — 2026 Team Standings" },
      { property: "og:description", content: "Official F1 team logos, points, wins and driver lineups." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(constructorsOptions);
    queryClient.prefetchQuery(driversOptions);
  },
  component: ConstructorsPage,
});

function ConstructorsPage() {
  const { data: constructors = [], isLoading } = useConstructors();
  const { data: drivers = [] } = useDrivers();

  return (
    <AppShell>
      <section className="container-f1 pt-10">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] text-primary">2026 SEASON</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">CONSTRUCTOR STANDINGS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live from Jolpica F1 API · {constructors.length} teams</p>
        </div>

        {isLoading && <div className="mt-8 text-center text-sm text-muted-foreground">Loading teams…</div>}

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {constructors.map((c) => {
            const teamDrivers = drivers.filter((d) => d.team === c.name);
            return (
              <li key={c.constructorId} className="glass-card relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: c.color, boxShadow: `0 0 20px ${c.color}88` }} />
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5">
                  <div className="text-4xl font-black tabular-nums" style={{ color: c.color }}>{c.pos}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <ConstructorLogo c={c} size={52} />
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-black">{c.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {c.countryCode && (
                            <span className="h-3 w-4 overflow-hidden rounded-[2px] ring-1 ring-white/10">
                              <Flag cc={c.countryCode} className="h-full w-full" />
                            </span>
                          )}
                          {c.nationality}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black tabular-nums">{c.pts}</div>
                    <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">POINTS</div>
                    <div className="mt-2 text-sm font-bold tabular-nums">{c.wins} <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">WINS</span></div>
                  </div>
                </div>

                {c.car && (
                  <div className="relative h-32 overflow-hidden bg-gradient-to-b from-transparent to-black/40">
                    <img src={c.car} alt={`${c.name} car`} className="absolute inset-0 h-full w-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}

                {teamDrivers.length > 0 && (
                  <div className="border-t border-white/5 px-5 py-3">
                    <div className="mb-2 text-[10px] font-bold tracking-widest text-muted-foreground">DRIVERS</div>
                    <ul className="flex flex-wrap gap-3">
                      {teamDrivers.map((d) => (
                        <li key={d.driverId} className="flex items-center gap-2">
                          <DriverPortrait d={d} size={32} />
                          <div>
                            <div className="text-xs font-bold leading-tight">{d.fullName}</div>
                            <div className="text-[10px] tabular-nums text-muted-foreground">#{d.number ?? "—"} · {d.pts} pts</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}

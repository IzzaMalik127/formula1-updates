import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ruler, RefreshCw, Timer, Trophy, MapPin, X } from "lucide-react";
import { AppShell } from "@/components/f1/AppShell";
import { Flag } from "@/components/f1/Flag";
import { scheduleOptions, useSchedule } from "@/hooks/use-f1";
import { CIRCUITS, circuitByIdOrName, type CircuitInfo } from "@/lib/f1-data";

export const Route = createFileRoute("/circuits")({
  head: () => ({
    meta: [
      { title: "F1 Circuits — 2026 Season Tracks" },
      { name: "description", content: "Every 2026 Formula 1 circuit with track maps, lap records, and key stats." },
      { property: "og:title", content: "F1 Circuits — 2026 Season Tracks" },
      { property: "og:description", content: "Explore every circuit on the 2026 calendar." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(scheduleOptions);
  },
  component: CircuitsPage,
});

function CircuitsPage() {
  const { data: schedule = [] } = useSchedule();
  const [selected, setSelected] = useState<CircuitInfo | null>(null);

  const seasonCircuits = useMemo(() => {
    const list: CircuitInfo[] = [];
    const seen = new Set<string>();
    for (const r of schedule) {
      const c = circuitByIdOrName(r.circuitId, r.circuitName);
      if (c && !seen.has(c.id)) {
        seen.add(c.id);
        list.push(c);
      }
    }
    // add any remaining metadata-known circuits as backup
    if (list.length === 0) list.push(...Object.values(CIRCUITS));
    return list;
  }, [schedule]);

  return (
    <AppShell>
      <section className="container-f1 pt-10">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] text-primary">2026 SEASON</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">CIRCUITS</h1>
          <p className="mt-1 text-sm text-muted-foreground">{seasonCircuits.length} tracks across the calendar</p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seasonCircuits.map((c) => (
            <li key={c.id}>
              <button onClick={() => setSelected(c)} className="glass-card group relative w-full overflow-hidden text-left transition hover:border-primary/40">
                <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(232,0,45,0.18),transparent_60%),linear-gradient(180deg,#0b0b10_0%,#050507_100%)]">
                  <img
                    src={c.heroImage}
                    alt={c.name}
                    className="absolute inset-0 h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105 drop-shadow-[0_6px_20px_rgba(232,0,45,0.25)]"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                  <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 backdrop-blur">
                    <span className="h-3 w-4 overflow-hidden rounded-[2px] ring-1 ring-white/10">
                      <Flag cc={c.countryCode} className="h-full w-full" />
                    </span>
                    <span className="text-[10px] font-bold tracking-widest">{c.country.toUpperCase()}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate text-base font-black tracking-tight">{c.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.city}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <Stat icon={Ruler} v={`${c.lengthKm}km`} l="LENGTH" />
                    <Stat icon={RefreshCw} v={String(c.laps)} l="LAPS" />
                    <Stat icon={Trophy} v={String(c.firstGp)} l="FIRST" />
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selected && <CircuitDetail circuit={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

function Stat({ icon: Icon, v, l }: { icon: React.ComponentType<{ className?: string }>; v: string; l: string }) {
  return (
    <div className="rounded-md bg-white/[0.03] py-2">
      <Icon className="mx-auto h-3 w-3 text-muted-foreground" />
      <div className="mt-1 text-xs font-black tabular-nums">{v}</div>
      <div className="text-[9px] font-semibold tracking-widest text-muted-foreground">{l}</div>
    </div>
  );
}

function CircuitDetail({ circuit, onClose }: { circuit: CircuitInfo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur" onClick={onClose}>
      <div className="glass-card relative w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/50 backdrop-blur hover:border-primary/50" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <div className="relative aspect-[16/9]">
          <img src={circuit.heroImage} alt={circuit.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <img src={circuit.trackMap} alt="" className="pointer-events-none absolute bottom-3 left-3 h-24 w-auto object-contain opacity-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]" />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-11 overflow-hidden rounded-sm ring-1 ring-white/10">
              <Flag cc={circuit.countryCode} className="h-full w-full" />
            </div>
            <div>
              <h3 className="text-xl font-black">{circuit.name}</h3>
              <div className="text-xs text-muted-foreground">{circuit.city}, {circuit.country}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailStat icon={Ruler} v={`${circuit.lengthKm}`} unit="km" l="TRACK LENGTH" />
            <DetailStat icon={RefreshCw} v={String(circuit.laps)} l="LAPS" />
            <DetailStat icon={Timer} v={circuit.lapRecord.time} l="LAP RECORD" sub={`${circuit.lapRecord.driver} (${circuit.lapRecord.year})`} />
            <DetailStat icon={Trophy} v={String(circuit.firstGp)} l="FIRST GP" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ icon: Icon, v, unit, l, sub }: { icon: React.ComponentType<{ className?: string }>; v: string; unit?: string; l: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <div className="mt-2 text-lg font-black tabular-nums">
        {v}{unit && <span className="ml-0.5 text-[10px] font-semibold text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">{l}</div>
      {sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

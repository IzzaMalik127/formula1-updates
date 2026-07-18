import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/f1/AppShell";
import { Flag } from "@/components/f1/Flag";
import { scheduleOptions, useSchedule } from "@/hooks/use-f1";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "F1 Calendar — 2026 Race Schedule" },
      { name: "description", content: "Every 2026 Formula 1 Grand Prix with dates, times, circuits and countries." },
      { property: "og:title", content: "F1 Calendar — 2026 Race Schedule" },
      { property: "og:description", content: "The full 2026 F1 race calendar." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(scheduleOptions);
  },
  component: CalendarPage,
});

function CalendarPage() {
  const { data: schedule = [], isLoading } = useSchedule();
  const now = Date.now();

  return (
    <AppShell>
      <section className="container-f1 pt-10">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] text-primary">SEASON CALENDAR</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">2026 RACE SCHEDULE</h1>
          <p className="mt-1 text-sm text-muted-foreground">{schedule.length} rounds · Live from Jolpica F1 API</p>
        </div>

        {isLoading && <div className="mt-8 text-center text-sm text-muted-foreground">Loading calendar…</div>}

        <ol className="mt-8 space-y-3">
          {schedule.map((r) => {
            const past = r.startsAt.getTime() < now;
            const day = String(r.startsAt.getUTCDate()).padStart(2, "0");
            const month = r.startsAt.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
            return (
              <li key={r.round} className={`glass-card grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 p-4 md:grid-cols-[64px_minmax(0,1fr)_auto_auto] ${past ? "opacity-70" : ""}`}>
                <div className="rounded-md bg-white/[0.03] py-2 text-center">
                  <div className="text-xl font-black leading-none text-primary">{day}</div>
                  <div className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">{month}</div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground">R{String(r.round).padStart(2, "0")}</span>
                    <span className="truncate text-base font-black tracking-tight">{r.name}</span>
                    {past && <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-label="Completed" />}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{r.circuitName} · {r.locality}, {r.country}</div>
                </div>
                <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
                  <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {r.startsAt.toLocaleDateString(undefined, { day: "2-digit", month: "short", timeZone: "UTC" })}</div>
                  {r.time && <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {String(r.startsAt.getUTCHours()).padStart(2, "0")}:{String(r.startsAt.getUTCMinutes()).padStart(2, "0")} GMT</div>}
                </div>
                <div className="h-6 w-9 overflow-hidden rounded-sm ring-1 ring-white/10">
                  <Flag cc={r.countryCode} className="h-full w-full" />
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/f1/AppShell";
import { newsOptions, useNews } from "@/hooks/use-f1";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "F1 News — Latest Formula 1 Headlines" },
      { name: "description", content: "The latest Formula 1 news, headlines and analysis." },
      { property: "og:title", content: "F1 News — Latest Formula 1 Headlines" },
      { property: "og:description", content: "Fresh F1 news updated every 5 minutes." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(newsOptions);
  },
  component: NewsPage,
});

function NewsPage() {
  const { data: items = [], isLoading } = useNews();

  return (
    <AppShell>
      <section className="container-f1 pt-10">
        <div>
          <div className="text-[11px] font-bold tracking-[0.2em] text-primary">FROM THE PADDOCK</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">LATEST F1 NEWS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Headlines via public F1 news feed</p>
        </div>

        {isLoading && <div className="mt-8 text-center text-sm text-muted-foreground">Loading news…</div>}
        {!isLoading && items.length === 0 && (
          <div className="mt-8 glass-card p-6 text-center text-sm text-muted-foreground">
            The news feed is temporarily unavailable. Please try again in a few minutes.
          </div>
        )}

        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => (
            <li key={n.link}>
              <a href={n.link} target="_blank" rel="noreferrer noopener" className="glass-card group block overflow-hidden transition hover:border-primary/40">
                <div className="relative aspect-[16/9] overflow-hidden bg-white/[0.03]">
                  {n.image ? (
                    <img src={n.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-transparent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent" />
                  <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold tracking-widest backdrop-blur">
                    {n.source.toUpperCase()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-bold group-hover:text-primary">{n.title}</h3>
                  {n.summary && <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{n.summary}</p>}
                  {n.publishedAt && (
                    <div className="mt-3 text-[10px] font-semibold tracking-widest text-muted-foreground">
                      {new Date(n.publishedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

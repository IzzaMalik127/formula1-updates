import { createFileRoute } from "@tanstack/react-router";

// Public F1 news feed. Pulls from Autosport's public RSS and returns JSON.
// Cached for 5 minutes.
const FEED = "https://www.autosport.com/rss/feed/f1";

type Item = {
  title: string;
  link: string;
  source: string;
  publishedAt?: string;
  image?: string;
  summary?: string;
};

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function firstMatch(src: string, re: RegExp): string | undefined {
  const m = src.match(re);
  return m ? decode(m[1]) : undefined;
}

function parseRss(xml: string): Item[] {
  const items: Item[] = [];
  const itemRe = /<item[\s\S]*?<\/item>/g;
  const chunks = xml.match(itemRe) ?? [];
  for (const chunk of chunks) {
    const title = firstMatch(chunk, /<title>([\s\S]*?)<\/title>/);
    const link = firstMatch(chunk, /<link>([\s\S]*?)<\/link>/);
    if (!title || !link) continue;
    const publishedAt = firstMatch(chunk, /<pubDate>([\s\S]*?)<\/pubDate>/);
    const description = firstMatch(chunk, /<description>([\s\S]*?)<\/description>/);
    const enclosure = firstMatch(chunk, /<enclosure[^>]*url="([^"]+)"/);
    const media = firstMatch(chunk, /<media:(?:content|thumbnail)[^>]*url="([^"]+)"/);
    const imgTag = description ? firstMatch(description, /<img[^>]*src="([^"]+)"/) : undefined;
    const summary = description ? decode(description.replace(/<[^>]+>/g, "")).slice(0, 200) : undefined;
    items.push({
      title,
      link,
      source: "Autosport",
      publishedAt,
      image: enclosure ?? media ?? imgTag,
      summary,
    });
    if (items.length >= 12) break;
  }
  return items;
}

export const Route = createFileRoute("/api/public/news")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await fetch(FEED, {
            headers: { "User-Agent": "F1LiveHub/1.0 (+https://lovable.dev)" },
          });
          if (!res.ok) {
            return Response.json({ items: [], error: `feed-${res.status}` }, { status: 200 });
          }
          const xml = await res.text();
          const items = parseRss(xml);
          return new Response(JSON.stringify({ items }), {
            status: 200,
            headers: {
              "content-type": "application/json",
              "cache-control": "public, max-age=300, stale-while-revalidate=600",
            },
          });
        } catch (e) {
          return Response.json({ items: [], error: (e as Error).message }, { status: 200 });
        }
      },
    },
  },
});

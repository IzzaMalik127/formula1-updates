
## What I'll build

### 1. Shared data layer — `src/lib/f1-data.ts`
Single source of truth for everything downstream.
- **Metadata tables** (drivers, teams, circuits) with official Formula 1 CDN URLs for headshots, team logos, team car renders, and circuit hero photos + track-map SVGs. Includes country codes, team colors, driver numbers, track length, lap count, lap record, first GP year.
- **Live fetchers** (Jolpica / Ergast, free, no key):
  - `fetchDriverStandings()` — full 20+ driver grid
  - `fetchConstructorStandings()` — all 10 teams
  - `fetchSchedule()` — full 2026 calendar with dates, times, circuits, countries
  - `fetchNextRace()` — computes the next upcoming round from schedule
  - `fetchLastRaceResults()` — most recent race podium + top 10
- **News fetcher** — public F1 news RSS (Autosport / Motorsport.com) via a small `/api/public/news` server route that proxies + parses the RSS on the server (avoids browser CORS).
- All hooks return `{ data, loading, error }` and fall back to curated static data so nothing ever renders empty.

### 2. Shared layout — extract from index.tsx
Move `TopNav`, `Footer`, `F1Logo`, `Flag` into `src/components/f1/*` so every page shares them. Convert the current `setActive` state nav into real `<Link>` routes.

### 3. Homepage — fill every section with real data
- **Hero** — unchanged, keep the night race photo
- **Next Race card** — pulled live from schedule; real countdown to real race start time; real circuit name, flag, date, local + GMT time
- **Driver Standings** — top 5 live from API with official headshots (already there, verified against current 2026 data)
- **Constructor Standings** — top 5 live with official team logos
- **Upcoming Races** — next 4 races from live schedule with real circuit names and flags
- **Featured Circuit** — the next-race circuit, real photo, real stats (length, laps, lap record, first GP)
- **NEW: Latest News strip** — 3 headlines from the RSS feed with thumbnails
- **NEW: Last Race Podium** — top 3 from the most recent completed round with driver photos + gaps

### 4. New route pages
Each gets its own `head()` with unique title + description, plus loader-primed TanStack Query.

- **`/drivers`** — full grid of 20+ drivers as cards: HD portrait, name, number, team logo, flag, points, wins, podiums, position change. Filter by team.
- **`/constructors`** — 10 team cards with official logo + real car render, points, wins, drivers list, team color bar.
- **`/circuits`** — grid of all season circuits with real hero photos, country flag, key stats. Click → detail modal with track map SVG.
- **`/calendar`** — chronological race list for the season with status (past/live/upcoming), date, time, circuit, winner if completed.
- **`/news`** — RSS-driven news feed with thumbnails and source attribution.
- **`/statistics`** — quick season stats: most wins, most poles, most podiums, DNFs, fastest laps, computed from `/current/results` endpoint.

### 5. Data source notes (technical)
- Jolpica (Ergast mirror): `api.jolpi.ca/ergast/f1/current/*` — standings, schedule, results, qualifying
- Images: `media.formula1.com/content/dam/fom-website/...` for headshots, team logos, car renders, circuit heroes
- Flags: `flagcdn.com` (already in use)
- News: single server route at `/api/public/news` that fetches an F1 RSS feed and returns JSON — keeps API key out of the client and avoids CORS
- All fetch layers have a 5-minute in-memory cache via TanStack Query

### 6. Not in scope
- Auth, favorites, comments, live timing (would need paid F1 API)
- Search functionality inside the nav (icon stays as visual)

Once you confirm, I'll ship it in one pass and the current premium black/red look, glassmorphism, and animations stay exactly the same — I'm only filling sections and adding pages, not restyling.

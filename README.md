# rohansingh04.com

Personal portfolio and live-data playground. Built with Next.js 16, Tailwind 4,
and React Three Fiber; hosted on Vercel.

## dev

```bash
pnpm dev
```

open [http://localhost:3000](http://localhost:3000).

## stack

- **next.js 16** -- app router, typescript
- **tailwind 4** -- css-first config, css variables for theming
- **fraunces** (serif headings) + **geist** (body) + **jetbrains mono** (code/data)
- **react-three-fiber** + **drei** -- 3d globe on /globe
- **next-mdx-remote** -- project writeups in /content/projects
- **vercel kv** (upstash redis) -- health data from ios shortcut
- **vercel analytics** -- free tier, enabled in dashboard

## structure

```
app/           next.js app router pages + api routes
components/    react components
  layout/      header, footer, theme toggle
  fitness/     fitness previews and dashboard components
  widgets/     small live data widgets (spotify and github)
  globe/        r3f globe components
  states/      us states svg map
  projects/    project grid + cards
  primitives/  shared ui primitives (modal, skeleton)
content/       all structured data (json + mdx)
lib/           shared utilities
public/        static assets + textures
docs/          deployment + setup guides
scripts/       local data publishing utilities
```

## content

all structured data lives in `/content`. edit json files directly.

- `site-config.json` -- current role, location, focus (single source of truth)
- `places.json` -- globe pins (lat/lng, visit date, notes)
- `states.json` -- all 50 states + DC with visited status
- `history.json` -- work, school, milestones for /history and /resume
- `projects/*/meta.json` -- project metadata, `featured: true` surfaces on landing
- `running-dashboard.json` -- deploy-safe fallback for `/fitness`
- `public/rohan-singh-resume.pdf` -- downloadable recruiter-facing résumé

## fitness page

the `/fitness` page is fed by the sibling `marathonPrepBot` repo. preview a
fresh privacy-safe snapshot locally with:

```bash
pnpm sync:running
```

publish it to the live site immediately with:

```bash
pnpm publish:running
```

by default the script reads `../marathonPrepBot`. set `MARATHON_REPO` to an
absolute repo path if the folders live somewhere else. the generated snapshot
uses an explicit field whitelist and excludes gps coordinates, source filenames,
private notes, and workout descriptions. `publish:running` sends the same checked
snapshot to an authenticated ingest endpoint backed by vercel kv. the committed
snapshot remains a deploy-safe fallback. the marathon repo runs this publisher
automatically after each successful `npm run import`, and both the homepage and
`/fitness` render at request time so a fresh ingest does not require another site
deployment. strava is an optional secondary source, not a freshness dependency.

## theme

light mode default. dark mode toggled by the button in the header, persisted to
localstorage. system preference used on first visit. a blocking script in
`app/layout.tsx` applies the correct class before first paint (no flash).

css variables for all colors defined in `app/globals.css`. accent is sage green
(#4f7c5a light / #6baa7a dark).

## env vars

see `docs/deploy.md` for the full list. for local dev, copy `.env.example` to
`.env.local` and fill in the values you need (most are optional in dev).

## notes

- Project, experience, and current-focus content lives in versioned JSON/MDX.
- Fitness data is ingested privately and exposed only through a strict,
  privacy-safe dashboard schema.
- The older Apple Health ingest remains available as a secondary source; see
  `docs/ios-shortcut.md`.
- `@vercel/kv` is deprecated upstream (moved to upstash redis). the api
  is identical; just add the upstash integration in the vercel dashboard
  and it will work with the same env vars

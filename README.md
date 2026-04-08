# rohansingh04.com

personal site. next.js 16, tailwind 4, react-three-fiber. hosted on vercel.

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
  widgets/     live data widgets (health, spotify, github)
  globe/        r3f globe components
  states/      us states svg map
  projects/    project grid + cards
  primitives/  shared ui primitives (modal, skeleton)
content/       all structured data (json + mdx)
lib/           shared utilities
public/        static assets + textures
docs/          deployment + setup guides
```

## content

all structured data lives in `/content`. edit json files directly.

- `site-config.json` -- current role, location, focus (single source of truth)
- `places.json` -- globe pins (lat/lng, visit date, notes)
- `states.json` -- all 50 states + DC with visited status
- `history.json` -- work, school, milestones for /history and /resume
- `projects/*/meta.json` -- project metadata, `featured: true` surfaces on landing

## theme

light mode default. dark mode toggled by the button in the header, persisted to
localstorage. system preference used on first visit. a blocking script in
`app/layout.tsx` applies the correct class before first paint (no flash).

css variables for all colors defined in `app/globals.css`. accent is sage green
(#4f7c5a light / #6baa7a dark).

## env vars

see `docs/deploy.md` for the full list. for local dev, copy `.env.example` to
`.env.local` and fill in the values you need (most are optional in dev).

## phases

- **phase 0** (done) -- scaffold, empty pages, header, footer, theme
- **phase 1** -- content json seed, widget card, types, geo helpers
- **phase 2** -- health dashboard on landing (mock data)
- **phase 3** -- projects, history, resume, now, states
- **phase 4** -- 3d globe, travel list
- **phase 5** -- live apis (spotify, github, health ingest), guestbook

## notes

- no db, no cms, no auth except github oauth on /guestbook (phase 5)
- the health dashboard on the landing page is fed by an ios shortcut
  that posts to /api/health/ingest daily -- see docs/ios-shortcut.md
- `@vercel/kv` is deprecated upstream (moved to upstash redis). the api
  is identical; just add the upstash integration in the vercel dashboard
  and it will work with the same env vars

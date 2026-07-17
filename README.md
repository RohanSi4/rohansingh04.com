# rohansingh04.com

My personal site and the home for the projects I want people to actually see.

**Live site:** [rohansingh04.com](https://rohansingh04.com)

![Homepage preview](public/og.png)

## What is here

- Project case studies with consistent proof, role, outcome, demo, and code links
- A live fitness dashboard fed by my Apple Watch and HealthFit pipeline
- A travel globe and state map built from structured trip data
- My work history, web résumé, and downloadable PDF résumé
- Small live pieces such as Spotify listening data and current training context

The site is personal on purpose. It is still a portfolio, but it also gives me a
place to build things around running, travel, music, and whatever else I am into.

## How it works

Most of the site is versioned content rendered through the Next.js App Router.
Project writeups live in MDX, while work history, travel, and site details live in
JSON. The pieces that need to stay fresh, such as fitness and Spotify data, use
server-side routes and privacy-safe schemas.

~~~text
Versioned JSON + MDX ─┐
                      ├── Next.js App Router ── Vercel
HealthFit pipeline ───┤
Spotify API ──────────┘
~~~

## Stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS 4 with a small shared design system
- React Three Fiber and Drei for the interactive globe
- MDX for long-form project case studies
- Vercel data storage for live dashboard snapshots
- Vitest, Playwright, and Axe for unit, browser, and accessibility checks

## Run it locally

Requirements: Node.js 20+ and pnpm.

~~~bash
pnpm install
cp .env.example .env.local
pnpm dev
~~~

Open [localhost:3000](http://localhost:3000). Most pages work without optional
API credentials. See [`docs/deploy.md`](docs/deploy.md) for the complete
environment-variable list.

## Useful commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start the local site |
| `pnpm check` | Run TypeScript, unit tests, and the production build |
| `pnpm test:e2e` | Run Playwright smoke and accessibility tests |
| `pnpm check:live` | Check the important production routes and demos |
| `pnpm sync:running` | Preview a fresh privacy-safe fitness snapshot locally |
| `pnpm publish:running` | Publish a checked fitness snapshot to the live site |

## Project structure

~~~text
app/           routes, pages, metadata, and API handlers
components/    shared UI, fitness views, globe, maps, and widgets
content/       projects, history, travel, and site configuration
lib/           schemas, data loaders, formatting, and integrations
public/        images, résumé, map textures, and static project assets
docs/          setup and deployment notes
scripts/       fitness publishing and live-site checks
e2e/           Playwright and Axe coverage
~~~

## Content model

The important content stays easy to review and update:

- `content/site-config.json`: current role, location, and focus
- `content/projects/*`: project metadata and MDX case studies
- `content/history.json`: work, school, and milestones
- `content/places.json` and `content/states.json`: travel data
- `content/running-dashboard.json`: deploy-safe fitness fallback
- `public/rohan-singh-resume.pdf`: downloadable résumé

## Fitness data and privacy

The fitness page is powered by the private `marathonPrepBot` repository. Apple
Watch workouts move through HealthFit into a TypeScript pipeline that calculates
training metrics and publishes a strict, privacy-safe dashboard snapshot.

The public schema excludes GPS coordinates, source filenames, private notes,
health notes, and workout descriptions. The committed JSON is only a fallback;
fresh ingests update the live page without waiting for another site deployment.

The reusable coaching machinery lives in the public
[Marathon Coach Starter](https://github.com/RohanSi4/marathon-coach-starter)
template.

## Deployment

Pushes to `main` deploy through Vercel. GitHub Actions runs TypeScript, unit
tests, integrity checks, the production build, Playwright smoke tests, and Axe
accessibility checks before changes are considered healthy.

# deploy guide

## initial deploy to vercel

1. push this repo to github
2. go to vercel.com, click "add new project", import the repo
3. vercel auto-detects next.js and pnpm -- no build config needed
4. deploy. you'll get a `*.vercel.app` preview url

## pointing rohansingh04.com at vercel

1. in vercel project settings, go to "domains" and add `rohansingh04.com`
2. vercel will show you two DNS records to add. add them in your domain registrar:

| type | name | value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

if your registrar doesn't support CNAME at root, use the A record only and
add `www` as an alias or redirect.

3. ssl is automatic via vercel. propagation takes a few minutes to a few hours.

## env vars to set in vercel

go to project settings > environment variables. add these before phase 5
(the site works without them -- stubbed apis return 501 until set).

### health dashboard (phase 5)
| var | description |
|-----|-------------|
| `HEALTH_INGEST_TOKEN` | secret bearer token. generate a random string (e.g. `openssl rand -hex 32`). hardcode the same value in the ios shortcut. |
| `KV_REST_API_URL` | auto-set when you add the upstash redis integration |
| `KV_REST_API_TOKEN` | auto-set when you add the upstash redis integration |

to set up kv: in vercel dashboard > storage, add an upstash redis database and
connect it to your project. the two `KV_*` vars above will be injected automatically.
`@vercel/kv` is deprecated but the upstash integration uses the same api -- it
just works.

### spotify now playing (phase 5)
| var | description |
|-----|-------------|
| `SPOTIFY_CLIENT_ID` | from developer.spotify.com > your app |
| `SPOTIFY_CLIENT_SECRET` | from developer.spotify.com > your app |
| `SPOTIFY_REFRESH_TOKEN` | see "getting a spotify refresh token" below |

#### getting a spotify refresh token
1. create an app at developer.spotify.com
2. set redirect uri to `http://localhost:3000/callback` (just for this flow)
3. visit this url in your browser (replace CLIENT_ID):
   ```
   https://accounts.spotify.com/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-read-currently-playing,user-read-recently-played
   ```
4. after authorizing, copy the `code` param from the redirect url
5. exchange it for tokens:
   ```bash
   curl -X POST https://accounts.spotify.com/api/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -H "Authorization: Basic $(echo -n CLIENT_ID:CLIENT_SECRET | base64)" \
     -d "grant_type=authorization_code&code=CODE&redirect_uri=http://localhost:3000/callback"
   ```
6. copy the `refresh_token` from the response -- that's `SPOTIFY_REFRESH_TOKEN`

### github latest commit (phase 5)
| var | description |
|-----|-------------|
| `GITHUB_TOKEN` | github personal access token, read-only scopes: `public_repo` |

create at github.com > settings > developer settings > personal access tokens (fine-grained).
scope: contents:read on public repos is enough.

### guestbook oauth (phase 5)
| var | description |
|-----|-------------|
| `NEXTAUTH_URL` | `https://rohansingh04.com` |
| `NEXTAUTH_SECRET` | random string: `openssl rand -hex 32` |
| `GITHUB_CLIENT_ID` | github oauth app client id |
| `GITHUB_CLIENT_SECRET` | github oauth app client secret |

create the github oauth app at github.com > settings > developer settings >
oauth apps. set homepage url to `https://rohansingh04.com` and callback url
to `https://rohansingh04.com/api/auth/callback/github`.

## local dev

copy `.env.example` to `.env.local` and fill in whatever you want to test.
most vars are optional -- the app falls back to mock data or returns 501.

```bash
cp .env.example .env.local
pnpm dev
```

## sitemap + robots

next.js auto-generates these. to verify after deploy:
- `https://rohansingh04.com/sitemap.xml`
- `https://rohansingh04.com/robots.txt`

## vercel analytics

enable in vercel dashboard > analytics tab. no code change needed -- the
`<Analytics />` component in `app/layout.tsx` is already wired up.

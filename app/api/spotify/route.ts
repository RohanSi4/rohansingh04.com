import { NextResponse } from "next/server";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const NOW_PLAYING_CACHE_MS = 25_000;
const RESPONSE_CACHE_CONTROL = "public, max-age=15, s-maxage=30, stale-while-revalidate=120";

type SpotifyData = {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumArt: string | null;
  trackUrl: string | null;
};

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  external_urls: { spotify: string };
};

const NOTHING_PLAYING: SpotifyData = {
  isPlaying: false,
  title: "",
  artist: "",
  albumArt: null,
  trackUrl: null,
};

let accessTokenCache: { value: string; expiresAt: number } | null = null;
let pendingAccessToken: Promise<string> | null = null;
let nowPlayingCache: { value: SpotifyData; expiresAt: number } | null = null;
let pendingNowPlaying: Promise<SpotifyData> | null = null;

async function getAccessToken(): Promise<string> {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) {
    return accessTokenCache.value;
  }
  if (pendingAccessToken) return pendingAccessToken;

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error("Spotify is not configured");
  }

  pendingAccessToken = (async () => {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
            "base64",
          ),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`token refresh failed: ${res.status}`);
    const data = await res.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token) throw new Error("Spotify returned an invalid token");
    accessTokenCache = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3_600) * 1_000,
    };
    return data.access_token;
  })().finally(() => {
    pendingAccessToken = null;
  });
  return pendingAccessToken;
}

function formatTrack(track: SpotifyTrack, isPlaying: boolean): SpotifyData {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    albumArt: track.album.images[0]?.url ?? null,
    trackUrl: track.external_urls.spotify,
  };
}

async function fetchRecentlyPlayed(accessToken: string): Promise<SpotifyData> {
  const res = await fetch(RECENTLY_PLAYED_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  // Older refresh tokens may not include the recently-played scope. In that
  // case, keep the widget gracefully empty instead of failing the whole route.
  if (!res.ok) return NOTHING_PLAYING;

  const data = await res.json() as {
    items?: { track?: SpotifyTrack }[];
  };
  const track = data.items?.[0]?.track;
  return track ? formatTrack(track, false) : NOTHING_PLAYING;
}

async function fetchNowPlaying(): Promise<SpotifyData> {
  const accessToken = await getAccessToken();

  const res = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status === 204) return fetchRecentlyPlayed(accessToken);
  if (!res.ok) throw new Error(`Spotify request failed: ${res.status}`);

  const data = await res.json() as {
    is_playing: boolean;
    item: SpotifyTrack | null;
  };
  if (!data.item) return fetchRecentlyPlayed(accessToken);

  return formatTrack(data.item, data.is_playing);
}

async function getNowPlaying(): Promise<SpotifyData> {
  if (nowPlayingCache && nowPlayingCache.expiresAt > Date.now()) return nowPlayingCache.value;
  if (pendingNowPlaying) return pendingNowPlaying;

  pendingNowPlaying = fetchNowPlaying()
    .then((value) => {
      nowPlayingCache = { value, expiresAt: Date.now() + NOW_PLAYING_CACHE_MS };
      return value;
    })
    .catch((error) => {
      if (nowPlayingCache) return nowPlayingCache.value;
      throw error;
    })
    .finally(() => {
      pendingNowPlaying = null;
    });
  return pendingNowPlaying;
}

export async function GET() {
  try {
    return NextResponse.json(await getNowPlaying(), {
      headers: { "Cache-Control": RESPONSE_CACHE_CONTROL },
    });
  } catch {
    return NextResponse.json(
      { error: "spotify unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

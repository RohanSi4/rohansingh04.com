import { NextResponse } from "next/server";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";

async function getAccessToken(): Promise<string> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64"
        ),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN!,
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`token refresh failed: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    // 204 = nothing playing
    if (res.status === 204) {
      return NextResponse.json({
        isPlaying: false,
        title: "",
        artist: "",
        albumArt: null,
        trackUrl: null,
      });
    }

    if (!res.ok) {
      return NextResponse.json({ error: "spotify error" }, { status: 502 });
    }

    const data = await res.json() as {
      is_playing: boolean;
      item: {
        name: string;
        artists: { name: string }[];
        album: { images: { url: string }[] };
        external_urls: { spotify: string };
      } | null;
    };

    if (!data.item) {
      return NextResponse.json({
        isPlaying: false,
        title: "",
        artist: "",
        albumArt: null,
        trackUrl: null,
      });
    }

    return NextResponse.json({
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((a) => a.name).join(", "),
      albumArt: data.item.album.images[0]?.url ?? null,
      trackUrl: data.item.external_urls.spotify,
    });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

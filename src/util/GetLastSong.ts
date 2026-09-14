/**
 * Last.fm "now playing" — Q6 hardening:
 *  - username and API key come from env vars, never hardcoded;
 *  - fails silently and cleanly: returns null on a missing key, a non-OK
 *    response, a network error or an unexpected payload — never throws,
 *    and the footer renders without the flourish rather than with a gap.
 */
const username = import.meta.env.VITE_LAST_FM_USER ?? "pj_au";
const apiKey = import.meta.env.VITE_LAST_FM_KEY;

interface NowPlaying {
  trackName: string;
  artist: string;
}

async function getLastSong(): Promise<NowPlaying | null> {
  if (!apiKey) return null;

  const url =
    "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks" +
    `&user=${encodeURIComponent(username)}` +
    `&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data: unknown = await response.json();
    const track = (
      data as { recenttracks?: { track?: Array<Record<string, unknown>> } }
    )?.recenttracks?.track?.[0];

    const trackName = track?.name;
    const artist = (
      track?.artist as { "#text"?: string } | undefined
    )?.["#text"];

    if (typeof trackName !== "string" || typeof artist !== "string") return null;
    return { trackName, artist };
  } catch {
    return null;
  }
}

export default getLastSong;

/**
 * Fetches an anime GIF from nekos.best (primary) with waifu.pics as fallback.
 * Never throws — always returns a URL string or null on failure.
 *
 * nekos.best supported types:
 *   hug, kiss, pat, slap, kick, shoot, baka, bite, poke, wave, punch,
 *   cuddle, blush, smile, wink, cry, dance, laugh, tickle, stare, yawn,
 *   handhold, nod, highfive, thumbsup, happy, facepalm, shrug, lurk, think
 *
 * waifu.pics fallback only for: hug, kiss, pat, slap
 */

const NEKOSBEST = 'https://nekos.best/api/v2';
const WAIFUPICS = 'https://api.waifu.pics/sfw';
const WAIFUPICS_TYPES = new Set(['hug', 'kiss', 'pat', 'slap', 'cry', 'dance', 'blush', 'smile', 'wave', 'poke', 'tickle', 'cuddle']);

export async function getGif(type) {
  // ── Primary: nekos.best ────────────────────────────────────────────────────
  try {
    const res = await fetch(`${NEKOSBEST}/${type}`, {
      headers: { 'User-Agent': 'LilithProtector/2.0 Discord Bot' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const json = await res.json();
      const url = json.results?.[0]?.url;
      if (url) return url;
    }
  } catch {}

  // ── Fallback: waifu.pics ───────────────────────────────────────────────────
  if (WAIFUPICS_TYPES.has(type)) {
    try {
      const res = await fetch(`${WAIFUPICS}/${type}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) return json.url;
      }
    } catch {}
  }

  return null;
}

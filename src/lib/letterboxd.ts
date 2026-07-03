import { XMLParser } from 'fast-xml-parser';

export interface Film {
  title: string;
  year: number | null;
  rating: number | null;
  link: string;
  poster: string | null;
  review: string; // HTML, may be empty
  watchedDate: Date | null;
}

// Your Letterboxd profile + feed. Change the handle here if it ever moves.
export const LETTERBOXD_URL = 'https://letterboxd.com/dokkeynot';
const FEED_URL = `${LETTERBOXD_URL}/rss/`;
const TIMEOUT_MS = 10_000;

function extractPoster(description: string): string | null {
  const m = description.match(/<img[^>]+src="([^"]+)"/i);
  return m ? m[1] : null;
}

function extractReview(description: string): string {
  // Strip the poster image and Letterboxd's boilerplate diary line,
  // leaving just the written review (if any) as HTML.
  return description
    .replace(/<p>\s*<img[^>]*>\s*<\/p>/i, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<p>\s*(?:Watched|Added|Rewatched)[^<]*<\/p>/i, '')
    .trim();
}

/**
 * Fetches recent films from your Letterboxd RSS at BUILD TIME.
 *
 * Like the Substack helper, this runs when the site builds (not in the
 * visitor's browser), so new entries appear on the next deploy. It is
 * failure-tolerant: any network/parse problem returns an empty array so a
 * flaky feed can never break a production build.
 */
export async function getRecentFilms(limit = 12): Promise<Film[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(FEED_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ouroboruszak.com build (+https://www.ouroboruszak.com)' },
    });
    if (!res.ok) {
      console.warn(`[letterboxd] feed returned ${res.status}; skipping recent watches.`);
      return [];
    }

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
    const data = parser.parse(xml);

    const channel = data?.rss?.channel;
    if (!channel) return [];
    const rawItems = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];

    return rawItems
      // Keep film diary entries only (the feed can also contain lists).
      .filter((item: Record<string, unknown>) => item['letterboxd:filmTitle'])
      .map((item: Record<string, unknown>): Film => {
        const description = String(item.description ?? '');
        const ratingRaw = item['letterboxd:memberRating'];
        const rating = ratingRaw != null && ratingRaw !== '' ? Number(ratingRaw) : null;
        const watched = item['letterboxd:watchedDate']
          ? new Date(String(item['letterboxd:watchedDate']))
          : null;
        const yearRaw = item['letterboxd:filmYear'];
        return {
          title: String(item['letterboxd:filmTitle'] ?? '').trim(),
          year: yearRaw ? Number(yearRaw) : null,
          rating: rating != null && !Number.isNaN(rating) ? rating : null,
          link: String(item.link ?? '').trim(),
          poster: extractPoster(description),
          review: extractReview(description),
          watchedDate: watched && !Number.isNaN(watched.valueOf()) ? watched : null,
        };
      })
      .sort((a: Film, b: Film) => (b.watchedDate?.valueOf() ?? 0) - (a.watchedDate?.valueOf() ?? 0))
      .slice(0, limit);
  } catch (err) {
    console.warn('[letterboxd] feed fetch failed; rendering without recent watches:', err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
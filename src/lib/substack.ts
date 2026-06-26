import { XMLParser } from 'fast-xml-parser';

export interface SubstackPost {
  title: string;
  link: string;
  pubDate: Date | null;
}

// Your Substack feed. Change the handle here if it ever moves.
export const SUBSTACK_URL = 'https://ouroboruszak.substack.com';
const FEED_URL = `${SUBSTACK_URL}/feed`;
const TIMEOUT_MS = 10_000;

/**
 * Fetches recent Substack posts at BUILD TIME.
 *
 * Notes:
 * - This runs when the site builds (locally or on Cloudflare), not in the
 *   visitor's browser. New posts therefore appear on the next deploy — see the
 *   note in the home page about scheduled rebuilds if you want it auto-fresh.
 * - It is deliberately failure-tolerant: any network/parse problem returns an
 *   empty array so a flaky feed can never break a production build.
 */
export async function getRecentPosts(limit = 3): Promise<SubstackPost[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(FEED_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ouroboruszak.com build (+https://www.ouroboruszak.com)',
      },
    });
    if (!res.ok) {
      console.warn(`[substack] feed returned ${res.status}; skipping recent posts.`);
      return [];
    }

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
    const data = parser.parse(xml);

    const channel = data?.rss?.channel;
    if (!channel) return [];

    // The feed yields a single object for one item, an array for many.
    const rawItems = Array.isArray(channel.item)
      ? channel.item
      : channel.item
        ? [channel.item]
        : [];

    return rawItems
      .map((item: Record<string, unknown>): SubstackPost => {
        const parsed = item.pubDate ? new Date(String(item.pubDate)) : null;
        return {
          title: String(item.title ?? '').trim(),
          link: String(item.link ?? '').trim(),
          pubDate: parsed && !Number.isNaN(parsed.valueOf()) ? parsed : null,
        };
      })
      .filter((post: SubstackPost) => post.title && post.link)
      .slice(0, limit);
  } catch (err) {
    console.warn('[substack] feed fetch failed; rendering without recent posts:', err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
/* ============================================================
   The Non-Negotiables — live wire
   ------------------------------------------------------------
   A Cloudflare Worker that pulls Arsenal RSS feeds, merges them,
   sorts newest-first and serves JSON to the site. Solves CORS
   (browsers can't fetch these feeds directly) and caches so you
   don't hammer anyone's server.

   WHY RSS AND NOT THE X API
   X's read access is priced for companies, not fan sites. RSS is
   free, stable, and the signal-to-noise is better anyway — these
   are the outlets, not the replies. Bluesky's public API is free
   and needs no auth, so it's wired in below as a bonus source.

   DEPLOY
     npm create cloudflare@latest nn-wire -- --type=hello-world
     # replace src/index.js with this file
     npx wrangler deploy

   Then in index.html set:
     const WIRE_ENDPOINT = 'https://nn-wire.<you>.workers.dev/';

   Free tier: 100,000 requests/day. You will not get close.
   ============================================================ */

const FEEDS = [
  { name: 'Arseblog News',  url: 'https://arseblog.news/feed/' },
  { name: 'Arseblog',       url: 'https://arseblog.com/feed/' },
  { name: 'BBC Sport',      url: 'https://feeds.bbci.co.uk/sport/football/teams/arsenal/rss.xml' },
  { name: 'Guardian',       url: 'https://www.theguardian.com/football/arsenal/rss' },
  { name: 'Sky Sports',     url: 'https://www.skysports.com/rss/11670' }
];

/* Bluesky accounts worth following. Public API, no auth, no key.
   Verify each handle resolves before relying on it. */
const BLUESKY = [
  'arseblog.bsky.social'
];

const CACHE_SECONDS = 900;   // 15 minutes
const MAX_ITEMS = 20;

/* ---------- tiny XML helpers (no dependencies) ---------- */
const strip = s => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? strip(m[1]) : '';
};

function parseFeed(xml, source) {
  const chunks = xml.match(/<(item|entry)[\s\S]*?<\/\1>/gi) || [];
  return chunks.slice(0, 10).map(c => {
    let link = tag(c, 'link');
    if (!link) {
      const href = c.match(/<link[^>]*href="([^"]+)"/i);
      link = href ? href[1] : '';
    }
    const when = tag(c, 'pubDate') || tag(c, 'updated') || tag(c, 'published');
    const ts = when ? Date.parse(when) : 0;
    return {
      t: tag(c, 'title').slice(0, 160),
      u: link,
      s: source,
      ts: Number.isNaN(ts) ? 0 : ts
    };
  }).filter(i => i.t && i.u);
}

async function fetchFeed(feed) {
  try {
    const r = await fetch(feed.url, {
      headers: { 'User-Agent': 'TheNonNegotiables/1.0 (Arsenal fan site)' },
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
    });
    if (!r.ok) return [];
    return parseFeed(await r.text(), feed.name);
  } catch {
    return [];
  }
}

async function fetchBluesky(handle) {
  try {
    const url = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed'
      + `?actor=${encodeURIComponent(handle)}&limit=5&filter=posts_no_replies`;
    const r = await fetch(url, { cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true } });
    if (!r.ok) return [];
    const j = await r.json();
    return (j.feed || []).map(f => {
      const p = f.post;
      const id = (p.uri || '').split('/').pop();
      return {
        t: (p.record?.text || '').slice(0, 160),
        u: `https://bsky.app/profile/${p.author?.handle}/post/${id}`,
        s: '@' + (p.author?.handle || handle).replace('.bsky.social', ''),
        ts: Date.parse(p.record?.createdAt || p.indexedAt || 0) || 0
      };
    }).filter(i => i.t && i.u);
  } catch {
    return [];
  }
}

const ago = ts => {
  if (!ts) return '';
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '*';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': `public, max-age=${CACHE_SECONDS}`
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    const transfersOnly = url.searchParams.get('filter') === 'transfers';

    const results = await Promise.all([
      ...FEEDS.map(fetchFeed),
      ...BLUESKY.map(fetchBluesky)
    ]);

    let items = results.flat();

    if (transfersOnly) {
      const kw = /transfer|sign|deal|bid|medical|fee|loan|deadline|contract|join|move|agree|talks/i;
      items = items.filter(i => kw.test(i.t));
    }

    /* de-duplicate by title, newest first */
    const seen = new Set();
    items = items
      .sort((a, b) => b.ts - a.ts)
      .filter(i => {
        const k = i.t.toLowerCase().slice(0, 60);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, MAX_ITEMS)
      .map(({ t, u, s, ts }) => ({ t, u, s, d: ago(ts) }));

    return new Response(
      JSON.stringify({ updated: new Date().toISOString(), count: items.length, items }, null, 2),
      { headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};

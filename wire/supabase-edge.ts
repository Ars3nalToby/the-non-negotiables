/* ============================================================
   The Non-Negotiables — live wire (Supabase Edge Function)
   ------------------------------------------------------------
   Deno port of wire/index.js. Same feeds, same parsing, same
   output shape — it just runs on Supabase instead of Cloudflare.

   WHY NOT THE CLOUDFLARE WORKER
   The Worker is fine code, but publishing it needs a workers.dev
   subdomain on the account, which would not provision. Supabase
   was already set up for the crew board and the visit counter,
   its host is already in every page's CSP connect-src, and an
   Edge Function is the same shape of thing. One less service.

   DEPLOY
     Deployed via the Supabase MCP tools as function "wire".
     Live at: <project>.supabase.co/functions/v1/wire
     Add ?filter=transfers for the transfer-only subset.

   AUTH
     verify_jwt is on, so callers must send the project's
     publishable key — app.js already has sbHeaders() for this.
     That key is public by design; the function is read-only and
     touches no tables.
   ============================================================ */

const FEEDS = [
  { name: 'Arseblog News', url: 'https://arseblog.news/feed/' },
  { name: 'Arseblog',      url: 'https://arseblog.com/feed/' },
  { name: 'BBC Sport',     url: 'https://feeds.bbci.co.uk/sport/football/teams/arsenal/rss.xml' },
  { name: 'Guardian',      url: 'https://www.theguardian.com/football/arsenal/rss' },
  { name: 'Sky Sports',    url: 'https://www.skysports.com/rss/11670' }
];

const BLUESKY = ['arseblog.bsky.social'];

/* Short enough that the site feels live, long enough that we aren't
   hitting Arseblog/BBC/Guardian on every single page load. Cached in
   module scope — Supabase reuses a warm instance across requests. */
const CACHE_SECONDS = 300;
const MAX_ITEMS = 20;

let cache: { at: number; items: WireItem[] } | null = null;

interface WireItem { t: string; u: string; s: string; ts: number }

/* ---------- tiny XML helpers (no dependencies) ---------- */
const strip = (s: string) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? strip(m[1]) : '';
};

function parseFeed(xml: string, source: string): WireItem[] {
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
  /* https-only: a feed is untrusted input parsed with a regex, not a real
     XML parser. Never let a javascript:/data: URI (or anything else) from
     a compromised or malformed feed reach the client. */
  }).filter(i => i.t && i.u && /^https:\/\//i.test(i.u));
}

async function fetchFeed(feed: { name: string; url: string }): Promise<WireItem[]> {
  try {
    const r = await fetch(feed.url, {
      headers: { 'User-Agent': 'TheNonNegotiables/1.0 (Arsenal fan site)' }
    });
    if (!r.ok) return [];
    return parseFeed(await r.text(), feed.name);
  } catch {
    return [];
  }
}

async function fetchBluesky(handle: string): Promise<WireItem[]> {
  try {
    const url = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed'
      + `?actor=${encodeURIComponent(handle)}&limit=5&filter=posts_no_replies`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const j = await r.json();
    return (j.feed || []).map((f: any) => {
      const p = f.post;
      const id = (p.uri || '').split('/').pop();
      return {
        t: (p.record?.text || '').slice(0, 160),
        u: `https://bsky.app/profile/${p.author?.handle}/post/${id}`,
        s: '@' + (p.author?.handle || handle).replace('.bsky.social', ''),
        ts: Date.parse(p.record?.createdAt || p.indexedAt || 0) || 0
      };
    }).filter((i: WireItem) => i.t && i.u && /^https:\/\//i.test(i.u));
  } catch {
    return [];
  }
}

const ago = (ts: number) => {
  if (!ts) return '';
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

async function collect(): Promise<WireItem[]> {
  if (cache && Date.now() - cache.at < CACHE_SECONDS * 1000) return cache.items;
  const results = await Promise.all([
    ...FEEDS.map(fetchFeed),
    ...BLUESKY.map(fetchBluesky)
  ]);
  const items = results.flat();
  /* Only cache a real result — a total upstream outage shouldn't get
     pinned in memory for the next five minutes. */
  if (items.length) cache = { at: Date.now(), items };
  return items;
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin') || '*';
  const cors: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, prefer',
    'Cache-Control': `public, max-age=${CACHE_SECONDS}`
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

  const url = new URL(request.url);
  const transfersOnly = url.searchParams.get('filter') === 'transfers';

  let items = await collect();

  if (transfersOnly) {
    const kw = /transfer|sign|deal|bid|medical|fee|loan|deadline|contract|join|move|agree|talks/i;
    items = items.filter(i => kw.test(i.t));
  }

  /* de-duplicate by title, newest first */
  const seen = new Set<string>();
  const out = items
    .slice()
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
    JSON.stringify({ updated: new Date().toISOString(), count: out.length, items: out }, null, 2),
    { headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } }
  );
});

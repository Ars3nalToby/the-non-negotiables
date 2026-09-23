# The Non-Negotiables

An independent Arsenal fan site, built by a lifelong supporter in Brisbane.
Fixtures, away days, ticket windows, and the one thing no other Arsenal site
does: it tells you what time you have to wake up in Australia.

---

## Repo layout

The site is a **hub page plus one sub-page per section** — no single
page holds the whole thing, so nobody has to scroll forever to reach
the squad list. Every page shares one stylesheet and one data/helpers
script; there's still no build step, no bundler.

```
index.html              Hub. Hero match board + a grid of clickable
                        "widget" cards, one per section, each with a
                        live teaser pulled from the shared data.
news.html                Original news coverage, newest first — short
                        write-ups in this site's own voice, each
                        linked to its real source. Renders from NEWS
                        (news-data.js); never a hardcoded item.
timetable.html           Full season fixture list (month accordion).
tickets.html             Ticket desk (sale windows) + Away Crew board.
europe.html              Champions League cards + key dates.
transfers.html            Transfer window countdown + live news wire.
squad.html               First-team squad, grouped by position.
junior.html               Junior Gunners — read-only, positions/glossary
                        plus a seven-game arcade (junior.js/.css).
programme.html            Original opinion column, newest first — grows
                        over time (routine adds one roughly weekly).
                        Renders from COLUMNS (columns.js); never a
                        hardcoded essay.
reading.html               Arseblog / Tim Stillman tribute + links.
fanart.html                Fan artists, embedded live from their own X
                        accounts (official embed widget) — never
                        rehosted. This is the ONE page with a widened
                        CSP (adds platform.twitter.com,
                        syndication.twitter.com, pbs.twimg.com) —
                        every other page keeps the strict default.
404.html                 Custom not-found page (intentionally
                        standalone — not wired into the nav/audit
                        content-page checks).
styles.css                All CSS for every page. Two themes,
                        `[data-theme="light"]` and `[data-theme="dark"]`,
                        defining **the same token set** — the audit
                        doesn't check this; if you add a token, add it
                        to both.
app.js                    Shared across all pages: data arrays
                        (CLUBS, FIXTURES, CL, SQUAD, MOVES_IN/OUT,
                        KEY_DATES, DEMAND...), helpers
                        (esc, fmt, t24, isoDate, store, getWireItems...),
                        theme toggle, scroll motion (progress bar,
                        back-to-top, reveal-on-scroll). Render logic
                        for each section's own list/grid stays in that
                        page's own inline `<script>`, not in app.js.
drawer.js                 The fixture dossier (openDrawer/closeDrawer),
                        away-day links, live match weather (Open-Meteo,
                        no key), the .ics calendar download, and the
                        share button — split out of app.js because only
                        index.html (hero "open the dossier") and
                        timetable.html (row click) ever use any of it;
                        every other page was loading it and never
                        touching a byte. Loaded right after app.js, on
                        those two pages only.
junior.js / junior.css    The Junior Gunners arcade: quiz, penalties,
                        keepy-uppy, who-am-I (reads SQUAD live), memory,
                        kit maker, bingo — plus the JG_QUIZ and JG_BINGO data.
                        junior.html only. 100% client-side: no fetch, no
                        submissions; best scores in localStorage key
                        `jg-best` and nowhere else. Keepy-uppy runs on
                        setInterval, not rAF, so it stays testable.
columns.js                COLUMNS only — split out of app.js because it
                        grows indefinitely (one entry added roughly
                        weekly, never trimmed) and only programme.html
                        needs it; every other page shouldn't pay its
                        byte cost. Loaded by programme.html alone, right
                        after app.js.
news-data.js              NEWS only — same reasoning as columns.js: this
                        grows indefinitely (the scheduled routine
                        prepends an item every few days) and tripped
                        app.js's 60KB budget once it did. Loaded by
                        both index.html (just NEWS[0], for the homepage
                        widget teaser) and news.html (the full list),
                        right after app.js on each.
audit.mjs               Self-audit script. Reads app.js, drawer.js,
                        junior.js/.css, columns.js and news-data.js for
                        data/syntax/size,
                        reads every *.html page for compliance/hygiene
                        checks. Run before every commit.
wire/supabase-edge.ts     THE LIVE ONE. RSS/Bluesky aggregator running as
                        a Supabase Edge Function ("wire"). Feeds news.html
                        and transfers.html (?filter=transfers). Deployed
                        via the Supabase MCP tools, not wrangler.
wire/index.js             Cloudflare Worker version — NOT deployed, kept as
                        a working alternative. Publishing it needs a
                        workers.dev subdomain that wouldn't provision.
                        Change a feed in one file, change it in both.
.github/workflows/
  weekly-audit.yml      Monday 08:00 Brisbane: runs audit, checks links,
                        opens/updates a GitHub issue with findings.
```

## Commands

```bash
node audit.mjs index.html     # must pass before any commit (checks every page)
python3 -m http.server 8000   # preview at localhost:8000
npx wrangler deploy           # deploy the wire worker (in its own dir)
```

## Community backend (Supabase)

Two features are backed by a real Supabase project, not `localStorage`:
the Away Crew board (`tickets.html`) and the site-wide visit line in
every page's footer. Project `the-non-negotiables`, org
`thenonnegotiablog.com`, region `ap-southeast-2` (Sydney — closest to
the audience), ref `anueveizfqxnloncuvmf`.

- **`crew_posts`** — `name`, `from_city`, `fixture_n`, `created_at`.
  RLS: anon can `select` and `insert`, nothing else. `esc()` at render
  time in `tickets.html` (unchanged from the old localStorage version).
- **`pageviews`** — `page`, `created_at`. RLS: anon can `select` and
  `insert`, nothing else. One row per browser *session* (not per page
  load — see `logVisit()` in `app.js`), no IP, no cookie, no
  identifying data at all. `renderVisitCount()` in `app.js` reads just
  the count (`HEAD` + `Prefer: count=exact`), never the rows.
- **Edge Function `wire`** — the live news wire, source in
  `wire/supabase-edge.ts`. `verify_jwt` is on, so call it with
  `sbHeaders()` like everything else. Touches no tables; it only
  fetches public RSS/Bluesky server-side (which is the point — the
  browser can't, CORS blocks it).

Both live in `app.js`'s "Community backend" block: `SUPABASE_URL` +
`SUPABASE_KEY` (Supabase's public **publishable** key — safe to ship
client-side by design, this is the intended way to use Supabase from a
static site; security comes from the RLS policies above, not from
keeping the key secret) + a small `sbHeaders()` helper. Plain
`fetch()` calls to Supabase's REST API throughout — no `supabase-js`
SDK, so this stays vanilla JS and doesn't violate "no new dependency."

**Every page except `junior.html`** needs the project's host
(`https://anueveizfqxnloncuvmf.supabase.co`) in its CSP `connect-src`,
or these fetches get silently blocked. `junior.html` is deliberately
excluded — see Child safety, rule 2, above.

`index.html` and `timetable.html` also need `https://api.open-meteo.com`
in `connect-src` — `drawer.js`'s away-day weather calls it directly, no
key, no proxy. Same silent-failure risk if it's ever removed.

There is no build, no bundler, no package.json for the site itself.
**Keep it that way.** The audit enforces a size budget per file instead
of one monolithic ceiling: `styles.css` ≤80KB, `app.js` ≤60KB,
`drawer.js` ≤60KB, `junior.js` ≤60KB, `junior.css` ≤30KB, `columns.js` and `news-data.js` ≤120KB each
(few-page files, but still not unbounded), each individual page ≤40KB.

**If `app.js` trips its budget again**, the fix is almost certainly
"extract another ever-growing array," not "trim something." It's
already happened twice — COLUMNS, then NEWS — both because a dataset
the scheduled routine keeps appending to lived in the one file every
page loads. Check which array grew, not what to cut.

---

## Architecture

The pattern for every content page: same `<head>` (CSP, fonts,
`styles.css`), same masthead/nav (the current page gets
`aria-current="page"`), a `.page-head` band with a "Back to hub"
crumb, the page's own section markup, shared footer/drawer markup,
`<script src="app.js">`, then a page-specific inline `<script>` for
that section's own render logic. New pages should copy an existing
page's chrome rather than reinventing it.

### Data objects (top of `app.js`, except `NEWS` and `COLUMNS` — see below)

| Object | Holds |
|---|---|
| `CLUBS` | Premier League opponents: stadium, city, capacity, nearest station, editorial note |
| `FIXTURES` | All 38 league games. `ko` is an ISO string **with an explicit UK offset**. A played match gets `result`/`scorers`, and optionally `reaction:{notes:[{who,role,quote,source,url}]}` — short, verified, sourced pull-quotes only, never fabricated, always linked. Renders automatically in the fixture drawer. |
| `CL` | Champions League league phase — 8 opponents, 4 home / 4 away |
| `DEMAND` | Ticket demand estimate per opponent, 1–3. **This site's own read, not club data** |
| `SQUAD` | First team + manager. `ig: null` / `x: null` means no verified Instagram / X handle — never guess either, both fall back to an in-platform search |
| `MOVES_IN` / `MOVES_OUT` | Transfer window, current summer |
| `KEY_DATES` | Cup rounds, CL matchdays, finals |
| `JG_QUIZ` / `JG_BINGO` (in `junior.js`, not `app.js`) | Junior Gunners content — QUIZ is 16 questions, 10 drawn per round; BINGO is a 20-item pool, 12 dealt per card |
| `NEWS` (in `news-data.js`, not `app.js`) | Original news write-ups, newest first (`news.html`, plus `NEWS[0]` on the homepage widget). Every entry: `date`, `headline`, `summary` (original wording, never copied), `source`, `url` (real, working link). audit.mjs flags it stale after 5 days. Kept in its own file for the same reason as COLUMNS — it grows without bound and tripped `app.js`'s budget once it did. |
| `COLUMNS` (in `columns.js`, not `app.js`) | Original opinion columns, newest first (`programme.html`). Every entry: `date`, `title`, `byline`, `paras` (array of paragraph strings). audit.mjs flags it stale after 10 days. Kept in its own file — see `columns.js` in Repo layout above — because it's the one dataset that grows without bound. |

### The timezone rule (read this before touching any date)

Every `ko` carries an explicit UK offset, and the browser converts to
`Australia/Brisbane` at render time. **Never store Brisbane times.**

- BST (`+01:00`): 29 Mar – 25 Oct 2026, and 28 Mar – 31 Oct 2027
- GMT (`+00:00`): everything between

Always format with `hourCycle:'h23'`, never `hour12:false` — some engines
render midnight as `24:00`, and the Villa away fixture is exactly `00:00`
Brisbane. `audit.mjs` checks every fixture's offset against the real DST
boundaries; run it after any fixture edit.

---

## Hard rules — do not break these

### 1. No ticket resale. Ever.

Section 166 of the Criminal Justice and Public Order Act 1994 (extended to
online sales by the Violent Crime Reduction Act 2006) makes it a **criminal
offence** for anyone not authorised in writing by the club to sell or
otherwise dispose of a ticket for a designated football match.

The wording catches more than selling. It covers offering, exposing for
sale, *making a ticket available for sale by another*, and *advertising
that a ticket is available for purchase*. Face value doesn't help.
Not making a profit doesn't help. A noticeboard counts. A forum post counts.

**Therefore:**
- Never add ticket listings, a ticket noticeboard, ticket classifieds,
  ticket alerts that broker a sale, or any "spare ticket" feature.
- The Away Crew board is for **people**, not tickets. It has no price
  field, no ticket field, and must never get one.
- All ticket links point to `arsenal.com/tickets` or
  `arsenal.com/ticket-exchange` and nowhere else.
- If a forum is added, ticket-sale posts must be blocked by word filter
  and by written policy. The platform operator is liable.

The audit enforces this: it fails if the s.166 notice disappears, and
fails CRITICAL if listing-shaped markup appears.

**The legitimate answer already exists.** Arsenal's own Ticket Exchange
moved roughly 4,200 tickets per match and got about 20,000 ballot-losers
into games in 2023/24 — the last season the club published figures.
This site's job is to make that visible to overseas fans who don't know
it exists. Not to compete with it.

### 2. Child safety

The Junior Gunners section is **read-only, by design**. No accounts, no
submissions, no uploads, no messaging, no contact forms, no analytics
that profile children. If a feature would let a child post anything or
be contacted by anyone, it does not go in.

The site-wide visit counter and the Away Crew board (see Community
backend below) are both explicitly excluded from `junior.html` — not
just in the JS, but at the CSP level too: that page's `connect-src`
deliberately does not include the Supabase host, so even a bug in the
JS guard can't leak a request out. If you ever add another Supabase
call anywhere, do not add the Supabase host to `junior.html`'s CSP.

### 3. Copyright and trademarks

- No Arsenal crest, cannon, wordmark, kit imagery, or club photography.
- No reproduced text from Arseblog, Tim Stillman, or any other outlet.
  The Required Reading section **links out and always will**. That is the
  whole point of it.
- All editorial prose in this repo is original. Keep it that way.
- The site is unofficial. The disclaimer in the footer stays.

### 4. Never commit secrets

`index.html` is served to the public. No API keys, ever. Anything needing
a key goes in the Worker, with `wrangler secret put`.

---

## Voice

The register is Arseblog: knowledgeable, dry, self-aware, occasionally
sweary, never breathless. Written by someone who has watched too much
of this and loves it anyway.

**Do:** short declaratives, specific detail, jokes that land because they're
true. Address the reader as a fellow sufferer.
**Don't:** hype, exclamation marks, "Gunners faithful", SEO padding,
listicles, anything that reads like a content farm.

The opponent notes and programme notes are the heart of the site. When
adding an opponent, write a real note — three or four sentences with an
actual observation in them. A placeholder is worse than nothing.

---

## Design system

Light is the default; dark is the departure board taken full-page. The
overall language is **matchday broadcast graphics** (Sky Sports / Amazon
Prime PL coverage) — flat saturated color blocks, angled `clip-path`
panels, bold tab-style headers — not a reference-doc/infobox look.
Revised twice already (cool-newsprint → cream/gold → broadcast); if it
drifts again, ask before another full repaint.

| Token | Light | Role |
|---|---|---|
| `--paper` | `#F4EEDD` | Page canvas — warm cream, breathing room between graphic panels |
| `--card` | `#FFFEF8` | Surfaces |
| `--ink` | `#0A1622` | **Text color only** — flips light/dark between themes, never use as a panel fill |
| `--board-bg` / `--board-fg` | `#0A1622` / `#FFFFFF` | The "always-dark" pair for broadcast bars — section-title tabs, accordion headers, box/dcard headers, the VS badge. Stays dark in both themes |
| `--red` | `#EF0107` | Arsenal red. Now used as a **large solid fill** (hero panel, accordion tab, HOME badge) — the old "accent only" rule no longer applies |
| `--navy` | `#063672` | Away panel fill, AWAY badge |
| `--gold` | `#AD8A3C` | Champions accent — masthead plaque, MOVED tag, demand badges, VS badge border, "next up" flag |

**Broadcast bar pattern:** any element styled as a bold title/header bar
(`.section__title`, `.acc__summary`, `.box h3`, `.dcard h3`, `.vs`) uses
`background:var(--board-bg); color:var(--board-fg)` — **not** `var(--ink)`
+ `#fff`, because `--ink` is a semantic text-color token that inverts
between themes and will render as a pale, low-contrast bar in dark mode.
This bit us once already; don't reintroduce it.

Type: **Archivo** (variable, uses the `wdth` axis for display) for UI,
**Newsreader** for editorial prose, **IBM Plex Mono** for all data —
times, dates, labels, scores. The sans/mono split is the timetable;
the serif is the programme. Don't blur them.

Motion is restrained and always behind `prefers-reduced-motion`.

---

## Current TODOs

1. **Instagram handles.** Most `SQUAD` entries are still `ig: null` and fall
   back to an Instagram search (run `node audit.mjs` for the current count).
   Verify each handle manually — do not guess. A wrong handle links a
   reader to a stranger.
2. ~~Live wire.~~ Done — `wire/supabase-edge.ts` is deployed as the
   Supabase Edge Function `wire`, `WIRE_ENDPOINT` is set, and both
   `news.html` and `transfers.html` pull it fresh on every page load
   (5-minute server-side cache so we don't hammer Arseblog/BBC).
   Falls back to `WIRE_FALLBACK`'s curated links if it's unreachable.
3. ~~Away Crew board backend.~~ Done — Supabase free tier project
   `the-non-negotiables` (org `thenonnegotiablog.com`, `ap-southeast-2`),
   see Community backend below. `esc()` is still applied at render time
   in `tickets.html`, same as before.
4. **Forum.** Discourse on a subdomain, not hand-rolled. Configure watched
   words for ticket-sale language before launch, per rule 1.

## Definition of done

- [ ] `node audit.mjs index.html` exits 0, or only INFO lines remain
- [ ] Both themes checked — no unreadable text, no invisible borders
- [ ] Mobile checked at 390px — the timetable is the thing that breaks
- [ ] Keyboard: Tab through the page, open a fixture drawer, Escape closes it,
      focus returns to the row
- [ ] No new dependency, no new build step, no key in the HTML

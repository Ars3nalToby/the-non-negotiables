# The Non-Negotiables

An independent Arsenal fan site, built by a lifelong supporter in Brisbane.
Fixtures, away days, ticket windows, and the one thing no other Arsenal site
does: it tells you what time you have to wake up in Australia.

---

## Repo layout

```
index.html              The entire site. Single file, zero build step,
                        zero runtime dependencies except Google Fonts.
audit.mjs               Self-audit script. Run before every commit.
worker.js               Cloudflare Worker — RSS/Bluesky aggregator for
                        the live news wire. Deploy separately.
.github/workflows/
  weekly-audit.yml      Monday 08:00 Brisbane: runs audit, checks links,
                        opens/updates a GitHub issue with findings.
```

## Commands

```bash
node audit.mjs index.html     # must pass before any commit
python3 -m http.server 8000   # preview at localhost:8000
npx wrangler deploy           # deploy the wire worker (in its own dir)
```

There is no build, no bundler, no package.json for the site itself.
**Keep it that way** unless index.html passes 150KB — the audit will
tell you when.

---

## Architecture

Everything lives in `index.html`, in this order:

1. `<style>` — CSS custom properties first. Two themes, `[data-theme="light"]`
   and `[data-theme="dark"]`, defining **the same token set**. The audit
   does not check this; if you add a token, add it to both.
2. `<body>` — semantic sections, each with an `id` used by the sticky nav.
3. `<script>` — data objects at the top, then helpers, then render
   functions, then a `BOOT` block at the very bottom.

### Data objects (top of the script block)

| Object | Holds |
|---|---|
| `CLUBS` | Premier League opponents: stadium, city, capacity, nearest station, editorial note |
| `FIXTURES` | All 38 league games. `ko` is an ISO string **with an explicit UK offset** |
| `CL` | Champions League league phase — 8 opponents, 4 home / 4 away |
| `DEMAND` | Ticket demand estimate per opponent, 1–3. **This site's own read, not club data** |
| `SQUAD` | First team + manager. `ig: null` means no verified Instagram handle |
| `MOVES_IN` / `MOVES_OUT` | Transfer window, current summer |
| `KEY_DATES` | Cup rounds, CL matchdays, finals |
| `QUIZ` / `BINGO` | Junior Gunners content |

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

Light is the default; dark is the departure board taken full-page.

| Token | Light | Role |
|---|---|---|
| `--paper` | `#EEF1F4` | Page. Cool newsprint, **not cream** |
| `--card` | `#FFFFFF` | Surfaces |
| `--ink` | `#0A1622` | Text, rules, board background |
| `--red` | `#EF0107` | Arsenal red. Accent only, never large fills |
| `--navy` | `#063672` | Away fixtures |
| `--gold` | `#8A7038` | Programme/editorial bylines only |

Type: **Archivo** (variable, uses the `wdth` axis for display) for UI,
**Newsreader** for editorial prose, **IBM Plex Mono** for all data —
times, dates, labels, scores. The sans/mono split is the timetable;
the serif is the programme. Don't blur them.

Motion is restrained and always behind `prefers-reduced-motion`.

---

## Current TODOs

1. **Champions League kick-off times.** UEFA has published fixtures by now.
   Add a `ko` field (ISO + UK offset) to each `CL` entry; the Brisbane
   conversion is already wired and will light up automatically.
2. **Instagram handles.** 20 of 24 `SQUAD` entries are `ig: null` and fall
   back to an Instagram search. Verify each handle manually — do not guess.
   A wrong handle links a reader to a stranger.
3. **Live wire.** Deploy `worker.js`, then set `WIRE_ENDPOINT` in
   `index.html`. Falls back to static source links until you do.
4. **Away Crew board backend.** Currently `localStorage`, single-browser.
   Supabase free tier is the intended target. **`esc()` every field on the
   way out** — the moment this is multi-user it's a stored XSS surface.
5. **Forum.** Discourse on a subdomain, not hand-rolled. Configure watched
   words for ticket-sale language before launch, per rule 1.

## Definition of done

- [ ] `node audit.mjs index.html` exits 0, or only INFO lines remain
- [ ] Both themes checked — no unreadable text, no invisible borders
- [ ] Mobile checked at 390px — the timetable is the thing that breaks
- [ ] Keyboard: Tab through the page, open a fixture drawer, Escape closes it,
      focus returns to the row
- [ ] No new dependency, no new build step, no key in the HTML

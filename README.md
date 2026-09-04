# The Non-Negotiables

An independent Arsenal fan site. Fixtures, away days, opponent notes,
ticket windows — and the one thing no other Arsenal site does: it tells
you what time you have to wake up in Australia.

Built by a lifelong Gunner in Brisbane. Unofficial, unaffiliated, and
not selling you anything.

---

## Launch in ten minutes

You do **not** need a domain to go live. Ship it on a free subdomain
today, attach the domain whenever you buy one. Do not let the domain
hold up the launch.

### Option A — GitHub Pages (fastest, ~5 minutes)

```bash
# 1. Create a repo on github.com, then:
git init
git add .
git commit -m "The Non-Negotiables — launch"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Then on github.com:
1. **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `root` → Save
2. **Settings → Actions → General → Workflow permissions** → `Read and write permissions` → Save
   *(this is what lets the weekly audit open issues — skip it and that job fails)*

Live at `https://YOUR-USERNAME.github.io/YOUR-REPO/` in about a minute.

### Option B — Cloudflare Pages (recommended for the long run)

Same push as above, then at dash.cloudflare.com:

1. **Workers & Pages → Create → Pages → Connect to Git** → pick the repo
2. Framework preset: **None**. Build command: **leave empty**. Output directory: **`/`**
3. Save and Deploy

Live at `https://YOUR-PROJECT.pages.dev`.

Worth the extra two minutes because the news wire Worker lives in the
same dashboard, custom domains are one click, and it's faster than
GitHub Pages everywhere outside the US.

### Attaching a domain later

**Cloudflare Pages:** project → Custom domains → Set up a domain.
If you bought through Cloudflare Registrar it's instant.

**GitHub Pages:** Settings → Pages → Custom domain, then add a CNAME
record at your registrar pointing to `YOUR-USERNAME.github.io`.

---

## After it's live

```bash
node audit.mjs index.html    # run this before every commit (checks every page)
```

Three things to do in the first week, none of which block launch:

1. **Instagram handles.** 20 of 24 `SQUAD` entries are `ig: null` and
   fall back to an Instagram search. Verify each handle on Instagram
   yourself — look for the blue tick — and paste it in. **Do not guess.**
   A wrong handle sends a reader to a stranger.

2. **The news wire.** Deploy the Worker, then set `WIRE_ENDPOINT` in
   `app.js`. Until then the wire shows static source links, which
   is fine.

   ```bash
   cd wire
   npx wrangler deploy
   # copy the workers.dev URL into WIRE_ENDPOINT in index.html
   ```

3. **Check it on your own phone.** The layout is built for 375–430px
   but nothing beats a real device.

---

## What's in here

```
index.html                  Hub page — the widget grid, one card per section.
timetable.html              Full season fixture list.
tickets.html                Ticket desk + Away Crew board.
europe.html                 Champions League + key dates.
transfers.html               Transfer window + live news wire.
squad.html                  First-team squad.
junior.html                 Junior Gunners (read-only kids' section).
programme.html               Editorial notes.
reading.html                 Arseblog / Tim Stillman tribute.
404.html                    Custom not-found page.
styles.css                  All CSS. Shared by every page.
app.js                       Shared data arrays, helpers, theme toggle,
                            drawer, scroll motion. No build step, no
                            bundler, no dependencies except Google Fonts.
audit.mjs                   Self-audit. Data staleness, timezone drift,
                            compliance invariants, iOS regressions —
                            checked across every page.
CLAUDE.md                   Project rules. Read this before changing
                            anything — especially the ticket rules.
wire/                       Cloudflare Worker: RSS + Bluesky aggregator.
.github/workflows/          Monday 08:00 Brisbane: audit, link check,
                            opens a GitHub issue with what it found.
```

## The one rule that matters

**No ticket resale, ever.** Section 166 of the Criminal Justice and
Public Order Act 1994 makes unauthorised football ticket sales a
criminal offence in England and Wales, and the wording covers
advertising, listing, and making a ticket available for sale by
someone else. Face value doesn't help. A noticeboard counts.

Every ticket link here points at Arsenal's own authorised channels.
`CLAUDE.md` has the full reasoning; `audit.mjs` fails the build if the
notice disappears or listing-shaped markup shows up.

---

Not affiliated with, endorsed by, or connected to Arsenal Football Club.
No club marks or photography used. All written content is original.

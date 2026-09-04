#!/usr/bin/env node
/* ============================================================
   The Non-Negotiables — weekly self-audit
   ------------------------------------------------------------
   The site is a hub page (index.html) plus one page per section,
   sharing styles.css and app.js. This script reads app.js for the
   data arrays, and every *.html page for compliance/hygiene checks.

   Run locally:   node audit.mjs
   Run in CI:     see .github/workflows/weekly-audit.yml

   Exit code 1 if anything is flagged, so CI can open an issue.
   ============================================================ */

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = process.argv[2] ? dirname(process.argv[2]) : dirname(fileURLToPath(import.meta.url));
const findings = [];
const flag = (level, area, msg) => findings.push({ level, area, msg });

const appJs = await readFile(join(DIR, 'app.js'), 'utf8');
const cssFile = await readFile(join(DIR, 'styles.css'), 'utf8');
const pageNames = (await readdir(DIR)).filter(f => f.endsWith('.html')).sort();
const pages = {};
for (const name of pageNames) pages[name] = await readFile(join(DIR, name), 'utf8');
const allHtml = Object.values(pages).join('\n');

/* ---------- extract the data arrays from app.js without executing it ---------- */
function block(name) {
  const m = appJs.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\];)`));
  return m ? m[1] : null;
}
const evalArr = (src, label) => {
  if (!src) { flag('ERROR', label, 'could not find this data block in app.js'); return []; }
  try { return eval(src.replace(/;$/, '')); }
  catch (e) { flag('ERROR', label, `could not parse: ${e.message}`); return []; }
};

const FIXTURES = evalArr(block('FIXTURES'), 'FIXTURES');
const CL = evalArr(block('CL'), 'CL');
const SQUAD = evalArr(block('SQUAD'), 'SQUAD');

const now = new Date();
const LDN = 'Europe/London', BNE = 'Australia/Brisbane';

/* ---------- 1. fixture data freshness ---------- */
const played = FIXTURES.filter(f => new Date(f.ko) < now);
const missingResults = played.filter(f => !f.result);
if (missingResults.length) {
  flag('DATA', 'fixtures',
    `${missingResults.length} played fixture(s) have no result recorded. Oldest: MW${missingResults[0].n} v ${missingResults[0].opp}.`);
}

const next = FIXTURES.find(f => new Date(f.ko) > now);
if (!next) {
  flag('DATA', 'fixtures', 'No upcoming fixtures left — the season array needs rolling over.');
} else {
  const days = Math.round((new Date(next.ko) - now) / 86400000);
  flag('INFO', 'fixtures', `Next up: MW${next.n} v ${next.opp} (${next.v}) in ${days} day(s).`);
}

/* ---------- 2. fixtures the broadcasters may have moved ----------
   The Premier League shifts kick-offs for TV up to ~5 weeks out.
   This check cannot verify reality — it flags rows that need a human
   to look at the official fixture list. That is the whole point:
   internal consistency is not the same as being correct. */
const HORIZON_DAYS = 21;
for (const f of FIXTURES) {
  const ko = new Date(f.ko);
  const daysAway = (ko - now) / 86400000;
  if (daysAway < 0 || daysAway > HORIZON_DAYS) continue;
  if (!f.checked) {
    flag('DATA', 'fixtures',
      `MW${f.n} v ${f.opp} is ${Math.round(daysAway)} day(s) away and has never been verified. Check arsenal.com/fixtures for a TV move.`);
    continue;
  }
  const staleDays = (now - new Date(f.checked)) / 86400000;
  if (staleDays > 7) {
    flag('DATA', 'fixtures',
      `MW${f.n} v ${f.opp} is ${Math.round(daysAway)} day(s) away, last verified ${Math.round(staleDays)} days ago. Re-check the kick-off time.`);
  }
}

/* ---------- 3. daylight-saving offsets ---------- */
/* BST 2026: 29 Mar – 25 Oct. BST 2027: 28 Mar – 31 Oct. */
const bstStart26 = Date.parse('2026-03-29T01:00:00Z'), bstEnd26 = Date.parse('2026-10-25T01:00:00Z');
const bstStart27 = Date.parse('2027-03-28T01:00:00Z'), bstEnd27 = Date.parse('2027-10-31T01:00:00Z');
const shouldBeBST = t => (t >= bstStart26 && t < bstEnd26) || (t >= bstStart27 && t < bstEnd27);
for (const f of FIXTURES) {
  const t = Date.parse(f.ko);
  const declared = f.ko.slice(-6);
  const expected = shouldBeBST(t) ? '+01:00' : '+00:00';
  if (declared !== expected) {
    flag('BUG', 'timezones', `MW${f.n} (${f.ko}) declares ${declared} but should be ${expected}.`);
  }
}

/* ---------- 3b. Brisbane conversion sanity ---------- */
const hourIn = (iso, tz) => Number(new Intl.DateTimeFormat('en-GB',
  { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date(iso)));
const brutal = FIXTURES.filter(f => { const h = hourIn(f.ko, BNE); return h >= 1 && h < 6; });
flag('INFO', 'timezones', `${brutal.length} of ${FIXTURES.length} fixtures land in the 1am–6am Brisbane window.`);
for (const f of FIXTURES) {
  const uk = hourIn(f.ko, LDN);
  if (uk < 11 || uk > 22) flag('BUG', 'timezones', `MW${f.n} renders as ${uk}:00 UK — implausible kick-off time.`);
}

/* ---------- 4. Champions League completeness ---------- */
if (CL.length !== 8) flag('BUG', 'europe', `Expected 8 league-phase opponents, found ${CL.length}.`);
const h = CL.filter(m => m.v === 'H').length, a = CL.filter(m => m.v === 'A').length;
if (h !== 4 || a !== 4) flag('BUG', 'europe', `League phase should be 4 home / 4 away, found ${h}/${a}.`);
if (!CL.some(m => m.ko)) {
  flag('TODO', 'europe', 'No Champions League kick-off times set yet. Once UEFA publishes, add a `ko` field to each CL entry so Brisbane times render.');
} else {
  const noKo = CL.filter(m => !m.ko);
  if (noKo.length) flag('BUG', 'europe', `${noKo.length} CL entr(ies) still missing a kick-off time.`);
  for (const m of CL.filter(x => x.ko)) {
    const expected = shouldBeBST(Date.parse(m.ko)) ? '+01:00' : '+00:00';
    if (m.ko.slice(-6) !== expected) {
      flag('BUG', 'europe', `CL MD${m.md} (${m.name}) declares ${m.ko.slice(-6)} but should be ${expected}.`);
    }
  }
  const mds = CL.map(m => m.md).sort((a, b) => a - b).join(',');
  if (mds !== '1,2,3,4,5,6,7,8') flag('BUG', 'europe', `Matchday numbers are ${mds} — should be 1 through 8.`);
  const order = CL.map(m => Date.parse(m.ko));
  if (order.some((t, i) => i && t < order[i - 1])) {
    flag('BUG', 'europe', 'CL entries are not in chronological order — the cards will render out of sequence.');
  }
  const clBrutal = CL.filter(m => { const h = hourIn(m.ko, BNE); return h >= 1 && h < 7; }).length;
  flag('INFO', 'europe', `All 8 CL fixtures dated. ${clBrutal} of them kick off between 1am and 7am Brisbane.`);
}

/* ---------- 5. squad / Instagram ---------- */
const noIg = SQUAD.filter(p => !p.ig);
if (noIg.length) {
  flag('TODO', 'squad', `${noIg.length} of ${SQUAD.length} players have no verified Instagram handle: ${noIg.slice(0,5).map(p=>p.name).join(', ')}${noIg.length>5?'…':''}`);
}

/* ---------- 6. legal + safety invariants (must never regress) ----------
   Scoped to the page(s) that actually carry this content — a multi-page
   site shouldn't require the s.166 notice to appear on every page, but
   it must never disappear from the ticket desk specifically, and the
   disclaimer must survive on every page's own footer. */
if (!pages['tickets.html']) {
  flag('CRITICAL', 'compliance', 'tickets.html is missing entirely — the ticket-resale legal notice has nowhere to live.');
} else {
  const tk = pages['tickets.html'];
  const mustContainTickets = [
    ['section 166', 'The ticket-resale legal notice is missing from tickets.html.'],
    ['arsenal.com/ticket-exchange', 'The official Ticket Exchange link is missing from tickets.html.']
  ];
  for (const [needle, msg] of mustContainTickets) {
    if (!tk.includes(needle)) flag('CRITICAL', 'compliance', msg);
  }
}
/* 404.html is an intentionally standalone, self-styled error page —
   no shared chrome, no footer, by design. Every real content page
   still must carry the disclaimer. */
const contentPages = Object.entries(pages).filter(([name]) => name !== '404.html');
for (const [name, html] of contentPages) {
  if (!html.includes('Not affiliated with')) {
    flag('CRITICAL', 'compliance', `The unofficial-site disclaimer is missing from ${name}'s footer.`);
  }
}
const mustNotContain = [
  ['id="ticket-listings"', 'A ticket listings feature has appeared. This is a criminal offence under s.166 CJPOA 1994. Remove it.'],
  ['localStorage.getItem(\'nn-tickets', 'Ticket storage detected. Remove it.']
];
for (const [name, html] of Object.entries(pages)) {
  for (const [needle, msg] of mustNotContain) {
    if (html.includes(needle)) flag('CRITICAL', 'compliance', `${msg} (found in ${name})`);
  }
}

/* ---------- 7. front-end hygiene ---------- */
/* esc() is DEFINED in app.js but CALLED from whichever page's inline
   script needs it (crew board, live wire) — search everywhere it
   could legitimately be used, not just where it's declared. Note the
   definition itself (`const esc = s => ...`) never contains the
   substring "esc(", so any hit here is a real call site. */
if (!appJs.includes('const esc =')) {
  flag('BUG', 'frontend', 'No HTML-escaping helper defined in app.js.');
} else if (![appJs, ...Object.values(pages)].some(src => src.includes('esc('))) {
  flag('BUG', 'frontend', 'esc() is defined but never called anywhere — check nothing renders untrusted strings unescaped instead.');
}
if (!appJs.includes('hourCycle')) {
  flag('BUG', 'frontend', 'Using hour12:false instead of hourCycle:"h23" can render midnight as 24:00 on some engines. (expected in app.js)');
}
for (const [name, html] of contentPages) {
  if (name === 'index.html' && !html.includes('og:site_name')) {
    flag('BUG', 'frontend', 'No Open Graph tags on the hub — links will look bare when shared.');
  }
  if (!html.includes('rel="icon"')) flag('BUG', 'frontend', `${name} has no favicon; browsers will request /favicon.ico and 404.`);
  if (!html.includes('<link rel="stylesheet" href="styles.css">')) {
    flag('BUG', 'frontend', `${name} doesn't link styles.css — it will render unstyled.`);
  }
  if (!html.includes('<script src="app.js">')) {
    flag('BUG', 'frontend', `${name} doesn't load app.js — shared data/theme/motion will be missing.`);
  }
}

/* ---------- 7b. mobile / iOS invariants (checked once, shared CSS) ---------- */
const mobile = [
  ['env(safe-area', 'No safe-area insets — content will sit under the notch or home indicator.'],
  ['-webkit-tap-highlight', 'No tap-highlight override; iOS will flash grey on every tap.'],
  ['overflow-x:hidden', 'No horizontal-overflow guard on body.'],
  ['@media (max-width:640px)', 'No phone breakpoint.'],
  ['orientation:landscape', 'No landscape handling — the hero board fills a rotated phone.']
];
for (const [needle, msg] of mobile) {
  if (!cssFile.includes(needle)) flag('BUG', 'mobile', msg);
}

/* Any input under 16px makes iOS Safari zoom the page on focus. */
const inputRules = [...cssFile.matchAll(/(input|select|textarea)[^{}]*\{[^}]*font-size:\s*(\d+(?:\.\d+)?)px/g)];
for (const m of inputRules) {
  if (Number(m[2]) < 16) flag('BUG', 'mobile', `A form control is set to ${m[2]}px — iOS Safari will zoom on focus. Minimum is 16px.`);
}

/* SVG labels shrink with the viewBox. Check they survive a 358px screen. */
for (const [name, html] of Object.entries(pages)) {
  for (const svg of html.matchAll(/viewBox="0 0 (\d+) \d+"[\s\S]{0,2600}?<\/svg>/g)) {
    const vbWidth = Number(svg[1]);
    const sizes = [...svg[0].matchAll(/font-size[:=]"?(\d+(?:\.\d+)?)/g)].map(x => Number(x[1]));
    for (const px of sizes) {
      const rendered = px * (358 / vbWidth);
      if (rendered < 9) flag('BUG', 'mobile', `${name}: SVG text at ${px}px in a ${vbWidth}-wide viewBox renders at ${rendered.toFixed(1)}px on a phone. Unreadable.`);
    }
  }
}

/* ---------- 7c. per-page id hygiene ----------
   Duplicate ids are only a real bug WITHIN one page — every page
   legitimately reuses ids like #theme-toggle or #scroll-progress
   since each is its own separate document. Missing-id references are
   checked against that same page's ids plus whatever app.js expects
   universally (guarded lookups there are fine if the element is
   absent on a given page). */
for (const [name, html] of Object.entries(pages)) {
  const ids = [...html.matchAll(/id="([\w-]+)"/g)].map(m => m[1]);
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dupes.length) flag('BUG', 'frontend', `${name}: duplicate element id(s): ${[...new Set(dupes)].join(', ')}`);

  const inlineScript = (html.match(/<script>([\s\S]*?)<\/script>/) || [, ''])[1];
  const used = new Set([...inlineScript.matchAll(/\$\('#([\w-]+)'\)/g)].map(m => m[1]));
  const missing = [...used].filter(id => !ids.includes(id));
  if (missing.length) flag('BUG', 'frontend', `${name}: inline script references missing id(s): ${missing.join(', ')}`);
}

/* ---------- 7d. brace balance ---------- */
for (const [label, src] of [['styles.css', cssFile], ['app.js', appJs]]) {
  if ((src.match(/{/g) || []).length !== (src.match(/}/g) || []).length) {
    flag('BUG', 'frontend', `Unbalanced braces in ${label}.`);
  }
}
if (appJs.includes('function') ) {
  // app.js is real JS (unlike the old inline <script>), so let node's own
  // parser be the authority on whether it's syntactically valid at all.
  try { new Function(appJs); }
  catch (e) { flag('BUG', 'frontend', `app.js does not parse as JavaScript: ${e.message}`); }
}

/* ---------- 8. size budget ----------
   The site is now split into a shared stylesheet/script plus one page
   per section, specifically so no single file has to carry everything.
   Budget each kind of file on its own terms instead of one combined cap. */
const kb = buf => Math.round(Buffer.byteLength(buf) / 1024);
flag('INFO', 'perf', `styles.css is ${kb(cssFile)}KB, app.js is ${kb(appJs)}KB.`);
if (kb(cssFile) > 80) flag('BUG', 'perf', `styles.css is ${kb(cssFile)}KB — getting big for a single stylesheet.`);
if (kb(appJs) > 60) flag('BUG', 'perf', `app.js is ${kb(appJs)}KB — getting big for shared data+logic.`);
for (const [name, html] of Object.entries(pages)) {
  const pkb = kb(html);
  if (pkb > 40) flag('BUG', 'perf', `${name} is ${pkb}KB of markup — that's a lot for one page now that styles/data are shared.`);
}

/* ---------- report ---------- */
const order = { CRITICAL: 0, BUG: 1, DATA: 2, TODO: 3, ERROR: 1, INFO: 9 };
findings.sort((x, y) => order[x.level] - order[y.level]);

const icon = { CRITICAL: '🔴', BUG: '🟠', DATA: '🟡', TODO: '🔵', ERROR: '🟠', INFO: '⚪' };
console.log(`\n# Weekly audit — ${now.toISOString().slice(0, 10)}\n`);
for (const f of findings) {
  console.log(`${icon[f.level]} **${f.level}** \`${f.area}\` — ${f.msg}`);
}

const actionable = findings.filter(f => f.level !== 'INFO');
console.log(`\n${actionable.length} item(s) need attention.\n`);
process.exit(actionable.length ? 1 : 0);

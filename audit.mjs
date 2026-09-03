#!/usr/bin/env node
/* ============================================================
   The Non-Negotiables — weekly self-audit
   ------------------------------------------------------------
   Reads index.html, extracts the data blocks, and reports
   anything that has gone stale or looks wrong.

   Run locally:   node audit.mjs
   Run in CI:     see .github/workflows/weekly-audit.yml

   Exit code 1 if anything is flagged, so CI can open an issue.
   ============================================================ */

import { readFile } from 'node:fs/promises';

const SRC = process.argv[2] || 'index.html';
const html = await readFile(SRC, 'utf8');
const findings = [];
const flag = (level, area, msg) => findings.push({ level, area, msg });

/* ---------- extract the data arrays without executing the page ---------- */
function block(name) {
  const m = html.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\];)`));
  return m ? m[1] : null;
}
const evalArr = (src, label) => {
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

/* ---------- 3. Brisbane conversion sanity ---------- */
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

/* ---------- 6. legal + safety invariants (must never regress) ---------- */
const mustContain = [
  ['section 166', 'The ticket-resale legal notice is missing.'],
  ['arsenal.com/ticket-exchange', 'The official Ticket Exchange link is missing.'],
  ['Not affiliated with', 'The unofficial-site disclaimer is missing.']
];
for (const [needle, msg] of mustContain) {
  if (!html.includes(needle)) flag('CRITICAL', 'compliance', msg);
}
const mustNotContain = [
  ['id="ticket-listings"', 'A ticket listings feature has appeared. This is a criminal offence under s.166 CJPOA 1994. Remove it.'],
  ['localStorage.getItem(\'nn-tickets', 'Ticket storage detected. Remove it.']
];
for (const [needle, msg] of mustNotContain) {
  if (html.includes(needle)) flag('CRITICAL', 'compliance', msg);
}

/* ---------- 7. front-end hygiene ---------- */
const hygiene = [
  ['esc(', 'No HTML-escaping helper in use — any user-supplied string rendered via innerHTML is an XSS risk.'],
  ['scroll-margin', 'Sections lack scroll-margin-top; the sticky nav will cover headings on anchor jumps.'],
  ['hourCycle', 'Using hour12:false instead of hourCycle:"h23" can render midnight as 24:00 on some engines.'],
  ['og:title', 'No Open Graph tags — links will look bare when shared.'],
  ['rel="icon"', 'No favicon; browsers will request /favicon.ico and 404.']
];
for (const [needle, msg] of hygiene) {
  if (!html.includes(needle)) flag('BUG', 'frontend', msg);
}

/* ---------- 7b. mobile / iOS invariants ---------- */
const cssBlock = (html.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
const mobile = [
  ['env(safe-area', 'No safe-area insets — content will sit under the notch or home indicator.'],
  ['-webkit-tap-highlight', 'No tap-highlight override; iOS will flash grey on every tap.'],
  ['overflow-x:hidden', 'No horizontal-overflow guard on body.'],
  ['@media (max-width:640px)', 'No phone breakpoint.'],
  ['orientation:landscape', 'No landscape handling — the hero board fills a rotated phone.']
];
for (const [needle, msg] of mobile) {
  if (!cssBlock.includes(needle) && !html.includes(needle)) flag('BUG', 'mobile', msg);
}

/* Any input under 16px makes iOS Safari zoom the page on focus. */
const inputRules = [...cssBlock.matchAll(/(input|select|textarea)[^{}]*\{[^}]*font-size:\s*(\d+(?:\.\d+)?)px/g)];
for (const m of inputRules) {
  if (Number(m[2]) < 16) flag('BUG', 'mobile', `A form control is set to ${m[2]}px — iOS Safari will zoom on focus. Minimum is 16px.`);
}

/* SVG labels shrink with the viewBox. Check they survive a 358px screen. */
for (const svg of html.matchAll(/viewBox="0 0 (\d+) \d+"[\s\S]{0,2600}?<\/svg>/g)) {
  const vbWidth = Number(svg[1]);
  const sizes = [...svg[0].matchAll(/font-size[:=]"?(\d+(?:\.\d+)?)/g)].map(x => Number(x[1]));
  for (const px of sizes) {
    const rendered = px * (358 / vbWidth);
    if (rendered < 9) flag('BUG', 'mobile', `SVG text at ${px}px in a ${vbWidth}-wide viewBox renders at ${rendered.toFixed(1)}px on a phone. Unreadable.`);
  }
}

const ids = [...html.matchAll(/id="([\w-]+)"/g)].map(m => m[1]);
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
if (dupes.length) flag('BUG', 'frontend', `Duplicate element id(s): ${[...new Set(dupes)].join(', ')}`);

const used = new Set([...html.matchAll(/\$\('#([\w-]+)'\)/g)].map(m => m[1]));
const missing = [...used].filter(id => !ids.includes(id));
if (missing.length) flag('BUG', 'frontend', `Script references missing id(s): ${missing.join(', ')}`);

const css = (html.match(/<style>([\s\S]*?)<\/style>/) || [,''])[1];
if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) {
  flag('BUG', 'frontend', 'Unbalanced braces in the stylesheet.');
}

/* ---------- 8. size budget ---------- */
const kb = Math.round(Buffer.byteLength(html) / 1024);
flag('INFO', 'perf', `index.html is ${kb}KB.`);
if (kb > 150) flag('BUG', 'perf', `${kb}KB in one file is past the point where it should be split into separate CSS/JS/data files.`);

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

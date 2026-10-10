#!/usr/bin/env node
/* ============================================================
   The Non-Negotiables — weekly email digest builder
   ------------------------------------------------------------
   Reads the same data arrays the site renders (FIXTURES, CL, CLUBS,
   NEWS, COLUMNS) and writes this week's issue as Markdown to
   digest/issue-YYYY-MM-DD.md, ready to paste into the newsletter
   service. Nothing is sent from here and no key is involved.

   Run:  node digest.mjs
         node digest.mjs --date 2026-10-03 --days 10 --news-days 8

   The issue is a draft. It leaves a marked slot at the top for two
   or three lines in the author's own words: that part is the point
   of an email people choose to read, so it is never auto-filled.
   ============================================================ */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const arg = n => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : null; };
const now = arg('date') ? new Date(arg('date') + 'T09:00:00Z') : new Date();
const DAYS = +(arg('days') || 10), NEWS_DAYS = +(arg('news-days') || 8);
const SITE = 'https://thenonnegotiablog.com';
const UK = 'Europe/London';
const ZONES = [['UK', UK], ['Brisbane', 'Australia/Brisbane'], ['Sydney', 'Australia/Sydney'],
  ['Perth', 'Australia/Perth'], ['Auckland', 'Pacific/Auckland'], ['Kuala Lumpur', 'Asia/Kuala_Lumpur']];

const appJs = await readFile(join(DIR, 'app.js'), 'utf8');
const newsJs = await readFile(join(DIR, 'news-data.js'), 'utf8');
const columnsJs = await readFile(join(DIR, 'columns.js'), 'utf8');
const grab = (src, name, open, close) => {
  const m = src.match(new RegExp(`const ${name} = (\\${open}[\\s\\S]*?\\n\\${close};)`));
  if (!m) throw new Error(`could not find ${name}`);
  return eval('(' + m[1].replace(/;$/, '') + ')');
};
const FIXTURES = grab(appJs, 'FIXTURES', '[', ']');
const CL = grab(appJs, 'CL', '[', ']');
const CLUBS = grab(appJs, 'CLUBS', '{', '}');
const NEWS = grab(newsJs, 'NEWS', '[', ']');
const COLUMNS = grab(columnsJs, 'COLUMNS', '[', ']');

const f = (d, tz, o) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...o }).format(d);
const t24 = (d, tz) => f(d, tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dayShort = (d, tz) => f(d, tz, { weekday: 'short', day: 'numeric', month: 'short' });
const ymd = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const hourIn = (d, tz) => parseInt(f(d, tz, { hour: '2-digit', hourCycle: 'h23' }), 10);
const brutalBne = d => { const h = hourIn(d, 'Australia/Brisbane'); return h >= 1 && h < 6; };

const zoneLine = d => ZONES.map(([name, tz]) => {
  const shift = ymd(d, tz) === ymd(d, UK) ? '' : (ymd(d, tz) > ymd(d, UK) ? ' (next day)' : ' (day before)');
  return `${t24(d, tz)} ${name}${shift}`;
}).join(' · ');

/* ---------- the week ahead ---------- */
const all = [];
FIXTURES.forEach(x => {
  const c = CLUBS[x.opp];
  all.push({ d: new Date(x.ko), played: !!x.result, short: c.name,
    title: x.v === 'H' ? `Arsenal v ${c.name}` : `${c.name} v Arsenal`, sub: `Premier League, matchweek ${x.n}` });
});
CL.forEach(m => all.push({ d: new Date(m.ko), played: !!m.result, short: m.name,
  title: m.v === 'H' ? `Arsenal v ${m.name}` : `${m.name} v Arsenal`, sub: `Champions League, matchday ${m.md}` }));
const upcoming = all.filter(e => !e.played && e.d >= now).sort((a, b) => a.d - b.d);
let ahead = upcoming.filter(e => e.d <= new Date(now.getTime() + DAYS * 86400000));
if (!ahead.length) ahead = upcoming.slice(0, 2);

/* ---------- the week just gone ---------- */
const cutoff = now.getTime() - NEWS_DAYS * 86400000;
let recent = NEWS.filter(n => new Date(n.date + 'T12:00:00Z').getTime() >= cutoff && /^https:\/\//.test(n.url)).slice(0, 6);
if (!recent.length) recent = NEWS.slice(0, 3);
const firstSentence = s => (s.match(/^.*?[.!?](?=\s|$)/) || [s])[0];

const col = COLUMNS[0];
const lead = col && (col.standfirst || col.paras[0]);
const colLead = lead && (lead.length > 260 ? lead.slice(0, 257).replace(/\s+\S*$/, '') + '…' : lead);

/* ---------- assemble ---------- */
const subjectBits = ahead.slice(0, 2).map(e => `${e.short} (${t24(e.d, 'Australia/Brisbane')} Brisbane)`);
const subject = `Arsenal this week: ${subjectBits.join(', ')}`;
const hot = ahead.filter(e => brutalBne(e.d)).length;

const md = [
  `<!-- Subject: ${subject} -->`,
  '',
  '**[WRITE TWO OR THREE LINES HERE IN YOUR OWN WORDS ABOUT WHAT YOU ACTUALLY THOUGHT THIS WEEK, THEN DELETE THIS LINE]**',
  '',
  '## On the clock',
  '',
  ...ahead.flatMap(e => [
    `- **${dayShort(e.d, UK)} · ${e.title}** — ${e.sub}${brutalBne(e.d) ? ' (middle of the night in Brisbane)' : ''}`,
    `  ${zoneLine(e.d)}`
  ]),
  '',
  `${ahead.length} kick-off${ahead.length === 1 ? '' : 's'} in the next ${DAYS} days${hot ? `, ${hot} of them inside the 1am–6am window in Brisbane` : ''}. Put every one in your phone with an alarm: [season calendar](${SITE}/timetable.html). Times are shown in your own timezone there, or pick another city on [the week page](${SITE}/digest.html).`,
  '',
  '## In the news',
  '',
  ...recent.map(n => `- **${n.headline}** — ${firstSentence(n.summary)} [${n.source}](${n.url})`),
  '',
  `More on [the news page](${SITE}/news.html).`,
  '',
  ...(col ? [
    '## From the blog',
    '',
    `**${col.title}** — ${colLead} [Read it](${SITE}/programme.html)`,
    ''
  ] : []),
  '---',
  '',
  `You're receiving this because you subscribed at [thenonnegotiablog.com](${SITE}). An unofficial fan project, not affiliated with Arsenal Football Club.`,
  ''
].join('\n');

const outDir = join(DIR, 'digest');
await mkdir(outDir, { recursive: true });
const file = join(outDir, `issue-${ymd(now, UK)}.md`);
await writeFile(file, md, 'utf8');
console.log(`Subject: ${subject}`);
console.log(`Wrote ${file}`);
console.log(`${ahead.length} fixtures · ${recent.length} news items · column: ${col.title}`);

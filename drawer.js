/* ============================================================
   drawer.js — the fixture dossier: index.html (hero "open the
   dossier") and timetable.html (row click) only. Split out of app.js
   for the same reason as columns.js/news-data.js — every other page
   loaded this and never used a byte of it. Depends on app.js globals
   ($, esc, t24, dayLong, isoDate, addDays, enc, isBrutal, LDN, BNE,
   CLUBS, FIXTURES, DEMAND, DEMAND_TEXT, getWireItems), so it must load
   after app.js on both pages.
   ============================================================ */

/* ============================================================
   AWAY-DAY LINKS (keyless, date pre-filled)
   ============================================================ */
function awayLinks(club, koDate){
  const inD = isoDate(addDays(koDate,-1), BNE);
  const outD = isoDate(addDays(koDate,1), BNE);
  const place = club.stadium + ' ' + club.city;
  return [
    {b:'Hotels near the ground', s:'Booking.com · dates set', u:`https://www.booking.com/searchresults.html?ss=${enc(place)}&checkin=${inD}&checkout=${outD}&group_adults=1&no_rooms=1`},
    {b:'Compare nightly rates', s:'Google Hotels', u:`https://www.google.com/search?q=${enc('hotels near ' + place)}&hl=en-GB`},
    {b:'Gigs that weekend', s:'Songkick · ' + club.city, u:`https://www.songkick.com/search?query=${enc(club.city)}&type=locations`},
    {b:'What’s on in town', s:'Skiddle · ' + club.city, u:`https://www.skiddle.com/whats-on/${enc(club.city)}/`},
    {b:'Everything else on', s:'Eventbrite', u:`https://www.eventbrite.co.uk/d/united-kingdom--${enc(club.city.toLowerCase())}/events/`},
    {b:'Getting there', s:'Maps · ' + club.station, u:`https://www.google.com/maps/search/?api=1&query=${enc(place)}`},
    {b:'Trains', s:'Trainline', u:'https://www.thetrainline.com/'},
    {b:'Official tickets', s:'Arsenal.com', u:'https://www.arsenal.com/tickets'}
  ];
}

/* ============================================================
   AWAY-DAY WEATHER — Open-Meteo, no key needed. A real forecast only
   exists ~16 days out; beyond that this falls back to a rough UK
   seasonal norm by month, framed as "typically", never as today's
   actual forecast, so it's never wrong even six months out.
   ============================================================ */
const UK_SEASON = {
  1:'2–7°C, often wet — proper coat weather',2:'2–8°C, still cold, occasional sleet',
  3:'4–11°C, improving, pack a layer',4:'6–13°C, mild with showers likely',
  5:'9–17°C, genuinely pleasant most days',6:'12–20°C, a jacket for evenings is enough',
  7:'14–22°C, as warm as England gets',8:'14–21°C, decent, light layer for kick-off',
  9:'11–19°C, cooling fast — layers',10:'8–15°C, proper autumn, bring a coat',
  11:'4–10°C, cold and wet, this is where it turns',12:'2–8°C, the classic miserable away day'
};
function weatherLabel(code){
  if(code === 0) return 'Clear';
  if(code <= 3) return 'Cloudy';
  if(code <= 48) return 'Foggy';
  if(code <= 67) return 'Rain';
  if(code <= 77) return 'Snow';
  if(code <= 82) return 'Showers';
  return 'Storms';
}
async function matchWeather(club, koDate){
  const iso = isoDate(koDate, LDN);
  const daysOut = Math.floor((koDate - Date.now()) / 86400000);
  if(daysOut < 0 || daysOut > 15){
    return {live:false, text:`Typically ${UK_SEASON[koDate.getUTCMonth() + 1]} in ${club.city} this time of year — no live forecast yet.`};
  }
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${club.lat}&longitude=${club.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto&start_date=${iso}&end_date=${iso}`;
    const r = await fetch(url);
    if(!r.ok) throw new Error(r.status);
    const j = await r.json();
    if(!j.daily || !j.daily.time || !j.daily.time.length) throw new Error('empty');
    const max = Math.round(j.daily.temperature_2m_max[0]), min = Math.round(j.daily.temperature_2m_min[0]);
    const rain = j.daily.precipitation_probability_max[0];
    const label = weatherLabel(j.daily.weathercode[0]);
    return {live:true, text:`${label}, ${min}–${max}°C, ${rain}% chance of rain in ${club.city} on matchday.`};
  }catch(e){
    return {live:false, text:`Typically ${UK_SEASON[koDate.getUTCMonth() + 1]} in ${club.city} this time of year — forecast unavailable right now.`};
  }
}

/* ============================================================
   ADD TO CALENDAR — a real .ics file, built client-side, no server
   round-trip. icsEsc only needs to cover , ; \n since every field is
   this site's own controlled data, never visitor input.
   ============================================================ */
const icsEsc = s => String(s).replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
function downloadFixtureICS(f, c, ground, koDate){
  const stamp = iso => iso.replace(/[-:]/g,'').split('.')[0] + 'Z';
  const start = koDate, end = new Date(koDate.getTime() + 2*3600*1000);
  const title = f.v === 'H' ? `Arsenal v ${c.name}` : `${c.name} v Arsenal`;
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Non-Negotiables//EN','CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:nn-mw${f.n}@thenonnegotiablog.com`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(start.toISOString())}`,
    `DTEND:${stamp(end.toISOString())}`,
    `SUMMARY:${icsEsc(title)}`,
    `LOCATION:${icsEsc(ground.stadium + ', ' + ground.city)}`,
    `DESCRIPTION:${icsEsc(`Kick-off ${t24(start,LDN)} UK · ${t24(start,BNE)} Brisbane.`)}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `arsenal-${f.opp}-mw${f.n}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Native share sheet on mobile, clipboard + a quick button-text swap
   as the fallback everywhere else — no toast system to build for one
   button. */
async function shareFixture(title, url){
  if(navigator.share){
    try{ await navigator.share({title, url}); return true; }catch(e){ return false; }
  }
  try{ await navigator.clipboard.writeText(url); return 'copied'; }catch(e){ return false; }
}

/* ============================================================
   DRAWER — shared because both index.html (hero "open the dossier")
   and timetable.html (row click) use it. Guarded: pages without the
   drawer markup (#drawer/#scrim) just skip this whole block.
   ============================================================ */
const drawer = $('#drawer'), scrim = $('#scrim');
let lastFocus = null;

/* Filters the shared wire down to whichever opponent's drawer is open
   (falls back to the general feed if fewer than 2 items name-match —
   a fixture months out won't have opponent-specific coverage yet, and
   an empty card reads as broken, not "nothing new"). `token` guards
   against a slow response landing after the visitor closed this
   drawer or opened a different fixture's. */
let drawerToken = 0;
async function loadDrawerNews(token, opponentName){
  const items = await getWireItems();
  if(token !== drawerToken) return;
  const short = opponentName.split(' ')[0];
  let relevant = items.filter(i => new RegExp(short,'i').test(i.t));
  if(relevant.length < 2) relevant = items;
  relevant = relevant.slice(0,3);
  const el = $('#d-news-body');
  if(!el) return;
  el.innerHTML = relevant.length ? relevant.map(i => `
    <a href="${esc(i.u)}" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;margin-bottom:10px">
      <p style="margin:0;font-size:14px;font-weight:600;color:var(--ink);line-height:1.4">${esc(i.t)}</p>
      <p style="margin:2px 0 0;font-family:var(--mono);font-size:11px;color:var(--mute);text-transform:uppercase">${esc(i.s)}${i.d ? ' · ' + i.d : ''}</p>
    </a>`).join('') : `<p class="note" style="margin:0">Nothing fresh on the wire right now — the full feed is on the <a href="news.html" style="color:var(--red)">News page</a>.</p>`;
}

function openDrawer(i){
  if(!drawer) return;
  const f = FIXTURES[i], c = CLUBS[f.opp], d = new Date(f.ko);
  const home = f.v === 'H';
  const ground = home ? CLUBS.ars : c;
  const dem = DEMAND_TEXT[DEMAND[f.opp] || 2];
  const myToken = ++drawerToken;

  $('#d-eyebrow').textContent = `Matchweek ${f.n} · ${home ? 'Home' : 'Away'}`;
  $('#d-body').innerHTML = `
    <p class="dsub">${dayLong(d,LDN)} · ${t24(d,LDN)} UK</p>
    <h2 class="dtitle" id="d-title">${home ? 'Arsenal v ' + c.name : c.name + ' v Arsenal'}</h2>

    <div class="dcard">
      <h3>Kick-off, both ends of the world</h3>
      <dl class="kv">
        <dt>London</dt><dd>${t24(d,LDN)} · ${dayLong(d,LDN)}</dd>
        <dt>Brisbane</dt><dd>${t24(d,BNE)} · ${dayLong(d,BNE)} ${isBrutal(d) ? '<span style="color:var(--red)">● brutal window</span>' : ''}</dd>
        ${f.tv ? `<dt>On TV</dt><dd>${f.tv}${f.moved ? ' — moved from the original slot' : ''}</dd>` : ''}
        ${f.checked ? `<dt>Verified</dt><dd style="color:var(--mute);font-size:13px">${f.checked}</dd>` : '<dt>Verified</dt><dd style="color:var(--warn);font-size:13px">Not re-checked — confirm before booking</dd>'}
        ${f.result ? `<dt>Result</dt><dd style="color:var(--ok);font-weight:600">${f.result}${f.scorers ? ' — ' + f.scorers : ''}</dd>` : ''}
      </dl>
      ${f.warn ? `<p style="margin:12px 0 0;padding:10px 12px;background:var(--warn-wash);color:var(--warn);font-size:13.5px;line-height:1.5;border-radius:2px">${f.warn}</p>` : ''}
    </div>

    <div class="dcard">
      <h3>Latest on ${c.name}</h3>
      <div id="d-news-body"><p class="note" style="margin:0;color:var(--mute)">Checking the wire…</p></div>
    </div>

    ${f.reaction ? `<div class="dcard">
      <h3>Post-match reaction</h3>
      ${f.reaction.notes.map(n => `
        <p class="dsub" style="margin:0 0 3px">${n.who}${n.role ? ', ' + n.role : ''}</p>
        <p class="note" style="margin:0 0 4px">“${n.quote}”</p>
        <p style="margin:0 0 16px"><a href="${n.url}" target="_blank" rel="noopener noreferrer" style="font-size:12.5px;color:var(--red);text-decoration:none;font-weight:600">Full reaction at ${n.source} →</a></p>
      `).join('')}
      <p class="sign">Quotes attributed and linked to their original source. Nothing here is reproduced beyond a short excerpt.</p>
    </div>` : ''}

    <div class="dcard">
      <h3>The ground</h3>
      <dl class="kv">
        <dt>Stadium</dt><dd>${ground.stadium}</dd>
        <dt>Where</dt><dd>${ground.area}, ${ground.city}</dd>
        <dt>Capacity</dt><dd>${ground.cap}</dd>
        <dt>Nearest rail</dt><dd>${ground.station}</dd>
      </dl>
    </div>

    ${c.note ? `<div class="dcard">
      <h3>The opponent</h3>
      ${c.last ? `<p class="dsub" style="margin:-4px 0 10px">Last season: ${c.last}</p>` : ''}
      <p class="note">${c.note}</p>
      <p class="sign">Programme note · The Non-Negotiables</p>
    </div>` : ''}

    <div class="dcard">
      <h3>Tickets</h3>
      <p style="margin:0 0 10px"><span class="badge ${dem.cls}">${dem.lbl}</span></p>
      <p style="font-size:14.5px;color:var(--ink-2);margin:0 0 12px;line-height:1.6">${dem.tier}</p>
      <div class="linkgrid">
        <a class="lnk" href="https://www.arsenal.com/tickets" target="_blank" rel="noopener noreferrer"><b>Buy / ballot</b><span>Arsenal.com · official</span></a>
        <a class="lnk" href="https://www.arsenal.com/ticket-exchange" target="_blank" rel="noopener noreferrer"><b>Ticket Exchange</b><span>The only legal resale</span></a>
      </div>
    </div>

    <div class="stub">
      <h3>${home ? 'Matchday in N5' : 'The away day'}</h3>
      <p class="dsub" style="margin:-4px 0 12px">Dates pre-filled: ${isoDate(addDays(d,-1),BNE)} → ${isoDate(addDays(d,1),BNE)}</p>
      <p id="d-weather" style="font-size:13.5px;color:var(--ink-2);margin:0 0 14px;line-height:1.5">⛅ Checking the forecast…</p>
      <div class="linkgrid">
        ${awayLinks(ground,d).map(l => `<a class="lnk" href="${l.u}" target="_blank" rel="noopener noreferrer"><b>${l.b}</b><span>${l.s}</span></a>`).join('')}
      </div>
      <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
        <button class="btn btn--line" id="d-ics" type="button" style="padding:9px 16px;font-size:12px">Add to calendar</button>
        <button class="btn btn--line" id="d-share" type="button" style="padding:9px 16px;font-size:12px">Share this away day</button>
      </div>
    </div>`;

  loadDrawerNews(myToken, c.name);

  matchWeather(ground, d).then(w => {
    if(myToken !== drawerToken) return;
    const el = $('#d-weather');
    if(el) el.textContent = (w.live ? '☀️ ' : '📅 ') + w.text;
  });

  $('#d-ics').addEventListener('click', () => downloadFixtureICS(f, c, ground, d));
  $('#d-share').addEventListener('click', async e => {
    /* e.currentTarget is reset to null once the event finishes
       dispatching — capture it before the first await, not after. */
    const btn = e.currentTarget, was = btn.textContent;
    const title = f.v === 'H' ? `Arsenal v ${c.name}` : `${c.name} v Arsenal`;
    const result = await shareFixture(`${title} — The Non-Negotiables`, location.href);
    if(result === 'copied'){
      btn.textContent = 'Link copied!';
      setTimeout(() => { btn.textContent = was; }, 1600);
    }
  });

  /* Stagger the drawer's own cards in just behind the panel's slide-in
     (.3s), rather than having everything appear at once the instant
     the panel arrives. */
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    $('#d-body').querySelectorAll(':scope > .dcard, :scope > .stub').forEach((card,k) => {
      card.classList.add('dcard-in');
      card.style.setProperty('--dd', (180 + k * 70) + 'ms');
    });
  }

  lastFocus = document.activeElement;
  drawer.classList.add('is-open'); scrim.classList.add('is-open');
  drawer.setAttribute('aria-hidden','false');
  $('#d-close').focus();
  document.body.style.overflow = 'hidden';
}
function closeDrawer(){
  drawer.classList.remove('is-open'); scrim.classList.remove('is-open');
  drawer.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  if(lastFocus) lastFocus.focus();
}
if(drawer){
  $('#d-close').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      if(drawer.classList.contains('is-open')) closeDrawer();
      return;
    }
    /* Keep Tab inside the drawer while it's open */
    if(e.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
    const f = drawer.querySelectorAll('a[href], button:not([disabled])');
    if(!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
}

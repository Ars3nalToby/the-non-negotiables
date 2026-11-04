/* ============================================================
   SITE SOUNDTRACK — seven original tracks in assets/audio, played
   as one playlist, controlled from a "Soundtrack" pill in the
   masthead of every page. Loaded by app.js (one line), so no page
   needs its own <script> tag.

   Rules: off until the visitor says yes (browsers block sound before
   a tap anyway). A first-time visitor gets ONE small "want the
   soundtrack?" card, a few seconds in; either answer is remembered
   (localStorage nn-sound: '1' on, '0' off) and the card never comes
   back. With it on, the track and position carry over between pages
   (sessionStorage nn-sound-pos). If a new page isn't allowed to start
   sound by itself, the pill pulses "Tap to resume" and the first tap
   or key press anywhere picks it straight back up.
   Pauses with the tab hidden, and while the factory's own sound is on.
   Nothing is fetched until the visitor actually turns it on.
   ============================================================ */
(function(){
  if (window.NN_SOUND || /[?&]export=1/.test(location.search)) return;
  /* [file, name, mood, gain]. gain evens out loudness: the two original
     anthems are mastered ~2 dB hotter than the rest, so they play at 0.8.
     All seven are original (the five newer ones are composed in code; the
     recipe lives in assets/audio/README.md). */
  const TRACKS = [
    ['assets/audio/dawn-on-the-hallowed-turf.mp3', 'Dawn on the Hallowed Turf', 'Anthem', .8],
    ['assets/audio/crown-of-the-pitch.mp3', 'Crown of the Pitch', 'Anthem', .8],
    ['assets/audio/red-dawn.mp3', 'Red Dawn', 'Synthwave', 1],
    ['assets/audio/matchday-stomp.mp3', 'Matchday Stomp', 'Terrace', 1],
    ['assets/audio/clock-end.mp3', 'Clock End', 'Cinematic', 1],
    ['assets/audio/north-bank-lofi.mp3', 'North Bank Lo-fi', 'Lo-fi', 1],
    ['assets/audio/kettle-4am.mp3', '4am Kettle', 'Ambient', 1]
  ];
  const VOL = .55;
  const get = (s, k) => { try { return s.getItem(k); } catch(e) { return null; } };
  const put = (s, k, v) => { try { s.setItem(k, v); } catch(e) {} };
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = document.createElement('style');
  css.textContent = `.snd{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px 0 12px;border-radius:999px;border:1px solid var(--card-border);background:var(--card);color:var(--ink);font:700 12.5px var(--sans);letter-spacing:.03em;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,color .15s}
.snd:hover{border-color:var(--red)}
.snd:focus-visible{outline:2px solid var(--red);outline-offset:2px}
.snd__m{display:none}
.snd__st{font:600 10.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
.snd__eq{display:inline-flex;align-items:flex-end;gap:2px;height:14px}
.snd__eq i{width:3px;height:4px;border-radius:1px;background:currentColor;opacity:.75}
.snd[aria-pressed="true"]{background:var(--red);border-color:var(--red);color:#fff}
.snd[aria-pressed="true"] .snd__st{color:rgba(255,255,255,.8)}
.snd[aria-pressed="true"] .snd__eq i{opacity:1;animation:sndEq .9s ease-in-out infinite alternate}
.snd__eq i:nth-child(2){animation-delay:-.3s!important}.snd__eq i:nth-child(3){animation-delay:-.6s!important}.snd__eq i:nth-child(4){animation-delay:-.15s!important}
@keyframes sndEq{0%{height:3px}100%{height:14px}}
.snd.is-waiting{animation:sndPulse 1.6s ease-in-out infinite}
@keyframes sndPulse{0%,100%{box-shadow:0 0 0 0 rgba(173,138,60,.55)}50%{box-shadow:0 0 0 7px rgba(173,138,60,0)}}
.snd-ask{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:60;max-width:330px;background:var(--board-bg);color:#fff;border-left:4px solid var(--red);padding:16px 16px 14px;box-shadow:0 18px 40px -10px rgba(5,10,20,.55);font:400 14.5px/1.45 var(--sans);animation:sndIn .35s ease both}
.snd-ask b{display:block;font-weight:800;font-size:15.5px;margin-bottom:3px}
.snd-ask p{margin:0 0 12px;color:rgba(255,255,255,.75)}
.snd-ask div{display:flex;gap:8px}
.snd-ask button{min-height:40px;padding:0 14px;border-radius:2px;font:700 13px var(--sans);cursor:pointer;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff}
.snd-ask button.go{background:var(--red);border-color:var(--red)}
.snd-ask button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}

.snd-grp{position:relative;display:inline-flex;align-items:center;gap:4px}
.snd-pick{width:34px;height:40px;border-radius:999px;border:1px solid var(--card-border);background:var(--card);color:var(--ink);cursor:pointer;display:grid;place-items:center}
.snd-pick:hover{border-color:var(--red)}.snd-pick:focus-visible{outline:2px solid var(--red);outline-offset:2px}
.snd-pick svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;transition:transform .15s}
.snd-pick[aria-expanded="true"] svg{transform:rotate(180deg)}
.snd-menu{position:absolute;top:calc(100% + 8px);right:0;z-index:70;width:290px;background:var(--board-bg);color:#fff;box-shadow:0 18px 40px -10px rgba(5,10,20,.55);border-top:4px solid var(--red);padding:8px 0 6px}
.snd-menu h4{margin:6px 14px 8px;font:600 10.5px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.55)}
.snd-menu ol{list-style:none;margin:0;padding:0}
.snd-menu li button{width:100%;display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:9px 14px;background:none;border:0;color:#fff;text-align:left;cursor:pointer;font:700 14px var(--sans)}
.snd-menu li button:hover,.snd-menu li button:focus-visible{background:rgba(255,255,255,.08);outline:none}
.snd-menu li button[aria-current="true"]{background:rgba(239,1,7,.22);box-shadow:inset 3px 0 0 var(--red)}
.snd-menu li span{font:600 10px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.22);padding:3px 6px}
.snd-menu .nx{display:flex;justify-content:space-between;align-items:center;margin:6px 14px 0;padding-top:8px;border-top:1px solid rgba(255,255,255,.1)}
.snd-menu .nx button{background:var(--red);border:0;color:#fff;font:700 12px var(--sans);letter-spacing:.04em;text-transform:uppercase;padding:8px 12px;cursor:pointer;min-height:36px}
.snd-menu .nx small{font:500 11px var(--mono);color:rgba(255,255,255,.55)}
@media (max-width:640px){.snd-grp{gap:2px}.snd-pick{width:28px}.snd__st{display:none}.snd{padding:0 11px;gap:6px}}
@media (max-width:430px){.snd__m{display:none!important}.snd{padding:0 10px;gap:4px}.snd::before{content:'\\266A';font:700 15px/1 var(--sans)}.snd-pick{width:26px}}
@media (max-width:360px){.snd__eq{display:none}.snd{padding:0 12px}.snd-grp{gap:1px}.mh-right{gap:5px!important}.mh-right .theme{width:36px;height:36px}}
@media (max-width:640px){.snd-menu{position:fixed;left:12px;right:12px;top:auto;bottom:calc(12px + env(safe-area-inset-bottom));width:auto}}
@keyframes sndIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@media (max-width:640px){.snd{padding:0 12px;gap:6px}.snd__lab{display:none}.snd__m{display:inline}.snd-ask{left:12px;right:12px;max-width:none}}
@media (prefers-reduced-motion:reduce){.snd[aria-pressed="true"] .snd__eq i,.snd.is-waiting,.snd-ask{animation:none}.snd[aria-pressed="true"] .snd__eq i:nth-child(odd){height:12px}}`;
  document.head.append(css);

  const host = document.querySelector('.mh-right');
  if (!host) return;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'snd';
  btn.innerHTML = '<span class="snd__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="snd__lab">Soundtrack</span><span class="snd__m">Music</span><span class="snd__st">Off</span>';
  const grp = document.createElement('span'); grp.className = 'snd-grp';
  const pick = document.createElement('button');
  pick.type = 'button'; pick.className = 'snd-pick'; pick.setAttribute('aria-label', 'Choose a track'); pick.setAttribute('aria-haspopup', 'true'); pick.setAttribute('aria-expanded', 'false');
  pick.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  grp.append(btn, pick);
  host.insertBefore(grp, host.querySelector('#theme-toggle'));
  const st = btn.querySelector('.snd__st');

  let audio = null, track = 0, on = false, held = false, fade = 0;
  const saved = (() => { try { return JSON.parse(get(sessionStorage, 'nn-sound-pos') || 'null'); } catch(e) { return null; } })();
  /* Each page has its own track (PAGE_TRACK, by TRACKS index). A listener
     who picks one from the menu locks it in (nn-sound-lock) and keeps it on
     every page; "Auto" in the menu hands control back to the pages. */
  const PAGE_TRACK = {'index':1,'squad':0,'digest':0,'timetable':6,'fanart':6,'europe':4,'ledger':4,
    'news':5,'programme':5,'reading':5,'voices':5,'explainers':2,'transfers':2,'tickets':3,'factory':3,'junior':3};
  const pageKey = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/,'') || 'index';
  const pageTrack = PAGE_TRACK[pageKey] ?? 1;
  const fav = Number(get(localStorage, 'nn-sound-track'));
  let locked = get(localStorage, 'nn-sound-lock') === '1' && !!TRACKS[fav];
  track = locked ? fav : pageTrack;
  const vol = () => VOL * (TRACKS[track][3] || 1);

  function ensure(){
    if (audio) return audio;
    audio = new Audio(); audio.preload = 'auto';
    audio.addEventListener('ended', () => { track = (track + 1) % TRACKS.length; load(0); start().catch(() => {}); });
    load(saved && saved.t === track ? saved.at : 0);   // same track as the last page: carry on
    return audio;
  }
  function load(at){
    audio.src = TRACKS[track][0];
    if (at) audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = at; } catch(e) {} }, {once:true});
  }
  function paint(state){
    btn.classList.toggle('is-waiting', state === 'wait');
    btn.setAttribute('aria-pressed', state === 'on' ? 'true' : 'false');
    st.textContent = state === 'on' ? 'On' : state === 'wait' ? 'Tap to resume' : 'Off';
    btn.setAttribute('aria-label', state === 'on' ? `Soundtrack on: ${TRACKS[track][1]}. Turn off` : 'Turn the site soundtrack on');
    btn.title = state === 'on' ? `Now playing: ${TRACKS[track][1]}` : 'Matchday soundtrack';
    if (menu) drawMenu();
    document.dispatchEvent(new CustomEvent('nn-sound', {detail:{on: state === 'on'}}));
  }
  function start(){
    ensure();
    audio.volume = 0;
    return audio.play().then(() => {
      clearInterval(fade);
      const v = vol();
      fade = setInterval(() => { audio.volume = Math.min(v, audio.volume + v / 20); if (audio.volume >= v) clearInterval(fade); }, 60);
      paint('on');
    });
  }
  function turnOn(){ on = true; put(localStorage, 'nn-sound', '1'); hideAsk(); start().catch(() => paint('wait')); }
  function turnOff(){ on = false; put(localStorage, 'nn-sound', '0'); if (audio) audio.pause(); paint('off'); }
  btn.addEventListener('click', e => { e.stopPropagation(); (on && !btn.classList.contains('is-waiting')) ? turnOff() : turnOn(); });

  /* track menu */
  let menu = null;
  function play(i, auto){
    track = (i + TRACKS.length) % TRACKS.length;
    locked = !auto; put(localStorage, 'nn-sound-lock', locked ? '1' : '0');
    if (!auto) put(localStorage, 'nn-sound-track', String(track));
    if (audio) load(0);
    on = true; put(localStorage, 'nn-sound', '1'); hideAsk();
    start().catch(() => paint('wait'));
  }
  function drawMenu(){
    menu.innerHTML = `<h4>Soundtrack \u00b7 ${TRACKS.length} original tracks</h4><ol>
      <li><button type="button" data-auto aria-current="${!locked && on}">Auto: this page\u2019s track<span>${TRACKS[pageTrack][1]}</span></button></li>${TRACKS.map((t, i) =>
      `<li><button type="button" data-i="${i}" aria-current="${locked && i === track && on}">${t[1]}<span>${t[2]}</span></button></li>`).join('')}</ol>
      <div class="nx"><small>${on ? 'Playing: ' + TRACKS[track][1] : 'Off'}</small><button type="button" data-next>Next track</button></div>`;
  }
  function closeMenu(){ if (menu) { menu.remove(); menu = null; pick.setAttribute('aria-expanded', 'false'); } }
  pick.addEventListener('click', e => {
    e.stopPropagation();
    if (menu) return closeMenu();
    menu = document.createElement('div'); menu.className = 'snd-menu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', 'Choose a track');
    drawMenu(); grp.append(menu); pick.setAttribute('aria-expanded', 'true');
    const cur = menu.querySelector('[aria-current="true"]') || menu.querySelector('li button'); cur && cur.focus();
    menu.addEventListener('click', ev => {
      ev.stopPropagation();
      const b = ev.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-next')) play(track + 1);
      else if (b.hasAttribute('data-auto')) play(pageTrack, true);
      else play(Number(b.dataset.i));
    });
  });
  document.addEventListener('click', e => { if (menu && !grp.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu) { closeMenu(); pick.focus(); } });

  /* resume on the first real interaction if the browser said "not yet" */
  function unlock(){
    if (on && !held && audio && audio.paused) start().catch(() => {});
  }
  ['pointerdown','keydown'].forEach(ev => document.addEventListener(ev, unlock, {capture:true}));

  addEventListener('pagehide', () => { if (audio && on) put(sessionStorage, 'nn-sound-pos', JSON.stringify({t:track, at:audio.currentTime})); });
  document.addEventListener('visibilitychange', () => {
    if (!audio || !on) return;
    if (document.hidden) audio.pause(); else if (!held) audio.play().catch(() => paint('wait'));
  });

  /* the factory has its own generated soundtrack — never play both */
  document.addEventListener('click', e => {
    const f = e.target.closest && e.target.closest('#soundBtn');
    if (!f) return;
    setTimeout(() => {
      held = f.getAttribute('aria-pressed') === 'true';
      if (!audio || !on) return;
      if (held) audio.pause(); else audio.play().catch(() => {});
    }, 0);
  });

  /* first visit: ask once */
  let ask = null;
  function hideAsk(){ if (ask) { ask.remove(); ask = null; } }
  function offerOnce(){
    if (get(localStorage, 'nn-sound') !== null || ask) return;
    ask = document.createElement('div');
    ask.className = 'snd-ask'; ask.setAttribute('role', 'dialog'); ask.setAttribute('aria-label', 'Site soundtrack');
    ask.innerHTML = '<b>This site has a soundtrack.</b><p>Seven original tracks for the 4am kick-off, from terrace stomp to lo-fi. Off unless you want it; the button stays up top, and the arrow next to it picks the mood.</p><div><button type="button" class="go">Play it</button><button type="button" class="no">Not now</button></div>';
    ask.querySelector('.go').addEventListener('click', turnOn);
    ask.querySelector('.no').addEventListener('click', () => { put(localStorage, 'nn-sound', '0'); hideAsk(); btn.focus(); });
    document.body.append(ask);
  }

  window.NN_SOUND = { toggle: () => (on ? turnOff() : turnOn()), isOn: () => on, play, tracks: TRACKS };

  if (get(localStorage, 'nn-sound') === '1') { on = true; start().catch(() => paint('wait')); }
  else { paint('off'); if (!/junior\.html/.test(location.pathname)) setTimeout(offerOnce, 7000); }
})();

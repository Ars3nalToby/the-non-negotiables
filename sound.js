/* ============================================================
   SITE SOUNDTRACK — the two original tracks in assets/audio, played
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
  const TRACKS = [
    ['assets/audio/dawn-on-the-hallowed-turf.mp3', 'Dawn on the Hallowed Turf'],
    ['assets/audio/crown-of-the-pitch.mp3', 'Crown of the Pitch']
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
@keyframes sndIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@media (max-width:640px){.snd{padding:0 12px;gap:6px}.snd__lab{display:none}.snd__m{display:inline}.snd-ask{left:12px;right:12px;max-width:none}}
@media (prefers-reduced-motion:reduce){.snd[aria-pressed="true"] .snd__eq i,.snd.is-waiting,.snd-ask{animation:none}.snd[aria-pressed="true"] .snd__eq i:nth-child(odd){height:12px}}`;
  document.head.append(css);

  const host = document.querySelector('.mh-right');
  if (!host) return;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'snd';
  btn.innerHTML = '<span class="snd__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="snd__lab">Soundtrack</span><span class="snd__m">Music</span><span class="snd__st">Off</span>';
  host.insertBefore(btn, host.querySelector('#theme-toggle'));
  const st = btn.querySelector('.snd__st');

  let audio = null, track = 0, on = false, held = false, fade = 0;
  const saved = (() => { try { return JSON.parse(get(sessionStorage, 'nn-sound-pos') || 'null'); } catch(e) { return null; } })();
  if (saved && TRACKS[saved.t]) track = saved.t;

  function ensure(){
    if (audio) return audio;
    audio = new Audio(); audio.preload = 'auto';
    audio.addEventListener('ended', () => { track = (track + 1) % TRACKS.length; load(0); start(); });
    load(saved && saved.t === track ? saved.at : 0);
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
    document.dispatchEvent(new CustomEvent('nn-sound', {detail:{on: state === 'on'}}));
  }
  function start(){
    ensure();
    audio.volume = 0;
    return audio.play().then(() => {
      clearInterval(fade);
      fade = setInterval(() => { audio.volume = Math.min(VOL, audio.volume + VOL / 20); if (audio.volume >= VOL) clearInterval(fade); }, 60);
      paint('on');
    });
  }
  function turnOn(){ on = true; put(localStorage, 'nn-sound', '1'); hideAsk(); start().catch(() => paint('wait')); }
  function turnOff(){ on = false; put(localStorage, 'nn-sound', '0'); if (audio) audio.pause(); paint('off'); }
  btn.addEventListener('click', e => { e.stopPropagation(); (on && !btn.classList.contains('is-waiting')) ? turnOff() : turnOn(); });

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
    ask.innerHTML = '<b>This site has a soundtrack.</b><p>Two original tracks for the 4am kick-off. Off unless you want it, and the button stays up top on every page.</p><div><button type="button" class="go">Play it</button><button type="button" class="no">Not now</button></div>';
    ask.querySelector('.go').addEventListener('click', turnOn);
    ask.querySelector('.no').addEventListener('click', () => { put(localStorage, 'nn-sound', '0'); hideAsk(); btn.focus(); });
    document.body.append(ask);
  }

  window.NN_SOUND = { toggle: () => (on ? turnOff() : turnOn()), isOn: () => on };

  if (get(localStorage, 'nn-sound') === '1') { on = true; start().catch(() => paint('wait')); }
  else { paint('off'); if (!/junior\.html/.test(location.pathname)) setTimeout(offerOnce, 7000); }
})();

/* ============================================================
   EXPLAINERS — 60-second, story-format match explainers, drawn in
   code (SVG + CSS), not video files. explainers.html only.

   EXPLAINERS is the data: one entry per explainer, newest first.
   Each is a list of beats; a beat is one caption + one scene.
   Captions mark the key word with *asterisks*. Every number in a
   beat must come from a source listed in that entry's `sources` —
   same standard as NEWS and FIXTURES.reaction. If we don't have a
   real shot map, we don't draw one: the pitch scene shows counts
   (a row of balls), never invented shot locations.

   Scene types: note (notebook), board (tactics whiteboard — always
   labelled as an illustration), pitch (ball counts + big counter),
   poss (possession bar), ft (full-time board), end (end card).

   Arsenal player numbers come from SQUAD (app.js) at render time,
   so a squad-number change never needs an edit here.
   ============================================================ */
const EXPLAINERS = [
  {
    id: 'mw9-liv', fixture: 9, date: '2026-11-01',
    title: 'How Arsenal won at Anfield with 43% of the ball',
    kicker: 'Liverpool 0–1 Arsenal · Premier League',
    standfirst: 'One goal, sixteen minutes in, and then seventy-odd minutes of standing in the way. The first league win at Anfield since 2012, explained in about a minute.',
    points: [
      'Havertz scored on 16 minutes: Rice overlapped Madueke on the right, Madueke slid it low across, Havertz was alone at the back post.',
      'Liverpool had no shots before the goal and 18 by full time. Nine were blocked. One was on target.',
      'Wirtz hit the woodwork from a free kick. Raya saved the only effort on target, a late Muñoz header.',
      'Arsenal made 36 clearances to Liverpool’s 21 and had 43% of the ball. It was not pretty. It did not need to be.'
    ],
    sources: [
      ['ESPN team stats', 'https://www.espn.com/soccer/team-stats/_/gameId/401879246/league/eng.1'],
      ['Liverpool FC match report', 'https://www.liverpoolfc.com/news/match-report-liverpool-arsenal-premier-league-november-2026'],
      ['Michael Reid, LFC v Arsenal: The Stats', 'https://mreidstats.substack.com/p/lfc-v-arsenal-h-2026-27-the-stats']
    ],
    beats: [
      {d:6200, cap:'Anfield. League. Arsenal’s last *win* there?', scene:{type:'note', lines:[
        {t:'Anfield · league', at:.05},
        {t:'Last win: Sep 2012 ✓', at:.35},
        {t:'Since ', boxes:13, at:.62, cls:'dim'}]}},
      {d:4800, cap:'Thirteen league visits. *Zero* wins.', scene:{type:'note', keep:3, lines:[
        {t:'Anfield · league'}, {t:'Last win: Sep 2012 ✓'}, {t:'Since ', boxes:13, cls:'dim'},
        {t:'Their run v us there: 16', at:.25, cls:'red'}]}},
      {d:5200, cap:'*16* minutes. Rice overlaps Madueke.', scene:{type:'board', step:0}},
      {d:4600, cap:'Madueke slides it low across the box…', scene:{type:'board', step:1}},
      {d:5200, cap:'…and *Havertz* is alone at the back post.', scene:{type:'board', step:2}},
      {d:5000, cap:'1–0. Then Liverpool got the *ball*.', scene:{type:'poss', l:57, r:43, ln:'Liverpool', rn:'Arsenal'}},
      {d:4200, cap:'Before the goal they had *zero* shots.', scene:{type:'pitch', balls:0, count:[0,0], label:'Liverpool shots before the goal'}},
      {d:5200, cap:'By full time: *eighteen*.', scene:{type:'pitch', balls:18, roll:true, count:[0,18], label:'Liverpool shots'}},
      {d:5200, cap:'*Nine* of them hit an Arsenal body.', scene:{type:'pitch', balls:18, blocked:9, anim:'block', count:[0,9], label:'blocked', gold:true}},
      {d:5200, cap:'One hit the *target*. Raya had it.', scene:{type:'pitch', balls:18, blocked:9, target:1, anim:'target', count:[0,1], label:'on target'}},
      {d:4800, cap:'Wirtz hit the *woodwork*. Woodwork doesn’t count.', scene:{type:'note', lines:[
        {t:'Woodwork: 1 (Wirtz FK)', at:.08},
        {t:'Goals from it: 0', at:.45, cls:'red'}]}},
      {d:4600, cap:'Arsenal cleared it *36* times.', scene:{type:'pitch', balls:18, blocked:9, target:1, count:[0,36], label:'Arsenal clearances', gold:true}},
      {d:6400, cap:'Not *pretty*. Didn’t need to be.', scene:{type:'ft', home:'Liverpool', away:'Arsenal', hs:0, as:1,
        scorers:'Havertz 16′', rows:[['Poss','57%','43%'],['Shots','18','10'],['On target','1','3'],['Clearances','21','36']]}},
      {d:5200, cap:'First league win at Anfield since *2012*.', scene:{type:'end', n:1}}
    ]
  }
];

/* ------------------------------------------------------------
   Player
   ------------------------------------------------------------ */
(function(){
  const stageEl = document.getElementById('xp-stage');
  if (!stageEl) return;
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = v => Math.max(0, Math.min(1, v));
  const seg = (p,a,b) => clamp((p-a)/(b-a));
  const ease = p => p<.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2;
  const lerp = (a,b,p) => a+(b-a)*p;
  const no = name => { const s = (typeof SQUAD!=='undefined' ? SQUAD : []).find(p => p.name === name); return s ? s.no : ''; };
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EXPORT = /[?&]export=1/.test(location.search);
  const html = (tag, cls, inner) => { const e = document.createElement(tag); if (cls) e.className = cls; if (inner != null) e.innerHTML = inner; return e; };
  const ms = (beat, f) => Math.round((f||0) * beat.d) + 'ms';

  let X = null, i = 0, t = 0, playing = false, last = 0, scene = null, ended = false;

  /* stage chrome */
  stageEl.innerHTML = '';
  const prog = html('div','xp-prog'); const capEl = html('div','xp-cap'); const holder = html('div');
  const tag = html('div','xp-tag','<b>The Non-Negotiables</b> · thenonnegotiablog.com');
  const big = html('div','xp-bigplay','<span><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span>');
  stageEl.append(holder, prog, capEl, tag, big);
  const fit = () => { stageEl.style.fontSize = (stageEl.clientWidth / 24) + 'px'; };
  new ResizeObserver(fit).observe(stageEl); fit();

  /* ---------- scenes ---------- */
  function caption(beat){
    const words = beat.cap.split(' ');
    const step = Math.min(200, (beat.d * .45) / words.length);
    capEl.innerHTML = '';
    words.forEach((w,k) => {
      const hi = /\*/.test(w), s = html('span', hi ? 'hi' : '');
      s.textContent = w.replace(/\*/g,'');
      s.style.animationDelay = Math.round(k*step) + 'ms';
      capEl.append(s);
    });
  }

  function note(beat){
    const sc = beat.scene, el = html('div');
    el.append(html('div','xp-desk'));
    const paper = html('div','xp-paper'); el.append(paper);
    sc.lines.forEach(L => {
      const ln = html('div','xp-line' + (L.cls ? ' ' + L.cls : ''));
      ln.textContent = L.t;
      if (L.boxes) { const b = html('span','xp-boxes'); for (let k=0;k<L.boxes;k++) b.append(html('i')); ln.append(b); }
      ln.style.animationDelay = L.at == null ? '0ms' : ms(beat, L.at);
      if (L.at == null) ln.style.animationDuration = '1ms';
      paper.append(ln);
    });
    return {el};
  }

  /* Tactics board: half-pitch, Arsenal attacking up. Positions are an
     illustration of the move described in the LFC match report, not
     tracking data — the board says so on its face. */
  const BOARD = {
    A: [ // Arsenal
      {n:'Declan Rice', lab:'RICE', p:[[205,238],[262,140],[262,140],[262,140]]},
      {n:'Noni Madueke', lab:'MADUEKE', p:[[238,172],[240,108],[240,108],[240,108]]},
      {n:'Kai Havertz', lab:'HAVERTZ', p:[[150,138],[140,108],[90,46],[90,46]]}
    ],
    O: [ // Liverpool, generic markers
      {lab:'AB', p:[[150,16],[150,16],[150,16],[132,14]]},
      {lab:'VVD', p:[[128,66],[135,62],[150,56],[150,56]]},
      {lab:'JJ', p:[[178,70],[188,70],[196,64],[196,64]]},
      {lab:'MK', p:[[226,124],[236,120],[230,112],[230,112]]}
    ],
    ball: [[244,182],[246,114],[92,44],[136,-2]]
  };
  function board(beat){
    const s = beat.scene.step, el = html('div');
    const wb = html('div','xp-wb'); el.append(wb);
    wb.append(html('span','note','Illustration · from the match report'));
    const svg = document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 -14 300 300'); svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.innerHTML = `<g fill="none" stroke="#2B323B" stroke-width="1.6">
      <rect x="20" y="0" width="260" height="290"/><rect x="62" y="0" width="176" height="104"/>
      <rect x="112" y="0" width="76" height="36"/><path d="M118 104a40 40 0 0 0 64 0"/>
      <path d="M127 0v-10h46v10"/><circle cx="150" cy="70" r="1.6" fill="#2B323B"/>
      <path d="M20 290h260"/><path d="M110 290a40 40 0 0 1 80 0"/></g>
      <g id="arr"></g><g id="dO"></g><g id="dA"></g><g id="stamp"></g>`;
    wb.append(svg);
    const arr = svg.querySelector('#arr');
    const path = (d, color, at, dash) => {
      const p = document.createElementNS(NS,'path');
      p.setAttribute('d', d); p.setAttribute('fill','none'); p.setAttribute('stroke', color);
      p.setAttribute('stroke-width','2.6'); p.setAttribute('stroke-linecap','round');
      if (dash) { p.setAttribute('stroke-dasharray','5 6'); }
      arr.append(p);
      const len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 300);
      if (!dash) { p.classList.add('xp-draw'); p.style.setProperty('--len', len); p.style.animationDelay = ms(beat, at); }
      else { p.style.opacity = 0; p.animate([{opacity:0},{opacity:1}], {duration:400, delay: at*beat.d, fill:'forwards'}); }
      return p;
    };
    // previously drawn arrows stay, new ones draw in
    if (s >= 0) path('M205 238 C 255 215, 266 175, 262 142', '#14202E', s===0 ? .1 : 0, false);
    if (s >= 1) path('M240 108 Q 170 90, 94 46', '#C8000A', s===1 ? .18 : 0, false);
    if (s >= 2) path('M94 46 L 134 2', '#C8000A', s===2 ? .12 : 0, false);
    if (s < 1) path('M150 138 Q 120 100, 92 48', '#5D6A7A', .55, true);
    const mk = (g, d, fill, txt, name) => {
      const grp = document.createElementNS(NS,'g');
      grp.innerHTML = `<circle r="11" fill="${fill}" stroke="#fff" stroke-width="1.8"/>
        <text text-anchor="middle" dy="4" font-family="Archivo,sans-serif" font-weight="800" font-size="${txt.length>2?7.5:10}" fill="#fff">${txt}</text>` +
        (name ? `<text y="25" text-anchor="middle" font-family="Caveat,cursive" font-weight="700" font-size="13" fill="#C8000A" paint-order="stroke" stroke="#EEF1F4" stroke-width="3">${name}</text>` : '');
      g.append(grp); return grp;
    };
    const dA = svg.querySelector('#dA'), dO = svg.querySelector('#dO');
    const nodes = [
      ...BOARD.O.map(d => ({d, g: mk(dO, d, '#063672', d.lab)})),
      ...BOARD.A.map(d => ({d, g: mk(dA, d, '#EF0107', String(no(d.n) || ''), d.lab)}))
    ];
    const ball = document.createElementNS(NS,'g');
    ball.innerHTML = '<circle r="5" fill="#fff" stroke="#14202E" stroke-width="1.6"/><circle r="1.8" fill="#14202E"/>';
    dA.append(ball);
    const stamp = svg.querySelector('#stamp');
    if (s === 2) {
      const st = document.createElementNS(NS,'g');
      st.innerHTML = `<g transform="translate(206 210)"><g class="xp-stamp" style="animation-delay:${ms(beat,.42)}">
        <rect x="-62" y="-22" width="124" height="44" rx="4" fill="none" stroke="#C8000A" stroke-width="2.4"/>
        <text text-anchor="middle" dy="9" font-family="Caveat,cursive" font-weight="700" font-size="28" fill="#C8000A">1–0 · 16′</text></g></g>`;
      stamp.append(st);
    }
    // timing windows per step for movement
    const win = [[.1,.85],[.2,.7],[.12,.4]][s];
    const winPlayer = [[.1,.85],[.05,.75],[.0,.3]][s];
    const upd = p => {
      const q = ease(seg(p, ...winPlayer));
      nodes.forEach(({d,g}) => {
        const a = d.p[s], b = d.p[s+1];
        g.setAttribute('transform', `translate(${lerp(a[0],b[0],q).toFixed(1)} ${lerp(a[1],b[1],q).toFixed(1)})`);
      });
      const bq = s === 0 ? q : ease(seg(p, ...win));
      const a = BOARD.ball[s], b = BOARD.ball[s+1];
      ball.setAttribute('transform', `translate(${lerp(a[0],b[0],bq).toFixed(1)} ${lerp(a[1],b[1],bq).toFixed(1)})`);
    };
    return {el, upd};
  }

  /* Pitch: a row of balls along the edge of Arsenal's box = Liverpool's
     shots, as a COUNT. Blocked ones get knocked aside, on-target ones
     roll to the line. Deliberately not a shot map. */
  function pitch(beat){
    const sc = beat.scene, el = html('div');
    el.append(html('div','xp-stands'));
    const wrap = html('div','xp-pitch'); el.append(wrap);
    const svg = document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 0 680 760');
    let stripes = ''; for (let k=0;k<8;k++) stripes += `<rect x="0" y="${k*95}" width="680" height="95" fill="${k%2?'#3E8E3A':'#46A042'}"/>`;
    svg.innerHTML = stripes + `<g fill="none" stroke="#fff" stroke-width="4" opacity=".92">
      <rect x="20" y="20" width="640" height="760"/><rect x="138" y="20" width="404" height="165"/>
      <rect x="248" y="20" width="184" height="55"/><path d="M276 185a75 75 0 0 0 128 0"/>
      <circle cx="340" cy="130" r="4" fill="#fff"/><path d="M304 20v-16h72v16" stroke-width="5"/></g><g id="balls"></g>`;
    wrap.append(svg);
    el.append(html('div','xp-fade'));
    const g = svg.querySelector('#balls');
    const N = sc.balls, row = [];
    for (let k=0;k<N;k++) {
      const x = 162 + k * (356 / Math.max(1,N-1)), y = 205;
      const b = document.createElementNS(NS,'g');
      b.innerHTML = `<ellipse rx="9" ry="4" cy="9" fill="rgba(0,0,0,.25)"/><circle r="8.5" fill="#F4F6F8" stroke="#9AA3AE" stroke-width="1.4"/><circle r="15" fill="none" stroke="#fff" stroke-width="2.5" opacity="0"/>`;
      g.append(b);
      // deterministic spread: alternate blocked picks across the row
      row.push({b, x, y, k});
    }
    const blockedIdx = new Set(), targetIdx = new Set();
    const order = row.map(r => r.k).sort((a,b) => ((a*7)%N) - ((b*7)%N));
    order.slice(0, sc.blocked||0).forEach(k => blockedIdx.add(k));
    const rest = order.filter(k => !blockedIdx.has(k));
    if (sc.target) targetIdx.add(rest[Math.floor(rest.length/2)]);

    let cnt = null;
    if (sc.count) {
      cnt = html('div','xp-count' + (sc.gold ? ' gold' : ''), `<b>${sc.count[0]}</b><small></small>`);
      cnt.querySelector('small').textContent = sc.label;
      el.append(cnt);
    }
    const upd = p => {
      row.forEach(({b,x,y,k}, j) => {
        let X = x, Y = y, fill = '#F4F6F8', ring = 0, op = 1;
        if (sc.roll) { const q = ease(seg(p, .08 + j*.028, .3 + j*.028)); Y = lerp(760, y, q); op = q > 0 ? 1 : 0; }
        if (blockedIdx.has(k)) {
          const q = sc.anim === 'block' ? ease(seg(p, .12 + (j%9)*.035, .32 + (j%9)*.035)) : 1;
          X = x + (k%2 ? 1 : -1) * 34 * q; Y = y + 70 * q; fill = q > .5 ? '#E3A33A' : fill;
        }
        if (targetIdx.has(k)) {
          const q = sc.anim === 'target' ? ease(seg(p, .2, .55)) : 1;
          X = lerp(x, 340, q); Y = lerp(y, 34, q); ring = q;
        }
        b.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)})`);
        b.style.opacity = op;
        b.children[1].setAttribute('fill', fill);
        b.children[2].setAttribute('opacity', ring);
      });
      if (cnt) cnt.firstChild.textContent = Math.round(lerp(sc.count[0], sc.count[1], ease(seg(p, .12, .62))));
    };
    return {el, upd};
  }

  function poss(beat){
    const sc = beat.scene, el = html('div','xp-poss');
    el.innerHTML = `<div class="nums"><div><b>0%</b><small>${sc.ln}</small></div><div style="text-align:right"><b style="color:#FF5A5F">0%</b><small>${sc.rn}</small></div></div>
      <div class="bar"><i style="background:#8A95A5"></i><i style="background:#EF0107;margin-left:auto"></i></div><p class="lab">Possession · full match</p>`;
    const [L,R] = el.querySelectorAll('.nums b'), [bl,br] = el.querySelectorAll('.bar i');
    const wrap = html('div'); wrap.append(el);
    return {el: wrap, upd: p => {
      const q = ease(seg(p, .15, .7));
      L.textContent = Math.round(sc.l*q) + '%'; R.textContent = Math.round(sc.r*q) + '%';
      bl.style.width = (sc.l*q) + '%'; br.style.width = (sc.r*q) + '%';
    }};
  }

  function ft(beat){
    const sc = beat.scene, el = html('div','xp-ft');
    el.innerHTML = `<header><span>Full time</span><span>Premier League</span></header>
      <div class="xr"><span>${sc.home}</span><b>${sc.hs}</b></div>
      <div class="xr"><span>${sc.away}</span><b>${sc.as}</b></div>
      <div class="sc">${sc.away}: ${sc.scorers}</div>
      <dl>${sc.rows.map((r,k) => `<div style="animation-delay:${ms(beat,.15+k*.1)}"><dt>${r[0]}</dt><dd>${r[1]}</dd><dd>${r[2]}</dd></div>`).join('')}</dl>`;
    const wrap = html('div'); wrap.append(el); return {el: wrap};
  }

  function end(beat){
    const el = html('div','xp-end', `<div class="wm">The <em>Non-</em><br>Negotiables</div>
      <div class="url">thenonnegotiablog.com</div>
      <div class="sub">Explainer no.${beat.scene.n} · an independent fan site, not the club’s. Every number sourced.</div>`);
    return {el};
  }

  const SCENES = {note, board, pitch, poss, ft, end};

  /* ---------- clock ---------- */
  function show(k){
    poster = false;
    i = Math.max(0, Math.min(X.beats.length-1, k)); t = 0; ended = false;
    const beat = X.beats[i];
    caption(beat);
    holder.innerHTML = '';
    scene = SCENES[beat.scene.type](beat);
    scene.el.classList.add('xp-scene');
    holder.append(scene.el);
    // restart caption CSS animations cleanly
    stageEl.classList.toggle('xp-static', REDUCE);
    if (REDUCE && scene.upd) scene.upd(1); else if (scene.upd) scene.upd(0);
    [...prog.children].forEach((seg,k) => seg.firstChild.style.width = k < i ? '100%' : '0%');
  }
  let poster = false;
  function setPlaying(v){
    if (v && poster) { poster = false; show(i); }
    playing = v; stageEl.classList.toggle('xp-paused', !v);
    const b = document.getElementById('xp-play'); if (b) b.textContent = v ? 'Pause' : (ended ? 'Replay' : 'Play');
    last = performance.now();
  }
  function frame(now){
    const dt = now - last; last = now;
    if (playing && X) {
      const beat = X.beats[i];
      t += dt;
      const p = Math.min(1, t / beat.d);
      if (scene && scene.upd && !REDUCE) scene.upd(p);
      prog.children[i].firstChild.style.width = (p*100) + '%';
      if (t >= beat.d) {
        if (i < X.beats.length - 1) show(i+1);
        else { ended = true; setPlaying(false); if (EXPORT) document.documentElement.dataset.done = '1'; }
      }
    }
    requestAnimationFrame(frame);
  }

  function load(id, autoplay){
    X = EXPLAINERS.find(e => e.id === id) || EXPLAINERS[0];
    prog.innerHTML = X.beats.map(() => '<i><b></b></i>').join('');
    stageEl.setAttribute('aria-label', `${X.title} — animated explainer. Space to play or pause, arrow keys to step.`);
    show(0);
    if (!autoplay || REDUCE) {   // poster frame: beat 1 drawn finished, not frozen blank
      poster = !REDUCE; stageEl.classList.add('xp-static'); if (scene.upd) scene.upd(1);
    }
    setPlaying(!!autoplay && !REDUCE);
    if (window.XP_ONLOAD) window.XP_ONLOAD(X);
  }

  /* ---------- input ---------- */
  stageEl.addEventListener('click', e => {
    const r = stageEl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    if (!playing && !ended && x > .25 && x < .75) return setPlaying(true);
    if (x < .25) { show(i-1); return; }
    if (x > .75) { show(i+1); return; }
    if (ended) { show(0); return setPlaying(true); }
    setPlaying(!playing);
  });
  stageEl.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (ended) show(0); setPlaying(!playing); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(i+1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(i-1); }
  });
  const on = (id, fn) => { const b = document.getElementById(id); if (b) b.addEventListener('click', fn); };
  on('xp-play', () => { if (ended) show(0); setPlaying(!playing); });
  on('xp-prev', () => show(i-1));
  on('xp-next', () => show(i+1));
  on('xp-restart', () => { show(0); setPlaying(!REDUCE); });

  window.XP = { load, list: EXPLAINERS };
  if (EXPORT) {
    document.documentElement.classList.add('xp-export');
    const f = html('div','xp-exportframe'); document.body.append(f); f.append(stageEl);
    requestAnimationFrame(fit);
  }
  const hashId = decodeURIComponent(location.hash.slice(1));
  load(hashId, EXPORT);
  last = performance.now(); requestAnimationFrame(frame);
})();

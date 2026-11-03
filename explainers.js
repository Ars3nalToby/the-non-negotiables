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
    /* Preview. Kick-off comes from CL (app.js) and is shown in the
       visitor's own zone, so the caption never names a city. */
    id: 'cl4-sla', date: '2026-11-04',
    title: 'Slavia away: the record, the absentee and the alarm',
    kicker: 'Preview · Champions League matchday 4',
    standfirst: 'Three games into the league phase and unbeaten, Arsenal go to Prague, where they won 3–0 a year ago. Here is where the campaign stands, who is missing, and what time you need to be awake.',
    points: [
      'League phase so far: won 1–0 in Naples, beat Lille 3–0 at home, drew 2–2 in Munich. Seven points from nine.',
      'Six goals, five different scorers: Ødegaard, Timber, Eze (twice), Saka and Rice. Two conceded, both in Munich.',
      'Last season’s visit finished Slavia 0–3 Arsenal, Mikel Merino scoring twice.',
      'Bukayo Saka is out. Kick-off is 20:00 in London, 21:00 in Prague.'
    ],
    sources: [
      ['UEFA Champions League fixtures', 'https://www.uefa.com/uefachampionsleague/fixtures-results/'],
      ['Yahoo Sports team news, 3 Nov 2026', 'https://sports.yahoo.com/articles/slavia-praha-vs-arsenal-early-063500884.html'],
      ['This site’s Champions League page', 'europe.html']
    ],
    beats: [
      {d:4800, cap:'Champions League. Matchday *four*. Prague.', zh:'欧冠 联赛阶段 第 *4* 轮。 布拉格。',
        scene:{type:'note', lines:[{t:'UCL · matchday 4', at:.05},{t:'Slavia Praha (away)', at:.3},{t:'Fortuna Arena, Prague', at:.55, cls:'dim'}]}},
      {d:6400, cap:'So far: Naples won, Lille *battered*, Munich drawn.', zh:'目前： 那不勒斯 赢了， 里尔 *血洗*， 慕尼黑 打平。',
        scene:{type:'chips', comp:'cl', upto:3}},
      {d:4800, cap:'*Seven* points from nine.', zh:'9 分 拿了 *7* 分。',
        scene:{type:'stat', count:[0,7], label:'points from 9', labelZh:'分 / 满分 9', sub:'Won 2 · Drawn 1 · Lost 0'}},
      {d:5600, cap:'Six goals. *Five* different scorers.', zh:'6 个进球， *5* 个 不同的进球者。',
        scene:{type:'bars', comp:'cl', upto:3}},
      {d:5600, cap:'Last time here? *3–0*. Merino twice.', zh:'上次来这里？ *3–0*。 梅里诺 梅开二度。',
        scene:{type:'note', lines:[{t:'Nov 2025 · Prague', at:.05},{t:'Slavia 0–3 Arsenal', at:.3},{t:'Merino ×2 ✓', at:.6, cls:'red'}]}},
      {d:4600, cap:'This time, no *Saka*.', zh:'这次， 没有 *萨卡*。',
        scene:{type:'note', lines:[{t:'Team news', at:.05},{t:'Saka: out', at:.35, cls:'red'}]}},
      {d:7600, cap:'Eight in London. What time is it where *you* are?', zh:'伦敦 晚上 8 点。 你那边 *几点*？',
        scene:{type:'clock', comp:'cl', md:4}},
      {d:5000, cap:'Set the *alarm*.', zh:'*定好闹钟*。', scene:{type:'end', n:4}}
    ]
  },
  {
    /* Built from FIXTURES (app.js) at render time: every peak and pit is
       a real scoreline, so there is nothing here to go stale or invent.
       The terrain is a picture of goals per match, not of play. */
    id: 'pl9-terrain', date: '2026-11-04',
    title: 'Nine games, drawn as a landscape',
    kicker: 'Season so far · Premier League matchdays 1–9',
    standfirst: 'Every league match so far turned into terrain: goals scored push the ground up, goals conceded dig it out. Eight hills, one hole, and a defence that has made the place look very flat from the other side.',
    points: [
      'Eight wins from nine: 24 points from a possible 27. The only defeat was 0–3 at Brighton on matchday 5.',
      'Fourteen goals scored, five conceded, and three of those five came in that one afternoon at Brighton.',
      'Six clean sheets in nine. Three of the wins finished 1–0: Villa away, Forest away, Anfield.',
      'Eight different scorers. Havertz and Saka have three each, Ødegaard and Guimarães two.'
    ],
    sources: [
      ['Arsenal.com fixtures and results', 'https://www.arsenal.com/fixtures'],
      ['This site’s results list', 'timetable.html']
    ],
    beats: [
      {d:5400, cap:'Nine league games. Let’s draw them as a *landscape*.', zh:'九场 联赛。 把它们 画成 一片 *地形*。',
        scene:{type:'terrain', n:9, upto:[0,0], rot:[-.62,-.5]}},
      {d:7200, cap:'Goals scored push the ground *up*. Four wins, four hills.', zh:'进球 把地面 *顶起来*。 四连胜， 四座山。',
        scene:{type:'terrain', n:9, upto:[0,4], rot:[-.5,-.32]}},
      {d:5600, cap:'Then *Brighton*. 0–3. The one hole in the map.', zh:'然后是 *布莱顿*。 0–3。 地图上 唯一的 坑。',
        scene:{type:'terrain', n:9, upto:[4,5], focus:4, rot:[-.32,-.22]}},
      {d:6800, cap:'Since then? Four more hills. Four more *wins*.', zh:'之后呢？ 又是 四座山， 四场 *胜利*。',
        scene:{type:'terrain', n:9, upto:[5,9], rot:[-.22,-.02]}},
      {d:4800, cap:'That’s *24* points from a possible 27.', zh:'27 分里 拿了 *24* 分。',
        scene:{type:'stat', count:[0,24], label:'points from 27', labelZh:'分 / 满分 27', sub:'Won 8 · Drawn 0 · Lost 1'}},
      {d:5200, cap:'*Fourteen* goals scored.', zh:'进了 *14* 球。',
        scene:{type:'wall', comp:'pl', n:9, side:'for', label:'goals scored', labelZh:'进球'}},
      {d:5800, cap:'Five conceded. Three of them in *one* afternoon.', zh:'丢了 5 球， 其中 3 个 在 *同一个* 下午。',
        scene:{type:'wall', comp:'pl', n:9, side:'against', label:'goals conceded', labelZh:'失球'}},
      {d:5600, cap:'*Six* clean sheets in nine.', zh:'九场 *六场* 零封。',
        scene:{type:'chips', comp:'pl', upto:9, mark:'cs'}},
      {d:5600, cap:'Three of the wins were *1–0*. Not pretty. Points.', zh:'其中 三场 都是 *1–0*。 不好看， 但有分。',
        scene:{type:'chips', comp:'pl', upto:9, mark:'one'}},
      {d:5800, cap:'*Eight* different scorers.', zh:'*8 个* 不同的 进球者。',
        scene:{type:'bars', comp:'pl', upto:9}},
      {d:6200, cap:'Eight wins. One very bad day by the *sea*.', zh:'八场 胜利。 一个 在 *海边* 的 糟糕下午。',
        scene:{type:'terrain', n:9, upto:[9,9], rot:[-.02,.55], spin:true}},
      {d:5000, cap:'Every game, *mapped*.', zh:'每一场， 都 *画* 出来。', scene:{type:'end', n:3}}
    ]
  },
  {
    /* Man City: findings only. Every claim is "the Commission found" or a
       plain matter of record (seasons, titles, status). No sanction guess,
       no claim the titles were won BECAUSE of the breaches — that is not
       what was ruled, and City have appealed. Shown on ledger.html too. */
    id: 'mci-ledger', date: '2026-11-03',
    title: 'Manchester City and the Commission, in about a minute',
    kicker: 'The Ledger · what was found',
    standfirst: 'Nine seasons of accounts, a sponsorship model that wasn’t what the paperwork said, and an investigation the club tried to stop. What an independent Commission found, and what is still undecided.',
    points: [
      'The Commission found most Abu Dhabi sponsorship money really came from the owner, booked as commercial income: overstated by over £830m across 2009/10 to 2017/18.',
      'It found owner-paid costs kept off the books (including £8.866m, £7.4m, £0.5m and £49.414m), and, with the accounts restated, UEFA’s break-even rule and the League’s £105m losses limit missed in every season charged.',
      'It found City made concerted efforts to frustrate the investigation, and that some of the club’s key witnesses were dishonest. Every charge was proven except 4(B).',
      'City won the league three times in those nine seasons. What, if anything, happens to that is for the sanction hearing. City deny every charge and have appealed.'
    ],
    sources: [
      ['Premier League statement, 29 Sep 2026', 'https://www.premierleague.com/en/news/4727779/premier-league-statement-manchester-city-fc/'],
      ['Premier League statement on the appeal, 2 Oct 2026', 'https://www.premierleague.com/en/news/4729207/premier-league-statement-manchester-city-fc-appeal-decision-of-independent-commission-02-october-2026'],
      ['The Ledger, charge by charge', 'ledger.html']
    ],
    beats: [
      {d:5600, cap:'An independent Commission has ruled on Manchester City. Here’s what it *found*.', scene:{type:'stat', count:[0,9], label:'seasons charged', sub:'2009/10 → 2017/18'}},
      {d:6400, cap:'The sponsors’ money? Mostly *wasn’t* the sponsors’.', scene:{type:'stack'}},
      {d:5200, cap:'Income overstated by over *£830m*, the Commission found.', scene:{type:'stat', count:[0,830], pre:'£', suf:'m+', label:'income overstated', sub:'sponsorship, nine seasons', gold:true}},
      {d:6800, cap:'And owner-paid costs went *missing* from the club’s books.', scene:{type:'book', rows:[
        ['Arrangement A','£8.866m'],['Arrangement B','£7.4m'],['Arrangement C','£0.5m'],['Fordham costs','£49.414m']]}},
      {d:6200, cap:'Put the books back together: UEFA’s break-even rule, missed. *Every* season.', scene:{type:'seasons', mode:'x', title:'UEFA break-even'}},
      {d:5600, cap:'The Premier League’s own losses limit, too. *Every* season.', scene:{type:'seasons', mode:'x', title:'PL limit · £105m over 3 yrs'}},
      {d:7200, cap:'The investigation? Concerted efforts to *frustrate* it, the Commission found.', scene:{type:'charges', rows:[
        ['1(A)','Sponsorship income',1],['1(B)','Payments off the books',1],['1(C)','Fordham',1],['1(D)','Related parties',1],['2','UEFA rules',1],['3','PL losses limit',1],['4(A,C,D)','Cooperation',2],['4(B)','One cooperation count',0]]}},
      {d:5800, cap:'Some of City’s key witnesses were *dishonest*, it concluded.', scene:{type:'stat', count:[0,27], label:'witnesses of fact heard', sub:'some of City’s, the Commission found, gave evidence they knew was untrue'}},
      {d:6200, cap:'Inside those nine seasons, City won the league *three* times.', scene:{type:'seasons', mode:'titles', title:'League champions', titles:['11/12','13/14','17/18']}},
      {d:6600, cap:'What happens to those titles? *Not decided.*', scene:{type:'status'}},
      {d:5400, cap:'Every finding, charge by charge, *sourced*.', scene:{type:'end', n:2, sub:'The Ledger · City deny every charge and have appealed. Source: Premier League statement, 29 Sep 2026.'}}
    ]
  },
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
  const LANG = (location.search.match(/[?&]lang=(\w+)/) || [])[1] || 'en';   // export-only: ?lang=zh uses beat.zh
  const ALL = EXPLAINERS.concat(window.XP_EXTRA || []);   // extras (promo cuts) load by id but stay off the list
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
    const words = ((LANG === 'zh' && beat.zh) || beat.cap).split(' ');
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
      <div class="sub">${beat.scene.sub ? L(beat.scene,"sub") : `Explainer no.${beat.scene.n} \u00b7 an independent fan site, not the club\u2019s. Every number sourced.`}</div>`);
    return {el};
  }

  /* ---- ledger scenes (stat, stack, book, seasons, charges, status) ---- */
  function stat(beat){
    const sc = beat.scene, el = html('div','xp-stat' + (sc.gold ? ' gold' : ''));
    el.innerHTML = `<div class="xp-grid" aria-hidden="true"></div><div class="xp-statin"><b>${sc.pre||''}<span>${sc.count[0]}</span>${sc.suf||''}</b><small></small>${sc.sub ? '<i></i>' : ''}</div>`;
    el.querySelector('small').textContent = L(sc,'label');
    if (sc.sub) el.querySelector('i').textContent = sc.sub;
    const n = el.querySelector('b span');
    return {el, upd: p => { n.textContent = Math.round(lerp(sc.count[0], sc.count[1], ease(seg(p, .1, .55)))); }};
  }
  function stack(beat){
    const el = html('div','xp-stack');
    el.innerHTML = `<p class="xp-illu">Illustration · not to scale</p>
      <div class="xp-flow">
        <div class="xp-src"><div class="xp-blk sp" style="animation-delay:${ms(beat,.12)}"><b>Sponsor</b><span>paid a fraction</span></div>
          <div class="xp-blk ow" style="animation-delay:${ms(beat,.34)}"><b>Owner</b><span>paid the rest</span></div></div>
        <div class="xp-arrow" style="animation-delay:${ms(beat,.5)}">→</div>
        <div class="xp-col" style="animation-delay:${ms(beat,.55)}"><div class="xp-fill"></div><b>Booked as</b><span>commercial revenue</span></div>
      </div>`;
    const fill = el.querySelector('.xp-fill');
    return {el, upd: p => { fill.style.height = (ease(seg(p, .58, .85)) * 100) + '%'; }};
  }
  function book(beat){
    const sc = beat.scene, el = html('div','xp-book');
    el.innerHTML = `<div class="xp-bookpg"><div class="xp-bookh"><span>Paid by the owner</span><span>On the club’s books?</span></div>
      ${sc.rows.map((r,k) => `<div class="xp-brow" style="animation-delay:${ms(beat,.1 + k*.14)}"><span>${r[0]}</span><b>${r[1]}</b>
        <em style="animation-delay:${ms(beat,.18 + k*.14)}">Not there</em></div>`).join('')}</div>`;
    return {el};
  }
  const SEASONS9 = ['09/10','10/11','11/12','12/13','13/14','14/15','15/16','16/17','17/18'];
  function seasons(beat){
    const sc = beat.scene, el = html('div','xp-seasons xp-m-' + sc.mode);
    el.innerHTML = `<p class="xp-stitle">${sc.title}</p><div class="xp-sgrid">${SEASONS9.map((y,k) => {
      const t = sc.mode === 'titles' && sc.titles.includes(y);
      return `<div class="xp-cell${t ? ' won' : ''}"><span>${y}</span>${sc.mode === 'x' ? `<i style="animation-delay:${ms(beat,.12 + k*.07)}">✕</i>` : t ? `<i style="animation-delay:${ms(beat,.25 + sc.titles.indexOf(y)*.15)}">Champions</i>` : ''}</div>`; }).join('')}</div>`;
    return {el};
  }
  function charges(beat){
    const sc = beat.scene, el = html('div','xp-charges');
    const V = ['Not proven','Proven','Mostly proven'];
    el.innerHTML = sc.rows.map((r,k) => `<div class="xp-crow" style="animation-delay:${ms(beat,.06 + k*.075)}"><b>${r[0]}</b><span>${r[1]}</span>
      <em class="v${r[2]}" style="animation-delay:${ms(beat,.14 + k*.075)}">${V[r[2]]}</em></div>`).join('');
    return {el};
  }
  function status(beat){
    const el = html('div','xp-status');
    el.innerHTML = [['Liability','Decided','d'],['Sanction','Not decided','w'],['Appeal','Lodged · in private','w']].map((r,k) =>
      `<div class="xp-srow" style="animation-delay:${ms(beat,.08 + k*.16)}"><span>${r[0]}</span><b class="${r[2]}">${r[1]}</b></div>`).join('') +
      `<p class="xp-snote" style="animation-delay:${ms(beat,.6)}">City deny every charge.</p>`;
    return {el};
  }

  /* ---- season scenes (terrain, wall, chips, bars, clock, shot) ----
     All read real results from FIXTURES / CL (app.js) at render time:
     'W 3-0' is always Arsenal's score first. */
  const games = (comp, upto) => {
    const src = comp === 'cl' ? (typeof CL!=='undefined' ? CL : []) : (typeof FIXTURES!=='undefined' ? FIXTURES : []);
    return src.filter(g => g.result).slice(0, upto).map(g => {
      const m = g.result.match(/^([WDL])\s*(\d+)-(\d+)/) || [];
      const name = comp === 'cl' ? g.name : ((typeof CLUBS!=='undefined' && CLUBS[g.opp]) ? CLUBS[g.opp].name : g.opp);
      return {r:m[1], f:+m[2], a:+m[3], v:g.v, name, code:(g.opp || name).slice(0,3).toUpperCase(), scorers:g.scorers || ''};
    });
  };
  const L = (sc, k) => (LANG === 'zh' && sc[k+'Zh']) || sc[k];
  const mix = (c1, c2, q) => c1.map((v,k) => Math.round(v + (c2[k]-v)*q));
  const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;

  /* Terrain: the season as a surface. Along the long axis, one band per
     matchday; goals for raise it (red), goals against dig it (navy).
     Painted on a 2D canvas with a hand-rolled projection: no library. */
  function terrain(beat){
    const sc = beat.scene, G = games('pl', sc.n), N = G.length || 1;
    const el = html('div','xp-ter'), cv = document.createElement('canvas'); el.append(cv);
    el.append(html('p','xp-illu xp-terkey','Height = goals · peaks scored, pits conceded'));
    const strip = html('div','xp-terstrip'); el.append(strip);
    G.forEach((g,k) => { const c = html('span', 'r' + g.r + (sc.focus === k ? ' on' : ''), `<b>${g.f}–${g.a}</b><i>${g.code}</i>`); strip.append(c); });
    const ctx = cv.getContext('2d'), NX = 84, NY = 26;
    const CREAM = [236,229,206], RED = [239,1,7], DEEP = [150,0,6], NAVY = [10,38,88];
    const hAt = (u, v, rev) => {
      let h = 0;
      for (let k=0;k<N;k++) {
        const amt = ease(clamp(rev - k)); if (!amt) continue;
        const cx = (k + .5) / N, du = (u - cx) * N, env = Math.exp(-Math.pow((v - .5) / .42, 2));
        const g = G[k], wob = 1 + .18 * Math.sin(v * 9 + k * 2.1);
        h += amt * env * (g.f * .12 * Math.exp(-du*du / .2) * wob - g.a * .12 * Math.exp(-du*du / .24));
      }
      return h;
    };
    let W = 0, Hh = 0;
    const size = () => { const r = el.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      W = cv.width = Math.max(2, Math.round(r.width * d)); Hh = cv.height = Math.max(2, Math.round(r.height * d)); };
    const upd = p => {
      if (!W) size();
      const rev = lerp(sc.upto[0], sc.upto[1], ease(seg(p, .08, .9)));
      const yaw = lerp(sc.rot[0], sc.rot[1], sc.spin ? p : ease(p)), tilt = .9, ct = Math.cos(tilt), st = Math.sin(tilt);
      const S = W * .52, cy0 = Hh * .5, cx0 = W / 2, LEN = 1.5, DEP = 1.0;
      const P = [];   // projected grid
      for (let j=0;j<=NY;j++) for (let i2=0;i2<=NX;i2++) {
        const u = i2/NX, v = j/NY, h = hAt(u, v, rev);
        const x = (u - .5) * LEN, y = (v - .5) * DEP;
        const X = x*Math.cos(yaw) - y*Math.sin(yaw), Y = x*Math.sin(yaw) + y*Math.cos(yaw);
        P.push([cx0 + X*S, cy0 + Y*S*ct - h*S*st, Y, h, x, y]);
      }
      ctx.clearRect(0,0,W,Hh);
      // shadow
      ctx.save(); ctx.translate(cx0, cy0 + W*.12); ctx.scale(1, .32); ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.beginPath(); ctx.arc(0, 0, W*.46, 0, 7); ctx.filter = 'blur(' + (W*.03) + 'px)'; ctx.fill(); ctx.restore();
      const quads = [];
      for (let j=0;j<NY;j++) for (let i2=0;i2<NX;i2++) {
        const a = j*(NX+1)+i2, q = [P[a], P[a+1], P[a+NX+2], P[a+NX+1]];
        quads.push([(q[0][2]+q[2][2])/2, q]);
      }
      quads.sort((m,n) => m[0]-n[0]);
      for (const [,q] of quads) {
        const h = (q[0][3]+q[1][3]+q[2][3]+q[3][3])/4;
        const dx = q[1][3]-q[0][3], dy = q[3][3]-q[0][3];
        const sh = clamp(.82 - dx*9 + dy*5);   // cheap slope light, from the left
        let c = h > .004 ? mix(CREAM, h > .3 ? DEEP : RED, clamp(h/.12)) : h < -.004 ? mix(CREAM, NAVY, clamp(-h/.12)) : CREAM;
        c = mix([8,12,20], c, .55 + .45*sh);
        ctx.fillStyle = rgb(c); ctx.strokeStyle = rgb(c); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(q[0][0],q[0][1]); for (let k=1;k<4;k++) ctx.lineTo(q[k][0],q[k][1]); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // matchday seams + score flags above each revealed peak
      ctx.lineWidth = Math.max(1, W/700); ctx.strokeStyle = 'rgba(10,20,34,.35)';
      for (let k=1;k<N;k++) { const ii = Math.round(k/N*NX); ctx.beginPath();
        for (let j=0;j<=NY;j++) { const pt = P[j*(NX+1)+ii]; j ? ctx.lineTo(pt[0],pt[1]) : ctx.moveTo(pt[0],pt[1]); } ctx.stroke(); }
      ctx.textAlign = 'center'; ctx.font = `800 ${Math.round(W*.034)}px Archivo, sans-serif`;
      for (let k=0;k<N;k++) {
        const amt = clamp(rev - k); if (amt < .6) continue;
        const ii = Math.round((k+.5)/N*NX), pt = P[Math.round(NY/2)*(NX+1)+ii], g = G[k];
        const yy = Math.min(pt[1], P[ii][1]) - W*.05, on = sc.focus === k;
        ctx.globalAlpha = clamp((amt - .6) / .4);
        ctx.fillStyle = on ? '#E3B95A' : '#fff'; ctx.fillText(`${g.f}–${g.a}`, pt[0], yy);
        ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(pt[0]-.5, yy + W*.008, 1, Math.max(0, pt[1] - yy - W*.012));
        ctx.globalAlpha = 1;
      }
      [...strip.children].forEach((c,k) => c.style.opacity = clamp(rev - k) > .5 ? 1 : .18);
    };
    new ResizeObserver(() => { W = 0; }).observe(el);
    return {el, upd};
  }

  /* Wall: a goal, face on. One ball in the net per goal, as a COUNT:
     positions are spread deterministically, not where the goals went. */
  function wall(beat){
    const sc = beat.scene, G = games(sc.comp, sc.n), el = html('div','xp-wall');
    const balls = []; G.forEach((g,k) => { for (let j=0;j<(sc.side === 'for' ? g.f : g.a);j++) balls.push({k, g}); });
    const n = balls.length, svg = document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 0 400 200');
    let net = ''; for (let x=24;x<=376;x+=11) net += `M${x} 30V170`; for (let y=30;y<=170;y+=11) net += `M24 ${y}H376`;
    svg.innerHTML = `<rect x="0" y="170" width="400" height="30" fill="#2F7A33"/><path d="${net}" stroke="rgba(255,255,255,.16)" stroke-width="1"/>
      <path d="M18 172V24H382V172" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><g id="b"></g>`;
    const bg = svg.querySelector('#b'), tone = sc.side === 'for' ? '#F4F6F8' : '#7C8DA6';
    const pos = balls.map((b,k) => { const r = (k*0.61803 + .13) % 1, s = (k*0.381966 + .47) % 1;
      return [44 + r*312, 52 + s*104]; });
    const nodes = pos.map(() => { const g = document.createElementNS(NS,'g');
      g.innerHTML = `<circle r="10.5" fill="${tone}" stroke="#0A1622" stroke-width="1.6"/><path d="M-4-3l4-3 4 3-1.5 4.5h-5z" fill="#0A1622" opacity=".75"/>`; bg.append(g); return g; });
    el.append(svg);
    const cnt = html('div','xp-count' + (sc.side === 'for' ? '' : ' gold'), `<b>0</b><small></small>`); cnt.querySelector('small').textContent = L(sc,'label'); el.append(cnt);
    const key = html('div','xp-wkey'); el.append(key);
    // which games they came from, as small tags
    const per = G.map(g => sc.side === 'for' ? g.f : g.a);
    key.innerHTML = G.map((g,k) => `<span class="${per[k] ? '' : 'z'}"><b>${per[k]}</b>${g.code}</span>`).join('');
    return {el, upd: p => {
      let shown = 0;
      nodes.forEach((g,k) => { const q = clamp(seg(p, .08 + k*(.6/Math.max(1,n)), .2 + k*(.6/Math.max(1,n))));
        const [x,y] = pos[k], yy = lerp(-30, y, ease(q)) + Math.sin(q*Math.PI)*-12;
        g.setAttribute('transform', `translate(${x.toFixed(1)} ${yy.toFixed(1)})`); g.style.opacity = q > 0 ? 1 : 0; if (q >= 1) shown++; });
      cnt.firstChild.textContent = shown;
    }};
  }

  /* Chips: one card per game, in order. mark: 'cs' clean sheets, 'one' 1-0s. */
  function chips(beat){
    const sc = beat.scene, G = games(sc.comp, sc.upto), el = html('div','xp-chips' + (G.length > 4 ? '' : ' few'));
    const hit = g => sc.mark === 'cs' ? g.a === 0 : sc.mark === 'one' ? (g.f === 1 && g.a === 0) : true;
    const tagTxt = {cs:'Clean sheet', one:'1–0'}[sc.mark];
    el.innerHTML = G.map((g,k) => `<div class="xp-chip r${g.r}${sc.mark && !hit(g) ? ' dim' : ''}" style="animation-delay:${ms(beat,.05 + k*.06)}">
      <span>${g.v === 'H' ? 'Home' : 'Away'}</span><b>${esc2(g.name)}</b><em>${g.f}–${g.a}</em>
      ${sc.mark && hit(g) ? `<i style="animation-delay:${ms(beat,.45 + k*.04)}">${tagTxt}</i>` : ''}</div>`).join('');
    return {el};
  }
  const esc2 = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* Bars: scorers, counted from the scorers strings. */
  function bars(beat){
    const sc = beat.scene, G = games(sc.comp, sc.upto), tally = {};
    // by surname: FIXTURES spells some players two ways ('Bruno Guimarães' / 'Guimarães')
    G.forEach(g => g.scorers.split(',').map(s => s.replace(/\(.*?\)/g,'').trim().split(' ').pop()).filter(Boolean).forEach(s => tally[s] = (tally[s]||0) + 1));
    const rows = Object.entries(tally).sort((a,b) => b[1]-a[1]), max = rows.length ? rows[0][1] : 1;
    const el = html('div','xp-bars');
    el.innerHTML = rows.map(([n,v],k) => `<div class="xp-bar${v === max ? ' top' : ''}" style="animation-delay:${ms(beat,.05 + k*.05)}">
      <span>${esc2(n)}</span><i><u style="--w:${(v/max*100).toFixed(1)}%;animation-delay:${ms(beat,.12 + k*.05)}"></u></i><b>${v}</b></div>`).join('');
    return {el};
  }

  /* Clock: the same kick-off in three places. The third is the
     visitor's chosen zone (NN_TZ from app.js), never a hard-coded city. */
  function clock(beat){
    const sc = beat.scene, src = sc.comp === 'cl' ? (typeof CL!=='undefined' ? CL : []) : (typeof FIXTURES!=='undefined' ? FIXTURES : []);
    const fx = src.find(g => sc.comp === 'cl' ? g.md === sc.md : g.n === sc.n), ko = new Date(fx ? fx.ko : Date.now());
    const me = (window.NN_TZ && window.NN_TZ.id) || 'Australia/Brisbane', meCity = (window.NN_TZ && window.NN_TZ.city) || 'Brisbane';
    const zones = [['Prague','Europe/Prague'],['London','Europe/London'],[meCity, me]].filter((z,k,a) => a.findIndex(y => y[1] === z[1]) === k);
    const el = html('div','xp-clocks');
    const parts = tz => { const o = {}; new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',weekday:'short',day:'numeric',month:'short',hourCycle:'h23'})
      .formatToParts(ko).forEach(x => o[x.type] = x.value); return o; };
    const faces = zones.map(([city,tz],k) => { const o = parts(tz), mine = k === zones.length - 1 && zones.length === 3;
      const d = html('div','xp-clk' + (mine ? ' me' : ''));
      let ticks = ''; for (let t2=0;t2<12;t2++) ticks += `<path d="M0 -40V${t2%3 ? -36 : -32}" transform="rotate(${t2*30})"/>`;
      d.innerHTML = `<svg viewBox="-46 -46 92 92"><circle r="44" fill="#0E1826" stroke="${mine ? '#E3B95A' : '#2A3A50'}" stroke-width="2.5"/>
        <g stroke="#93A0B2" stroke-width="2">${ticks}</g><path class="hh" d="M0 4V-22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
        <path class="mm" d="M0 6V-34" stroke="${mine ? '#E3B95A' : '#EF0107'}" stroke-width="3" stroke-linecap="round"/><circle r="3.5" fill="#fff"/></svg>
        <div><small>${esc2(city)}</small><b>${o.hour}:${o.minute}</b><span>${o.weekday} ${o.day} ${o.month}</span></div>`;
      el.append(d); return {d, h:+o.hour, m:+o.minute};
    });
    return {el, upd: p => faces.forEach((f,k) => {
      const q = ease(seg(p, .06 + k*.12, .45 + k*.12)), tot = (f.h*60 + f.m) * q;
      f.d.querySelector('.hh').setAttribute('transform', `rotate(${(tot/720*360).toFixed(2)})`);
      f.d.querySelector('.mm').setAttribute('transform', `rotate(${(tot%60*6).toFixed(2)})`);
      f.d.style.opacity = q > 0 ? 1 : .25;
    })};
  }

  /* Shot: a screenshot of one of this site's own pages in a phone,
     panning down. Used by the promo cuts only (XP_EXTRA), not the list. */
  function shot(beat){
    const sc = beat.scene, el = html('div','xp-shot');
    el.innerHTML = `<div class="xp-phone"><div class="xp-scr"><img alt="" src="${esc2(sc.src)}"></div></div>${sc.label ? `<p class="xp-illu">${esc2(sc.label)}</p>` : ''}`;
    const img = el.querySelector('img');
    return {el, upd: p => { img.style.transform = `translateY(-${(lerp(sc.pan ? sc.pan[0] : 0, sc.pan ? sc.pan[1] : 0, ease(seg(p,.1,.95)))*100).toFixed(2)}%)`; }};
  }

  const SCENES = {note, board, pitch, poss, ft, end, stat, stack, book, seasons, charges, status, terrain, wall, chips, bars, clock, shot};

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
    X = ALL.find(e => e.id === id) || EXPLAINERS[0];
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

  /* Frame-exact export: XP.seek(ms) draws the explainer at that moment,
     CSS animations included (Web Animations currentTime), so a recorder
     can step 1/30s at a time instead of filming in real time. */
  const total = () => X.beats.reduce((s,b) => s + b.d, 0);
  function seek(msAt){
    let k = 0, acc = 0;
    while (k < X.beats.length - 1 && msAt >= acc + X.beats[k].d) { acc += X.beats[k].d; k++; }
    playing = false;
    if (k !== i || poster || !scene) show(k);
    stageEl.classList.remove('xp-static','xp-paused');
    t = Math.max(0, Math.min(msAt - acc, X.beats[k].d));
    if (scene && scene.upd) scene.upd(t / X.beats[k].d);
    stageEl.getAnimations({subtree:true}).forEach(a => { a.pause(); a.currentTime = t; });
  }
  window.XP = { load, seek, total, list: EXPLAINERS };
  if (EXPORT) {
    document.documentElement.classList.add('xp-export');
    if (LANG === 'zh') document.documentElement.classList.add('xp-zh');
    const f = html('div','xp-exportframe'); document.body.append(f); f.append(stageEl);
    requestAnimationFrame(fit);
  }
  const hashId = decodeURIComponent(location.hash.slice(1));
  load(stageEl.dataset.xp || hashId, EXPORT);
  last = performance.now(); requestAnimationFrame(frame);
})();

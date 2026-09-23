/* ============================================================
   junior.js — the Junior Gunners arcade (junior.html only).
   Everything here runs entirely in the browser: no network calls
   (junior.html's CSP allows none beyond 'self', by design), no
   accounts, no submissions, nothing typed is stored or sent. Best
   scores live in this device's localStorage and never leave it.
   Depends on app.js ($, store, SQUAD), so it loads right after it.
   ============================================================ */

/* JG_-prefixed on purpose: these used to be QUIZ/BINGO in app.js, and a
   visitor with that older app.js still cached would hit a duplicate
   `const` declaration and lose every game on the page. */
const JG_QUIZ = [
  {q:'What is the name of Arsenal’s home ground?', a:['Emirates Stadium','Highbury','Old Trafford'], c:0,
   f:'Arsenal moved there in 2006 from Highbury, which was just down the road.'},
  {q:'What is on the Arsenal badge?', a:['A cannon','A lion','An eagle'], c:0,
   f:'A cannon. Arsenal started in 1886 as a team of workers at a weapons factory in Woolwich — that’s where the name comes from.'},
  {q:'Who wears number 8 and the captain’s armband?', a:['Bukayo Saka','Martin Ødegaard','Declan Rice'], c:1,
   f:'Martin Ødegaard, from Norway. He’s the one always pointing at where he wants everyone to run.'},
  {q:'What is a “clean sheet”?', a:['A brand new kit','The other team scored zero','The half-time break'], c:1,
   f:'The goalkeeper and defenders get most of the credit — and they will remind you of it.'},
  {q:'How many players does each team have on the pitch at kick-off?', a:['Nine','Eleven','Fifteen'], c:1,
   f:'Eleven each, including the goalkeeper. Up to five can be swapped for substitutes.'},
  {q:'What is Arsenal’s nickname?', a:['The Gunners','The Magpies','The Toffees'], c:0,
   f:'The Gunners, because of the cannon. The Magpies are Newcastle and the Toffees are Everton.'},
  {q:'The “Invincibles” went a whole league season without…', a:['Scoring a goal','Losing a game','Winning a corner'], c:1,
   f:'In 2003–04 Arsenal played 38 league games and lost none of them. Nobody has done it since.'},
  {q:'Who is Arsenal’s manager?', a:['Mikel Arteta','Thierry Henry','Bukayo Saka'], c:0,
   f:'Mikel Arteta. He used to play for Arsenal too — he was the captain.'},
  {q:'Who has scored the most goals ever for Arsenal?', a:['Thierry Henry','Ian Wright','Bukayo Saka'], c:0,
   f:'Thierry Henry, with 228. There’s a statue of him outside the Emirates.'},
  {q:'How long is a normal football match?', a:['60 minutes','90 minutes','2 hours'], c:1,
   f:'Two halves of 45 minutes, plus a few extra minutes the referee adds on for stoppages.'},
  {q:'Which team does Arsenal play in the North London derby?', a:['Chelsea','Tottenham','West Ham'], c:1,
   f:'Tottenham Hotspur. For a lot of fans it’s the biggest game of the season.'},
  {q:'What happens if a player gets two yellow cards in one game?', a:['Nothing at all','It’s a red card and they have to go off','They get to take a penalty'], c:1,
   f:'Two yellows make a red. Their team then has to play with one player fewer.'},
  {q:'How many points does a team get for winning a Premier League game?', a:['One','Two','Three'], c:2,
   f:'Three for a win, one for a draw, none for a loss.'},
  {q:'Where did Bukayo Saka learn to play before joining the first team?', a:['Arsenal’s own academy','A school in Spain','He never practised'], c:0,
   f:'He came through Hale End, Arsenal’s youth academy — just like Myles Lewis-Skelly and Max Dowman.'},
  {q:'What colours does Arsenal usually wear at home?', a:['Red and white','All blue','Green and yellow'], c:0,
   f:'Red shirts with white sleeves. It’s been that way since the 1930s.'},
  {q:'Who is the youngest player ever to start a match for Arsenal?', a:['Max Dowman','Declan Rice','David Raya'], c:0,
   f:'Max Dowman, aged 16, against Ipswich in September 2026 — and he scored twice.'}
];

const JG_BINGO = ['Arsenal win a corner','Someone shouts at the referee','Saka takes on a defender','A shot hits the post',
  'The keeper makes a save','A player gets a yellow card','Arsenal score','Someone slides on their knees',
  'The commentator says “Arteta”','A substitute comes on','The ball goes in the crowd','Full time whistle',
  'A header at goal','The offside flag goes up','A free kick near the box','The keeper kicks it long',
  'Fans start a song','A VAR check','The captain talks to the referee','Someone rolls on the grass'];

/* ---------- shared bits ---------- */
const jgReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const shuffle = arr => {
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const bestAll = () => store.get('jg-best') || {};
const getBest = k => { const v = bestAll()[k]; return v == null ? null : v; };
/* lowerWins for memory, where fewer moves is better */
function setBest(k, v, lowerWins){
  const all = bestAll(), cur = all[k];
  if(cur == null || (lowerWins ? v < cur : v > cur)){
    all[k] = v; store.set('jg-best', all); refreshTiles(); return true;
  }
  return false;
}
function confetti(host){
  if(jgReduce || !host) return;
  const colors = ['#EF0107', '#FFFFFF', '#DAB876', '#063672', '#F5D90A'];
  for(let i = 0; i < 30; i++){
    const s = document.createElement('span');
    s.className = 'confetti';
    s.style.left = (Math.random() * 100) + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = (Math.random() * .35) + 's';
    s.style.setProperty('--dx', (Math.random() * 140 - 70) + 'px');
    host.appendChild(s);
    setTimeout(() => s.remove(), 2200);
  }
}
const panelOf = el => el.closest('.arcade__panel');

/* ---------- arcade menu ---------- */
const GAMES = ['quiz', 'pens', 'keepy', 'who', 'memory', 'kit', 'bingo'];
const BEST_LABEL = {
  quiz: v => `Best ${v}/10`, pens: v => `Best ${v}/5`, keepy: v => `Best ${v}`,
  who: v => `Best ${v}/24`, memory: v => `Best ${v} moves`
};
function refreshTiles(){
  document.querySelectorAll('.arcade__tile').forEach(t => {
    const k = t.dataset.game, v = getBest(k), el = t.querySelector('small');
    if(el && BEST_LABEL[k]) el.textContent = v == null ? el.dataset.idle : BEST_LABEL[k](v);
  });
}
function openGame(id, fromUser){
  if(!GAMES.includes(id)) id = 'quiz';
  document.querySelectorAll('.arcade__tile').forEach(t => {
    const on = t.dataset.game === id;
    t.classList.toggle('is-on', on);
    t.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  document.querySelectorAll('.arcade__panel').forEach(p => { p.hidden = p.dataset.panel !== id; });
  if(id !== 'keepy') keepy.stop();
  if(!fromUser) return;
  try{ history.replaceState(null, '', '#' + id); }catch(e){}
  $('#arcade-stage').scrollIntoView({block:'start', behavior: jgReduce ? 'auto' : 'smooth'});
}
$('#arcade-menu').addEventListener('click', e => {
  const t = e.target.closest('.arcade__tile');
  if(t) openGame(t.dataset.game, true);
});

/* ---------- 1. quiz: ten random questions, one at a time ---------- */
const quiz = (() => {
  const el = $('#quiz');
  let qs, i, score, answered;
  function start(){
    qs = shuffle(JG_QUIZ).slice(0, 10).map(q => {
      const order = shuffle(q.a.map((_, j) => j));
      return {q:q.q, a:order.map(j => q.a[j]), c:order.indexOf(q.c), f:q.f};
    });
    i = 0; score = 0; render();
  }
  function render(){
    if(i >= qs.length) return finish();
    const q = qs[i]; answered = false;
    el.innerHTML = `
      <div class="jq__top"><span>Question ${i + 1} of ${qs.length}</span><span>Score <b>${score}</b></span></div>
      <div class="jq__bar"><i style="width:${i / qs.length * 100}%"></i></div>
      <p class="q__p">${q.q}</p>
      <div class="q__opts">${q.a.map((a, j) => `<button class="q__opt" type="button" data-j="${j}">${a}</button>`).join('')}</div>
      <p class="q__fb" id="jq-fb"></p>
      <button class="btn btn--solid jq__next" type="button" id="jq-next" hidden>${i === qs.length - 1 ? 'See my score' : 'Next question'}</button>`;
  }
  function finish(){
    const pct = score / qs.length;
    const msg = pct === 1 ? 'Perfect score. Ødegaard would hand you the armband.'
      : pct >= .7 ? 'Proper Gooner knowledge. Nearly there.'
      : pct >= .4 ? 'Not bad at all — the grown-ups get some of these wrong too.'
      : 'Every Gooner starts somewhere. Have another go.';
    const isBest = setBest('quiz', score);
    el.innerHTML = `<div class="jend">
      <p class="jend__big">${score}<small>/${qs.length}</small></p>
      <p class="jend__msg">${msg}</p>
      ${isBest && score > 0 ? '<p class="jend__best">New best score</p>' : ''}
      <button class="btn btn--solid" type="button" id="jq-again">Play again</button></div>`;
    if(pct >= .7) confetti(panelOf(el));
  }
  el.addEventListener('click', e => {
    const opt = e.target.closest('.q__opt');
    if(opt && !answered){
      answered = true;
      const q = qs[i], j = Number(opt.dataset.j), right = j === q.c;
      el.querySelectorAll('.q__opt').forEach(b => { b.disabled = true; });
      if(right){ opt.classList.add('is-right'); score++; el.querySelector('.jq__top b').textContent = score; }
      else { opt.classList.add('is-wrong'); el.querySelectorAll('.q__opt')[q.c].classList.add('is-right'); }
      const fb = $('#jq-fb');
      fb.textContent = (right ? 'Yes! ' : 'Not quite. ') + q.f;
      fb.classList.add('is-shown');
      const next = $('#jq-next'); next.hidden = false; next.focus({preventScroll:true});
      return;
    }
    if(e.target.id === 'jq-next'){ i++; render(); }
    else if(e.target.id === 'jq-again') start();
  });
  start();
})();

/* ---------- 2. penalty shootout: take five, or go in goal ---------- */
const pens = (() => {
  const pitch = $('#pens-pitch'), goal = $('#pens-goal'), ball = $('#pens-ball'),
        keeper = $('#pens-keeper'), msg = $('#pens-msg'), dots = $('#pens-dots');
  const KICKS = 5, ZONE = ['Top left', 'Top middle', 'Top right', 'Bottom left', 'Bottom middle', 'Bottom right'];
  let mode = 'shoot', results = [], busy = false;
  const idle = () => mode === 'shoot' ? 'Pick a spot in the goal and shoot.' : 'You’re in goal. Pick where to dive.';
  function place(snap){
    if(snap) pitch.classList.add('no-anim');
    ball.style.transform = ''; keeper.style.transform = '';
    if(snap){ void pitch.offsetWidth; pitch.classList.remove('no-anim'); }
  }
  function renderDots(){
    dots.innerHTML = Array.from({length:KICKS}, (_, k) => {
      const r = results[k];
      return `<span class="pens__dot${r === undefined ? '' : (r ? ' is-good' : ' is-bad')}">${r === undefined ? k + 1 : (r ? '✓' : '✗')}</span>`;
    }).join('');
  }
  function reset(){
    results = []; busy = false; place(true); renderDots(); msg.textContent = idle();
    pitch.classList.toggle('is-saving', mode === 'save');
    goal.querySelectorAll('.pens__zones button').forEach((b, z) => b.setAttribute('aria-label', (mode === 'shoot' ? 'Shoot ' : 'Dive ') + ZONE[z].toLowerCase()));
  }
  function take(z){
    if(busy || results.length >= KICKS) return;
    busy = true;
    const shot = mode === 'shoot' ? z : Math.floor(Math.random() * 6);
    const dive = mode === 'shoot' ? Math.floor(Math.random() * 6) : z;
    const top = shot < 3, sameSide = shot % 3 === dive % 3;
    const missed = mode === 'shoot' && top && Math.random() < .12;
    let saved = false;
    if(!missed && sameSide) saved = shot % 3 === 1 ? true : Math.random() < (top ? .5 : .85);
    const gw = goal.offsetWidth, gh = goal.offsetHeight;
    const col = shot % 3, row = Math.floor(shot / 3);
    const tx = goal.offsetLeft + (col + .5) / 3 * gw - (ball.offsetLeft + ball.offsetWidth / 2);
    const ty = missed ? goal.offsetTop - 34 - (ball.offsetTop + ball.offsetHeight / 2)
                      : goal.offsetTop + (row + .5) / 2 * gh - (ball.offsetTop + ball.offsetHeight / 2);
    ball.style.transform = `translate(${tx}px, ${ty}px) scale(.62) rotate(${col * 180 - 180}deg)`;
    const dx = (dive % 3 - 1) * gw / 3, dy = dive < 3 ? -gh * .3 : 0, rot = (dive % 3 - 1) * 58;
    keeper.style.transform = `translateX(calc(-50% + ${dx}px)) translateY(${dy}px) rotate(${rot}deg)`;
    const good = mode === 'shoot' ? (!saved && !missed) : saved;
    setTimeout(() => {
      results.push(good); renderDots();
      if(mode === 'shoot'){
        msg.textContent = missed ? 'Over the bar! Top corners are risky.'
          : saved ? pick(['Saved! The keeper guessed right.', 'Saved! Great stop by the keeper.'])
          : pick(['GOAL! The keeper went the wrong way.', 'GOAL! Cool as you like.', 'GOAL! No chance for the keeper.']);
      } else {
        msg.textContent = saved ? pick(['SAVED! What a stop.', 'SAVED! Raya would be proud.']) : pick(['Goal. You dived the wrong way.', 'Goal. Tucked away — guess again next time.']);
      }
      if(results.length === KICKS) setTimeout(finish, 900);
      else setTimeout(() => { place(true); busy = false; }, 1100);
    }, 560);
  }
  function finish(){
    const n = results.filter(Boolean).length;
    const key = mode === 'shoot' ? 'pens' : 'pensSave';
    const isBest = setBest(key, n);
    msg.textContent = (mode === 'shoot' ? `You scored ${n} out of 5.` : `You saved ${n} out of 5.`) +
      (n === 5 ? ' Perfect!' : n >= 3 ? ' Shootout winner.' : ' Tough day at the spot.') + (isBest && n > 0 ? ' New best!' : '');
    if(n >= 4) confetti(panelOf(pitch));
    busy = true;
  }
  goal.querySelector('.pens__zones').addEventListener('click', e => {
    const b = e.target.closest('button');
    if(b) take(Number(b.dataset.z));
  });
  $('#pens-mode').addEventListener('click', e => {
    const b = e.target.closest('button');
    if(!b) return;
    mode = b.dataset.mode;
    $('#pens-mode').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    reset();
  });
  $('#pens-reset').addEventListener('click', reset);
  reset();
})();

/* ---------- 3. keepy-uppy: tap the ball, don't let it drop ----------
   setInterval rather than requestAnimationFrame on purpose: it keeps
   running (and stays testable) in embedded/background views where rAF
   is throttled to nothing. */
const keepy = (() => {
  const arena = $('#keepy-arena'), ballEl = $('#keepy-ball'), countEl = $('#keepy-count'),
        msg = $('#keepy-msg'), startBtn = $('#keepy-start');
  let x, y, vx, vy, n = 0, timer = null, W, H, R;
  const draw = () => { ballEl.style.transform = `translate(${x - R}px, ${y - R}px) rotate(${x * 2}deg)`; };
  function start(){
    W = arena.clientWidth; H = arena.clientHeight; R = ballEl.offsetWidth / 2;
    x = W / 2; y = H * .3; vx = 0; vy = -2; n = 0;
    countEl.textContent = '0';
    msg.textContent = 'Tap the ball to keep it up!';
    startBtn.hidden = true; arena.classList.add('is-live');
    clearInterval(timer); timer = setInterval(step, 16); draw();
    arena.focus({preventScroll:true});
  }
  function step(){
    vy += .3 + Math.min(n, 40) * .006;
    x += vx; y += vy;
    if(x < R){ x = R; vx = Math.abs(vx) * .8; }
    if(x > W - R){ x = W - R; vx = -Math.abs(vx) * .8; }
    if(y < R){ y = R; vy = Math.abs(vy) * .5; }
    if(y >= H - R * 1.1){ y = H - R * 1.1; draw(); return end(); }
    draw();
  }
  function kick(px, py){
    if(!timer) return;
    const dx = px - x, dy = py - y;
    if(Math.hypot(dx, dy) > R * 1.7) return;
    n++; countEl.textContent = n;
    vy = -(8.5 + Math.random() * 2.5);
    vx = -dx * .16 + (Math.random() - .5) * 2.4;
    ballEl.classList.remove('is-hit'); void ballEl.offsetWidth; ballEl.classList.add('is-hit');
  }
  function end(){
    clearInterval(timer); timer = null; arena.classList.remove('is-live'); ballEl.style.transform = '';
    const isBest = setBest('keepy', n);
    msg.textContent = n === 0 ? 'Dropped it straight away! Have another go.'
      : `${n} keepy-upp${n === 1 ? 'y' : 'ies'}! ` + (isBest ? 'New best!' : `Your best is ${getBest('keepy')}.`);
    startBtn.textContent = 'Go again'; startBtn.hidden = false;
    if(isBest && n >= 10) confetti(panelOf(arena));
  }
  function stop(){
    if(!timer) return;
    clearInterval(timer); timer = null; arena.classList.remove('is-live'); ballEl.style.transform = '';
    startBtn.textContent = 'Start'; startBtn.hidden = false;
    msg.textContent = 'Press Start, then tap the ball to keep it in the air.';
  }
  arena.addEventListener('pointerdown', e => {
    const r = arena.getBoundingClientRect();
    kick(e.clientX - r.left, e.clientY - r.top);
  });
  /* Keyboard: space or enter kicks, but only once the ball has dropped
     into the lower part of the pitch — still a game, just a fair one. */
  arena.addEventListener('keydown', e => {
    if(e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if(!timer){ start(); return; }
    if(y > H * .45) kick(x, y);
  });
  startBtn.addEventListener('click', start);
  document.addEventListener('visibilitychange', () => { if(document.hidden) stop(); });
  return {stop};
})();

/* ---------- 4. who am I? clues from the live SQUAD data ---------- */
const who = (() => {
  const el = $('#who');
  const POS = {GK:'a goalkeeper', DF:'a defender', MF:'a midfielder', FW:'a forward'};
  const players = SQUAD.filter(p => p.pos !== 'MGR');
  const ROUNDS = 6;
  let order, round, score, shown, wrong, done, cur, choices;
  const country = p => p.from.split(' · ')[0];
  const clues = p => [
    `I’m ${POS[p.pos] || 'in the squad'}.`,
    `I’m from ${country(p)}.`,
    `I wear shirt number ${p.no}.`,
    `My name starts with “${p.name[0]}”.`
  ];
  function start(){ order = shuffle(players).slice(0, ROUNDS); round = 0; score = 0; next(); }
  function next(){
    if(round >= ROUNDS) return finish();
    cur = order[round]; shown = 1; wrong = 0; done = false;
    choices = shuffle([cur, ...shuffle(players.filter(p => p !== cur)).slice(0, 3)]);
    render();
  }
  function render(){
    const list = clues(cur).slice(0, shown);
    el.innerHTML = `
      <div class="jq__top"><span>Player ${round + 1} of ${ROUNDS}</span><span>Score <b>${score}</b></span></div>
      <div class="who__card">
        <span class="who__mark${done ? ' is-found' : ''}">${done ? cur.no : '?'}</span>
        <ol class="who__clues">${list.map(c => `<li>${c}</li>`).join('')}</ol>
      </div>
      <div class="q__opts">${choices.map((p, j) => `<button class="q__opt" type="button" data-j="${j}">${p.name}</button>`).join('')}</div>
      <div class="who__actions">
        <button class="btn btn--line" type="button" id="who-more"${shown >= 4 || done ? ' hidden' : ''}>Another clue (${4 - shown} left)</button>
        <button class="btn btn--solid" type="button" id="who-next" hidden>${round === ROUNDS - 1 ? 'See my score' : 'Next player'}</button>
      </div>
      <p class="q__fb" id="who-fb"></p>`;
  }
  function finish(){
    const max = ROUNDS * 4, isBest = setBest('who', score);
    el.innerHTML = `<div class="jend">
      <p class="jend__big">${score}<small>/${max}</small></p>
      <p class="jend__msg">${score >= 18 ? 'You know this squad better than the kit man.' : score >= 10 ? 'Solid scouting. Arteta might give you a job.' : 'Study the Squad page and come back stronger.'}</p>
      ${isBest && score > 0 ? '<p class="jend__best">New best score</p>' : ''}
      <button class="btn btn--solid" type="button" id="who-again">Play again</button></div>`;
    if(score >= 18) confetti(panelOf(el));
  }
  el.addEventListener('click', e => {
    const opt = e.target.closest('.q__opt');
    if(opt && !done){
      const p = choices[Number(opt.dataset.j)];
      if(p === cur){
        done = true;
        const pts = Math.max(1, 5 - shown - wrong);
        score += pts; shown = 4;
        render();
        el.querySelectorAll('.q__opt').forEach(b => { b.disabled = true; if(choices[b.dataset.j] === cur) b.classList.add('is-right'); });
        const fb = $('#who-fb'); fb.textContent = `Yes! It’s ${cur.name}. +${pts} point${pts === 1 ? '' : 's'}.`; fb.classList.add('is-shown');
        $('#who-next').hidden = false;
      } else {
        wrong++; opt.disabled = true; opt.classList.add('is-wrong');
        if(shown < 4){
          shown++;
          const li = document.createElement('li'); li.textContent = clues(cur)[shown - 1];
          el.querySelector('.who__clues').appendChild(li);
          const more = $('#who-more');
          if(shown >= 4) more.hidden = true; else more.textContent = `Another clue (${4 - shown} left)`;
        }
      }
      return;
    }
    if(e.target.id === 'who-more' && shown < 4){
      shown++;
      const li = document.createElement('li'); li.textContent = clues(cur)[shown - 1];
      el.querySelector('.who__clues').appendChild(li);
      if(shown >= 4) e.target.hidden = true; else e.target.textContent = `Another clue (${4 - shown} left)`;
    } else if(e.target.id === 'who-next'){ round++; next(); }
    else if(e.target.id === 'who-again') start();
  });
  start();
})();

/* ---------- 5. memory match ---------- */
const memory = (() => {
  const grid = $('#memory-grid'), movesEl = $('#memory-moves'), msg = $('#memory-msg');
  const ICONS = [['⚽', 'Ball'], ['🥅', 'Goal'], ['🏆', 'Trophy'], ['🧤', 'Gloves'], ['👟', 'Boots'],
                 ['🟨', 'Yellow card'], ['📣', 'Chant'], ['🚩', 'Corner flag']];
  const PAIRS = 6;
  let cards, open, matched, moves, lock;
  function start(){
    const set = shuffle(ICONS).slice(0, PAIRS);
    cards = shuffle([...set, ...set]);
    open = []; matched = 0; moves = 0; lock = false;
    movesEl.textContent = '0';
    const b = getBest('memory');
    msg.textContent = 'Find all six pairs in as few moves as you can.' + (b == null ? '' : ` Your best: ${b} moves.`);
    grid.innerHTML = cards.map((c, i) => `<button class="mem" type="button" data-i="${i}" aria-label="Hidden card"><span class="mem__in"><span class="mem__back"></span><span class="mem__face">${c[0]}<small>${c[1]}</small></span></span></button>`).join('');
  }
  grid.addEventListener('click', e => {
    const b = e.target.closest('.mem');
    if(!b || lock || b.classList.contains('is-up')) return;
    b.classList.add('is-up'); b.setAttribute('aria-label', cards[b.dataset.i][1]);
    open.push(b);
    if(open.length < 2) return;
    moves++; movesEl.textContent = moves;
    const [a, c] = open;
    if(cards[a.dataset.i][0] === cards[c.dataset.i][0]){
      a.classList.add('is-match'); c.classList.add('is-match'); a.disabled = c.disabled = true;
      open = []; matched++;
      if(matched === PAIRS){
        const isBest = setBest('memory', moves, true);
        msg.textContent = `All pairs found in ${moves} moves! ` + (isBest ? 'New best!' : `Your best is ${getBest('memory')}.`);
        confetti(panelOf(grid));
      }
    } else {
      lock = true;
      setTimeout(() => {
        [a, c].forEach(x => { x.classList.remove('is-up'); x.setAttribute('aria-label', 'Hidden card'); });
        open = []; lock = false;
      }, 850);
    }
  });
  $('#memory-new').addEventListener('click', start);
  start();
})();

/* ---------- 6. design your own kit ----------
   Nothing typed here is saved or sent. The name only ever goes into
   an SVG <text> node via textContent, never innerHTML. */
const kit = (() => {
  const PALETTE = {Red:'#EF0107', White:'#FFFFFF', Navy:'#063672', Gold:'#DAB876', Black:'#111111',
                   Yellow:'#F5D90A', Green:'#1E8E3E', Sky:'#6CB4EE', Claret:'#8A1538', Orange:'#F58025'};
  const PATTERNS = ['Plain', 'Stripes', 'Hoops', 'Half', 'Sash'];
  const s = {body:'#EF0107', sleeves:'#FFFFFF', pattern:'Plain', pat:'#FFFFFF', trim:'#FFFFFF', text:'#FFFFFF', name:'', num:'7'};
  const svg = id => document.getElementById(id);
  function shapes(){
    const f = `fill="${s.pat}"`;
    if(s.pattern === 'Stripes') return [0,1,2,3,4,5].map(k => `<rect x="${58 + k * 16}" y="0" width="8" height="220" ${f}/>`).join('');
    if(s.pattern === 'Hoops') return [0,1,2,3,4,5,6].map(k => `<rect x="0" y="${30 + k * 28}" width="200" height="14" ${f}/>`).join('');
    if(s.pattern === 'Half') return `<rect x="100" y="0" width="100" height="220" ${f}/>`;
    if(s.pattern === 'Sash') return `<polygon points="46,40 76,18 176,190 146,214" ${f}/>`;
    return '';
  }
  function render(){
    svg('kit-body').setAttribute('fill', s.body);
    svg('kit-sl-l').setAttribute('fill', s.sleeves);
    svg('kit-sl-r').setAttribute('fill', s.sleeves);
    svg('kit-pattern').innerHTML = shapes();
    ['kit-collar', 'kit-cuff-l', 'kit-cuff-r'].forEach(id => svg(id).setAttribute('stroke', s.trim));
    const name = svg('kit-name'), num = svg('kit-num');
    const label = s.name || 'YOUR NAME';
    /* ~80 units of shirt back at name height; heavy caps run ~.72em wide */
    name.textContent = label; name.setAttribute('fill', s.text);
    name.setAttribute('font-size', Math.min(17, 80 / (label.length * .72)).toFixed(1));
    name.setAttribute('opacity', s.name ? '1' : '.45');
    num.textContent = s.num || ''; num.setAttribute('fill', s.text);
    document.querySelectorAll('#kit-ctl [data-part]').forEach(b => {
      const part = b.dataset.part, v = b.dataset.v;
      b.setAttribute('aria-pressed', (part === 'pattern' ? s.pattern === v : s[part] === v) ? 'true' : 'false');
    });
  }
  const swatches = part => `<div class="swatches">${Object.entries(PALETTE).map(([n, hex]) =>
    `<button type="button" class="sw" data-part="${part}" data-v="${hex}" style="background:${hex}" aria-label="${n}"></button>`).join('')}</div>`;
  $('#kit-ctl').innerHTML = `
    <div class="kit__row"><span>Shirt</span>${swatches('body')}</div>
    <div class="kit__row"><span>Sleeves</span>${swatches('sleeves')}</div>
    <div class="kit__row"><span>Pattern</span><div class="swatches">${PATTERNS.map(p => `<button type="button" class="pat" data-part="pattern" data-v="${p}">${p}</button>`).join('')}</div></div>
    <div class="kit__row"><span>Pattern colour</span>${swatches('pat')}</div>
    <div class="kit__row"><span>Collar &amp; cuffs</span>${swatches('trim')}</div>
    <div class="kit__row"><span>Name &amp; number colour</span>${swatches('text')}</div>
    <div class="kit__row"><span>Your name and number</span>
      <div class="kit__in">
        <input id="kit-name-in" type="text" maxlength="12" autocomplete="off" spellcheck="false" placeholder="Name" aria-label="Name on the shirt">
        <input id="kit-num-in" type="text" inputmode="numeric" maxlength="2" autocomplete="off" value="7" aria-label="Shirt number">
      </div>
    </div>
    <div class="kit__btns">
      <button class="btn btn--solid" type="button" id="kit-random">Surprise me</button>
      <button class="btn btn--line" type="button" id="kit-classic">Red and white</button>
    </div>
    <p class="kit__note">Nothing you type here is saved or sent anywhere.</p>`;
  $('#kit-ctl').addEventListener('click', e => {
    const b = e.target.closest('[data-part]');
    if(b){ s[b.dataset.part] = b.dataset.v; render(); return; }
    if(e.target.id === 'kit-random'){
      const hex = Object.values(PALETTE);
      s.body = pick(hex); s.sleeves = pick(hex); s.pattern = pick(PATTERNS);
      s.pat = pick(hex.filter(h => h !== s.body)); s.trim = pick(hex);
      s.text = s.body === '#FFFFFF' || s.body === '#F5D90A' || s.body === '#DAB876' ? '#111111' : '#FFFFFF';
      render();
    } else if(e.target.id === 'kit-classic'){
      Object.assign(s, {body:'#EF0107', sleeves:'#FFFFFF', pattern:'Plain', pat:'#FFFFFF', trim:'#FFFFFF', text:'#FFFFFF'});
      render();
    }
  });
  $('#kit-name-in').addEventListener('input', e => {
    const clean = e.target.value.replace(/[^A-Za-z .'-]/g, '').slice(0, 12);
    if(clean !== e.target.value) e.target.value = clean;
    s.name = clean.toUpperCase(); render();
  });
  $('#kit-num-in').addEventListener('input', e => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 2);
    if(clean !== e.target.value) e.target.value = clean;
    s.num = clean; render();
  });
  render();
})();

/* ---------- 7. matchday bingo: fixed 3x4 card, rows and columns count ---------- */
const bingo = (() => {
  const el = $('#bingo'), msg = $('#bingo-msg');
  const COLS = 3, ROWS = 4;
  const LINES = [
    ...Array.from({length:ROWS}, (_, r) => Array.from({length:COLS}, (_, c) => r * COLS + c)),
    ...Array.from({length:COLS}, (_, c) => Array.from({length:ROWS}, (_, r) => r * COLS + c))
  ];
  const IDLE = 'Tap a square when it happens during the match. A full row or column is BINGO.';
  let card, on, lines;
  function deal(){
    card = shuffle(JG_BINGO).slice(0, COLS * ROWS); on = new Set(); lines = 0;
    el.innerHTML = card.map((t, i) => `<button type="button" data-i="${i}" aria-pressed="false">${t}</button>`).join('');
    msg.textContent = IDLE;
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('button');
    if(!b) return;
    const i = Number(b.dataset.i);
    on.has(i) ? on.delete(i) : on.add(i);
    b.classList.toggle('is-on', on.has(i));
    b.setAttribute('aria-pressed', on.has(i) ? 'true' : 'false');
    const done = LINES.filter(line => line.every(k => on.has(k)));
    el.querySelectorAll('button').forEach(x => x.classList.remove('is-line'));
    done.forEach(line => line.forEach(k => el.children[k].classList.add('is-line')));
    if(on.size === card.length){ msg.textContent = 'FULL HOUSE! Every single square. Legendary.'; confetti(panelOf(el)); }
    else if(done.length > lines){ msg.textContent = `BINGO! That’s ${done.length} line${done.length > 1 ? 's' : ''}. You’re allowed to be smug.`; confetti(panelOf(el)); }
    else if(!done.length) msg.textContent = IDLE;
    lines = done.length;
  });
  $('#bingo-new').addEventListener('click', deal);
  deal();
})();

refreshTiles();
openGame(location.hash.slice(1), false);

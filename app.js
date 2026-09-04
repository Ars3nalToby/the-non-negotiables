/* ============================================================
   app.js — shared data, helpers, theme, drawer, and site-wide
   motion (reveal-on-scroll, scroll progress, back-to-top).
   Loaded by every page via <script src="app.js"></script>.
   Page-specific rendering lives in each page's own inline
   <script> at the bottom of its body.
   ============================================================ */

/* ============================================================
   DATA_NOTES — upgrade paths
   1. Live fixtures/results/table: football-data.org (free tier,
      X-Auth-Token, competition 'PL') or TheSportsDB (Arsenal = 133604).
   2. Opponent xG / pressing: FBref + StatsBomb open data.
   3. Hotel rates: needs a paid feed (Booking Demand API, Amadeus,
      Expedia Rapid) behind a server. Never put a key in this file.
   4. Crew board: swap localStorage for Supabase (free tier is plenty).
   5. TICKETS: legal constraint documented in the ticket desk section.
      Do not add listings. Route to arsenal.com/tickets only.
   VERIFY BEFORE PUBLISHING: Instagram handles change. ig:null falls
   back to an Instagram search rather than a guessed handle.
   ============================================================ */

const CLUBS = {
  ars:{name:'Arsenal',stadium:'Emirates Stadium',city:'London',area:'Islington, N5',cap:'60,700',station:'Arsenal (Piccadilly line)',note:''},
  cov:{name:'Coventry City',stadium:'Coventry Building Society Arena',city:'Coventry',area:'Rowley\u2019s Green',cap:'32,600',station:'Coventry Arena',last:'Promoted from the Championship',
    note:'Their first season in the top flight in twenty-five years, and they have waited long enough that the away end will sing for ninety minutes regardless of the score. The trap here is treating it as a formality \u2014 newly promoted sides in August are all adrenaline and no fear.'},
  avl:{name:'Aston Villa',stadium:'Villa Park',city:'Birmingham',area:'Aston, B6',cap:'42,600',station:'Witton or Aston',last:'Champions League qualification',
    note:'Emery has never needed much of an excuse, and Villa Park under lights on a Monday is one of the genuinely hostile away days left \u2014 a proper old ground with the Holte End behind one goal and no patience for anyone playing out from the back. They beat us here 2-1 last season, Buend\u00eda in the 95th minute, and they did the double over us in 2023/24. They arrive off a 4-0 hiding at Brighton with Jo\u00e3o Gomes suspended, which historically makes them more dangerous rather than less. Watch the second ball.'},
  che:{name:'Chelsea',stadium:'Stamford Bridge',city:'London',area:'Fulham, SW6',cap:'40,300',station:'Fulham Broadway',last:'Xabi Alonso\u2019s first full season',
    note:'A London derby with a manager who wants his side to control the game in exactly the way we do, which usually produces either a chess match or an absolute mess. Nothing in between. The Bridge is compact and the away allocation is tucked into the corner of the Shed End.'},
  sun:{name:'Sunderland',stadium:'Stadium of Light',city:'Sunderland',area:'Monkwearmouth',cap:'48,700',station:'Stadium of Light (Metro)',last:'Europa League qualification',
    note:'Forty-eight thousand people who have decided, collectively and without discussion, that this is the year. The Stadium of Light on a night game is a genuinely great football experience and an extremely bad place to be one goal down.'},
  bha:{name:'Brighton & Hove Albion',stadium:'American Express Stadium',city:'Brighton',area:'Falmer',cap:'31,800',station:'Falmer',last:'Conference League qualification',
    note:'Brighton have spent a decade being the smartest club in the division, and the Amex is the only ground where the away end genuinely cannot get a taxi afterwards \u2014 Falmer station empties 30,000 people through two platforms. Their build-up is designed to bait a press and punish it. Patience is the whole game plan.'},
  lee:{name:'Leeds United',stadium:'Elland Road',city:'Leeds',area:'Beeston',cap:'37,600',station:'Leeds (then a 25-minute walk)',
    note:'Elland Road does not do quiet. Loud, old, close to the pitch, and utterly indifferent to whether you are the champions. We put five past them at the Emirates in August 2025; nobody at Leeds has forgotten that, and they will not let us forget that they have not forgotten.'},
  nfo:{name:'Nottingham Forest',stadium:'The City Ground',city:'Nottingham',area:'West Bridgford',cap:'30,400',station:'Nottingham (walk over Trent Bridge)',
    note:'The nicest walk to any away ground in England \u2014 over the river, past the swans, into a stand that has been shaking since 1980. Forest transition faster than almost anyone and will happily give us the ball for an hour to get one chance.'},
  eve:{name:'Everton',stadium:'Hill Dickinson Stadium',city:'Liverpool',area:'Bramley-Moore Dock',cap:'52,900',station:'Sandhills',
    note:'The new dock ground is a proper piece of architecture and considerably nastier to visit than late-period Goodison, because 52,000 Evertonians in a steep bowl have rediscovered their voice. Everton away is never routine, whatever the table says.'},
  liv:{name:'Liverpool',stadium:'Anfield',city:'Liverpool',area:'Anfield, L4',cap:'61,000',station:'Liverpool Lime Street',
    note:'You know what Anfield is. The expanded Anfield Road End made it louder rather than more corporate, which nobody predicted. First fifteen minutes is a survival exercise. Get through it at 0-0 and the ground gets nervous quicker than any big stadium in the country.'},
  hul:{name:'Hull City',stadium:'MKM Stadium',city:'Hull',area:'West Park',cap:'25,600',station:'Hull Paragon',
    note:'Newly promoted, a long way from London, and a ground in a park that feels more like a Sunday than a title defence. Which is exactly the danger. These are the six points that decide leagues \u2014 the games nobody writes about in May because you won them 2-0 and forgot.'},
  new:{name:'Newcastle United',stadium:'St James\u2019 Park',city:'Newcastle upon Tyne',area:'City centre',cap:'52,300',station:'Newcastle Central',
    note:'St James\u2019 sits right in the middle of the city, which makes it the best away weekend on the calendar and the hardest one to be sensible on. The away end is in the gods \u2014 bring shoes with grip. Selling Bruno to us has not improved their mood.'},
  mci:{name:'Manchester City',stadium:'Etihad Stadium',city:'Manchester',area:'Eastlands',cap:'61,000',station:'Etihad Campus (tram)',last:'Runners-up, 78 points',
    note:'The team we beat to it, in the first post-Guardiola era anyone has had to imagine. We put three past them in the Community Shield in August, which is worth precisely nothing in February and everything in the group chat.'},
  bre:{name:'Brentford',stadium:'Gtech Community Stadium',city:'London',area:'Brentford, TW8',cap:'17,250',station:'Kew Bridge',
    note:'Seventeen thousand people crammed into a box next to the M4, playing the most annoying football in London. Long throws, set-piece coaches, a goalkeeper starting attacks with 60-yard passes. A genuinely well-run football club and an absolutely miserable Tuesday night.'},
  tot:{name:'Tottenham Hotspur',stadium:'Tottenham Hotspur Stadium',city:'London',area:'N17',cap:'62,850',station:'White Hart Lane or Seven Sisters',
    note:'The North London derby, away, in December, in a stadium that cost more than some countries. Everything else about the season is a rehearsal for this. There is no tactical note worth writing here. Just win it.'},
  bou:{name:'AFC Bournemouth',stadium:'Vitality Stadium',city:'Bournemouth',area:'Kings Park',cap:'11,300',station:'Bournemouth or Pokesdown',last:'Europa League qualification',
    note:'The smallest ground in the division and one of the most awkward fixtures in it \u2014 Bournemouth press with real aggression and the tight pitch does half their work. Eleven thousand people close enough to hear individually.'},
  mun:{name:'Manchester United',stadium:'Old Trafford',city:'Manchester',area:'Trafford',cap:'74,300',station:'Old Trafford (tram) or Piccadilly',last:'Champions League qualification',
    note:'Seventy-four thousand seats, a leaking roof, and a fanbase that has spent a decade being told next season is the one. It is still Old Trafford and it is still the fixture that makes older Gunners go quiet. February away is a proper test of where the season actually is.'},
  cry:{name:'Crystal Palace',stadium:'Selhurst Park',city:'London',area:'South Norwood, SE25',cap:'25,500',station:'Selhurst or Norwood Junction',
    note:'Boxing Day at Selhurst is a cruel piece of scheduling and the Holmesdale End will make sure you feel it. Old ground, terrible sightlines, brilliant noise. Palace have been a bogey side often enough that pretending otherwise is tempting fate.'},
  ful:{name:'Fulham',stadium:'Craven Cottage',city:'London',area:'Fulham, SW6',cap:'29,600',station:'Putney Bridge',
    note:'The prettiest ground in the league \u2014 riverside, Victorian pavilion, the walk through Bishop\u2019s Park. It is also 8pm on the 30th of December, which means four degrees and everyone having had a difficult week. Fulham at home are far better than their reputation.'},
  ips:{name:'Ipswich Town',stadium:'Portman Road',city:'Ipswich',area:'Town centre',cap:'30,300',station:'Ipswich',
    note:'Back up again, and Portman Road remains one of the proper old grounds \u2014 right in the town, stands close to the pitch, a crowd that knows when to get behind them. McKenna\u2019s sides are coached to within an inch of their lives. Nothing is loose against them.'}
};

/* UK offsets: BST (+01:00) to 25 Oct 2026, GMT (+00:00) to 28 Mar 2027, then BST. */
/* `ko` = ISO with an explicit UK offset. `tv` = broadcaster.
   `moved` = shifted from the original slot for television.
   `checked` = date this row was last verified against a live source.
   Fixtures get moved for TV constantly — audit.mjs warns when a
   fixture inside 21 days hasn't been re-checked. */
const FIXTURES = [
  {n:1, ko:'2026-08-21T20:00:00+01:00', opp:'cov', v:'H', result:'W 3-0', scorers:'Havertz, Saka, \u00d8degaard', tv:'Sky Sports', checked:'2026-08-29'},
  {n:2, ko:'2026-08-31T20:00:00+01:00', opp:'avl', v:'A', result:'W 1-0', scorers:'Saka', tv:'Sky Sports', moved:true, checked:'2026-08-29'},
  {n:3, ko:'2026-09-06T16:30:00+01:00', opp:'che', v:'H', tv:'Sky Sports', moved:true, checked:'2026-08-29'},
  {n:4, ko:'2026-09-12T20:00:00+01:00', opp:'sun', v:'A', tv:'TNT Sports', moved:true, checked:'2026-08-29'},
  {n:5, ko:'2026-09-19T15:00:00+01:00', opp:'bha', v:'A', tv:'Not on UK TV \u00b7 3pm blackout', checked:'2026-08-29'},
  {n:6, ko:'2026-10-10T12:30:00+01:00', opp:'lee', v:'H', tv:'TNT Sports', moved:true, checked:'2026-08-29'},
  {n:7, ko:'2026-10-18T16:30:00+01:00', opp:'nfo', v:'A', tv:'Sky Sports', moved:true, checked:'2026-08-29'},
  {n:8, ko:'2026-10-24T15:00:00+01:00', opp:'eve', v:'H', tv:'Not on UK TV \u00b7 3pm blackout', checked:'2026-08-29'},
  {n:9, ko:'2026-11-01T16:30:00+00:00', opp:'liv', v:'A', tv:'Sky Sports', moved:true, checked:'2026-08-29'},
  {n:10,ko:'2026-11-07T15:00:00+00:00', opp:'hul', v:'H'},
  {n:11,ko:'2026-11-21T15:00:00+00:00', opp:'new', v:'A'},
  {n:12,ko:'2026-11-28T15:00:00+00:00', opp:'mci', v:'H'},
  {n:13,ko:'2026-12-02T20:00:00+00:00', opp:'bre', v:'A'},
  {n:14,ko:'2026-12-05T15:00:00+00:00', opp:'tot', v:'A'},
  {n:15,ko:'2026-12-12T15:00:00+00:00', opp:'bou', v:'H', warn:'Arsenal have said this is set to move \u2014 Bournemouth are in Europa League action the preceding Thursday.'},
  {n:16,ko:'2026-12-19T15:00:00+00:00', opp:'mun', v:'H'},
  {n:17,ko:'2026-12-26T15:00:00+00:00', opp:'cry', v:'A'},
  {n:18,ko:'2026-12-30T20:00:00+00:00', opp:'ful', v:'A'},
  {n:19,ko:'2027-01-02T15:00:00+00:00', opp:'ips', v:'H'},
  {n:20,ko:'2027-01-06T20:00:00+00:00', opp:'bre', v:'H'},
  {n:21,ko:'2027-01-16T15:00:00+00:00', opp:'hul', v:'A'},
  {n:22,ko:'2027-01-23T15:00:00+00:00', opp:'new', v:'H'},
  {n:23,ko:'2027-01-30T15:00:00+00:00', opp:'mci', v:'A'},
  {n:24,ko:'2027-02-06T15:00:00+00:00', opp:'liv', v:'H'},
  {n:25,ko:'2027-02-10T20:00:00+00:00', opp:'ips', v:'A'},
  {n:26,ko:'2027-02-20T15:00:00+00:00', opp:'ful', v:'H'},
  {n:27,ko:'2027-02-27T15:00:00+00:00', opp:'mun', v:'A'},
  {n:28,ko:'2027-03-03T20:00:00+00:00', opp:'cry', v:'H'},
  {n:29,ko:'2027-03-13T15:00:00+00:00', opp:'che', v:'A'},
  {n:30,ko:'2027-03-20T15:00:00+00:00', opp:'sun', v:'H'},
  {n:31,ko:'2027-04-10T15:00:00+01:00', opp:'cov', v:'A'},
  {n:32,ko:'2027-04-17T15:00:00+01:00', opp:'avl', v:'H'},
  {n:33,ko:'2027-04-24T15:00:00+01:00', opp:'bou', v:'A'},
  {n:34,ko:'2027-05-01T15:00:00+01:00', opp:'tot', v:'H'},
  {n:35,ko:'2027-05-08T15:00:00+01:00', opp:'lee', v:'A'},
  {n:36,ko:'2027-05-15T15:00:00+01:00', opp:'nfo', v:'H'},
  {n:37,ko:'2027-05-23T15:00:00+01:00', opp:'eve', v:'A'},
  {n:38,ko:'2027-05-30T16:00:00+01:00', opp:'bha', v:'H'}
];

/* ---- Champions League league phase, drawn 27 Aug 2026 (Monaco) ----
   Dates and kick-off times confirmed by UEFA 29 Aug 2026.
   All eight are 20:00 UK (21:00 CET). GMT from matchday 4 onward. */
const CL = [
  {md:1, ko:'2026-09-09T20:00:00+01:00', v:'A', name:'Napoli', country:'Italy', pot:3,
   ground:'Stadio Diego Armando Maradona', city:'Naples',
   note:'Straight into it. Naples, the Maradona, forty-odd thousand people who treat a European night as a civic event. Opening the league phase away in Campania is about as unforgiving a start as the draw could have given us \u2014 and if you only do one away trip this season, do this one. Then do not attempt to drive anywhere.'},
  {md:2, ko:'2026-10-13T20:00:00+01:00', v:'H', name:'Lille', country:'France', pot:3,
   ground:'Emirates Stadium', city:'London',
   note:'First European night back at the Emirates. Lille are always better than the seeding suggests \u2014 well coached, quick in transition, completely unbothered by reputations. A home banana skin dressed up as a comfortable evening.'},
  {md:3, ko:'2026-10-21T20:00:00+01:00', v:'A', name:'Bayern Munich', country:'Germany', pot:1,
   ground:'Allianz Arena', city:'Munich',
   note:'Eight days after Lille, the hardest away trip in the draw. This is the tie that ended 2023/24 for us and a rivalry that runs a lot deeper than most fans want to count. The Allianz on a European night is the best-run big away day in Europe \u2014 the trains work, the beer is cheap, and the stadium glows red from the motorway.'},
  {md:4, ko:'2026-11-04T20:00:00+00:00', v:'A', name:'Slavia Praha', country:'Czechia', pot:4,
   ground:'Fortuna Arena', city:'Prague',
   note:'We won 3-0 there last season, Merino with a brace. Prague in November is cold and beautiful, the Fortuna Arena is small and loud, and the flights are absurdly cheap. The value away day of the whole draw.'},
  {md:5, ko:'2026-11-24T20:00:00+00:00', v:'H', name:'Borussia Dortmund', country:'Germany', pot:2,
   ground:'Emirates Stadium', city:'London',
   note:'Mercifully, the Yellow Wall does not travel. Dortmund away is the great European pilgrimage; Dortmund at home is a very good side without the terrace that makes them frightening. Take the draw.'},
  {md:6, ko:'2026-12-09T20:00:00+00:00', v:'H', name:'Real Madrid', country:'Spain', pot:1,
   ground:'Emirates Stadium', city:'London',
   note:'The night the whole draw was pointing at. Fifteen-time winners, at the Emirates, in December. We knocked them out of the 2024/25 quarter-final \u2014 3-0 here, then 2-1 at the Bernab\u00e9u \u2014 and nobody in that dressing room has forgotten it. This is the ticket everyone will want and almost nobody will get.'},
  {md:7, ko:'2027-01-20T20:00:00+00:00', v:'A', name:'Real Betis', country:'Spain', pot:2,
   ground:'Estadio Benito Villamar\u00edn', city:'Seville',
   note:'Seville in January, a stadium being rebuilt around you, and a crowd singing a song older than half the clubs in this competition. The most underrated trip in the draw and the one to book first, before everyone else works it out.'},
  {md:8, ko:'2027-01-27T20:00:00+00:00', v:'H', name:'Sabah', country:'Azerbaijan', pot:4,
   ground:'Emirates Stadium', city:'London',
   note:'Champions League debutants from Baku, and the one night this season where the Emirates gets to be generous for ninety minutes. Historically this is when Nwaneri scores twice and the internet decides he should start every week. A kind way to finish a brutal league phase.'}
];

/* Demand read — this site's own estimate, not club information. */
const DEMAND = {tot:3,mci:3,liv:3,mun:3,che:3,new:2,avl:2,eve:2,bha:2,nfo:2,cry:2,bre:2,ful:2,sun:2,lee:2,bou:1,cov:1,hul:1,ips:1};
const DEMAND_TEXT = {
  3:{lbl:'Ballot territory',cls:'badge--hard',tier:'Season ticket holders + highest away credits. Members almost never see general sale.'},
  2:{lbl:'Silver, be quick',cls:'badge--mid',tier:'Silver members with a decent record. Red members: refresh at 10am and hope.'},
  1:{lbl:'Red members OK',cls:'badge--easy',tier:'Usually reaches Red membership, and often general sale.'}
};

const KEY_DATES = [
  {d:'16 Aug 2026', t:'Community Shield v Man City, Principality Stadium \u2014 won 3-0'},
  {d:'21 Aug 2026', t:'Premier League title defence begins'},
  {d:'27 Aug 2026', t:'Champions League draw \u2014 Madrid, Bayern, Dortmund, Betis, Lille, Napoli, Sabah, Slavia'},
  {d:'9 Sep 2026', t:'Champions League MD1 \u2014 Napoli away, the Maradona'},
  {d:'21 Oct 2026', t:'Champions League MD3 \u2014 Bayern away, the Allianz'},
  {d:'9 Dec 2026', t:'Champions League MD6 \u2014 Real Madrid at the Emirates'},
  {d:'9 Jan 2027', t:'FA Cup third round'},
  {d:'27 Jan 2027', t:'Champions League MD8 \u2014 Sabah at home, league phase ends'},
  {d:'16 Feb 2027', t:'Champions League knockout phase begins'},
  {d:'21 Mar 2027', t:'Carabao Cup final'},
  {d:'22 May 2027', t:'FA Cup final'},
  {d:'30 May 2027', t:'Premier League season ends'},
  {d:'5 Jun 2027', t:'Champions League final, Metropolitano, Madrid'}
];

const SQUAD = [
  {no:1, pos:'GK', name:'David Raya', from:'Spain', ig:null},
  {no:2, pos:'DF', name:'William Saliba', from:'France', ig:'wsaliba4'},
  {no:3, pos:'DF', name:'Myles Lewis-Skelly', from:'England', ig:null},
  {no:4, pos:'DF', name:'Ben White', from:'England', ig:null},
  {no:5, pos:'MF', name:'Bruno Guimar\u00e3es', from:'Brazil \u00b7 new', ig:null},
  {no:6, pos:'DF', name:'Gabriel Magalh\u00e3es', from:'Brazil', ig:null},
  {no:7, pos:'FW', name:'Bukayo Saka', from:'England', ig:'bukayosaka87'},
  {no:8, pos:'MF', name:'Martin \u00d8degaard', from:'Norway \u00b7 captain', ig:'odegaard.98'},
  {no:9, pos:'FW', name:'Viktor Gy\u00f6keres', from:'Sweden', ig:null},
  {no:10,pos:'MF', name:'Eberechi Eze', from:'England', ig:null},
  {no:12,pos:'DF', name:'Jurri\u00ebn Timber', from:'Netherlands', ig:null},
  {no:13,pos:'GK', name:'Illan Meslier', from:'France \u00b7 new', ig:null},
  {no:14,pos:'FW', name:'Christos Tzolis', from:'Greece \u00b7 new', ig:null},
  {no:15,pos:'MF', name:'Mart\u00edn Zubimendi', from:'Spain', ig:null},
  {no:16,pos:'DF', name:'Piero Hincapi\u00e9', from:'Ecuador', ig:null},
  {no:17,pos:'DF', name:'Riccardo Calafiori', from:'Italy', ig:null},
  {no:18,pos:'DF', name:'Ezri Konsa', from:'England \u00b7 new', ig:null},
  {no:19,pos:'MF', name:'Declan Rice', from:'England', ig:'declanrice'},
  {no:20,pos:'FW', name:'Kai Havertz', from:'Germany', ig:null},
  {no:21,pos:'MF', name:'Mikel Merino', from:'Spain', ig:null},
  {no:23,pos:'FW', name:'Noni Madueke', from:'England', ig:null},
  {no:0, pos:'MGR',name:'Mikel Arteta', from:'Manager since 2019', ig:null}
];

const QUIZ = [
  {q:'What is the name of Arsenal\u2019s home ground?',a:['Emirates Stadium','Highbury','Old Trafford'],c:0,
   f:'Correct. Arsenal moved there in 2006 from Highbury, which was just down the road.'},
  {q:'Which animal is NOT on the Arsenal badge?',a:['A cannon','A lion','Neither \u2014 it\u2019s just a cannon'],c:2,
   f:'The badge is a cannon. Arsenal started as a team of workers at a weapons factory in Woolwich in 1886.'},
  {q:'Who wears number 8 and wears the captain\u2019s armband?',a:['Bukayo Saka','Martin \u00d8degaard','Declan Rice'],c:1,
   f:'Martin \u00d8degaard, from Norway. He is the one always pointing at where he wants everyone to run.'},
  {q:'What is a \u201cclean sheet\u201d?',a:['A new kit','The other team scored zero','Half-time'],c:1,
   f:'Right. The goalkeeper and defenders get most of the credit \u2014 and they will remind you of it.'},
  {q:'How many players from each team are on the pitch at kick-off?',a:['Nine','Eleven','Fifteen'],c:1,
   f:'Eleven each, including the goalkeeper. Five can be swapped for substitutes during the game.'}
];

const BINGO = ['Arsenal win a corner','Someone shouts at the referee','Saka takes on a defender','A shot hits the post',
  'The keeper makes a save','A player gets a yellow card','Arsenal score','Someone slides on their knees',
  'The commentator says \u201cArteta\u201d','A substitute comes on','The ball goes in the crowd','Full time whistle'];

/* ============================================================
   HELPERS
   ============================================================ */
const $ = s => document.querySelector(s);
const enc = encodeURIComponent;
const BNE = 'Australia/Brisbane';
const LDN = 'Europe/London';
const store = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
const fmt = (d,tz,o) => new Intl.DateTimeFormat('en-GB', Object.assign({timeZone:tz}, o)).format(d);
/* hourCycle:'h23' not hour12:false — some engines render midnight as "24:00"
   with hour12:false, and Villa away is exactly 00:00 Brisbane. */
const t24 = (d,tz) => fmt(d,tz,{hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const dayLong = (d,tz) => fmt(d,tz,{weekday:'long',day:'numeric',month:'long'});
const dayShort = (d,tz) => fmt(d,tz,{weekday:'short',day:'2-digit',month:'short'});
const isoDate = (d,tz) => new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const addDays = (d,n) => new Date(d.getTime() + n*86400000);
const bneHour = d => parseInt(fmt(d,BNE,{hour:'2-digit',hourCycle:'h23'}),10);
const isBrutal = d => { const h = bneHour(d); return h >= 1 && h < 6; };
/* Grouping key for the month accordions — sort-stable, UK calendar month. */
const monthKey = d => fmt(d,LDN,{year:'numeric',month:'2-digit'});
const monthLabel = d => fmt(d,LDN,{month:'long',year:'numeric'});
/* Anything rendered via innerHTML that did not come from this file must
   go through this. Matters the moment the crew board gets a real backend. */
const esc = s => String(s).replace(/[&<>"']/g, c => (
  {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ============================================================
   NEXT_I — index of the next unplayed fixture. Shared because the
   hub (which fixture the hero board shows), the timetable ("still to
   come" filter, is-next/is-done styling) and the ticket desk (only
   show sale windows from here on) all need the same answer.
   ============================================================ */
const NEXT_I = (() => {
  const i = FIXTURES.findIndex(f => new Date(f.ko).getTime() > Date.now());
  return i === -1 ? FIXTURES.length - 1 : i;
})();

/* ============================================================
   THEME
   ============================================================ */
(function initTheme(){
  const saved = store.get('nn-theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (sysDark ? 'dark' : 'light');
})();
$('#theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set('nn-theme', next);
});

/* ============================================================
   AWAY-DAY LINKS (keyless, date pre-filled)
   ============================================================ */
function awayLinks(club, koDate){
  const inD = isoDate(addDays(koDate,-1), BNE);
  const outD = isoDate(addDays(koDate,1), BNE);
  const place = club.stadium + ' ' + club.city;
  return [
    {b:'Hotels near the ground', s:'Booking.com \u00b7 dates set', u:`https://www.booking.com/searchresults.html?ss=${enc(place)}&checkin=${inD}&checkout=${outD}&group_adults=1&no_rooms=1`},
    {b:'Compare nightly rates', s:'Google Hotels', u:`https://www.google.com/search?q=${enc('hotels near ' + place)}&hl=en-GB`},
    {b:'Gigs that weekend', s:'Songkick \u00b7 ' + club.city, u:`https://www.songkick.com/search?query=${enc(club.city)}&type=locations`},
    {b:'What\u2019s on in town', s:'Skiddle \u00b7 ' + club.city, u:`https://www.skiddle.com/whats-on/${enc(club.city)}/`},
    {b:'Everything else on', s:'Eventbrite', u:`https://www.eventbrite.co.uk/d/united-kingdom--${enc(club.city.toLowerCase())}/events/`},
    {b:'Getting there', s:'Maps \u00b7 ' + club.station, u:`https://www.google.com/maps/search/?api=1&query=${enc(place)}`},
    {b:'Trains', s:'Trainline', u:'https://www.thetrainline.com/'},
    {b:'Official tickets', s:'Arsenal.com', u:'https://www.arsenal.com/tickets'}
  ];
}

/* ============================================================
   TRANSFERS + WIRE — data only. Render logic lives on transfers.html.
   ============================================================ */
const DEADLINE = '2026-09-01T23:00:00+01:00';
const MOVES_IN = [
  {name:'Bruno Guimarães', club:'Newcastle United', fee:'£75m'},
  {name:'Ezri Konsa', club:'Aston Villa', fee:'£51m'},
  {name:'Christos Tzolis', club:'Club Brugge', fee:'£34m'},
  {name:'Piero Hincapié', club:'Bayer Leverkusen · loan made permanent', fee:'£34m'},
  {name:'Illan Meslier', club:'Leeds United', fee:'Free'}
];
const MOVES_OUT = [
  {name:'Leandro Trossard', club:'Beşiktaş', fee:'£17m'},
  {name:'Jakub Kiwior', club:'Porto', fee:'£14.6m'},
  {name:'Christian Nørgaard', club:'Everton', fee:'£6.8m'},
  {name:'Karl Hein', club:'Werder Bremen', fee:'£2.6m'},
  {name:'Alexei Rojas', club:'Penafiel', fee:'Free'},
  {name:'Reiss Nelson', club:'Contract terminated by mutual consent', fee:'Free'},
  {name:'Ismeal Kabia', club:'St Mirren', fee:'Loan'},
  {name:'Gabriel Jesus', club:'Barcelona', fee:'£8.6m'},
  {name:'Fabio Vieira', club:'Hamburg', fee:'£8.6m'},
  {name:'Ethan Nwaneri', club:'Borussia Dortmund · loan', fee:'Loan'}
];

/* ---- Live wire ----
   Set WIRE_ENDPOINT to your deployed Cloudflare Worker (see wire/index.js).
   Until then the wire shows curated source links instead of failing. */
const WIRE_ENDPOINT = '';   // e.g. 'https://nn-wire.yourname.workers.dev/'
const WIRE_FALLBACK = [
  {t:'Arseblog News — Arsenal news, all day, every day', u:'https://arseblog.news', s:'Arseblog News'},
  {t:'Arsenal transfer live blog', u:'https://www.skysports.com/arsenal-transfer-news', s:'Sky Sports'},
  {t:'Official ins and outs, 2026/27', u:'https://www.arsenal.com/news/arsenal-transfers-all-the-ins-and-outs-in-202627-a8qx29v8B1fR', s:'Arsenal.com'},
  {t:'Arsenal news aggregator — every outlet, newest first', u:'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Arsenal/Transfer+News', s:'NewsNow'}
];

/* ============================================================
   DRAWER — shared because both index.html (hero "open the dossier")
   and timetable.html (row click) use it. Guarded: pages without the
   drawer markup (#drawer/#scrim) just skip this whole block.
   ============================================================ */
const drawer = $('#drawer'), scrim = $('#scrim');
let lastFocus = null;

function openDrawer(i){
  if(!drawer) return;
  const f = FIXTURES[i], c = CLUBS[f.opp], d = new Date(f.ko);
  const home = f.v === 'H';
  const ground = home ? CLUBS.ars : c;
  const dem = DEMAND_TEXT[DEMAND[f.opp] || 2];

  $('#d-eyebrow').textContent = `Matchweek ${f.n} \u00b7 ${home ? 'Home' : 'Away'}`;
  $('#d-body').innerHTML = `
    <p class="dsub">${dayLong(d,LDN)} \u00b7 ${t24(d,LDN)} UK</p>
    <h2 class="dtitle" id="d-title">${home ? 'Arsenal v ' + c.name : c.name + ' v Arsenal'}</h2>

    <div class="dcard">
      <h3>Kick-off, both ends of the world</h3>
      <dl class="kv">
        <dt>London</dt><dd>${t24(d,LDN)} \u00b7 ${dayLong(d,LDN)}</dd>
        <dt>Brisbane</dt><dd>${t24(d,BNE)} \u00b7 ${dayLong(d,BNE)} ${isBrutal(d) ? '<span style="color:var(--red)">\u25cf brutal window</span>' : ''}</dd>
        ${f.tv ? `<dt>On TV</dt><dd>${f.tv}${f.moved ? ' \u2014 moved from the original slot' : ''}</dd>` : ''}
        ${f.checked ? `<dt>Verified</dt><dd style="color:var(--mute);font-size:13px">${f.checked}</dd>` : '<dt>Verified</dt><dd style="color:var(--warn);font-size:13px">Not re-checked \u2014 confirm before booking</dd>'}
        ${f.result ? `<dt>Result</dt><dd style="color:var(--ok);font-weight:600">${f.result}${f.scorers ? ' \u2014 ' + f.scorers : ''}</dd>` : ''}
      </dl>
      ${f.warn ? `<p style="margin:12px 0 0;padding:10px 12px;background:var(--warn-wash);color:var(--warn);font-size:13.5px;line-height:1.5;border-radius:2px">${f.warn}</p>` : ''}
    </div>

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
      <p class="sign">Programme note \u00b7 The Non-Negotiables</p>
    </div>` : ''}

    <div class="dcard">
      <h3>Tickets</h3>
      <p style="margin:0 0 10px"><span class="badge ${dem.cls}">${dem.lbl}</span></p>
      <p style="font-size:14.5px;color:var(--ink-2);margin:0 0 12px;line-height:1.6">${dem.tier}</p>
      <div class="linkgrid">
        <a class="lnk" href="https://www.arsenal.com/tickets" target="_blank" rel="noopener noreferrer"><b>Buy / ballot</b><span>Arsenal.com \u00b7 official</span></a>
        <a class="lnk" href="https://www.arsenal.com/ticket-exchange" target="_blank" rel="noopener noreferrer"><b>Ticket Exchange</b><span>The only legal resale</span></a>
      </div>
    </div>

    <div class="stub">
      <h3>${home ? 'Matchday in N5' : 'The away day'}</h3>
      <p class="dsub" style="margin:-4px 0 12px">Dates pre-filled: ${isoDate(addDays(d,-1),BNE)} \u2192 ${isoDate(addDays(d,1),BNE)}</p>
      <div class="linkgrid">
        ${awayLinks(ground,d).map(l => `<a class="lnk" href="${l.u}" target="_blank" rel="noopener noreferrer"><b>${l.b}</b><span>${l.s}</span></a>`).join('')}
      </div>
    </div>`;

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
    if(e.key === 'Escape'){ closeDrawer(); return; }
    /* Keep Tab inside the drawer while it's open */
    if(e.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
    const f = drawer.querySelectorAll('a[href], button:not([disabled])');
    if(!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
}

if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const io = new IntersectionObserver(entries => {
    entries.forEach((en,k) => {
      if(en.isIntersecting){
        en.target.classList.add('reveal');
        en.target.style.animationDelay = (k * 28) + 'ms';
        io.unobserve(en.target);
      }
    });
  }, {rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.row, .p, .date, .read, .section__head').forEach(el => io.observe(el));
}

/* Thin scroll-progress bar + a back-to-top button that appears once
   you've scrolled past the hero. One passive listener, rAF-throttled,
   touches only style.width/classList — no layout reads on every
   scroll event. */
(function scrollFX(){
  const bar = $('#scroll-progress');
  const topBtn = $('#back-top');
  let ticking = false;
  function update(){
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0) + '%';
    topBtn.classList.toggle('is-visible', window.scrollY > 600);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, {passive:true});
  topBtn.addEventListener('click', () => window.scrollTo({top:0}));
  update();
})();

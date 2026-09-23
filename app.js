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
  ars:{name:'Arsenal',stadium:'Emirates Stadium',city:'London',area:'Islington, N5',cap:'60,700',station:'Arsenal (Piccadilly line)',site:'https://www.arsenal.com',lat:51.555,lon:-0.1086,note:''},
  cov:{name:'Coventry City',stadium:'Coventry Building Society Arena',city:'Coventry',area:'Rowley\u2019s Green',cap:'32,600',station:'Coventry Arena',last:'Promoted from the Championship',site:'https://www.ccfc.co.uk',lat:52.4483,lon:-1.4954,
    note:'Their first season in the top flight in twenty-five years, and they have waited long enough that the away end will sing for ninety minutes regardless of the score. The trap here is treating it as a formality \u2014 newly promoted sides in August are all adrenaline and no fear.'},
  avl:{name:'Aston Villa',stadium:'Villa Park',city:'Birmingham',area:'Aston, B6',cap:'42,600',station:'Witton or Aston',last:'Champions League qualification',site:'https://www.avfc.co.uk',lat:52.5092,lon:-1.8848,
    note:'Emery has never needed much of an excuse, and Villa Park under lights on a Monday is one of the genuinely hostile away days left \u2014 a proper old ground with the Holte End behind one goal and no patience for anyone playing out from the back. They beat us here 2-1 last season, Buend\u00eda in the 95th minute, and they did the double over us in 2023/24. They arrive off a 4-0 hiding at Brighton with Jo\u00e3o Gomes suspended, which historically makes them more dangerous rather than less. Watch the second ball.'},
  che:{name:'Chelsea',stadium:'Stamford Bridge',city:'London',area:'Fulham, SW6',cap:'40,300',station:'Fulham Broadway',last:'Xabi Alonso\u2019s first full season',site:'https://www.chelseafc.com',lat:51.4817,lon:-0.191,
    note:'A London derby with a manager who wants his side to control the game in exactly the way we do, which usually produces either a chess match or an absolute mess. Nothing in between. The Bridge is compact and the away allocation is tucked into the corner of the Shed End.'},
  sun:{name:'Sunderland',stadium:'Stadium of Light',city:'Sunderland',area:'Monkwearmouth',cap:'48,700',station:'Stadium of Light (Metro)',last:'Europa League qualification',site:'https://www.safc.com',lat:54.9144,lon:-1.3883,
    note:'Forty-eight thousand people who have decided, collectively and without discussion, that this is the year. The Stadium of Light on a night game is a genuinely great football experience and an extremely bad place to be one goal down.'},
  bha:{name:'Brighton & Hove Albion',stadium:'American Express Stadium',city:'Brighton',area:'Falmer',cap:'31,800',station:'Falmer',last:'Conference League qualification',site:'https://www.brightonandhovealbion.com',lat:50.8617,lon:-0.0837,
    note:'Brighton have spent a decade being the smartest club in the division, and the Amex is the only ground where the away end genuinely cannot get a taxi afterwards \u2014 Falmer station empties 30,000 people through two platforms. Their build-up is designed to bait a press and punish it. Patience is the whole game plan.'},
  lee:{name:'Leeds United',stadium:'Elland Road',city:'Leeds',area:'Beeston',cap:'37,600',station:'Leeds (then a 25-minute walk)',site:'https://www.leedsunited.com',lat:53.7778,lon:-1.5722,
    note:'Elland Road does not do quiet. Loud, old, close to the pitch, and utterly indifferent to whether you are the champions. We put five past them at the Emirates in August 2025; nobody at Leeds has forgotten that, and they will not let us forget that they have not forgotten.'},
  nfo:{name:'Nottingham Forest',stadium:'The City Ground',city:'Nottingham',area:'West Bridgford',cap:'30,400',station:'Nottingham (walk over Trent Bridge)',site:'https://www.nottinghamforest.co.uk',lat:52.94,lon:-1.1327,
    note:'The nicest walk to any away ground in England \u2014 over the river, past the swans, into a stand that has been shaking since 1980. Forest transition faster than almost anyone and will happily give us the ball for an hour to get one chance.'},
  eve:{name:'Everton',stadium:'Hill Dickinson Stadium',city:'Liverpool',area:'Bramley-Moore Dock',cap:'52,900',station:'Sandhills',site:'https://www.evertonfc.com',lat:53.4308,lon:-2.9615,
    note:'The new dock ground is a proper piece of architecture and considerably nastier to visit than late-period Goodison, because 52,000 Evertonians in a steep bowl have rediscovered their voice. Everton away is never routine, whatever the table says.'},
  liv:{name:'Liverpool',stadium:'Anfield',city:'Liverpool',area:'Anfield, L4',cap:'61,000',station:'Liverpool Lime Street',site:'https://www.liverpoolfc.com',lat:53.4308,lon:-2.9608,
    note:'You know what Anfield is. The expanded Anfield Road End made it louder rather than more corporate, which nobody predicted. First fifteen minutes is a survival exercise. Get through it at 0-0 and the ground gets nervous quicker than any big stadium in the country.'},
  hul:{name:'Hull City',stadium:'MKM Stadium',city:'Hull',area:'West Park',cap:'25,600',station:'Hull Paragon',site:'https://www.hullcity.co.uk',lat:53.7461,lon:-0.3667,
    note:'Newly promoted, a long way from London, and a ground in a park that feels more like a Sunday than a title defence. Which is exactly the danger. These are the six points that decide leagues \u2014 the games nobody writes about in May because you won them 2-0 and forgot.'},
  new:{name:'Newcastle United',stadium:'St James\u2019 Park',city:'Newcastle upon Tyne',area:'City centre',cap:'52,300',station:'Newcastle Central',site:'https://www.nufc.co.uk',lat:54.9756,lon:-1.6217,
    note:'St James\u2019 sits right in the middle of the city, which makes it the best away weekend on the calendar and the hardest one to be sensible on. The away end is in the gods \u2014 bring shoes with grip. Selling Bruno to us has not improved their mood.'},
  mci:{name:'Manchester City',stadium:'Etihad Stadium',city:'Manchester',area:'Eastlands',cap:'61,000',station:'Etihad Campus (tram)',last:'Runners-up, 78 points',site:'https://www.mancity.com',lat:53.4831,lon:-2.2004,
    note:'The team we beat to it, in the first post-Guardiola era anyone has had to imagine. We put three past them in the Community Shield in August, which is worth precisely nothing in February and everything in the group chat.'},
  bre:{name:'Brentford',stadium:'Gtech Community Stadium',city:'London',area:'Brentford, TW8',cap:'17,250',station:'Kew Bridge',site:'https://www.brentfordfc.com',lat:51.4907,lon:-0.2886,
    note:'Seventeen thousand people crammed into a box next to the M4, playing the most annoying football in London. Long throws, set-piece coaches, a goalkeeper starting attacks with 60-yard passes. A genuinely well-run football club and an absolutely miserable Tuesday night.'},
  tot:{name:'Tottenham Hotspur',stadium:'Tottenham Hotspur Stadium',city:'London',area:'N17',cap:'62,850',station:'White Hart Lane or Seven Sisters',site:'https://www.tottenhamhotspur.com',lat:51.6043,lon:-0.0664,
    note:'The North London derby, away, in December, in a stadium that cost more than some countries. Everything else about the season is a rehearsal for this. There is no tactical note worth writing here. Just win it.'},
  bou:{name:'AFC Bournemouth',stadium:'Vitality Stadium',city:'Bournemouth',area:'Kings Park',cap:'11,300',station:'Bournemouth or Pokesdown',last:'Europa League qualification',site:'https://www.afcb.co.uk',lat:50.7352,lon:-1.8382,
    note:'The smallest ground in the division and one of the most awkward fixtures in it \u2014 Bournemouth press with real aggression and the tight pitch does half their work. Eleven thousand people close enough to hear individually.'},
  mun:{name:'Manchester United',stadium:'Old Trafford',city:'Manchester',area:'Trafford',cap:'74,300',station:'Old Trafford (tram) or Piccadilly',last:'Champions League qualification',site:'https://www.manutd.com',lat:53.4631,lon:-2.2913,
    note:'Seventy-four thousand seats, a leaking roof, and a fanbase that has spent a decade being told next season is the one. It is still Old Trafford and it is still the fixture that makes older Gunners go quiet. February away is a proper test of where the season actually is.'},
  cry:{name:'Crystal Palace',stadium:'Selhurst Park',city:'London',area:'South Norwood, SE25',cap:'25,500',station:'Selhurst or Norwood Junction',site:'https://www.cpfc.co.uk',lat:51.3983,lon:-0.0855,
    note:'Boxing Day at Selhurst is a cruel piece of scheduling and the Holmesdale End will make sure you feel it. Old ground, terrible sightlines, brilliant noise. Palace have been a bogey side often enough that pretending otherwise is tempting fate.'},
  ful:{name:'Fulham',stadium:'Craven Cottage',city:'London',area:'Fulham, SW6',cap:'29,600',station:'Putney Bridge',site:'https://www.fulhamfc.com',lat:51.4749,lon:-0.2217,
    note:'The prettiest ground in the league \u2014 riverside, Victorian pavilion, the walk through Bishop\u2019s Park. It is also 8pm on the 30th of December, which means four degrees and everyone having had a difficult week. Fulham at home are far better than their reputation.'},
  ips:{name:'Ipswich Town',stadium:'Portman Road',city:'Ipswich',area:'Town centre',cap:'30,300',station:'Ipswich',site:'https://www.itfc.co.uk',lat:52.0552,lon:1.1447,
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
  {n:3, ko:'2026-09-06T16:30:00+01:00', opp:'che', v:'H', result:'W 2-1', scorers:'Havertz, Ødegaard', tv:'Sky Sports', moved:true, checked:'2026-09-08',
    reaction:{notes:[
      {who:'Mikel Arteta', role:'manager', quote:'A proper London derby. We expected that because of the quality of the opposition, because of the individual quality that they have.', source:'Arsenal.com', url:'https://www.arsenal.com/news/every-word-artetas-post-chelsea-presser-4'},
      {who:'Martin Ødegaard', role:'captain', quote:'I think we showed them today our quality with the ball, without the ball, and I think the result reflects that.', source:'Arseblog News', url:'https://arseblog.news/2026/09/odegaard-and-konsa-react-to-2-1-win-over-chelsea/'},
      {who:'Ezri Konsa', role:'defender', quote:'It’s part of football. Things happen, it’s all about how you react.', source:'Arseblog News', url:'https://arseblog.news/2026/09/odegaard-and-konsa-react-to-2-1-win-over-chelsea/'}
    ]}},
  {n:4, ko:'2026-09-12T20:00:00+01:00', opp:'sun', v:'A', result:'W 2-0', scorers:'Bruno Guimarães, Saka (pen)', tv:'TNT Sports', moved:true, checked:'2026-09-15',
    reaction:{notes:[
      {who:'Mikel Arteta', role:'manager', quote:'The personality that he has, and this was a special game for him as well, what it means for him. How he grabs the game, making decisions that he’s made.', source:'VAVEL International', url:'https://www.vavel.com/en/football/2026/09/12/arsenal/1271211-arteta-praises-guimaraes-for-grabbing-the-game-against-sunderland.html'},
      {who:'Bruno Guimarães', role:'midfielder', quote:'I score a beautiful goal, beautiful moment for me and my family and I am happy.', source:'VAVEL International', url:'https://www.vavel.com/en/football/2026/09/12/arsenal/1271210-guimaraes-a-beautiful-goal-beautiful-moment.html'},
      {who:'David Raya', role:'goalkeeper', quote:'For the players and the team to have that faith and keep going and win the game, two minutes after we score. Even if we conceded a goal, we had the faith to get back in the game.', source:'VAVEL International', url:'https://www.vavel.com/en/football/2026/09/12/arsenal/1271208-raya-reacts-to-penalty-save-against-sunderland.html'}
    ]}},
  {n:5, ko:'2026-09-19T15:00:00+01:00', opp:'bha', v:'A', tv:'Not on UK TV \u00b7 3pm blackout', result:'L 0-3', checked:'2026-09-19',
    reaction:{notes:[
      {who:'Mikel Arteta', role:'manager', quote:'Extremely disappointed. First of all I want to congratulate Brighton, I think they deserve it, I think they were the better team.', source:'Arsenal.com', url:'https://www.arsenal.com/news/every-word-from-artetas-post-brighton-presser-auZJ86i5UOdG'}
    ]}},
  {n:6, ko:'2026-10-10T12:30:00+01:00', opp:'lee', v:'H', tv:'TNT Sports', moved:true, checked:'2026-09-19'},
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
  {n:17,ko:'2026-12-27T19:00:00+00:00', opp:'cry', v:'A', tv:'Sky Sports', moved:true, checked:'2026-09-11'},
  {n:18,ko:'2026-12-30T19:30:00+00:00', opp:'ful', v:'A', tv:'Sky Sports', moved:true, checked:'2026-09-11'},
  {n:19,ko:'2027-01-02T15:00:00+00:00', opp:'ips', v:'H'},
  {n:20,ko:'2027-01-05T19:30:00+00:00', opp:'bre', v:'H', tv:'Sky Sports', moved:true, checked:'2026-09-11'},
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
   ground:'Stadio Diego Armando Maradona', city:'Naples', result:'W 1-0', scorers:'\u00d8degaard',
   note:'Straight into it. Naples, the Maradona, forty-odd thousand people who treat a European night as a civic event. Opening the league phase away in Campania is about as unforgiving a start as the draw could have given us \u2014 and if you only do one away trip this season, do this one. Then do not attempt to drive anywhere.',
   reaction:{notes:[
     {who:'Mikel Arteta', role:'manager', quote:'But to do what we\u2019ve done today in this stadium against this opponent, is remarkable from the team.', source:'Yahoo Sports', url:'https://uk.sports.yahoo.com/news/arteta-lauds-form-odegaard-remarkable-224202694.html'},
     {who:'Declan Rice', role:'midfielder', quote:'It could\u2019ve been four or five tonight if we were a bit more clinical.', source:'VAVEL International', url:'https://www.vavel.com/en/football/2026/09/09/arsenal/1270797-declan-rice-we-played-with-fluidity.html'}
   ]}},
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
  {no:1, pos:'GK', name:'David Raya', from:'Spain', ig:'d.raya1', x:'daviidraya1'},
  {no:2, pos:'DF', name:'William Saliba', from:'France', ig:'wsaliba4', x:'w_saliba4'},
  {no:3, pos:'DF', name:'Myles Lewis-Skelly', from:'England', ig:'myleslewisskelly', x:'lewisskelly49'},
  {no:4, pos:'DF', name:'Ben White', from:'England', ig:null, x:'ben6white'},
  {no:5, pos:'MF', name:'Bruno Guimar\u00e3es', from:'Brazil \u00b7 new', ig:'brunoguimaraes', x:'brunoog97'},
  {no:6, pos:'DF', name:'Gabriel Magalh\u00e3es', from:'Brazil', ig:'_gabrielmagalhaes', x:'biel_m04'},
  {no:7, pos:'FW', name:'Bukayo Saka', from:'England', ig:'bukayosaka87', x:'BukayoSaka87'},
  {no:8, pos:'MF', name:'Martin \u00d8degaard', from:'Norway \u00b7 captain', ig:'odegaard.98', x:null},
  {no:9, pos:'FW', name:'Viktor Gy\u00f6keres', from:'Sweden', ig:'viktorgyokeres', x:'viktor_gyokeres'},
  {no:10,pos:'MF', name:'Eberechi Eze', from:'England', ig:'eze', x:'EbereEze10'},
  {no:12,pos:'DF', name:'Jurri\u00ebn Timber', from:'Netherlands', ig:'jurrientimber', x:'JurrienTimber'},
  {no:13,pos:'GK', name:'Illan Meslier', from:'France \u00b7 new', ig:'illan.meslier', x:'meslierillan'},
  {no:14,pos:'FW', name:'Christos Tzolis', from:'Greece \u00b7 new', ig:'christostzolis', x:'christos_tzolis'},
  {no:15,pos:'MF', name:'Mart\u00edn Zubimendi', from:'Spain', ig:'martin_zubimendi', x:null},
  {no:16,pos:'DF', name:'Piero Hincapi\u00e9', from:'Ecuador', ig:'pierohincapie', x:'pierohincapie'},
  {no:17,pos:'DF', name:'Riccardo Calafiori', from:'Italy', ig:'richycala', x:'Ric_Calafiori'},
  {no:18,pos:'DF', name:'Ezri Konsa', from:'England \u00b7 new', ig:'ezrikonsa', x:'ezrikonsa'},
  {no:19,pos:'MF', name:'Declan Rice', from:'England', ig:'declanrice', x:'_DeclanRice'},
  {no:20,pos:'FW', name:'Kai Havertz', from:'Germany', ig:'kaihavertz29', x:'kaihavertz29'},
  {no:21,pos:'MF', name:'Mikel Merino', from:'Spain', ig:'mikelmerino', x:'mikelmerino1'},
  {no:23,pos:'FW', name:'Noni Madueke', from:'England', ig:'nonzinoo10', x:'NoniMadueke_'},
  {no:0, pos:'MGR',name:'Mikel Arteta', from:'Manager since 2019', ig:'mikelarteta', x:'m8arteta'}
];

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

/* Splits a heading's text into one <span> per word, each masked and
   slid up into place with its own delay — a one-time load-in
   flourish for big static headings. Never touch an element another
   script keeps rewriting via textContent (it'll just get wiped) —
   this is for static headings only. No-op under reduced-motion, and
   a no-op if it's ever called twice on the same element. */
function splitWords(el){
  if(!el || el.dataset.split || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.dataset.split = '1';
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w,i) =>
    `<span class="tw-mask"><span class="tw-word" style="animation-delay:${i * 55}ms">${esc(w)}</span></span>`
  ).join(' ');
}

/* Animates a number counting up from 0 to its target once, the first
   time the element scrolls into view. Target comes from the element's
   own current text (digits + commas only) so the static fallback and
   the animated version can never disagree. */
function countUp(el, duration = 900){
  if(!el || el.dataset.counted) return;
  const target = parseInt(el.textContent.replace(/[^\d]/g, ''), 10);
  if(!Number.isFinite(target)) return;
  el.dataset.counted = '1';
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = performance.now();
  const tick = now => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString('en-GB');
    if(p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('en-GB');
  };
  el.textContent = '0';
  requestAnimationFrame(tick);
}

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
  {name:'Ethan Nwaneri', club:'Borussia Dortmund · loan', fee:'Loan'},
  {name:'Gabriel Martinelli', club:'Al Hilal', fee:'£60m'},
  {name:'Tommy Setford', club:'Stevenage · loan', fee:'Loan'}
];

/* ---- Live wire ----
   Live Arsenal headlines, pulled server-side from RSS (Arseblog, BBC,
   Guardian, Sky) + Bluesky and merged newest-first. Runs as a Supabase
   Edge Function — see wire/supabase-edge.ts for the source and for why
   it isn't the Cloudflare Worker in wire/index.js. Needs the same
   publishable key as everything else, so call it with sbHeaders().
   If it's ever unreachable the pages fall back to WIRE_FALLBACK's
   curated source links rather than showing nothing. */
const WIRE_ENDPOINT = 'https://anueveizfqxnloncuvmf.supabase.co/functions/v1/wire';
const WIRE_FALLBACK = [
  {t:'Arseblog News — Arsenal news, all day, every day', u:'https://arseblog.news', s:'Arseblog News'},
  {t:'Arsenal transfer live blog', u:'https://www.skysports.com/arsenal-transfer-news', s:'Sky Sports'},
  {t:'Official ins and outs, 2026/27', u:'https://www.arsenal.com/news/arsenal-transfers-all-the-ins-and-outs-in-202627-a8qx29v8B1fR', s:'Arsenal.com'},
  {t:'Arsenal news aggregator — every outlet, newest first', u:'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Arsenal/Transfer+News', s:'NewsNow'}
];
/* Shared fetch + 5-minute cache, reused by the fixture drawer's "Latest
   on [opponent]" card below and by the hero's dossier-button badge
   (index.html) — exposed on window so that second consumer doesn't
   need its own copy of this logic or trigger a duplicate fetch. */
let wireCache = null, wireCacheAt = 0;
async function getWireItems(){
  if(wireCache && Date.now() - wireCacheAt < 5*60*1000) return wireCache;
  try{
    const r = await fetch(WIRE_ENDPOINT, {cache:'no-store', headers: sbHeaders()});
    if(!r.ok) throw new Error(r.status);
    const data = await r.json();
    if(!Array.isArray(data.items) || !data.items.length) throw new Error('empty');
    wireCache = data.items.filter(i => /^https:\/\//i.test(i.u));
  }catch(e){
    wireCache = WIRE_FALLBACK;
  }
  wireCacheAt = Date.now();
  return wireCache;
}
window.getWireItems = getWireItems;

/* ---- Community backend (Supabase) ----
   Powers the Away Crew board (tickets.html) and the site-wide visit
   line in the footer. SUPABASE_KEY is Supabase's public "publishable"
   key — safe to ship in client code by design (this is how Supabase
   is meant to be used from a static site); it is not a secret, and
   it grants nothing beyond what the row-level-security policies on
   these two tables explicitly allow: crew_posts (anyone can read,
   anyone can insert a post) and pageviews (anyone can log one,
   anyone can read the total count). No admin access, no way to read
   or alter anything else. Plain fetch() throughout — no SDK — so
   this stays vanilla JS, no new dependency. */
const SUPABASE_URL = 'https://anueveizfqxnloncuvmf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_D40Bu8mh3MtExE82Nt2zXA_BMeXtWRw';
const sbHeaders = extra => Object.assign({apikey:SUPABASE_KEY, Authorization:'Bearer '+SUPABASE_KEY}, extra || {});

/* One anonymous visit logged per browser tab session, not per page —
   click around the site all you like, it's still one visit. No IP,
   no cookie, no identifying data of any kind, just a timestamp and
   which page you landed on. Skipped entirely on junior.html: Junior
   Gunners stays free of any analytics, full stop, no exceptions. */
(function logVisit(){
  if(location.pathname.endsWith('junior.html')) return;
  if(sessionStorage.getItem('nn-visit-logged')) return;
  sessionStorage.setItem('nn-visit-logged', '1');
  fetch(`${SUPABASE_URL}/rest/v1/pageviews`, {
    method:'POST',
    headers: sbHeaders({'Content-Type':'application/json', Prefer:'return=minimal'}),
    body: JSON.stringify({page: location.pathname.replace(/^\//, '') || 'index.html'})
  }).catch(() => {});
})();

/* A quiet "people have actually visited" line in the footer, on
   every page. HEAD + count=exact asks Postgres for just the number,
   never the rows themselves. Fails silently (no line shown) if the
   request is blocked or offline — this is a nice-to-have, not load
   bearing for anything else on the page. */
(async function renderVisitCount(){
  if(location.pathname.endsWith('junior.html')) return;
  const grid = document.querySelector('.foot .foot__grid');
  if(!grid) return;
  try{
    const res = await fetch(`${SUPABASE_URL}/rest/v1/pageviews?select=id`, {
      method:'HEAD', headers: sbHeaders({Prefer:'count=exact'})
    });
    const range = res.headers.get('content-range');
    const total = range && Number(range.split('/')[1]);
    if(!total) return;
    const p = document.createElement('p');
    p.className = 'foot__visits';
    p.textContent = `${total.toLocaleString()} visit${total === 1 ? '' : 's'} logged since launch — real people, no cookies, no tracking.`;
    grid.insertAdjacentElement('afterend', p);
  }catch(e){}
})();

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
  document.querySelectorAll('.row, .p, .date, .read, .section__head, .widget').forEach(el => io.observe(el));
}

/* Big static page headings get the word-by-word slide-in on load.
   .page-head h1 is never rewritten by any page's own script, so this
   is safe everywhere it appears — one call, once, per page load. */
document.querySelectorAll('.page-head h1').forEach(splitWords);

/* Stat numbers (floating badges, etc.) count up from 0 the moment
   they scroll into view. Reuses the same rootMargin as the reveal
   observer above but is a separate instance since these need
   isolated once-only triggering distinct from the CSS reveal class. */
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const countEls = document.querySelectorAll('[data-countup]');
  if(countEls.length){
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if(en.isIntersecting){ countUp(en.target); cio.unobserve(en.target); }
      });
    }, {rootMargin:'0px 0px -20px 0px'});
    countEls.forEach(el => cio.observe(el));
  }
}

/* Nav drag-to-scroll — mouse users with no horizontal scroll wheel
   have no native way to reach nav items past the fold; click-and-drag
   fixes that without touching layout. Scoped to pointerType 'mouse'
   only — touch and pen already get real native scrolling, and
   hijacking those pointer types tends to fight the browser's own
   momentum/inertia scrolling rather than improve on it. A drag past
   a few pixels marks the gesture as "real" so the subsequent click
   doesn't also fire a navigation (handled by the .is-dragging class
   in CSS turning off pointer-events on the links themselves). */
document.querySelectorAll('.nav__in').forEach(nav => {
  let down = false, startX = 0, startScroll = 0;
  nav.addEventListener('pointerdown', e => {
    if(e.pointerType !== 'mouse') return;
    down = true;
    startX = e.clientX;
    startScroll = nav.scrollLeft;
  });
  nav.addEventListener('pointermove', e => {
    if(!down) return;
    const dx = e.clientX - startX;
    if(!nav.classList.contains('is-dragging') && Math.abs(dx) > 4) nav.classList.add('is-dragging');
    if(nav.classList.contains('is-dragging')) nav.scrollLeft = startScroll - dx;
  });
  const endDrag = () => { down = false; nav.classList.remove('is-dragging'); };
  nav.addEventListener('pointerup', endDrag);
  nav.addEventListener('pointerleave', endDrag);
});

/* Nav overflow arrows — the fade mask on its own wasn't telling anyone
   that Fan Art (and whatever else is last) exists off to the right.
   These are real buttons, and they only appear when there is genuinely
   something hidden that way, so a nav that fits shows no chrome at all.
   Built here rather than in the markup so all 12 pages get it without
   12 copies of the same three elements. */
document.querySelectorAll('.nav__in').forEach(nav => {
  const parent = nav.parentElement;
  if(!parent) return;
  parent.classList.add('nav__wrap');

  let prev, next;
  const sync = () => {
    const max = nav.scrollWidth - nav.clientWidth;
    /* 2px slack: sub-pixel layout means scrollLeft rarely lands exactly
       on 0 or on max, and a permanently-lit arrow that does nothing is
       the same broken-feeling thing as no arrow at all. */
    if(prev) prev.dataset.show = nav.scrollLeft > 2 ? '1' : '0';
    if(next) next.dataset.show = nav.scrollLeft < max - 2 ? '1' : '0';
  };

  const arrow = dir => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `nav__arrow nav__arrow--${dir === -1 ? 'prev' : 'next'}`;
    b.setAttribute('aria-label', dir === -1 ? 'Scroll navigation left' : 'More sections');
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === -1 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
    b.addEventListener('click', () => {
      const max = nav.scrollWidth - nav.clientWidth;
      const from = nav.scrollLeft;
      const to = Math.max(0, Math.min(max, from + dir * Math.max(160, nav.clientWidth * 0.7)));
      if(from === to) return;
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ nav.scrollLeft = to; sync(); return; }
      /* setInterval rather than requestAnimationFrame, and sync() called
         directly on each tick rather than trusting the scroll event:
         both rAF and scroll events are starved in some embedded
         contexts (verified here — neither fired), which left the arrow
         either dead or stuck lit the wrong way. A 16ms timer plus an
         explicit sync always runs. */
      const t0 = Date.now(), dur = 280;
      const ease = p => 1 - Math.pow(1 - p, 3);
      const id = setInterval(() => {
        const p = Math.min(1, (Date.now() - t0) / dur);
        nav.scrollLeft = from + (to - from) * ease(p);
        sync();
        if(p >= 1) clearInterval(id);
      }, 16);
    });
    parent.appendChild(b);
    return b;
  };

  prev = arrow(-1);
  next = arrow(1);

  sync();
  nav.addEventListener('scroll', sync, {passive:true});
  window.addEventListener('resize', sync);
  /* Web fonts land after first paint and change every label's width,
     which changes whether anything overflows at all. */
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
});

/* Mascots roll as you scroll past them — each ball's own rotation
   tracks the page's scroll position, offset slightly per-ball so a
   row of them doesn't spin in perfect unison. Runs inside the same
   rAF-throttled scroll loop as scrollFX below; skipped entirely
   under reduced-motion. */
const mascotBalls = [...document.querySelectorAll('[data-mascot]')];
if(mascotBalls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const spin = () => {
    mascotBalls.forEach((el,i) => {
      const deg = (window.scrollY * (0.22 + i * 0.05)) % 360;
      el.style.transform = `rotate(${deg}deg)`;
    });
  };
  let mascotTicking = false;
  window.addEventListener('scroll', () => {
    if(!mascotTicking){ requestAnimationFrame(() => { spin(); mascotTicking = false; }); mascotTicking = true; }
  }, {passive:true});
  spin();
}

/* Mascot eyes track the cursor — each pupil offsets a small distance
   from its resting position toward wherever the pointer is, clamped
   so it never drifts out of its socket. One shared pointermove
   listener for every mascot on the page, rAF-throttled like the
   scroll effects above. Skipped under reduced-motion (pupils just
   sit at their resting cx/cy from the markup) and on touch devices
   with no real pointer to track (coarse pointer = finger, not a
   cursor — chasing a fingertip that's already lifted is meaningless). */
if(mascotBalls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
   && window.matchMedia('(pointer: fine)').matches){
  const maxOffset = 1.6; // SVG user-units; viewBox is 100 wide
  let eyeTicking = false, lastX = 0, lastY = 0;
  const updateEyes = () => {
    mascotBalls.forEach(ball => {
      const rect = ball.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const dx = lastX - cx, dy = lastY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const ox = (dx / dist) * maxOffset, oy = (dy / dist) * maxOffset;
      ball.querySelectorAll('[data-eye]').forEach(p => {
        p.setAttribute('cx', parseFloat(p.dataset.bx) + ox);
        p.setAttribute('cy', parseFloat(p.dataset.by) + oy);
      });
    });
    eyeTicking = false;
  };
  document.addEventListener('pointermove', e => {
    lastX = e.clientX; lastY = e.clientY;
    if(!eyeTicking){ requestAnimationFrame(updateEyes); eyeTicking = true; }
  }, {passive:true});
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

/* Hero → next-section handoff (hub only — #board doesn't exist on
   sub-pages, hence the guard). As the hero board scrolls past the top
   of the viewport, it eases back slightly (scale + fade) instead of
   just vanishing under the next section — a cheap way to make the
   transition feel deliberate without true scroll-driven pinning,
   which risks real layout bugs stacked on top of the existing sticky
   nav. rAF-throttled, same pattern as the mascot spin above.
   Skipped when #board lives inside .cinema__now: there it's the
   cursor-tilt card, and this effect's inline transform:scale(...)
   would silently clobber that card's CSS transform (inline always
   wins over a stylesheet rule), killing the tilt. */
(function heroHandoff(){
  const board = $('#board');
  if(!board || board.closest('.cinema__now') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  const update = () => {
    const r = board.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -r.top / r.height));
    board.style.opacity = String(1 - progress * 0.5);
    board.style.transform = `scale(${1 - progress * 0.04})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, {passive:true});
  update();
})();

/* Shared accordion open/close animation for every .acc on the site
   (squad position groups, timetable months, ticket sale windows).
   Intercepts the click that would normally toggle <details> natively
   and drives the height transition with the Web Animations API
   instead, then hands the `open` attribute back at the end — so
   keyboard activation (Enter/Space fires a click on <summary> same as
   a pointer click) and the existing chevron-rotation CSS keep working
   unmodified. Skipped entirely under reduced-motion: native instant
   toggle is untouched and still fully accessible. */
function initAccordions(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.acc').forEach(details => {
    const summary = details.querySelector(':scope > .acc__summary');
    const body = details.querySelector(':scope > .acc__body');
    if(!summary || !body) return;
    let anim = null, closing = false, expanding = false;
    summary.addEventListener('click', e => {
      e.preventDefault();
      if(closing || !details.open) openAcc();
      else if(expanding || details.open) closeAcc();
    });
    function openAcc(){
      details.style.overflow = 'hidden';
      const startHeight = details.offsetHeight;
      details.open = true;
      const endHeight = summary.offsetHeight + body.offsetHeight;
      runAnim(startHeight, endHeight, true);
    }
    function closeAcc(){
      details.style.overflow = 'hidden';
      const startHeight = details.offsetHeight;
      const endHeight = summary.offsetHeight;
      runAnim(startHeight, endHeight, false);
    }
    function runAnim(from, to, opening){
      if(anim) anim.cancel();
      expanding = opening; closing = !opening;
      anim = details.animate(
        {height:[from + 'px', to + 'px']},
        {duration:300, easing:'cubic-bezier(.22,.7,.3,1)'}
      );
      anim.onfinish = () => {
        details.open = opening;
        details.style.height = details.style.overflow = '';
        anim = null; expanding = closing = false;
      };
      anim.oncancel = () => { expanding = closing = false; };
    }
  });
}
initAccordions();

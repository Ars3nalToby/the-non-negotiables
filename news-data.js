/* ============================================================
   news-data.js — this site's own original news coverage.
   Split out of app.js for the same reason columns.js was: this grows
   indefinitely (the scheduled routine prepends a new item roughly
   every few days) while every page that loads app.js paid its byte
   cost. news.html renders the full list; index.html reads only
   NEWS[0] for the homepage widget teaser.
   Loaded by both pages via <script src="news-data.js"></script>,
   right after app.js.
   ============================================================ */
/* ============================================================
   NEWS — this site's own original coverage. Every entry: a short
   original write-up (never a copied sentence) plus a real, working
   link to the primary source. Newest first — the scheduled routine
   prepends new items here, it never rewrites news.html itself.
   ============================================================ */
const NEWS = [
  {date:'2026-09-15', headline:'Max Dowman becomes Arsenal’s youngest-ever starter — and scores twice to sink Ipswich',
   summary:'Sixteen years and 258 days old, handed a start in a heavily rotated side at Portman Road, and the response was two goals in a 4-2 Carabao Cup win — one either side of strikes from Madueke and Merino, with Ipswich pulling two back late through Mehmeti and Akpom that never threatened the result. It made him the youngest player ever to start a match for this club. Arteta’s read on him afterwards was the tell: “A tiny smile, that’s what you get with him... he doesn’t make a big fuss of it.” Arsenal are through to round four.',
   source:'Sky Sports', url:'https://www.skysports.com/football/news/11095/13582699/ipswich-2-4-arsenal-max-dowman-shines-with-two-goals-as-gunners-ease-into-carabao-cup-fourth-round'},
  {date:'2026-09-14', headline:'Timber gets through Sunderland unscathed — and looks set for his first start of the season',
   summary:'Buried under two separate fitness worries was the update this site has been waiting a month for. Ben White didn’t make it to half-time at the Stadium of Light, withdrawn with what looked like a groin complaint, and William Saliba is now out of Monday’s Carabao Cup trip to Portman Road with a back problem. But Jurrien Timber came through his second-half cameo against Sunderland with nothing wrong, and Arteta all but confirmed he’ll start against Ipswich — the actual return, not another round of “closing in.” Cristhian Mosquera remains a doubt of his own.',
   source:'Sports Mole', url:'https://www.sportsmole.co.uk/football/arsenal/league-cup/team-news/ipswich-vs-arsenal-injury-suspension-list-predicted-xis_605060.html'},
  {date:'2026-09-13', headline:'Arsenal want Pro Ref to explain the Sunderland penalty, VAR and all',
   summary:'David Raya saved it, so the three points were never really at risk, but the club aren’t letting the decision go quietly. Referee John Brooks gave Sunderland a spot-kick for a challenge by Ezri Konsa on Dan Ballard that looked soft from every angle shown, VAR checked it and waved it through regardless, and Arsenal have now asked Pro Ref — the body that oversees Premier League officials — for an explanation of both calls. Arteta’s verdict from the press conference, delivered once he’d had a day to cool off, was that it simply shouldn’t happen at this level.',
   source:'ESPN', url:'https://www.espn.com/soccer/story/_/id/49939662/arsenal-contact-pro-ref-sunderland-penalty-incident-source'},
  {date:'2026-09-13', headline:'Twenty years of the Emirates, told in a handful of numbers',
   summary:'Two decades since the move from Highbury, and the club marked it with a stat sheet rather than a ceremony, which feels about right for a ground built on financial discipline rather than sentiment. The shirt-and-stadium sponsorship is still the longest-running of its kind in the Premier League. Gilberto Silva scored the first competitive goal there, wearing No. 19. Eighteen hat-tricks have gone in since and not one of them belonged to the visitors, and the heaviest scoreline anyone has managed in a single game there is still ten goals, set the afternoon Arsenal put seven past Newcastle in 2012.',
   source:'Arsenal.com', url:'https://arsenal.com/news/emirates-at-20-the-stats-breakdown-aiV0A9T0lVxm'},
  {date:'2026-09-11', headline:'Arsenal get a clean bill ahead of Sunderland: White in, Timber close, Mosquera not far behind',
   summary:'Arteta’s pre-Sunderland briefing was about as good as these things get this early in the season. Ben White has trained through his knock and travels to the Stadium of Light. Jurrien Timber, out since the spring, has been working with the group for several days and is now a genuine selection option rather than a hopeful one. Cristhian Mosquera, sidelined since the Villa game, is being talked about in terms of this weekend or the next rather than in the abstract. Five games unbeaten and the treatment room is finally starting to look normal.',
   source:'Yahoo Sports', url:'https://ca.sports.yahoo.com/news/arteta-provides-injury-updates-arsenal-085000743.html'},
  {date:'2026-09-10', headline:'Festive fixtures land: Palace moves to a Sunday, Fulham and Brentford both shift kick-off times',
   summary:'The Premier League’s Boxing Day round is never actually all on Boxing Day, and this year Arsenal’s trip to Selhurst Park is the one that moves — Crystal Palace away is now Sunday 27 December, 7pm, live on Sky. The following Fulham trip stays on the 30th but shunts back half an hour to 7.30pm, also live. Brentford at home loses a day off the calendar too, sliding from the 6th to Tuesday 5 January, again 7.30pm and again on Sky. Only the Ipswich game on New Year’s weekend survives untouched — 3pm on the 2nd, and still nowhere on UK television. Book accordingly.',
   source:'Arsenal.com', url:'https://www.arsenal.com/news/premier-league-festive-fixture-details-confirmed-atjUt4t54LGl'},
  {date:'2026-09-09', headline:'Arsenal open the Champions League with an away win at Napoli',
   summary:'First points on the board in Europe, and it came the hard way — away, at a ground that does not do quiet nights. Ødegaard settled it with fifteen minutes left, low into the corner off a Tzolis assist. One down, seven to go.',
   source:'VAVEL', url:'https://www.vavel.com/en-us/soccer/2026/09/09/1270590-napoli-vs-arsenal-live-score-uefa-champions-league.html'},
  {date:'2026-09-08', headline:'Rice, Saliba and Gabriel picked for Ballon d’Or shortlist, Raya up for the Yashin Trophy',
   summary:'Three names on the 30-man shortlist for the game’s biggest individual prize, which tells you something about where this squad has got to even if none of them will be troubling the podium. Declan Rice and William Saliba return to the list, Gabriel makes it for the first time, and David Raya’s season earns him a nomination for the Yashin Trophy instead, the goalkeeper-specific award. Arteta’s own body of work has him shortlisted for Men’s Coach of the Year alongside a small group that includes Unai Emery. The ceremony is in London on 26 October, which for once means nobody has to stay up for it.',
   source:'Yahoo Sports', url:'https://sports.yahoo.com/articles/arsenal-rack-nominations-ballon-d-120500413.html'},
  {date:'2026-09-08', headline:'Arsenal sign Crystal Palace academy striker Mylo Bernard',
   summary:'The ins-and-outs are not only senior-squad business. Palace’s leading Under-18 scorer this season joins as a scholar, with a pro contract already lined up for when he turns seventeen — eight years at Palace, gone in one announcement.',
   source:'Arsenal.com', url:'https://www.arsenal.com/news/mylo-bernard-joins-arsenal-a6HBo1d0UJCP'},
  {date:'2026-09-05', headline:'Arteta: Mosquera absence precautionary, Timber closing in on a return',
   summary:'Arteta downplayed Mosquera sitting out the Chelsea game as precaution rather than a fresh knock, and gave the clearest signal yet that Timber’s long lay-off is nearly over — “in a really good condition,” with a call on his involvement coming after Saturday’s session.',
   source:'Daily Cannon', url:'https://dailycannon.com/2026/09/arteta-alonso-arsenal-chelsea-injury-updates/'}
];

/* ============================================================
   columns.js — original opinion columns (programme.html only).
   Split out of app.js because this grows indefinitely (the
   scheduled routine adds one roughly weekly) while every other page
   pays app.js's byte cost on every load; programme.html is the only
   page that needs this data.
   Loaded by programme.html via <script src="columns.js"></script>,
   right before its own inline render script.
   ============================================================ */
/* ============================================================
   COLUMNS — original opinion writing, in the site's own voice.
   Newest first. Grows over time (the scheduled routine adds one
   roughly weekly once the last entry is stale) rather than sitting
   at a fixed three forever — programme.html just renders whatever's
   here, it never carries its own hardcoded essays.
   ============================================================ */
const COLUMNS = [
  {date:'2026-09-27', title:'Nothing has happened to Manchester City yet', byline:'On 114 charges, one appeal, and the table',
   standfirst:'A reported guilty verdict is not a sanction, and nobody should be celebrating anything yet.', paras:[
    'On Friday The Athletic’s David Ornstein reported that the independent commission had found Manchester City guilty on 114 of the 115 charges the Premier League brought in February 2023. It is worth being careful with that sentence. It is a report, citing sources. The Premier League has not published the ruling and declined to comment on it. Nobody has said which charge did not stick.',
    'City’s line is that the process is still going and that they have respected it throughout. They are expected to appeal.',
    'The charges cover 2009/10 to 2017/18: the accuracy of financial reporting, how revenue was documented, related-party deals, what managers and players were paid, UEFA compliance, and cooperation with the investigation itself. That is a long list to be found guilty of nearly all of. It is also a list from a decade ago and more.',
    'What has not happened is anything. There is no sanction. Points deductions, fines, stripped titles and relegation have all been offered up by people writing headlines, and none of them has been decided. Other clubs could pursue claims if City are found to have gained an unfair advantage, but that is a sentence in a report, not a process anyone has started.',
    'Meanwhile the league table, which is the only tribunal that matters in September, has City first and Arsenal second after five games. The champions are second and reading about a court case. It is a slightly odd place to find yourself.',
    'The sensible position for a supporter is the boring one. Don’t build a season on a tribunal. Appeals take time and City will use all of it. If sanctions come, they will come with a published ruling and a long argument, and this site will link to the ruling rather than to anybody’s summary of it. Until then, 114 is a number and not an outcome. Leeds on the tenth of October is a football match, and it is the one thing on the list we can actually affect.'
  ]},
  {date:'2026-09-22', title:'The break nobody in Brisbane asked for', byline:'On the interlull, and getting your Saturdays back',
   standfirst:'Twenty-one days with nothing to set an alarm for. This is meant to feel like relief.', paras:[
    'Brighton kicked off at midnight Brisbane time, which on this site’s own scale is the polite end of the window. It still ended 3–0. Now there is nothing to check. Arsenal’s next match is Leeds at home on Saturday the tenth of October, twenty-one days after the last one, and the timetable has nothing to warn anybody about until then.',
    'That Leeds game kicks off at 12:30 in London, which is 9:30pm in Brisbane. A Saturday evening. No alarm, no shift swap, no invented dentist appointment. The first kick-off in weeks that costs nobody any sleep arrives right after the longest gap in the list, which is the sort of joke the calendar only tells when it thinks you have earned it. Probably you haven’t.',
    'What a break like this is for, stripped of sentiment, is time. Arteta has said what he thought of Brighton, and repeating it for three weeks does not make it more useful. A squad that has played league, Champions League and cup football inside five weeks gets to train without a Saturday attached to everything.',
    'It is also, for anyone who likes a number, the last empty stretch. Most of this season lands between 1am and 6am in Brisbane, so enjoy the blank calendar while it lasts.',
    'Set no alarm for the tenth. It will feel wrong. Do it anyway.'
  ]},
  {date:'2026-09-22', title:'What the treatment room actually needed', byline:'On the international break, medically speaking',
   paras:[
    'The fair thing to say about Brighton is that it was not a full-strength Arsenal, and the fairer thing is that it was never going to be. William Saliba has been out since the summer with a back problem. Ben White picked up a groin issue in the win at Sunderland on the twelfth, missed the Carabao Cup tie with Ipswich and was not in the squad at Brighton. Cristhian Mosquera, with a muscle problem, was not either. Piero Hincapié has been managing something of his own.',
    'Nobody credible excuses a 0–3 with an injury list. Brighton were the better team and the manager said so himself. But the back line Arteta drew up in pre-season has not existed as a unit for most of the time since, and the results were good enough to hide that until Saturday.',
    'Three weeks helps unevenly. White and Mosquera can use it to get properly fit rather than fit enough. Jurriën Timber, back from his own long absence, gets a fortnight where his workload is nobody’s problem. Saliba is a longer story: reports put his return after the November international break, possibly December, so nothing about the Leeds game gets him back.',
    'The honest expectation for the tenth of October is a better defence, not the defence. Whether that is enough to stop what Brighton did is a question the break cannot answer. It can only clear the runway.'
  ]},
  {date:'2026-09-21', title:'Seven from seven, and the record that stayed in 1903', byline:'On matchday five, and the record that got away',
   paras:[
    'Seven wins from seven across league, Champions League and cup is not a run anyone notices until it is one game from a record. Arsenal’s longest winning start to a season is eight, set in 1903–04 when the club was still Woolwich Arsenal and playing in the Second Division. The club itself pointed it out before Brighton: win at the Amex and you equal it, 123 years on.',
    'Brighton were not interested in history. The chase had started against Coventry, Aston Villa, Chelsea and Sunderland in the league, with Napoli and Ipswich in between, and the eighth was supposed to be the easy part.',
    'A record is a convenient way of noticing whether a team has learned to carry pressure. Being hunted is different from hunting, and this group spent years hunting. Now the champions are the target. One 3–0 defeat is a bad afternoon, not a crisis: Arsenal are still second, two points clear of the team that beat them. But the record went before it could even be equalled, and the answer to how this group carries it arrived in September rather than April. Better now.'
  ]},
  {date:'2026-09-20', title:'The Amex has never needed a script', byline:'On Brighton 3-0 Arsenal',
   paras:[
    'Pascal Gross put Brighton ahead after thirty-one minutes. Charalampos Kostoulas doubled it on the stroke of half-time. Chema Andrés headed in a third from a corner shortly before the hour. That last one will annoy Arteta longest, because defending a corner is a solved problem in professional football and on Saturday it was not solved.',
    'Arsenal’s best chance was Kai Havertz one-on-one with the keeper, and he was denied. Beyond that Arsenal could barely get out of their own half. Arseblog’s headline was “Shoddy Gunners get what they deserve”, and it is hard to argue with from the evidence. There is no passage of this game that reads as bad luck.',
    '“Extremely disappointed,” Arteta said afterwards, and to his credit he led with Brighton rather than his own side: “I think they deserve it, I think they were the better team.” That is the correct order to say those two things in, and underneath the good manners it is also as honest an assessment as you will get from a manager who has just watched his champions taken apart.',
    'This site has spent five weeks writing about a team that looked finished with proving things to anyone. Saturday was the reminder that the proving never actually stops. It just changes shape. And it kicked off at midnight.'
  ]},
  {date:'2026-09-20', title:'One bad Saturday for £75m', byline:'On Bruno Guimarães, and patience',
   paras:[
    'The easiest sentence to write after Brighton is the one that blames the new signing, and it is not going to be written here. Bruno Guimarães scored at Sunderland a week earlier. One bad Saturday, produced by an entire team, is not a verdict on £75m.',
    'This is the part of a big transfer nobody enjoys and everybody has to live through: the gap between a player’s reputation and the timing of the passes around him. Guimarães spent years reading games at a tempo most of the league cannot match. None of that transfers instantly. It arrives over months, in training sessions and half-time notes and the hundred small agreements a midfield makes about who covers what when the ball is lost.',
    'The break is probably the best thing that could happen to that. Three weeks of Arsenal training rather than Arsenal matches, with Rice and Ødegaard, away from a Saturday and a stadium that had already decided what kind of afternoon it wanted.',
    'Seventy-five million pounds buys a player, not a finished partnership. Judge him in November, and if it still is not working then, this column will say so.'
  ]},
  {date:'2026-09-11', title:'The armband is not vacant', byline:'On Ødegaard, after Naples',
   standfirst:'Twenty-six shots in Naples, and the only one that mattered belonged to the man half of you spent the summer trying to demote.', paras:[
    'Late on, with the game finally cracking a little, Kevin De Bruyne was played through. Clean. The one moment Napoli had been permitted all evening, handed to the one player in their side capable of doing something irreversible with it. He chose to cross.',
    'Arsenal’s version of that moment had already happened, fifteen minutes earlier, and had gone rather differently. Intricate build-up, the ball worked back to the edge of the box, and Martin Ødegaard hit it low and hard enough that it went in off the post. No hesitation in it. No looking for a better option, because there wasn’t one, and he knew it before the ball arrived.',
    'That contrast is the match. Two footballers of genuine quality were each offered a decision, and only one of them took it.',
    'The structural read is less flattering to Arsenal than the scoreline suggests, which is a strange thing to say about a night that produced twenty-six shots and 4.05 expected goals against 0.22. Thirteen of those shots came in the first half, the most Arsenal have managed in the first half of a Champions League away game since records began in 2003-04. In Naples. In heat you could chew. Against a side that had turned up off back-to-back league defeats and set up accordingly.',
    'What that number tells you is that the chance creation is now industrial. It doesn’t require a moment of inspiration or a set-piece lottery ticket or an opposition error. The machine simply runs, and shooting positions come out of the end of it at a rate that would have seemed fanciful eighteen months ago. Arsenal did not need anything unusual to happen in that first half. They needed roughly forty-five more minutes of exactly what they were already doing.',
    'The machine has one part it cannot manufacture, though, and that’s the last decision. Volume is a system property. Finishing is a personal one. And on the evidence of Wednesday, Arsenal currently have precisely one player reliably converting the system’s output into points.',
    'Which brings us to Bukayo Saka, and I’m going to be blunt about it because pretending otherwise helps nobody. Five shots in the first half worth 0.95 xG. That is nearly a full goal’s worth of opportunity, taken and discarded by one man before the interval. Some of that is bad luck and some of it is bad shooting, and the honest position is that we can’t always tell which is which from the sofa. What we can say is that a striker’s evening’s work went unconverted.',
    'The generous framing, which is also the true one, is that getting into those positions five times in forty-five minutes is the harder half of the job. Saka was where he was supposed to be, repeatedly, in a stadium designed to make players stop wanting to be there. Mikel Merino had his own version of it, meeting an Eze header back across goal and finding the keeper’s hands. Neither of them hid. Both of them will have watched it back with a face on.',
    'I watched it at five in the morning in Brisbane with a shift waiting for me, which meant Ødegaard’s goal landed in a room where I couldn’t make any noise, and the only place to put it was a Malaysian WhatsApp group that had been quietly losing its mind for an hour. By the time De Bruyne squared it, I was already thinking about the dispensary. Seventeen years of this and the geography still hasn’t improved.',
    'The thing worth sitting with is the frequency. Ødegaard’s fourth goal in five games this season, and the second winner in five days after he’d already settled the Chelsea game at the weekend. Two matches that were finely balanced and could have gone either way, and both of them were closed by the same player. He also led every player on the pitch in Naples for chances created with six, in touches with 120, and in line-breaking passes with five. He built the thing and then finished it.',
    'There was a fashionable argument this summer that the armband had drifted to the wrong man, that Declan Rice’s presence and volume and force of personality made him the more natural captain, and that Ødegaard’s version of leadership was too quiet to be leadership at all. I understand why people find that argument attractive. Rice is enormously good and enormously visible, and there’s a certain type of supporter who will always mistake noise for authority.',
    'Wednesday was the rebuttal, and it wasn’t even a loud one. Ødegaard’s captaincy shows up in the ninety seconds a game where somebody has to be certain, and everybody else is calculating.',
    'The development angle is the four changes. Arteta rotated four players from the Chelsea win, took that side to Naples on matchday one, and the performance level did not move an inch. Twelve months ago the honest worry about this squad was whether it could survive rotation, whether the fluency was load-bearing on specific individuals, whether the away trips in Europe would go the way European away trips historically go for Arsenal. Five wins from five in all competitions plus the Community Shield, and one defeat in the last twelve European away games, is an answer to a question that used to make me uncomfortable.',
    'It’s also why the miss count matters more than it looks. This team is no longer at risk of losing these games. It is at risk of drawing them, and drawing matchday one in Naples is how you find yourself in a February playoff round explaining that the underlying numbers were fine. 4.05 to 0.22 and a one-goal margin is a result and a warning arriving in the same envelope.',
    'Napoli, for their part, will feel they got away with something. Allegri had them arranged to survive, and they survived for seventy-five minutes, which under the circumstances counts as a plan working right up until it didn’t.',
    'Rice will captain this club, probably for a long time, and he’ll be excellent at it. He can wait his turn. The current holder is busy.'
  ]},
  {date:'2026-09-10', title:'One Napoli night doesn’t make a European campaign', byline:'On matchday 1', paras:[
    'An away win at a ground that eats away form teams alive is a good habit to start the league phase with, and it is worth saying plainly: Ødegaard scoring the winner with fifteen minutes left, off a Tzolis assist, in Naples, is exactly the kind of result that gets forgotten by January and mattered enormously on the night.',
    'What it does not do is tell you anything about matchday 3 at the Allianz. Eight games, four pots, and a format specifically designed so that one bad Tuesday in a random city can undo three good ones. The habit that matters is not winning the big away nights — it is not dropping points at home to the sides you are supposed to beat, because that is where league-phase campaigns actually die.',
    'Enjoy Naples. Then forget about it by Friday.'
  ]},
  {date:'2026-08-21', title:'Defending it is a completely different job', byline:'Season opener · August 2026', paras:[
    'Twenty-two years is a long time to spend explaining to people why the wait was nearly over. Now it is over, and the strange thing nobody warns you about is that winning the thing does not make the next season easier. It makes it louder. Every draw is a wobble. Every substitution is a referendum. Every set-piece conceded gets its own six-minute segment on a channel you have never heard of.',
    'The squad is better than the one that won it. Bruno Guimarães walking into a midfield that already had Zubimendi, Rice and Ødegaard is faintly obscene. Tzolis gives us a left side that does not depend on one man’s hamstring. Hincapié is permanent. Meslier is a free goalkeeper who has played a hundred Premier League games. This is what a club looks like when it has stopped being sentimental about the gaps.',
    'What we are actually watching for this year is whether the standards hold when the motivation changes. Chasing is easy. Being chased is the test.'
  ]},
  {date:'2026-08-15', title:'In defence of the captain, again, forever', byline:'On Martin Ødegaard', paras:[
    'Every eighteen months the discourse cycles back to whether the armband should move. It is always framed as a compliment to Declan Rice, which is a neat trick, because it means anyone defending Ødegaard sounds like they are attacking a player everyone loves.',
    'So let’s be plain about it. Captaincy at this club, under this manager, is not about who wins the most duels. It is about who holds the shape of the idea when the game is going badly — who keeps demanding the ball in the pocket at 0-0 away from home in the 71st minute when the easy thing is to hide. He does that in games where his numbers look ordinary. That is precisely the point.',
    'Also he scored in the opener and the shot took a deflection, which is the most Ødegaard sentence ever written.'
  ]},
  {date:'2026-08-10', title:'A word on watching this from 16,000km away', byline:'The Brisbane clause', paras:[
    'There is a specific kind of supporter who has never once walked up Drayton Park but can tell you exactly what the away kit looked like in 2011 because they were awake at 2am to see it. That is most of us out here. The fixture list is not a fixture list, it is a sleep schedule, and a 3pm Saturday in London is midnight on Sunday morning in Queensland.',
    'So this site puts the Brisbane time next to every kick-off, and flags the ones that land between 1am and 6am — the genuinely brutal ones, where you either commit or you spend Sunday morning dodging the score. Both are respectable choices. Only one of them is correct.'
  ]}
];

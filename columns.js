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

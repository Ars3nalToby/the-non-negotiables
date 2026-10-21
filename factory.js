/* ============================================================
   DIAL SQUARE WORKS — factory.html only.
   A 3D factory that replays every Arsenal squad from 1992/93 to
   2026/27: signings forged at the intake press, departures out on the
   despatch belt, honours dropping into the cabinet.

   Loaded after app.js and the self-hosted three.js r147 build in
   assets/vendor/. Everything lives inside one IIFE, so none of its
   names (P, SEASONS, $, ...) touch app.js's globals.

   DATA: P (player stints) and SEASONS (manager, captain, finish,
   honours, a one-line note) near the top. This is the club's history,
   not the current squad — app.js's SQUAD stays the source for that.
   A stint is [first season start year, last season start year];
   0 = still at the club. 1991 marks players already there in 1992.

   ADS: SHOW_SPONSOR_SLOTS stays false until a real sponsor signs.
   ============================================================ */

(async function(){
"use strict";
const START_HASH=location.hash; // read before boot writes the current season into the hash
// On factory.html the factory owns the hash and the full page; on the homepage it is a guest.
const EMBED=!/factory\.html$/.test(location.pathname);
// The HUD markup lives here, so any page can mount the factory into an empty <section id="dsw">.
if(!document.getElementById("hud"))document.getElementById("dsw").insertAdjacentHTML("beforeend",`<div id="stage" aria-label="3D view of the Arsenal squad factory"></div>

<div id="hud">
  <section class="plate" aria-live="polite">
    <div class="row1"><span>Production run</span><span id="runNo">01 / 35</span></div>
    <div class="season" id="seasonTxt">1992<small>/</small>93</div>
    <dl>
      <dt>League</dt><dd class="pos" id="posTxt">10th</dd>
      <dt>Manager</dt><dd id="mgrTxt">George Graham</dd>
      <dt>Captain</dt><dd id="capTxt">Tony Adams</dd>
    </dl>
    <div class="chips" id="honTxt"></div>
    <p class="fnote" id="noteTxt"></p>
  </section>

  <div class="strip">
    <div class="lane in" aria-label="Arrivals this season"><span class="lane-h">In <b id="inCount">0</b></span><ol id="inList"></ol></div>
    <div class="lane out" aria-label="Departures this season"><span class="lane-h">Out <b id="outCount">0</b></span><ol id="outList"></ol></div>
  </div>

  <div class="rail">
    <div class="top">
      <button class="fbtn icon" id="prevBtn" aria-label="Previous season"><svg viewBox="0 0 16 16"><path d="M3 2h2v12H3zM14 2v12L6 8z"/></svg></button>
      <button class="fbtn primary" id="playBtn" aria-label="Pause"><svg viewBox="0 0 16 16" id="playIco"><path d="M3 2h4v12H3zM9 2h4v12H9z"/></svg><span id="playLbl">Pause</span></button>
      <button class="fbtn icon" id="nextBtn" aria-label="Next season"><svg viewBox="0 0 16 16"><path d="M11 2h2v12h-2zM2 2v12l8-6z"/></svg></button>
      <div class="seg" role="group" aria-label="Line speed">
        <button data-sp="1" aria-pressed="false">1×</button>
        <button data-sp="2" aria-pressed="true">2×</button>
        <button data-sp="4" aria-pressed="false">4×</button>
      </div>
      <div class="seg view" role="group" aria-label="Camera view"><button data-v="auto" aria-pressed="true">Auto</button><button data-v="intake" aria-pressed="false">Intake</button><button data-v="squad" aria-pressed="false">Squad</button><button data-v="despatch" aria-pressed="false">Despatch</button></div>
      <button class="fbtn soundbtn" id="soundBtn" type="button" aria-pressed="false" aria-label="Sound"><svg viewBox="0 0 16 16"><path d="M2 6h3l4-3v10L5 10H2z"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.6a6 6 0 0 1 0 8.8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><span>Sound</span></button>
      <button class="fbtn nightbtn" id="nightBtn" aria-pressed="false"><svg viewBox="0 0 16 16"><path d="M10.5 1.5A6.5 6.5 0 1 0 14.5 11 5.5 5.5 0 0 1 10.5 1.5z"/></svg><span>Night</span></button>
            <button class="fbtn sharebtn" id="shareBtn" type="button"><svg viewBox="0 0 16 16"><path d="M12 10a2 2 0 0 0-1.6.8L5.9 8.5a2 2 0 0 0 0-1l4.5-2.3A2 2 0 1 0 10 4l-4.5 2.3a2 2 0 1 0 0 3.4L10 12a2 2 0 1 0 2-2z"/></svg><span>Share</span></button>
      <span class="stat hide-sm hintx" id="camHint">Drag to look around · then scroll to zoom</span><span class="spacer"></span>
      <span class="stat">Squad <b id="sqN">0</b></span>
      <span class="stat hide-sm">Longest serving <b id="longTxt">—</b></span>
      <span class="stat hide-sm">Trophies <b id="trophN">0</b></span>
    </div>
    <div class="timeline" id="timeline"><div class="prog" id="prog"></div></div>
  </div>
</div>

<div class="pcard" id="pcard" hidden></div>`);
try{await Promise.race([Promise.all([document.fonts.load("900 100px 'Big Shoulders Display'"),document.fonts.load("800 60px 'Big Shoulders Display'"),document.fonts.load("600 30px 'IBM Plex Mono'"),document.fonts.load("600 16px 'Barlow Semi Condensed'")]),new Promise(r=>setTimeout(r,2500))]);}catch(e){}

/* ===================================================================
   DATA — player tenures by season start year (1992 = 1992/93).
   Stints are [first season, last season]; 0 = still at the club.
   1991 marks players already in the squad when the Premier League began.
   =================================================================== */
const FIRST=1992, LAST=2026, NOW=0;
const P=[];
function p(name,label,pos,stints,from,to,flags){P.push({name,label,pos,stints,from:from||[],to:to||[],legend:/L/.test(flags||""),id:P.length});}
const A="Academy";
// --- The 1992 inheritance
p("David Seaman","SEAMAN","G",[[1991,2002]],["QPR"],["Man City"],"L");
p("Lee Dixon","DIXON","D",[[1991,2001]],["Stoke City"],["Retired"],"L");
p("Nigel Winterburn","WINTERBURN","D",[[1991,1999]],["Wimbledon"],["West Ham"],"L");
p("Tony Adams","ADAMS","D",[[1991,2001]],[A],["Retired"],"L");
p("Steve Bould","BOULD","D",[[1991,1998]],["Stoke City"],["Sunderland"]);
p("Andy Linighan","LINIGHAN","D",[[1991,1996]],["Norwich City"],["Crystal Palace"]);
p("Paul Davis","DAVIS","M",[[1991,1994]],[A],["Brentford"]);
p("David Hillier","HILLIER","M",[[1991,1996]],[A],["Portsmouth"]);
p("Steve Morrow","MORROW","M",[[1991,1996]],[A],["QPR"]);
p("Ray Parlour","PARLOUR","M",[[1991,2003]],[A],["Middlesbrough"],"L");
p("Anders Limpar","LIMPAR","M",[[1991,1993]],["Cremonese"],["Everton"]);
p("Paul Merson","MERSON","F",[[1991,1996]],[A],["Middlesbrough"]);
p("Ian Wright","I. WRIGHT","F",[[1991,1997]],["Crystal Palace"],["West Ham"],"L");
p("Alan Smith","SMITH","F",[[1991,1994]],["Leicester City"],["Retired"]);
p("Kevin Campbell","K. CAMPBELL","F",[[1991,1994]],[A],["Nottingham Forest"]);
// --- Graham & Rioch
p("John Jensen","JENSEN","M",[[1992,1995]],["Brøndby"],["Brøndby"]);
p("Martin Keown","KEOWN","D",[[1992,2003]],["Everton"],["Leicester City"],"L");
p("Ian Selley","SELLEY","M",[[1992,1996]],[A],["Fulham"]);
p("Eddie McGoldrick","McGOLDRICK","M",[[1993,1995]],["Crystal Palace"],["Man City"]);
p("Stefan Schwarz","SCHWARZ","M",[[1994,1994]],["Benfica"],["Fiorentina"]);
p("John Hartson","HARTSON","F",[[1994,1996]],["Luton Town"],["West Ham"]);
p("Glenn Helder","HELDER","F",[[1994,1996]],["Vitesse"],[""]);
p("Chris Kiwomya","KIWOMYA","F",[[1994,1995]],["Ipswich Town"],[""]);
p("Vince Bartram","BARTRAM","G",[[1994,1996]],["Bournemouth"],[""]);
p("Dennis Bergkamp","BERGKAMP","F",[[1995,2005]],["Inter"],["Retired"],"L");
p("David Platt","PLATT","M",[[1995,1997]],["Sampdoria"],["Nottingham Forest"]);
// --- Wenger
p("Patrick Vieira","VIEIRA","M",[[1996,2004]],["AC Milan"],["Juventus"],"L");
p("Rémi Garde","GARDE","M",[[1996,1998]],["Strasbourg"],["Retired"]);
p("Nicolas Anelka","ANELKA","F",[[1996,1998]],["Paris Saint-Germain"],["Real Madrid"]);
p("Marc Overmars","OVERMARS","F",[[1997,1999]],["Ajax"],["Barcelona"]);
p("Emmanuel Petit","PETIT","M",[[1997,1999]],["Monaco"],["Barcelona"]);
p("Gilles Grimandi","GRIMANDI","D",[[1997,2001]],["Monaco"],["Retired"]);
p("Luís Boa Morte","BOA MORTE","F",[[1997,1998]],["Sporting CP"],["Southampton"]);
p("Alex Manninger","MANNINGER","G",[[1997,2001]],["Grazer AK"],["Fiorentina"]);
p("Christopher Wreh","WREH","F",[[1997,1999]],["Monaco"],[""]);
p("Matthew Upson","UPSON","D",[[1997,2002]],["Luton Town"],["Birmingham City"]);
p("Nelson Vivas","VIVAS","D",[[1998,2000]],["Boca Juniors"],["Inter"]);
p("Freddie Ljungberg","LJUNGBERG","M",[[1998,2006]],["Halmstad"],["West Ham"],"L");
p("Nwankwo Kanu","KANU","F",[[1998,2003]],["Inter"],["West Brom"]);
p("Kaba Diawara","DIAWARA","F",[[1998,1998]],["Bordeaux"],[""]);
p("Thierry Henry","HENRY","F",[[1999,2006],[2011,2011]],["Juventus","New York Red Bulls (loan)"],["Barcelona","New York Red Bulls"],"L");
p("Davor Šuker","ŠUKER","F",[[1999,1999]],["Real Madrid"],["West Ham"]);
p("Oleh Luzhnyi","LUZHNYI","D",[[1999,2002]],["Dynamo Kyiv"],["Wolves"]);
p("Silvinho","SILVINHO","D",[[1999,2000]],["Corinthians"],["Celta Vigo"]);
p("Ashley Cole","COLE","D",[[1999,2005]],[A],["Chelsea"]);
p("Robert Pirès","PIRÈS","M",[[2000,2005]],["Marseille"],["Villarreal"],"L");
p("Sylvain Wiltord","WILTORD","F",[[2000,2003]],["Bordeaux"],["Lyon"]);
p("Lauren","LAUREN","D",[[2000,2006]],["Mallorca"],["Portsmouth"]);
p("Edu","EDU","M",[[2000,2004]],["Corinthians"],["Valencia"]);
p("Igors Stepanovs","STEPANOVS","D",[[2000,2002]],["Skonto Riga"],[""]);
p("Sol Campbell","CAMPBELL","D",[[2001,2005],[2009,2009]],["Tottenham (free)","Free agent"],["Portsmouth","Newcastle"],"L");
p("Giovanni van Bronckhorst","VAN BRONCKHORST","M",[[2001,2002]],["Rangers"],["Barcelona"]);
p("Francis Jeffers","JEFFERS","F",[[2001,2002]],["Everton"],["Charlton"]);
p("Richard Wright","R. WRIGHT","G",[[2001,2001]],["Ipswich Town"],["Everton"]);
p("Gilberto Silva","GILBERTO","M",[[2002,2007]],["Atlético Mineiro"],["Panathinaikos"]);
p("Pascal Cygan","CYGAN","D",[[2002,2005]],["Lille"],["Villarreal"]);
p("Kolo Touré","TOURÉ","D",[[2002,2008]],["ASEC Mimosas"],["Man City"]);
p("Jens Lehmann","LEHMANN","G",[[2003,2007],[2010,2010]],["Borussia Dortmund","Out of retirement"],["Stuttgart","Retired"]);
p("Gaël Clichy","CLICHY","D",[[2003,2010]],["Cannes"],["Man City"]);
p("Cesc Fàbregas","FÀBREGAS","M",[[2003,2010]],["Barcelona youth"],["Barcelona"],"L");
p("José Antonio Reyes","REYES","F",[[2003,2005]],["Sevilla"],["Real Madrid (loan)"]);
p("Philippe Senderos","SENDEROS","D",[[2003,2009]],["Servette"],["Fulham"]);
p("Robin van Persie","VAN PERSIE","F",[[2004,2011]],["Feyenoord"],["Man United"]);
p("Mathieu Flamini","FLAMINI","M",[[2004,2007],[2013,2015]],["Marseille","AC Milan (free)"],["AC Milan","Crystal Palace"]);
p("Manuel Almunia","ALMUNIA","G",[[2004,2010]],["Celta Vigo"],["Watford"]);
p("Emmanuel Eboué","EBOUÉ","D",[[2004,2010]],["Beveren"],["Galatasaray"]);
p("Johan Djourou","DJOUROU","D",[[2004,2012]],[A],["Hamburg"]);
p("Alexander Hleb","HLEB","M",[[2005,2007]],["Stuttgart"],["Barcelona"]);
p("Emmanuel Adebayor","ADEBAYOR","F",[[2005,2008]],["Monaco"],["Man City"]);
p("Theo Walcott","WALCOTT","F",[[2005,2017]],["Southampton"],["Everton"]);
p("Abou Diaby","DIABY","M",[[2005,2014]],["Auxerre"],["Marseille"]);
p("Alex Song","SONG","M",[[2005,2011]],["Bastia"],["Barcelona"]);
p("Tomáš Rosický","ROSICKÝ","M",[[2006,2015]],["Borussia Dortmund"],["Sparta Prague"]);
p("William Gallas","GALLAS","D",[[2006,2009]],["Chelsea"],["Tottenham"]);
p("Júlio Baptista","BAPTISTA","F",[[2006,2006]],["Real Madrid (loan)"],["Real Madrid"]);
p("Denílson","DENÍLSON","M",[[2006,2010]],["São Paulo"],["São Paulo"]);
p("Bacary Sagna","SAGNA","D",[[2007,2013]],["Auxerre"],["Man City"]);
p("Eduardo","EDUARDO","F",[[2007,2009]],["Dinamo Zagreb"],["Shakhtar Donetsk"]);
p("Lassana Diarra","DIARRA","M",[[2007,2007]],["Chelsea"],["Portsmouth"]);
p("Nicklas Bendtner","BENDTNER","F",[[2007,2013]],[A],["Wolfsburg"]);
p("Łukasz Fabiański","FABIAŃSKI","G",[[2007,2013]],["Legia Warsaw"],["Swansea"]);
p("Samir Nasri","NASRI","M",[[2008,2010]],["Marseille"],["Man City"]);
p("Aaron Ramsey","RAMSEY","M",[[2008,2018]],["Cardiff City"],["Juventus"],"L");
p("Andrey Arshavin","ARSHAVIN","F",[[2008,2012]],["Zenit"],["Zenit"]);
p("Carlos Vela","VELA","F",[[2008,2010]],["Guadalajara"],["Real Sociedad"]);
p("Thomas Vermaelen","VERMAELEN","D",[[2009,2013]],["Ajax"],["Barcelona"]);
p("Wojciech Szczęsny","SZCZĘSNY","G",[[2009,2014]],[A],["Roma (loan)"]);
p("Laurent Koscielny","KOSCIELNY","D",[[2010,2018]],["Lorient"],["Bordeaux"],"L");
p("Marouane Chamakh","CHAMAKH","F",[[2010,2012]],["Bordeaux"],["West Ham (loan)"]);
p("Sébastien Squillaci","SQUILLACI","D",[[2010,2012]],["Sevilla"],["Bastia"]);
p("Jack Wilshere","WILSHERE","M",[[2010,2017]],[A],["West Ham"]);
p("Kieran Gibbs","GIBBS","D",[[2010,2016]],[A],["West Brom"]);
p("Per Mertesacker","MERTESACKER","D",[[2011,2017]],["Werder Bremen"],["Retired"]);
p("Mikel Arteta","ARTETA","M",[[2011,2015]],["Everton"],["Retired"]);
p("Gervinho","GERVINHO","F",[[2011,2012]],["Lille"],["Roma"]);
p("Alex Oxlade-Chamberlain","OX","M",[[2011,2016]],["Southampton"],["Liverpool"]);
p("André Santos","SANTOS","D",[[2011,2012]],["Fenerbahçe"],["Grêmio (loan)"]);
p("Carl Jenkinson","JENKINSON","D",[[2011,2013]],["Charlton"],["West Ham (loan)"]);
p("Yossi Benayoun","BENAYOUN","M",[[2011,2011]],["Chelsea (loan)"],["Chelsea"]);
p("Santi Cazorla","CAZORLA","M",[[2012,2017]],["Málaga"],["Villarreal"],"L");
p("Olivier Giroud","GIROUD","F",[[2012,2017]],["Montpellier"],["Chelsea"]);
p("Lukas Podolski","PODOLSKI","F",[[2012,2014]],["Köln"],["Inter (loan)"]);
p("Nacho Monreal","MONREAL","D",[[2012,2018]],["Málaga"],["Real Sociedad"]);
p("Mesut Özil","ÖZIL","M",[[2013,2020]],["Real Madrid"],["Fenerbahçe"]);
p("Alexis Sánchez","ALEXIS","F",[[2014,2017]],["Barcelona"],["Man United"]);
p("Danny Welbeck","WELBECK","F",[[2014,2018]],["Man United"],["Watford"]);
p("Calum Chambers","CHAMBERS","D",[[2014,2021]],["Southampton"],["Aston Villa"]);
p("Mathieu Debuchy","DEBUCHY","D",[[2014,2015]],["Newcastle"],["Bordeaux (loan)"]);
p("David Ospina","OSPINA","G",[[2014,2017]],["Nice"],["Napoli (loan)"]);
p("Héctor Bellerín","BELLERÍN","D",[[2014,2020]],[A],["Real Betis (loan)"]);
p("Gabriel Paulista","PAULISTA","D",[[2014,2016]],["Villarreal"],["Valencia"]);
p("Francis Coquelin","COQUELIN","M",[[2014,2017]],[A],["Valencia"]);
p("Petr Čech","ČECH","G",[[2015,2018]],["Chelsea"],["Retired"]);
p("Mohamed Elneny","ELNENY","M",[[2015,2018],[2020,2023]],["Basel","Back from loan"],["Beşiktaş (loan)","Released"]);
p("Alex Iwobi","IWOBI","F",[[2015,2018]],[A],["Everton"]);
p("Granit Xhaka","XHAKA","M",[[2016,2022]],["Gladbach"],["Leverkusen"]);
p("Shkodran Mustafi","MUSTAFI","D",[[2016,2020]],["Valencia"],["Schalke"]);
p("Rob Holding","HOLDING","D",[[2016,2022]],["Bolton"],["Crystal Palace"]);
p("Lucas Pérez","PÉREZ","F",[[2016,2016]],["Deportivo"],["Deportivo (loan)"]);
p("Alexandre Lacazette","LACAZETTE","F",[[2017,2021]],["Lyon"],["Lyon"]);
p("Sead Kolašinac","KOLAŠINAC","D",[[2017,2020]],["Schalke (free)"],["Schalke (loan)"]);
p("Pierre-Emerick Aubameyang","AUBAMEYANG","F",[[2017,2021]],["Borussia Dortmund"],["Barcelona"]);
p("Henrikh Mkhitaryan","MKHITARYAN","M",[[2017,2018]],["Man United"],["Roma (loan)"]);
// --- Emery & Arteta
p("Bernd Leno","LENO","G",[[2018,2021]],["Leverkusen"],["Fulham"]);
p("Lucas Torreira","TORREIRA","M",[[2018,2019]],["Sampdoria"],["Atlético Madrid (loan)"]);
p("Sokratis","SOKRATIS","D",[[2018,2020]],["Borussia Dortmund"],["Olympiacos"]);
p("Matteo Guendouzi","GUENDOUZI","M",[[2018,2019]],["Lorient"],["Hertha (loan)"]);
p("Stephan Lichtsteiner","LICHTSTEINER","D",[[2018,2018]],["Juventus"],["Augsburg"]);
p("Nicolas Pépé","PÉPÉ","F",[[2019,2021]],["Lille"],["Nice (loan)"]);
p("Kieran Tierney","TIERNEY","D",[[2019,2022],[2024,2024]],["Celtic","Back from loan"],["Real Sociedad (loan)","Celtic"]);
p("David Luiz","LUIZ","D",[[2019,2020]],["Chelsea"],["Flamengo"]);
p("Gabriel Martinelli","MARTINELLI","F",[[2019,2025]],["Ituano"],["Al Hilal (club-record sale)"]);
p("Bukayo Saka","SAKA","F",[[2019,NOW]],[A],[],"L");
p("Dani Ceballos","CEBALLOS","M",[[2019,2020]],["Real Madrid (loan)"],["Real Madrid"]);
p("Pablo Marí","MARÍ","D",[[2019,2020]],["Flamengo"],["Udinese (loan)"]);
p("Cédric Soares","CÉDRIC","D",[[2019,2023]],["Southampton"],["Sevilla"]);
p("Eddie Nketiah","NKETIAH","F",[[2019,2023]],[A],["Crystal Palace"]);
p("Emiliano Martínez","E. MARTÍNEZ","G",[[2019,2019]],[A],["Aston Villa"]);
p("Reiss Nelson","NELSON","F",[[2019,2023]],[A],["Fulham (loan)"]);
p("Thomas Partey","PARTEY","M",[[2020,2024]],["Atlético Madrid"],["Villarreal"]);
p("Gabriel Magalhães","GABRIEL","D",[[2020,NOW]],["Lille"],[],"L");
p("Willian","WILLIAN","F",[[2020,2020]],["Chelsea"],["Corinthians"]);
p("Martin Ødegaard","ØDEGAARD","M",[[2020,NOW]],["Real Madrid"],[],"L");
p("Emile Smith Rowe","SMITH ROWE","M",[[2020,2023]],[A],["Fulham"]);
p("Ben White","WHITE","D",[[2021,NOW]],["Brighton"],[]);
p("Aaron Ramsdale","RAMSDALE","G",[[2021,2023]],["Sheffield United"],["Southampton (loan)"]);
p("Takehiro Tomiyasu","TOMIYASU","D",[[2021,2024]],["Bologna"],["Released"]);
p("Nuno Tavares","TAVARES","D",[[2021,2021]],["Benfica"],["Marseille (loan)"]);
p("Albert Sambi Lokonga","LOKONGA","M",[[2021,2021]],["Anderlecht"],["Crystal Palace (loan)"]);
p("William Saliba","SALIBA","D",[[2022,NOW]],["Saint-Étienne (back from loan)"],[],"L");
p("Gabriel Jesus","JESUS","F",[[2022,2025]],["Man City"],["Barcelona"]);
p("Oleksandr Zinchenko","ZINCHENKO","D",[[2022,2024]],["Man City"],["Nottingham Forest (loan)"]);
p("Fábio Vieira","F. VIEIRA","M",[[2022,2023]],["Porto"],["Porto (loan)"]);
p("Matt Turner","TURNER","G",[[2022,2022]],["New England Revolution"],["Nottingham Forest"]);
p("Leandro Trossard","TROSSARD","F",[[2022,2025]],["Brighton"],["Beşiktaş"]);
p("Jakub Kiwior","KIWIOR","D",[[2022,2024]],["Spezia"],["Porto (loan)"]);
p("Jorginho","JORGINHO","M",[[2022,2024]],["Chelsea"],["Flamengo"]);
p("Declan Rice","RICE","M",[[2023,NOW]],["West Ham"],[],"L");
p("Kai Havertz","HAVERTZ","F",[[2023,NOW]],["Chelsea"],[]);
p("Jurriën Timber","TIMBER","D",[[2023,NOW]],["Ajax"],[]);
p("David Raya","RAYA","G",[[2023,NOW]],["Brentford"],[]);
p("Riccardo Calafiori","CALAFIORI","D",[[2024,NOW]],["Bologna"],[]);
p("Mikel Merino","MERINO","M",[[2024,NOW]],["Real Sociedad"],[]);
p("Raheem Sterling","STERLING","F",[[2024,2024]],["Chelsea (loan)"],["Chelsea"]);
p("Neto","NETO","G",[[2024,2024]],["Bournemouth (loan)"],["Bournemouth"]);
p("Myles Lewis-Skelly","LEWIS-SKELLY","D",[[2024,NOW]],[A],[]);
p("Ethan Nwaneri","NWANERI","M",[[2024,2025]],[A],["Borussia Dortmund (loan)"]);
p("Kepa Arrizabalaga","KEPA","G",[[2025,NOW]],["Chelsea"],[]);
p("Martín Zubimendi","ZUBIMENDI","M",[[2025,NOW]],["Real Sociedad"],[]);
p("Noni Madueke","MADUEKE","F",[[2025,NOW]],["Chelsea"],[]);
p("Christian Nørgaard","NØRGAARD","M",[[2025,2025]],["Brentford"],["Everton"]);
p("Cristhian Mosquera","MOSQUERA","D",[[2025,NOW]],["Valencia"],[]);
p("Viktor Gyökeres","GYÖKERES","F",[[2025,NOW]],["Sporting CP"],[]);
p("Eberechi Eze","EZE","M",[[2025,NOW]],["Crystal Palace"],[]);
p("Piero Hincapié","HINCAPIÉ","D",[[2025,NOW]],["Leverkusen (loan, made permanent 2026)"],[]);
p("Max Dowman","DOWMAN","F",[[2025,NOW]],[A],[]);
p("Bruno Guimarães","GUIMARÃES","M",[[2026,NOW]],["Newcastle"],[]);
p("Ezri Konsa","KONSA","D",[[2026,NOW]],["Aston Villa"],[]);
p("Christos Tzolis","TZOLIS","F",[[2026,NOW]],["Club Brugge"],[]);
p("Illan Meslier","MESLIER","G",[[2026,NOW]],["Leeds United (free)"],[]);

const SEASONS=[
 {y:1992,m:"George Graham",c:"Tony Adams",f:10,h:["FA Cup","League Cup"],n:"The first Premier League season. Mid-table in the league, but both domestic cups, the second final won with Andy Linighan's late header against Sheffield Wednesday."},
 {y:1993,m:"George Graham",c:"Tony Adams",f:4,h:["Cup Winners' Cup"],n:"Alan Smith's volley beats Parma 1–0 in Copenhagen. Ian Wright scores 35 times in all competitions."},
 {y:1994,m:"George Graham → Stewart Houston",c:"Tony Adams",f:12,h:[],l:["Cup Winners' Cup final"],n:"Graham leaves in February. Nayim's lob from halfway settles the Cup Winners' Cup final for Real Zaragoza."},
 {y:1995,m:"Bruce Rioch",c:"Tony Adams",f:5,h:[],n:"Dennis Bergkamp arrives from Inter and changes what the club thinks a forward can be."},
 {y:1996,m:"Arsène Wenger",c:"Tony Adams",f:3,h:[],n:"A little-known manager arrives from Nagoya Grampus in October. Patrick Vieira is already waiting for him."},
 {y:1997,m:"Arsène Wenger",c:"Tony Adams",f:1,h:["Premier League","FA Cup"],n:"Wenger's first full season ends with the Double. Overmars and Petit land in the summer and decide it."},
 {y:1998,m:"Arsène Wenger",c:"Tony Adams",f:2,h:[],n:"Runners-up by a single point. Kanu arrives in February; Anelka leaves for Madrid in the summer."},
 {y:1999,m:"Arsène Wenger",c:"Tony Adams",f:2,h:[],l:["UEFA Cup final"],n:"Thierry Henry arrives from Juventus as a winger. The UEFA Cup final is lost on penalties to Galatasaray."},
 {y:2000,m:"Arsène Wenger",c:"Tony Adams",f:2,h:[],l:["FA Cup final"],n:"Pirès, Wiltord, Lauren and Edu arrive. Michael Owen's late double takes the FA Cup final in Cardiff."},
 {y:2001,m:"Arsène Wenger",c:"Tony Adams",f:1,h:["Premier League","FA Cup"],n:"A second Double, sealed at Old Trafford. Sol Campbell crossed north London on a free in the summer."},
 {y:2002,m:"Arsène Wenger",c:"Patrick Vieira",f:2,h:["FA Cup"],n:"Adams and Dixon have retired. Vieira takes the armband; the FA Cup is retained."},
 {y:2003,m:"Arsène Wenger",c:"Patrick Vieira",f:1,h:["Premier League"],n:"The Invincibles: 26 wins, 12 draws, no defeats. A gold trophy was made for the occasion."},
 {y:2004,m:"Arsène Wenger",c:"Patrick Vieira",f:2,h:["FA Cup"],n:"The unbeaten run reaches 49. Vieira's last kick for the club wins the FA Cup final shoot-out."},
 {y:2005,m:"Arsène Wenger",c:"Thierry Henry",f:4,h:[],l:["Champions League final"],n:"The last season at Highbury, and a first Champions League final, lost 2–1 to Barcelona in Paris."},
 {y:2006,m:"Arsène Wenger",c:"Thierry Henry",f:4,h:[],l:["League Cup final"],n:"The Emirates Stadium opens. Henry leaves for Barcelona at the end of the season."},
 {y:2007,m:"Arsène Wenger",c:"William Gallas",f:3,h:[],n:"Fàbregas runs the midfield at 20. Eduardo's injury at Birmingham turns the title race."},
 {y:2008,m:"Arsène Wenger",c:"Cesc Fàbregas",f:4,h:[],n:"Arshavin arrives in the snow and scores four at Anfield. Adebayor and Touré go to Manchester City."},
 {y:2009,m:"Arsène Wenger",c:"Cesc Fàbregas",f:3,h:[],n:"Vermaelen arrives from Ajax. Sol Campbell returns in January for a second spell."},
 {y:2010,m:"Arsène Wenger",c:"Cesc Fàbregas",f:4,h:[],l:["League Cup final"],n:"Koscielny arrives from Lorient. Birmingham win the League Cup final in the 89th minute."},
 {y:2011,m:"Arsène Wenger",c:"Robin van Persie",f:3,h:[],n:"Fàbregas and Nasri leave; Arteta and Mertesacker arrive on deadline day. Henry returns on loan and scores against Leeds."},
 {y:2012,m:"Arsène Wenger",c:"Thomas Vermaelen",f:4,h:[],n:"Van Persie goes to Manchester United. Cazorla and Giroud arrive."},
 {y:2013,m:"Arsène Wenger",c:"Thomas Vermaelen",f:4,h:["FA Cup"],n:"Özil arrives for a club record. Ramsey's extra-time winner against Hull ends a nine-year trophy wait."},
 {y:2014,m:"Arsène Wenger",c:"Mikel Arteta",f:3,h:["FA Cup"],n:"Alexis Sánchez arrives from Barcelona. The FA Cup is retained with a 4–0 final against Aston Villa."},
 {y:2015,m:"Arsène Wenger",c:"Mikel Arteta",f:2,h:[],n:"Petr Čech arrives from Chelsea. Runners-up to Leicester City."},
 {y:2016,m:"Arsène Wenger",c:"Per Mertesacker",f:5,h:["FA Cup"],n:"A 13th FA Cup, beating Chelsea at Wembley, but out of the top four for the first time under Wenger."},
 {y:2017,m:"Arsène Wenger",c:"Laurent Koscielny",f:6,h:[],l:["League Cup final"],n:"Wenger's last season after 22 years. Aubameyang and Mkhitaryan arrive as Alexis and Walcott leave in January."},
 {y:2018,m:"Unai Emery",c:"Laurent Koscielny",f:5,h:[],l:["Europa League final"],n:"Emery's first season ends with a 4–1 defeat to Chelsea in the Europa League final in Baku."},
 {y:2019,m:"Unai Emery → Mikel Arteta",c:"Pierre-Emerick Aubameyang",f:8,h:["FA Cup"],n:"Arteta is appointed in December and wins the FA Cup in an empty Wembley. Saka and Martinelli break through."},
 {y:2020,m:"Mikel Arteta",c:"Pierre-Emerick Aubameyang",f:8,h:[],n:"Partey and Gabriel arrive; Ødegaard arrives on loan in January. Özil leaves for Fenerbahçe."},
 {y:2021,m:"Mikel Arteta",c:"Alexandre Lacazette",f:5,h:[],n:"Six summer signings, all under 24: White, Ramsdale, Tomiyasu, Ødegaard (permanently), Tavares, Lokonga."},
 {y:2022,m:"Mikel Arteta",c:"Martin Ødegaard",f:2,h:[],n:"Jesus and Zinchenko arrive from City, Saliba returns from loan, Ødegaard takes the armband. Top of the table for 248 days."},
 {y:2023,m:"Mikel Arteta",c:"Martin Ødegaard",f:2,h:[],n:"Declan Rice arrives for a club record. 89 points, two short of City."},
 {y:2024,m:"Mikel Arteta",c:"Martin Ødegaard",f:2,h:[],n:"Runners-up for a third straight season. Lewis-Skelly and Nwaneri come through the academy."},
 {y:2025,m:"Mikel Arteta",c:"Martin Ødegaard",f:1,h:["Premier League"],l:["Champions League final","League Cup final"],n:"Champions for the first time in 22 years, sealed with a game to spare. The Champions League final is lost on penalties to PSG in Budapest."},
 {y:2026,m:"Mikel Arteta",c:"Martin Ødegaard",f:0,h:[],n:"In progress. Defending champions. Martinelli leaves for Al Hilal in a club-record sale; Bruno Guimarães arrives from Newcastle."}
];
const SN={};SEASONS.forEach((s,i)=>{s.i=i;SN[s.y]=s;});
// Charity / Community Shield wins, played each August at the start of that season
const SHIELDS=[1998,1999,2002,2004,2014,2015,2017,2020,2023,2026];
SEASONS.forEach(s=>{s.cs=SHIELDS.includes(s.y);});
const honoursOf=s=>(s.cs?["Community Shield"]:[]).concat(s.h);
const TROPHY_KIND={"Premier League":"PL","FA Cup":"FA","League Cup":"LC","Cup Winners' Cup":"CWC","Community Shield":"CS"};

const endOf=b=>b===NOW?9999:b;
function stintAt(pl,y){return pl.stints.findIndex(([a,b])=>y>=a&&y<=endOf(b));}
function squadAt(y){return P.filter(pl=>stintAt(pl,y)>=0);}
function arrivalsAt(y){return P.filter(pl=>stintAt(pl,y)>=0&&stintAt(pl,y-1)<0);}
function departuresAt(y){return P.filter(pl=>stintAt(pl,y-1)>=0&&stintAt(pl,y)<0);}
function seasonLabel(y){const b=(y+1)%100;return y+"/"+(b<10?"0":"")+b;}
function shortSeason(y){const a=y%100,b=(y+1)%100;return (a<10?"0":"")+a+"/"+(b<10?"0":"")+b;}
function ordinal(n){if(!n)return "In progress";const s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
function captainOf(y){return (SN[y]||SN[FIRST]).c;}
function seasonsServed(pl,y){let n=0;for(let s=FIRST;s<=y;s++) if(stintAt(pl,s)>=0) n++;return n;}
function streakTo(pl,y){let n=0;for(let s=y;s>=1991&&stintAt(pl,s)>=0;s--) n++;return n;}
const POSNAME={G:"Goalkeeper",D:"Defender",M:"Midfielder",F:"Forward"};
const POSAB={G:"GK",D:"DF",M:"MF",F:"FW"};

/* ===================================================================
   RENDERER / SCENE
   =================================================================== */
THREE.ColorManagement.legacyMode=false;
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const stage=document.getElementById("stage");
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const BG=new THREE.Color(0xE9E3DC);
scene.background=BG;
scene.fog=new THREE.Fog(0xE9E3DC,58,130);

const camera=new THREE.PerspectiveCamera(38,1,0.1,400);
camera.position.set(0,15,32);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=0.06;
controls.rotateSpeed=0.6;controls.zoomSpeed=1.1;controls.panSpeed=0.9;
controls.enablePan=true;controls.screenSpacePanning=false;
controls.target.set(0,2.5,-1);
controls.maxPolarAngle=Math.PI*0.485;controls.minDistance=3.5;controls.maxDistance=70;
controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
controls.enabled=false;
renderer.domElement.style.touchAction="pan-y"; // page scrolls past until the visitor grabs the camera

// Colours
const COL={red:0xDB0A16,redDeep:0x9E0912,white:0xF7F3EE,navy:0x0F1B36,navy2:0x1B2A4F,brass:0xC9A24B,gold:0xE2B64A,silver:0xD9DEE6,skin:0xD9B99A,concrete:0xCFC8C0,turfA:0x3E8E4A,turfB:0x37803F};

function mat(color,o={}){return new THREE.MeshStandardMaterial(Object.assign({color,roughness:.62,metalness:.05},o));}
const M={
  red:mat(COL.red,{roughness:.5}),
  redDeep:mat(COL.redDeep,{roughness:.55}),
  white:mat(COL.white,{roughness:.55}),
  navy:mat(COL.navy,{roughness:.55}),
  navy2:mat(COL.navy2,{roughness:.5}),
  brass:mat(COL.brass,{roughness:.32,metalness:.85}),
  gold:mat(COL.gold,{roughness:.22,metalness:1,emissive:0x3a2600,emissiveIntensity:.25}),
  silver:mat(COL.silver,{roughness:.18,metalness:1}),
  steel:mat(0x8E949E,{roughness:.4,metalness:.7}),
  darkSteel:mat(0x3A3F4A,{roughness:.45,metalness:.6}),
  skin:mat(COL.skin,{roughness:.45}),
  rubber:mat(0x24262B,{roughness:.9}),
  gk:mat(0xE8B923,{roughness:.5}),
  gkDark:mat(0x1E2A3A,{roughness:.55}),
};

// Lights
const hemi=new THREE.HemisphereLight(0xFFF6EC,0xB8A796,0.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xFFF1E0,1.55);
sun.position.set(-16,32,22);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-44,right:44,top:26,bottom:-22,near:1,far:90});
sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.03;
scene.add(sun);
const fill=new THREE.DirectionalLight(0xDDE6FF,0.35);fill.position.set(20,12,30);scene.add(fill);

/* ---------- Canvas textures ---------- */
function canvasTex(w,h,draw,{repeat,aniso=8}={}){
  const cv=document.createElement("canvas");cv.width=w;cv.height=h;const x=cv.getContext("2d");draw(x,w,h);
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=aniso;
  if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat[0],repeat[1]);}
  t.userData={cv,x};return t;
}
function noise(x,w,h,amt,alpha){const id=x.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n;if(alpha)d[i+3]=255;}x.putImageData(id,0,0);}

// Floor: polished concrete with saw-cut joints
const floorTex=canvasTex(512,512,(x,w,h)=>{
  x.fillStyle="#D3CCC4";x.fillRect(0,0,w,h);noise(x,w,h,16);
  for(let i=0;i<40;i++){x.fillStyle=`rgba(${150+Math.random()*40},${140+Math.random()*30},${130},${.05+Math.random()*.06})`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,20+Math.random()*80,0,7);x.fill();}
  x.strokeStyle="rgba(90,80,72,.35)";x.lineWidth=2;x.strokeRect(1,1,w-2,h-2);
},{repeat:[14,7]});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(140,70),new THREE.MeshStandardMaterial({map:floorTex,roughness:.7,metalness:.05}));
floor.rotation.x=-Math.PI/2;floor.position.set(0,0,0);floor.receiveShadow=true;scene.add(floor);

// Back wall: white ribbed cladding, red dado band
const wallTex=canvasTex(512,512,(x,w,h)=>{
  x.fillStyle="#F2EEE8";x.fillRect(0,0,w,h);
  for(let i=0;i<8;i++){const gx=i*64;const g=x.createLinearGradient(gx,0,gx+64,0);g.addColorStop(0,"rgba(0,0,0,.06)");g.addColorStop(.12,"rgba(255,255,255,.6)");g.addColorStop(.5,"rgba(0,0,0,0)");g.addColorStop(.92,"rgba(0,0,0,.05)");g.addColorStop(1,"rgba(0,0,0,.09)");x.fillStyle=g;x.fillRect(gx,0,64,h);}
  noise(x,w,h,6);
},{repeat:[18,3]});
const wall=new THREE.Mesh(new THREE.PlaneGeometry(140,24),new THREE.MeshStandardMaterial({map:wallTex,roughness:.8}));
wall.position.set(0,12,-16);wall.receiveShadow=true;scene.add(wall);
const dado=new THREE.Mesh(new THREE.BoxGeometry(140,2.2,.2),M.red);dado.position.set(0,1.1,-15.9);dado.receiveShadow=true;scene.add(dado);
const dadoLine=new THREE.Mesh(new THREE.BoxGeometry(140,.12,.22),M.navy);dadoLine.position.set(0,2.45,-15.88);scene.add(dadoLine);
// side walls for depth
[-62,62].forEach(sx=>{const sw=new THREE.Mesh(new THREE.PlaneGeometry(70,24),new THREE.MeshStandardMaterial({map:wallTex,roughness:.8}));sw.position.set(sx,12,19);sw.rotation.y=sx<0?Math.PI/2:-Math.PI/2;scene.add(sw);});

// Columns & eave beam (red I-beams)
function iBeam(h){const g=new THREE.Group();const web=new THREE.Mesh(new THREE.BoxGeometry(.18,h,.7),M.red);const f1=new THREE.Mesh(new THREE.BoxGeometry(.7,h,.12),M.red);f1.position.z=.35;const f2=f1.clone();f2.position.z=-.35;[web,f1,f2].forEach(m=>{m.castShadow=true;m.receiveShadow=true;g.add(m)});return g;}
[-44,-30,30,44].forEach(cx=>{const c=iBeam(20);c.position.set(cx,10,-15.4);scene.add(c);
  const base=new THREE.Mesh(new THREE.BoxGeometry(1.2,.25,1.2),M.darkSteel);base.position.set(cx,.12,-15.4);scene.add(base);});
const eave=new THREE.Mesh(new THREE.BoxGeometry(140,.7,.6),M.red);eave.position.set(0,17.2,-15.4);eave.castShadow=true;scene.add(eave);

/* ---------- The pitch platform ---------- */
const PW=24,PD=14,PY=0.12;
const turfTex=canvasTex(1536,896,(x,w,h)=>{
  const s=w/PW; // px per unit
  for(let i=0;i<12;i++){x.fillStyle=i%2?"#3B8A47":"#43964F";x.fillRect(0,i*h/12,w,h/12+1);}
  noise(x,w,h,10);
  x.strokeStyle="rgba(255,255,255,.92)";x.lineWidth=7;
  const m=10;x.strokeRect(m,m,w-2*m,h-2*m);
  const cx=w/2;
  // penalty box (top = goal line at back)
  const pbW=14.2*s,pbD=5.8*s;x.strokeRect(cx-pbW/2,m,pbW,pbD);
  const gbW=6.5*s,gbD=1.95*s;x.strokeRect(cx-gbW/2,m,gbW,gbD);
  x.fillStyle="#fff";x.beginPath();x.arc(cx,m+3.9*s,6,0,7);x.fill();
  x.beginPath();x.arc(cx,m+3.9*s,3.2*s,0.2*Math.PI,0.8*Math.PI);x.stroke();
  // halfway line and centre circle at front edge
  x.beginPath();x.arc(cx,h-m,3.2*s,Math.PI,2*Math.PI);x.stroke();
  x.beginPath();x.arc(cx,h-m,7,0,7);x.fill();
  // corner arcs
  x.beginPath();x.arc(m,m,.35*s,0,Math.PI/2);x.stroke();x.beginPath();x.arc(w-m,m,.35*s,Math.PI/2,Math.PI);x.stroke();
});
const pitch=new THREE.Mesh(new THREE.BoxGeometry(PW,PY*2,PD),[M.navy,M.navy,new THREE.MeshStandardMaterial({map:turfTex,roughness:.92}),M.navy,M.navy,M.navy]);
pitch.position.set(0,0,0);pitch.receiveShadow=true;scene.add(pitch);
// LED edge strip
const ledMat=new THREE.MeshStandardMaterial({color:COL.red,emissive:COL.red,emissiveIntensity:.8,roughness:.4});
const led1=new THREE.Mesh(new THREE.BoxGeometry(PW+.5,.08,.12),ledMat);led1.position.set(0,.06,PD/2+.2);scene.add(led1);
const led2=led1.clone();led2.position.z=-PD/2-.2;scene.add(led2);
const led3=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,PD+.5),ledMat);led3.position.set(PW/2+.2,.06,0);scene.add(led3);
const led4=led3.clone();led4.position.x=-PW/2-.2;scene.add(led4);
// Goal at the back line
(function(){const g=new THREE.Group();const pm=mat(0xFFFFFF,{roughness:.35});
  const gw=2.6,gh=.9,r=.045;
  const post=new THREE.CylinderGeometry(r,r,gh,10);
  const l=new THREE.Mesh(post,pm);l.position.set(-gw/2,gh/2,0);const rr=l.clone();rr.position.x=gw/2;
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(r,r,gw+r*2,10),pm);bar.rotation.z=Math.PI/2;bar.position.y=gh;
  const net=new THREE.Mesh(new THREE.BoxGeometry(gw,gh,.8),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.22,roughness:1,depthWrite:false}));net.position.set(0,gh/2,-.4);
  [l,rr,bar].forEach(m=>{m.castShadow=true;g.add(m)});g.add(net);g.position.set(0,PY,-PD/2+.12);scene.add(g);})();

/* ---------- Conveyors ---------- */
const BELT_Y=0.72, OUT_V=9;
const beltTex=canvasTex(256,64,(x,w,h)=>{x.fillStyle="#2A2D33";x.fillRect(0,0,w,h);x.fillStyle="#353941";for(let i=0;i<8;i++)x.fillRect(i*32,0,14,h);noise(x,w,h,10);},{repeat:[10,1]});
const beltTex2=beltTex.clone();beltTex2.needsUpdate=true;
function conveyor(x0,x1,tex,hazard){
  const g=new THREE.Group();const L=x1-x0,cx=(x0+x1)/2;
  const frameL=new THREE.Mesh(new THREE.BoxGeometry(L,.32,.14),hazard?M.red:M.white);frameL.position.set(0,BELT_Y-.1,.86);
  const frameR=frameL.clone();frameR.position.z=-.86;
  tex.repeat.set(L/2.2,1);
  const belt=new THREE.Mesh(new THREE.BoxGeometry(L,.08,1.6),[M.rubber,M.rubber,new THREE.MeshStandardMaterial({map:tex,roughness:.85}),M.rubber,M.rubber,M.rubber]);
  belt.position.y=BELT_Y-.04;
  [frameL,frameR,belt].forEach(m=>{m.castShadow=true;m.receiveShadow=true;g.add(m)});
  for(let x=-L/2+1;x<L/2;x+=3){const leg=new THREE.Mesh(new THREE.BoxGeometry(.14,BELT_Y-.1,.14),M.darkSteel);leg.position.set(x,(BELT_Y-.1)/2,.78);const leg2=leg.clone();leg2.position.z=-.78;g.add(leg,leg2);}
  // hazard stripes along the skirt
  const hz=canvasTex(512,32,(c,w,h)=>{c.fillStyle="#F7F3EE";c.fillRect(0,0,w,h);c.fillStyle="#DB0A16";for(let i=-2;i<32;i++){c.beginPath();c.moveTo(i*24,h);c.lineTo(i*24+12,0);c.lineTo(i*24+24,0);c.lineTo(i*24+12,h);c.fill();}},{repeat:[L/6,1]});
  const skirt=new THREE.Mesh(new THREE.PlaneGeometry(L,.22),new THREE.MeshStandardMaterial({map:hz,roughness:.6}));skirt.position.set(0,BELT_Y-.12,.935);g.add(skirt);
  g.position.set(cx,0,0);scene.add(g);return g;
}
const INTAKE_X0=-36,PRESS_X=-21,INTAKE_X1=-18.6;
const DESP_X0=17,DESP_X1=34;
conveyor(INTAKE_X0,INTAKE_X1,beltTex,true);
conveyor(DESP_X0,DESP_X1,beltTex2,false);
// ramps
function ramp(x,dir){const r=new THREE.Mesh(new THREE.BoxGeometry(2,.08,1.6),M.darkSteel);const len=2;r.position.set(x+dir*len/2,BELT_Y/2,0);r.rotation.z=dir*Math.atan2(BELT_Y,len)*-1;r.receiveShadow=true;scene.add(r);}
ramp(INTAKE_X1,1);ramp(DESP_X0,-1);

/* ---------- Portals ---------- */
function signTex(text,sub,bg,fg){return canvasTex(1024,256,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;x.font="900 150px 'Big Shoulders Display', Impact, sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(text,w/2,sub?h*.42:h/2+6);if(sub){x.font="600 34px 'IBM Plex Mono', monospace";x.globalAlpha=.85;x.fillText(sub,w/2,h*.83);}});}
function portal(x,label,sub,inward){
  const g=new THREE.Group();
  const W=5,H=6;
  const back=new THREE.Mesh(new THREE.BoxGeometry(.4,H+1,W+2),M.white);back.position.set(inward?-1.2:1.2,(H+1)/2,0);back.castShadow=true;back.receiveShadow=true;
  const hole=new THREE.Mesh(new THREE.PlaneGeometry(W-1.2,H-1.2),new THREE.MeshBasicMaterial({color:0x090F1E}));hole.position.set(inward?-.98:.98,(H-1.2)/2,0);hole.rotation.y=inward?Math.PI/2:-Math.PI/2;
  const fl=iBeam(H);fl.position.set(0,H/2,W/2);const fr=iBeam(H);fr.position.set(0,H/2,-W/2);
  const top=new THREE.Mesh(new THREE.BoxGeometry(.8,.7,W+.8),M.red);top.position.set(0,H,0);top.castShadow=true;
  const s=new THREE.Mesh(new THREE.PlaneGeometry(4.4,1.1),new THREE.MeshBasicMaterial({map:signTex(label,sub,"#0F1B36","#FBF8F4")}));
  s.position.set(.45,H+1.25,0);s.rotation.y=Math.PI/2;
  const sBox=new THREE.Mesh(new THREE.BoxGeometry(.3,1.3,4.6),M.navy);sBox.position.set(.2,H+1.25,0);
  // face the sign toward the camera (+z) instead: rotate group so sign readable
  g.add(back,hole,fl,fr,top,sBox,s);
  // strip curtain
  const strips=[];
  const sm=new THREE.MeshStandardMaterial({color:0xF5D9DB,transparent:true,opacity:.42,roughness:.2,side:THREE.DoubleSide,depthWrite:false});
  for(let i=0;i<9;i++){const st=new THREE.Mesh(new THREE.PlaneGeometry(.42,H-1.4),sm);st.geometry.translate(0,-(H-1.4)/2,0);st.position.set(inward?-.6:.6,H-.6,-1.8+i*.45);st.rotation.y=Math.PI/2;g.add(st);strips.push(st);}
  g.position.set(x,0,0);scene.add(g);
  // sign facing camera
  const front=new THREE.Mesh(new THREE.PlaneGeometry(5.2,1.3),new THREE.MeshBasicMaterial({map:signTex(label,sub,"#0F1B36","#FBF8F4")}));
  front.position.set(x+(inward?1.4:-1.4),H+1.25,2.7);scene.add(front);
  const fb=new THREE.Mesh(new THREE.BoxGeometry(5.5,1.55,.2),M.red);fb.position.set(front.position.x,front.position.y,2.58);scene.add(fb);
  const hangA=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,4,6),M.darkSteel);hangA.position.set(front.position.x-2,H+3.9,2.6);const hangB=hangA.clone();hangB.position.x+=4;scene.add(hangA,hangB);
  return {g,strips};
}
const inPortal=portal(INTAKE_X0+.2,"INTAKE","SIGNINGS · RETURNS · ACADEMY",true);
const outPortal=portal(DESP_X1-.2,"DESPATCH","SALES · RELEASES · RETIREMENTS",false);
// red glow inside portals
const inGlow=new THREE.PointLight(0xFF3B3B,1.2,10);inGlow.position.set(INTAKE_X0+1.5,2.5,0);scene.add(inGlow);
const outGlow=new THREE.PointLight(0x5C7CFF,0.8,10);outGlow.position.set(DESP_X1-1.5,2.5,0);scene.add(outGlow);

/* ---------- The press ---------- */
const press=new THREE.Group();
(function(){
  const H=5.2;
  const colA=iBeam(H);colA.position.set(0,H/2,1.35);const colB=iBeam(H);colB.position.set(0,H/2,-1.35);
  const crown=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.2,3.6),M.red);crown.position.y=H+.3;crown.castShadow=true;
  const plate=new THREE.Mesh(new THREE.PlaneGeometry(2.0,.8),new THREE.MeshBasicMaterial({map:signTex("PRESS 01","",'#DB0A16','#FBF8F4')}));plate.position.set(0,H+.3,1.81);
  const cyl=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,1.6,20),M.steel);cyl.position.y=H-.9;cyl.castShadow=true;
  press.add(colA,colB,crown,plate,cyl);
})();
const ram=new THREE.Group();
const ramRod=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,2.4,14),M.silver);ramRod.position.y=1.2;
const ramHead=new THREE.Mesh(new THREE.BoxGeometry(1.5,.36,1.5),M.navy);ramHead.castShadow=true;
const ramFace=new THREE.Mesh(new THREE.BoxGeometry(1.3,.08,1.3),M.brass);ramFace.position.y=-.2;
ram.add(ramRod,ramHead,ramFace);press.add(ram);
const RAM_UP=3.75,RAM_DOWN=BELT_Y+1.95;
ram.position.y=RAM_UP;
press.position.set(PRESS_X,0,0);scene.add(press);
const flash=new THREE.PointLight(0xFFE7C2,0,9,2);flash.position.set(PRESS_X,2.2,1.4);scene.add(flash);
const pressState={busy:false,t:0,pod:null,onStamp:null};

/* ---------- Season board ---------- */
const BOARD_W=15,BOARD_H=5.65;
const boardTex=canvasTex(2048,770,()=>{});
const boardGroup=new THREE.Group();
const boardFrame=new THREE.Mesh(new THREE.BoxGeometry(BOARD_W+.6,BOARD_H+.6,.5),M.navy);boardFrame.castShadow=true;
const boardFace=new THREE.Mesh(new THREE.PlaneGeometry(BOARD_W,BOARD_H),new THREE.MeshBasicMaterial({map:boardTex,toneMapped:false}));boardFace.position.z=.27;
boardGroup.add(boardFrame,boardFace);
const boardTrim=new THREE.Mesh(new THREE.BoxGeometry(BOARD_W+.6,.18,.56),M.brass);boardTrim.position.y=-BOARD_H/2-.3;boardGroup.add(boardTrim);
boardGroup.position.set(0,9.3,-15.4);scene.add(boardGroup);
// board lamps
[-5,0,5].forEach(dx=>{const arm=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.2,6),M.navy);arm.rotation.x=Math.PI/2;arm.position.set(dx,13.3,-14.7);const sh=new THREE.Mesh(new THREE.ConeGeometry(.42,.5,18,1,true),M.red);sh.position.set(dx,13.15,-14.1);sh.rotation.x=-.9;scene.add(arm,sh);});
const boardLight=new THREE.SpotLight(0xFFF2DD,.9,30,.7,.6);boardLight.position.set(0,15,-8);boardLight.target.position.set(0,9.5,-15.5);scene.add(boardLight,boardLight.target);

function drawBoard(y,counts){
  const {x,cv}=boardTex.userData;const w=cv.width,h=cv.height;const s=SN[y];
  x.clearRect(0,0,w,h);
  x.fillStyle="#0F1B36";x.fillRect(0,0,w,h);
  // subtle panel grid
  x.strokeStyle="rgba(255,255,255,.04)";x.lineWidth=2;for(let i=0;i<w;i+=64){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();}
  x.fillStyle="#DB0A16";x.fillRect(0,0,w,96);
  x.fillStyle="#FBF8F4";x.font="600 40px 'IBM Plex Mono', monospace";x.textBaseline="middle";
  x.textAlign="left";x.fillText("DIAL SQUARE WORKS  ·  PRODUCTION RUN "+String(s.i+1).padStart(2,"0")+" OF 35",56,50);
  x.textAlign="right";x.fillText(s.f===1?"CHAMPIONS":(s.f?"FINISHED "+ordinal(s.f).toUpperCase():"SEASON LIVE"),w-56,50);
  // season
  x.textAlign="left";x.textBaseline="alphabetic";
  x.fillStyle="#FBF8F4";x.font="900 360px 'Big Shoulders Display', Impact, sans-serif";
  const a=String(y),b=String((y+1)%100).padStart(2,"0");
  x.fillText(a,48,505);const aw=x.measureText(a).width;
  x.fillStyle="#DB0A16";x.fillText("/",48+aw+6,505);const sw=x.measureText("/").width;
  x.fillStyle="#FBF8F4";x.fillText(b,48+aw+sw+16,505);
  // right column
  const rx=1400;
  const row=(lab,val,yy,big)=>{x.fillStyle="#C9A24B";x.font="600 34px 'IBM Plex Mono', monospace";x.fillText(lab,rx,yy);x.fillStyle="#FBF8F4";x.font=(big?"900 92px":"800 60px")+" 'Big Shoulders Display', Impact, sans-serif";fitText(x,val,rx,yy+(big?86:62),w-rx-50);};
  row("LEAGUE",s.f?ordinal(s.f).toUpperCase():"IN PROGRESS",160,true);
  row("MANAGER",s.m.split(" → ").pop().toUpperCase(),340);
  row("CAPTAIN",s.c.toUpperCase(),480);
  // bottom bar: counts
  x.fillStyle="#1B2A4F";x.fillRect(0,600,w,170);
  const cols=[["SQUAD",counts.sq,"#FBF8F4"],["IN",counts.in,"#FF4651"],["OUT",counts.out,"#9FB3E0"],["HONOURS",honoursOf(s).length?honoursOf(s).join(" + ").replace("Community Shield","Shield").toUpperCase():"—","#E2B64A"]];
  let cx=56;
  cols.forEach(([l,v,c],i)=>{x.fillStyle="#93A0BE";x.font="600 30px 'IBM Plex Mono', monospace";x.fillText(l,cx,650);x.fillStyle=c;x.font="900 92px 'Big Shoulders Display', Impact, sans-serif";if(i<3){x.fillText(String(v),cx,744);cx+=260;}else{fitText(x,String(v),cx,744,w-cx-50);}});
  boardTex.needsUpdate=true;
}
function fitText(x,t,px,py,maxW){let fs=parseFloat(x.font.match(/(\d+)px/)[1]);const base=x.font;while(x.measureText(t).width>maxW&&fs>20){fs-=4;x.font=base.replace(/\d+px/,fs+"px");}x.fillText(t,px,py);}
let boardFlip={t:1,pending:null};

/* ---------- Clock End clock ---------- */
const clock=new THREE.Group();
(function(){
  const face=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,.2,48),M.white);face.rotation.x=Math.PI/2;
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1.75,.14,12,48),M.red);
  const lab=canvasTex(512,512,(x,w,h)=>{x.fillStyle="#FBF8F4";x.fillRect(0,0,w,h);x.translate(w/2,h/2);x.fillStyle="#0F1B36";for(let i=0;i<12;i++){x.save();x.rotate(i*Math.PI/6);x.fillRect(-5,-230,10,i%3?28:52);x.restore();}x.font="600 34px 'IBM Plex Mono', monospace";x.textAlign="center";x.fillStyle="#DB0A16";x.fillText("THE CLOCK END",0,95);});
  const dial=new THREE.Mesh(new THREE.CircleGeometry(1.62,48),new THREE.MeshStandardMaterial({map:lab,roughness:.5}));dial.position.z=.11;
  clock.add(face,rim,dial);
  const hh=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.04),M.navy);hh.geometry.translate(0,.4,0);hh.position.z=.16;
  const mh=new THREE.Mesh(new THREE.BoxGeometry(.08,1.35,.04),M.navy);mh.geometry.translate(0,.6,0);mh.position.z=.19;
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.1,12),M.red);cap.rotation.x=Math.PI/2;cap.position.z=.22;
  clock.add(hh,mh,cap);clock.userData={hh,mh};
  clock.position.set(9.6,10.1,-15.6);clock.scale.setScalar(.82);scene.add(clock);
})();

/* ---------- Gears ---------- */
function gearGeo(r,teeth,th){const s=new THREE.Shape();const tD=r*.16;for(let i=0;i<teeth*2;i++){const a0=i/(teeth*2)*Math.PI*2,a1=(i+1)/(teeth*2)*Math.PI*2;const rr=i%2?r:r+tD;if(i===0)s.moveTo(Math.cos(a0)*rr,Math.sin(a0)*rr);else s.lineTo(Math.cos(a0)*rr,Math.sin(a0)*rr);s.lineTo(Math.cos(a1)*rr,Math.sin(a1)*rr);}const hole=new THREE.Path();hole.absarc(0,0,r*.28,0,Math.PI*2,true);s.holes.push(hole);
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2;const hp=new THREE.Path();hp.absarc(Math.cos(a)*r*.62,Math.sin(a)*r*.62,r*.15,0,Math.PI*2,true);s.holes.push(hp);}
  return new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:1,curveSegments:24});}
const gears=[];
[[19.5,6.2,2.4,16,M.red,1],[23.55,3.8,1.5,10,M.navy,-1.6],[16.2,3.9,1.2,8,M.brass,-2]].forEach(([x,y,r,t,m,sp])=>{const g=new THREE.Mesh(gearGeo(r,t,.35),m);g.position.set(x,y,-15.8);g.castShadow=true;scene.add(g);gears.push({g,sp});});
// founding plaque
const plaqueTex=canvasTex(1024,512,(x,w,h)=>{x.fillStyle="#C9A24B";x.fillRect(0,0,w,h);x.strokeStyle="#7C6227";x.lineWidth=10;x.strokeRect(20,20,w-40,h-40);x.fillStyle="#3B2C0A";x.textAlign="center";x.font="600 40px 'IBM Plex Mono', monospace";x.fillText("ROYAL ARSENAL · WOOLWICH",w/2,120);x.font="900 150px 'Big Shoulders Display', Impact, sans-serif";x.fillText("DIAL SQUARE",w/2,290);x.font="600 46px 'IBM Plex Mono', monospace";x.fillText("WORKSHOP FOUNDED 1886",w/2,400);});
const plaque=new THREE.Mesh(new THREE.PlaneGeometry(4,2),new THREE.MeshStandardMaterial({map:plaqueTex,roughness:.35,metalness:.6}));plaque.position.set(-25.4,6.4,-15.85);plaque.scale.setScalar(.85);scene.add(plaque);

/* ---------- Trophy cabinet ---------- */
const cab=new THREE.Group();
const CAB_W=10.8,CAB_H=7.4;
(function(){
  const back=new THREE.Mesh(new THREE.BoxGeometry(CAB_W,CAB_H,.2),M.navy);back.position.set(0,CAB_H/2,-.5);back.receiveShadow=true;
  const frameT=new THREE.Mesh(new THREE.BoxGeometry(CAB_W+.5,.4,1.4),M.redDeep);frameT.position.set(0,CAB_H+.2,0);
  const frameB=frameT.clone();frameB.position.y=-.2;
  const sideL=new THREE.Mesh(new THREE.BoxGeometry(.3,CAB_H,1.4),M.redDeep);sideL.position.set(-CAB_W/2,CAB_H/2,0);const sideR=sideL.clone();sideR.position.x=CAB_W/2;
  [frameT,frameB,sideL,sideR].forEach(m=>{m.castShadow=true;cab.add(m)});cab.add(back);
  for(let i=0;i<3;i++){const sh=new THREE.Mesh(new THREE.BoxGeometry(CAB_W-.3,.1,1.1),M.brass);sh.position.set(0,.35+i*2.35,-.05);sh.receiveShadow=true;cab.add(sh);}
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(CAB_W-.3,CAB_H),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.08,roughness:.05,metalness:.2,depthWrite:false}));glass.position.set(0,CAB_H/2,.66);cab.add(glass);
  const lamp=new THREE.PointLight(0xFFE2A8,1.0,9);lamp.position.set(0,CAB_H-.5,.6);cab.add(lamp);
})();
const cabPlaqueTex=canvasTex(1024,180,()=>{});
const cabPlaque=new THREE.Mesh(new THREE.PlaneGeometry(CAB_W+.5,1.4),new THREE.MeshBasicMaterial({map:cabPlaqueTex,toneMapped:false}));cabPlaque.position.set(0,CAB_H+1.1,.3);cab.add(cabPlaque);
cab.position.set(-15.6,0.45,-15.1);scene.add(cab);
function drawCabPlaque(n){const {x,cv}=cabPlaqueTex.userData;const w=cv.width,h=cv.height;x.fillStyle="#DB0A16";x.fillRect(0,0,w,h);x.fillStyle="#FBF8F4";x.textBaseline="middle";x.font="900 100px 'Big Shoulders Display', Impact, sans-serif";x.textAlign="left";x.fillText("HONOURS",36,h/2+6);x.textAlign="right";x.font="900 130px 'Big Shoulders Display', Impact, sans-serif";x.fillText(String(n).padStart(2,"0"),w-36,h/2+8);x.font="600 26px 'IBM Plex Mono', monospace";x.textAlign="left";x.fillText("TROPHIES INCL.",440,h/2-16);x.fillText("COMMUNITY SHIELDS",440,h/2+22);cabPlaqueTex.needsUpdate=true;}

function lathe(pts,m,seg=32){return new THREE.Mesh(new THREE.LatheGeometry(pts.map(([a,b])=>new THREE.Vector2(a,b)),seg),m);}
function makeTrophy(kind,special){
  const g=new THREE.Group();
  if(kind==="PL"){
    const m=special?new THREE.MeshStandardMaterial({color:0xF2C443,roughness:.15,metalness:1,emissive:0x5a3a00,emissiveIntensity:.35}):M.silver;
    g.add(lathe([[0,0],[.34,0],[.34,.12],[.2,.18],[.12,.4],[.1,.55],[.3,.72],[.36,.95],[.3,1.02],[0,1.02]],m));
    const crown=new THREE.Mesh(new THREE.ConeGeometry(.16,.22,8),special?m:M.gold);crown.position.y=1.14;g.add(crown);
    [-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.TorusGeometry(.14,.025,8,16,Math.PI),m);h.position.set(s*.38,.82,0);h.rotation.z=s*-Math.PI/2;g.add(h);});
    if(!special){const band=new THREE.Mesh(new THREE.TorusGeometry(.33,.03,8,32),M.red);band.rotation.x=Math.PI/2;band.position.y=.82;g.add(band);}
  }else if(kind==="FA"){
    g.add(lathe([[0,0],[.26,0],[.26,.1],[.12,.16],[.09,.36],[.2,.45],[.3,.66],[.28,.8],[.18,.86],[.2,.92],[.08,1.0],[.06,1.08],[0,1.1]],M.silver));
    [-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.TorusGeometry(.13,.024,8,16,Math.PI*1.2),M.silver);h.position.set(s*.33,.66,0);h.rotation.z=s*-Math.PI/2;g.add(h);});
    const rib=new THREE.Mesh(new THREE.TorusGeometry(.24,.02,6,24),M.red);rib.rotation.x=Math.PI/2;rib.position.y=.47;g.add(rib);
  }else if(kind==="LC"){
    g.add(lathe([[0,0],[.25,0],[.25,.12],[.1,.18],[.08,.32],[.26,.5],[.3,.7],[0,.72]],M.silver));
    for(let i=0;i<3;i++){const a=i/3*Math.PI*2;const h=new THREE.Mesh(new THREE.TorusGeometry(.11,.022,8,16,Math.PI),M.silver);h.position.set(Math.cos(a)*.3,.5,Math.sin(a)*.3);h.rotation.y=-a;h.rotation.z=-Math.PI/2;g.add(h);}
  }else if(kind==="CS"){
    const base=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.3),M.navy2);base.position.y=.06;g.add(base);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.14,10),M.silver);stem.position.y=.19;g.add(stem);
    const plate=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.05,40),M.silver);plate.rotation.x=Math.PI/2;plate.position.y=.62;g.add(plate);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,8,40),M.gold);rim.position.y=.62;g.add(rim);
    const boss=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.07,28),M.red);boss.rotation.x=Math.PI/2;boss.position.set(0,.62,.02);g.add(boss);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(.07,16,10),M.gold);dome.position.set(0,.62,.06);g.add(dome);
  }else{ // CWC
    g.add(lathe([[0,0],[.24,0],[.24,.16],[.12,.22],[.1,.5],[.22,.62],[.28,.86],[.22,.98],[.26,1.04],[.12,1.14],[.06,1.26],[0,1.28]],M.silver));
    [-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,8,16,Math.PI),M.silver);h.position.set(s*.3,.78,0);h.rotation.z=s*-Math.PI/2;g.add(h);});
  }
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;}});
  g.scale.setScalar(kind==="CS"?1.05:1.0);
  return g;
}
const trophyList=[];SEASONS.forEach(s=>honoursOf(s).forEach(h=>trophyList.push({y:s.y,kind:TROPHY_KIND[h],name:h,special:s.y===2003&&h==="Premier League"})));
trophyList.forEach((t,i)=>{const shelf=Math.floor(i/9),slot=i%9;t.pos=new THREE.Vector3(-CAB_W/2+.8+slot*1.15,.4+shelf*2.35,0);t.obj=null;});
const trophyAnims=[];
function setTrophies(y,animate){
  let n=0;
  trophyList.forEach(t=>{
    const want=t.y<=y;
    if(want){n++;if(!t.obj){t.obj=makeTrophy(t.kind,t.special);t.obj.position.copy(t.pos);cab.add(t.obj);
      if(animate&&t.y===y){t.obj.position.y+=5;trophyAnims.push({t,time:0});SND.chime(.85);}}}
    else if(t.obj){cab.remove(t.obj);t.obj=null;}
  });
  drawCabPlaque(n);document.getElementById("trophN").textContent=n;
  return n;
}

/* ---------- Bunting ---------- */
const bunting=[];
(function(){
  const triGeo=new THREE.BufferGeometry();triGeo.setAttribute("position",new THREE.Float32BufferAttribute([-.32,0,0,.32,0,0,0,-.75,0],3));triGeo.computeVertexNormals();
  const mR=new THREE.MeshStandardMaterial({color:COL.red,side:THREE.DoubleSide,roughness:.7});
  const mW=new THREE.MeshStandardMaterial({color:0xFFFFFF,side:THREE.DoubleSide,roughness:.7});
  [[-14.9,-50,50,16.6,1.1]].forEach(([z,x0,x1,y,sag])=>{
    const pts=[];const N=Math.round((x1-x0)/1.1);
    for(let i=0;i<=N;i++){const t=i/N;const x=x0+(x1-x0)*t;const yy=y-sag*Math.sin(Math.PI*t);pts.push(new THREE.Vector3(x,yy,z));}
    const curve=new THREE.CatmullRomCurve3(pts);
    const line=new THREE.Mesh(new THREE.TubeGeometry(curve,80,.02,4),M.navy);scene.add(line);
    for(let i=1;i<N;i++){const f=new THREE.Mesh(triGeo,i%2?mR:mW);f.position.copy(pts[i]);scene.add(f);bunting.push({f,ph:i*.7+z});}
  });
})();

/* ===================================================================
   ADVERTISING — edit this block to sell or swap any slot.
   perimeter: the LED boards around the pitch (scrolling).
   billboards: the two big wall panels (they rotate through the list).
   Every slot links to ADS.url when clicked.
   =================================================================== */
/* Flip SHOW_SPONSOR_SLOTS to true only when a real sponsor has signed.
   Until then the boards carry the site's own house ads, which is what
   the README promises ("not selling you anything"). Entries marked
   sponsor:true are the paid slots; swap their text/colours for the
   sponsor's own when the deal is done. */
const SHOW_SPONSOR_SLOTS=false;
const ADS_ALL={
  url:"index.html",
  site:"thenonnegotiablog.com",
  perimeter:[
    {t:"THENONNEGOTIABLOG.COM",bg:"#DB0A16",fg:"#FFFFFF"},
    {t:"EVERY FIXTURE IN YOUR TIMEZONE",bg:"#0F1B36",fg:"#FFFFFF"},
    {t:"A COLUMN AFTER EVERY MATCH",bg:"#FBF8F4",fg:"#0F1B36"},
    {t:"YOUR BRAND HERE",bg:"#0F1B36",fg:"#E2B64A",sponsor:true},
  ],
  billboards:[
    {eyebrow:"The Non-Negotiables",title:"Every match.|Every column.",sub:"thenonnegotiablog.com",bg:"#DB0A16",fg:"#FFFFFF",accent:"#0F1B36"},
    {eyebrow:"The timetable",title:"Kick-off at 4:30am?|Set the alarm.",sub:"Every fixture, in your timezone",bg:"#0F1B36",fg:"#FBF8F4",accent:"#E2B64A"},
    {eyebrow:"Sponsor slot",title:"Your brand|here",sub:"In front of Arsenal fans, every season",bg:"#0F1B36",fg:"#FBF8F4",accent:"#E2B64A",sponsor:true},
    {eyebrow:"Dial Square Works",title:"35 seasons.|One factory.",sub:"Share it with a fellow sufferer",bg:"#FBF8F4",fg:"#0F1B36",accent:"#DB0A16"},
  ],
};
const ADS={...ADS_ALL,
  perimeter:ADS_ALL.perimeter.filter(a=>SHOW_SPONSOR_SLOTS||!a.sponsor),
  billboards:ADS_ALL.billboards.filter(a=>SHOW_SPONSOR_SLOTS||!a.sponsor)};
const adPickables=[];

// --- Perimeter LED boards (scrolling) ---
function ledTexture(){
  const cv=document.createElement("canvas");cv.width=4096;cv.height=128;const x=cv.getContext("2d");
  const segW=cv.width/ADS.perimeter.length;
  ADS.perimeter.forEach((a,i)=>{
    x.fillStyle=a.bg;x.fillRect(i*segW,0,segW,128);
    x.fillStyle=a.fg;let fs=84;x.font=`900 ${fs}px 'Big Shoulders Display', Impact, sans-serif`;
    while(x.measureText(a.t).width>segW-80&&fs>40){fs-=4;x.font=`900 ${fs}px 'Big Shoulders Display', Impact, sans-serif`;}
    x.textAlign="center";x.textBaseline="middle";x.fillText(a.t,i*segW+segW/2,68);
  });
  // LED pixel grid
  x.fillStyle="rgba(0,0,0,.22)";for(let gx=0;gx<cv.width;gx+=6)x.fillRect(gx,0,1.5,128);for(let gy=0;gy<128;gy+=6)x.fillRect(0,gy,cv.width,1.5);
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.wrapS=THREE.RepeatWrapping;t.anisotropy=8;return t;
}
const ledBase=ledTexture();
const ledBoards=[];
const LED_H=.5;
function ledBoard(len,x,z,rotY,speed){
  const tex=ledBase.clone();tex.needsUpdate=true;tex.repeat.set(len/(LED_H*32),1);
  const g=new THREE.Group();
  const face=new THREE.Mesh(new THREE.PlaneGeometry(len,LED_H),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));face.position.set(0,LED_H/2+.08,.07);
  const box=new THREE.Mesh(new THREE.BoxGeometry(len+.1,LED_H+.12,.12),M.navy);box.position.y=LED_H/2+.06;box.castShadow=true;
  const legs=new THREE.Mesh(new THREE.BoxGeometry(len,.06,.4),M.darkSteel);legs.position.set(0,.03,-.12);
  g.add(box,face,legs);g.position.set(x,PY,z);g.rotation.y=rotY;scene.add(g);
  face.userData.ad="perimeter";adPickables.push(face);
  ledBoards.push({tex,speed});
}
// front and back run the full width; the sides leave a gap for the walk-in / walk-out lanes
ledBoard(PW+1.6,0,PD/2+1.0,0,.045);
ledBoard(PW+1.6,0,-PD/2-1.35,0,-.045);
[[-1,1],[1,-1]].forEach(([sx,dir])=>{
  [[-PD/2-.5,-2.6],[2.6,PD/2+.5]].forEach(([z0,z1])=>{const len=z1-z0;ledBoard(len,sx*(PW/2+1.0),(z0+z1)/2,sx<0?Math.PI/2:-Math.PI/2,.06*dir);});
});

// --- Big rotating wall billboards ---
function drawBillboard(x,w,h,a){
  x.fillStyle=a.bg;x.fillRect(0,0,w,h);
  x.fillStyle=a.accent;x.fillRect(0,0,w,18);x.fillRect(0,h-18,w,18);
  x.fillStyle=a.accent;x.font="600 34px 'IBM Plex Mono', monospace";x.textBaseline="alphabetic";x.textAlign="left";
  x.fillText(a.eyebrow.toUpperCase(),60,96);
  x.fillStyle=a.fg;const lines=a.title.split("|");let fs=150;
  x.font=`900 ${fs}px 'Big Shoulders Display', Impact, sans-serif`;
  while(lines.some(l=>x.measureText(l.toUpperCase()).width>w-120)&&fs>60){fs-=6;x.font=`900 ${fs}px 'Big Shoulders Display', Impact, sans-serif`;}
  lines.forEach((l,i)=>x.fillText(l.toUpperCase(),56,110+fs*.92*(i+1)));
  x.font="600 40px 'Barlow Semi Condensed', 'Arial Narrow', sans-serif";x.globalAlpha=.9;x.fillText(a.sub,60,h-56);x.globalAlpha=1;
  if(a.sponsor){x.strokeStyle=a.accent;x.setLineDash([18,12]);x.lineWidth=6;x.strokeRect(30,30,w-60,h-60);x.setLineDash([]);}
}
const billboards=[];
function billboard(xPos,yPos,startIdx){
  const W=10.4,H=5.2;
  const cv=document.createElement("canvas");cv.width=1040;cv.height=520;const ctx=cv.getContext("2d");
  const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
  const g=new THREE.Group();
  const frame=new THREE.Mesh(new THREE.BoxGeometry(W+.5,H+.5,.4),M.navy);frame.castShadow=true;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));face.position.z=.21;
  const trim=new THREE.Mesh(new THREE.BoxGeometry(W+.5,.16,.46),M.brass);trim.position.y=-H/2-.3;
  const lampArm=new THREE.Mesh(new THREE.BoxGeometry(W*.8,.1,.9),M.darkSteel);lampArm.position.set(0,H/2+.45,.5);
  g.add(frame,face,trim,lampArm);
  for(let i=-1;i<=1;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,.3,14),M.red);l.position.set(i*W*.32,H/2+.32,.9);l.rotation.x=.6;g.add(l);}
  g.position.set(xPos,yPos,-15.55);scene.add(g);
  face.userData.ad="billboard";adPickables.push(face);
  const bb={g,face,ctx,tex,W:cv.width,H:cv.height,idx:startIdx,t:Math.random()*3,flip:1,pending:false};
  drawBillboard(ctx,cv.width,cv.height,ADS.billboards[bb.idx%ADS.billboards.length]);tex.needsUpdate=true;
  billboards.push(bb);
}
billboard(-37,10.6,0);
billboard(37,10.6,1);
function updateAds(rdt){
  ledBoards.forEach(b=>{b.tex.offset.x+=rdt*b.speed;});
  billboards.forEach(b=>{
    b.t+=rdt;
    if(b.t>9&&b.flip>=1){b.flip=0;b.pending=true;b.t=0;}
    if(b.flip<1){b.flip=Math.min(1,b.flip+rdt*1.6);const k=b.flip;
      if(k>=.5&&b.pending){b.pending=false;b.idx++;drawBillboard(b.ctx,b.W,b.H,ADS.billboards[b.idx%ADS.billboards.length]);b.tex.needsUpdate=true;}
      b.face.scale.y=Math.max(.02,Math.abs(Math.cos(k*Math.PI)));}
  });
}

// --- Skylight windows along the top of the back wall ---
function windowTex(night){
  const cv=document.createElement("canvas");cv.width=2048;cv.height=128;const x=cv.getContext("2d");
  const g=x.createLinearGradient(0,0,0,128);
  if(night){g.addColorStop(0,"#050A18");g.addColorStop(1,"#14244A");}else{g.addColorStop(0,"#9CC3E8");g.addColorStop(1,"#E8F1FA");}
  x.fillStyle=g;x.fillRect(0,0,2048,128);
  if(night){x.fillStyle="#fff";for(let i=0;i<70;i++){x.globalAlpha=.3+Math.random()*.7;x.fillRect(Math.random()*2048,Math.random()*90,2,2);}x.globalAlpha=1;}
  else{x.fillStyle="rgba(255,255,255,.7)";for(let i=0;i<9;i++){x.beginPath();x.ellipse(Math.random()*2048,30+Math.random()*50,60+Math.random()*80,14,0,0,7);x.fill();}}
  x.fillStyle="#1B2A4F";for(let i=0;i<=32;i++)x.fillRect(i*64-3,0,6,128);x.fillRect(0,0,2048,6);x.fillRect(0,122,2048,6);x.fillRect(0,61,2048,4);
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return t;
}
const winDay=new THREE.Mesh(new THREE.PlaneGeometry(100,2.4),new THREE.MeshBasicMaterial({map:windowTex(false),toneMapped:false}));
winDay.position.set(0,19.2,-15.94);scene.add(winDay);
const winNight=new THREE.Mesh(new THREE.PlaneGeometry(100,2.4),new THREE.MeshBasicMaterial({map:windowTex(true),toneMapped:false,transparent:true,opacity:0}));
winNight.position.set(0,19.2,-15.93);scene.add(winNight);

// --- Floodlight towers ---
const floods=[];
const beamMat=new THREE.MeshBasicMaterial({color:0xFFF4DD,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
[[-1,-1],[1,-1]].forEach(([sx,sz],i)=>{
  const bx=sx*(PW/2+11),bz=-PD/2-2.2,H=13.5;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,H,10),M.darkSteel);pole.position.set(bx,H/2,bz);pole.castShadow=true;scene.add(pole);
  const head=new THREE.Group();
  const panel=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.3,.25),M.navy);head.add(panel);
  const lampMat=new THREE.MeshStandardMaterial({color:0xFFFFFF,emissive:0xFFF1D6,emissiveIntensity:.15,roughness:.3});
  for(let r=0;r<2;r++)for(let c=0;c<4;c++){const l=new THREE.Mesh(new THREE.CircleGeometry(.2,16),lampMat);l.position.set(-.75+c*.5,-.28+r*.56,.13);head.add(l);}
  head.position.set(bx,H+.4,bz);head.lookAt(0,0,0);scene.add(head);
  const spot=new THREE.SpotLight(0xFFF2DC,0,34,.52,.6,1.4);spot.position.set(bx,H+.4,bz);spot.target.position.set(-sx*3.5,0,2.2);spot.visible=false;scene.add(spot,spot.target);
  const len=Math.hypot(bx,H,bz);const beam=new THREE.Mesh(new THREE.ConeGeometry(4.2,len,24,1,true),beamMat);beam.geometry.translate(0,-len/2,0);
  beam.position.set(bx,H+.4,bz);beam.lookAt(0,0,0);beam.rotateX(-Math.PI/2);scene.add(beam);
  floods.push({spot,lampMat,beam});
});

// --- Day / night ---
const DAYC={bg:new THREE.Color(0xE9E3DC),hemiS:new THREE.Color(0xFFF6EC),hemiG:new THREE.Color(0xB8A796)};
const NIGHTC={bg:new THREE.Color(0x0B1224),hemiS:new THREE.Color(0x5B6FA8),hemiG:new THREE.Color(0x1A1F2E)};
let nightGoal=0,nightK=0;
const workLamps=[[-27,5.5,2.5],[25.5,5.5,2.5]].map(([x,y,z])=>{const l=new THREE.PointLight(0xFFE2B8,0,18,1.6);l.position.set(x,y,z);l.visible=false;scene.add(l);return l;});
const WHITE=new THREE.Color(0xFFFFFF),HALL_NIGHT=new THREE.Color(0x4A5470);
const hallMats=[floor.material,wall.material];scene.traverse(o=>{if(o.isMesh&&o.geometry.type==="PlaneGeometry"&&o.geometry.parameters.width===70&&o.geometry.parameters.height===24)hallMats.push(o.material);});
function setNight(v){nightGoal=v?1:0;SND.setNight(v);document.getElementById("hud").classList.toggle("night",v);const b=document.getElementById("nightBtn");if(b){b.setAttribute("aria-pressed",v?"true":"false");b.querySelector("span").textContent=v?"Day":"Night";}
  floods.forEach(f=>f.spot.visible=true);}
function updateNight(rdt){
  if(Math.abs(nightK-nightGoal)<1e-3){if(nightGoal===0&&floods[0].spot.visible&&nightK===0)floods.forEach(f=>f.spot.visible=false);return;}
  nightK+=Math.sign(nightGoal-nightK)*Math.min(Math.abs(nightGoal-nightK),rdt*.8);
  const k=nightK*nightK*(3-2*nightK);
  scene.background.copy(DAYC.bg).lerp(NIGHTC.bg,k);scene.fog.color.copy(scene.background);
  hemi.color.copy(DAYC.hemiS).lerp(NIGHTC.hemiS,k);hemi.groundColor.copy(DAYC.hemiG).lerp(NIGHTC.hemiG,k);
  hemi.intensity=.62-.5*k;sun.intensity=1.55-1.45*k;fill.intensity=.35-.1*k;workLamps.forEach(l=>{l.intensity=k*1.6;l.visible=k>0;});renderer.toneMappingExposure=1.08+.12*k;
  winNight.material.opacity=k;
  hallMats.forEach(m=>m.color.copy(WHITE).lerp(HALL_NIGHT,k));
  floods.forEach(f=>{f.spot.intensity=k*4.2;f.lampMat.emissiveIntensity=.15+k*2.4;f.beam.material.opacity=k*.055;});
  ledMat.emissiveIntensity=.8+k*1.2;inGlow.intensity=1.2+k*2;outGlow.intensity=.8+k*2;
  if(nightK===0)floods.forEach(f=>f.spot.visible=false);
}

/* ===================================================================
   SOUND — an original soundtrack built live with the Web Audio API
   (no audio files, nothing fetched). Off until the visitor presses
   Sound; browsers won't play audio before a tap anyway. The music
   follows the floor: full band while players move, drums drop out in
   the gap between seasons, a darker progression at night. SFX hook
   into the press, the belts, the cabinet and title seasons.
   =================================================================== */
const SND=(()=>{
  let ctx=null,master=null,musicBus=null,sfxBus=null,noiseBuf=null,on=false,timer=null;
  let nextT=0,step=0,intensity=1,nightMood=false;
  const BPM=122,SPB=60/BPM/4; // 16th-note grid
  const DAY=[[62,66,69],[59,62,66],[55,59,62],[57,61,64]],DAY_R=[38,35,31,33];
  const NIGHT=[[59,62,66],[55,59,62],[50,54,57],[57,61,64]],NIGHT_R=[35,31,26,33];
  // the hook: [16th offset in a 2-bar phrase, midi, length in 16ths]
  const HOOK=[[0,74,2],[2,76,2],[4,78,4],[8,76,2],[10,74,2],[12,71,4],[16,74,2],[18,76,2],[20,78,3],[23,81,1],[24,78,4],[28,76,4]];
  const f=n=>440*Math.pow(2,(n-69)/12);
  function init(){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=.0001;
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;
    master.connect(comp);comp.connect(ctx.destination);
    musicBus=ctx.createGain();musicBus.gain.value=.55;musicBus.connect(master);
    sfxBus=ctx.createGain();sfxBus.gain.value=.8;sfxBus.connect(master);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }
  function env(g,t,a,peak,dec,sus=0){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(Math.max(.0001,sus||.0001),t+a+dec);}
  function osc(type,freq,t,dur,peak,dest,a=.005,cut=0){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
    let n=o;if(cut){const l=ctx.createBiquadFilter();l.type="lowpass";l.frequency.value=cut;o.connect(l);n=l;}
    n.connect(g);g.connect(dest);env(g,t,a,peak,dur);o.start(t);o.stop(t+a+dur+.05);return o;
  }
  function noise(t,dur,peak,type,freq,dest,q=1){
    const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;
    fl.type=type;fl.frequency.value=freq;fl.Q.value=q;s.connect(fl);fl.connect(g);g.connect(dest);env(g,t,.002,peak,dur);s.start(t);s.stop(t+dur+.05);
  }
  function kick(t,v=1){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(48,t+.12);o.connect(g);g.connect(musicBus);env(g,t,.003,.9*v,.32);o.start(t);o.stop(t+.4);}
  function schedule(i,t){
    const bar=Math.floor(i/16)%4,s16=i%16,prog=nightMood?NIGHT:DAY,roots=nightMood?NIGHT_R:DAY_R;
    const full=intensity>.5;
    // drums
    if(s16%4===0)kick(t,full?1:.55);
    if(full&&(s16===4||s16===12))noise(t,.16,.32,"bandpass",1800,musicBus,.8);
    if(s16%2===1||full&&s16%4===2)noise(t,.04,full?.10:.05,"highpass",8000,musicBus);
    // bass: off-beat octave pump
    if(full&&s16%2===0){const n=roots[bar]+(s16%4===2?12:0);osc("sawtooth",f(n),t,SPB*1.6,.16,musicBus,.004,600);}
    // pad: one chord per bar
    if(s16===0)prog[bar].forEach(n=>{[-4,5].forEach(det=>{const o=osc("sawtooth",f(n)*(1+det/1200),t,SPB*15,.035,musicBus,nightMood?.6:.25,nightMood?900:1600);});});
    // the hook, on alternate 2-bar phrases while the line is moving
    const ph=Math.floor(i/32)%2,p16=i%32;
    if(full&&ph===0)HOOK.forEach(([o,n,l])=>{if(o===p16){osc("square",f(n-(nightMood?12:0)),t,SPB*l*.9,.05,musicBus,.01,2400);osc("sawtooth",f(n)*1.003,t,SPB*l*.9,.03,musicBus,.01,2000);}});
  }
  function pump(){if(!on)return;const ahead=ctx.currentTime+.15;while(nextT<ahead){schedule(step,nextT);step++;nextT+=SPB;}}
  function start(){
    if(!ctx)init();if(ctx.state==="suspended")ctx.resume();
    on=true;nextT=ctx.currentTime+.08;master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(.9,ctx.currentTime,.25);
    clearInterval(timer);timer=setInterval(pump,25);
  }
  function stop(){if(!ctx)return;on=false;clearInterval(timer);master.gain.setTargetAtTime(.0001,ctx.currentTime,.15);}
  const ok=()=>on&&ctx;
  return {
    toggle(){on?stop():start();return on;},get on(){return on;},
    pause(){if(ctx&&on)ctx.suspend();},resume(){if(ctx&&on)ctx.resume();},
    setIntensity(v){intensity=v;},setNight(v){nightMood=v;},
    stamp(){if(!ok())return;const t=ctx.currentTime;kick(t,1.3);noise(t,.25,.5,"lowpass",900,sfxBus);osc("triangle",f(84),t+.02,.35,.12,sfxBus,.002);osc("triangle",f(91),t+.02,.3,.07,sfxBus,.002);},
    whoosh(){if(!ok())return;const t=ctx.currentTime,s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;fl.type="bandpass";fl.Q.value=2;fl.frequency.setValueAtTime(400,t);fl.frequency.exponentialRampToValueAtTime(2600,t+.5);s.connect(fl);fl.connect(g);g.connect(sfxBus);env(g,t,.15,.12,.45);s.start(t);s.stop(t+.7);},
    chime(delay=0){if(!ok())return;const t=ctx.currentTime+delay;[[88,.12],[95,.08],[100,.06],[107,.03]].forEach(([n,v],i)=>osc("sine",f(n),t+i*.06,1.6,v,sfxBus,.003));},
    cheer(big=1){if(!ok())return;const t=ctx.currentTime,s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;s.loop=true;fl.type="bandpass";fl.frequency.value=1100;fl.Q.value=.6;s.connect(fl);fl.connect(g);g.connect(sfxBus);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22*big,t+.6);g.gain.exponentialRampToValueAtTime(.0001,t+3.2);s.start(t);s.stop(t+3.4);},
    flip(){if(!ok())return;const t=ctx.currentTime;noise(t,.06,.18,"highpass",3000,sfxBus);osc("square",f(79),t,.05,.04,sfxBus,.002,3000);},
  };
})();

/* ---------- Players ---------- */
const G={
  torso:new THREE.CylinderGeometry(.27,.21,.62,12),
  sleeve:new THREE.CylinderGeometry(.085,.075,.36,8),
  arm:new THREE.CylinderGeometry(.065,.055,.3,8),
  hand:new THREE.SphereGeometry(.07,8,6),
  shorts:new THREE.CylinderGeometry(.235,.25,.24,12),
  thigh:new THREE.CylinderGeometry(.085,.075,.3,8),
  sock:new THREE.CylinderGeometry(.072,.064,.32,8),
  hoop:new THREE.CylinderGeometry(.075,.075,.06,8),
  boot:new THREE.BoxGeometry(.13,.08,.26),
  neck:new THREE.CylinderGeometry(.07,.08,.1,8),
  head:new THREE.SphereGeometry(.18,16,12),
  collar:new THREE.TorusGeometry(.09,.025,6,14),
  band:new THREE.CylinderGeometry(.09,.09,.07,10),
};
[G.sleeve,G.arm].forEach(g=>g.translate(0,-g.parameters.height/2,0));
G.thigh.translate(0,-.15,0);G.sock.translate(0,-.16,0);

function buildFigure(pl){
  const g=new THREE.Group();
  const gk=pl.pos==="G";
  const shirt=gk?M.gk:M.red, sleeve=gk?M.gk:M.white, shorts=gk?M.gkDark:M.white, sockM=gk?M.gkDark:M.white;
  const body=new THREE.Group();g.add(body);
  const torso=new THREE.Mesh(G.torso,shirt);torso.position.y=1.12;body.add(torso);
  const collar=new THREE.Mesh(G.collar,gk?M.navy:M.white);collar.rotation.x=Math.PI/2;collar.position.y=1.44;body.add(collar);
  const neck=new THREE.Mesh(G.neck,M.skin);neck.position.y=1.48;body.add(neck);
  const head=new THREE.Mesh(G.head,M.skin);head.position.y=1.68;head.scale.set(1,1.08,1);body.add(head);
  const sh=new THREE.Mesh(G.shorts,shorts);sh.position.y=.74;body.add(sh);
  const arms=[],legs=[];
  [-1,1].forEach(s=>{
    const a=new THREE.Group();a.position.set(s*.32,1.38,0);
    const sl=new THREE.Mesh(G.sleeve,sleeve);a.add(sl);
    const fa=new THREE.Mesh(G.arm,M.skin);fa.position.y=-.34;a.add(fa);
    const hd=new THREE.Mesh(G.hand,M.skin);hd.position.y=-.66;a.add(hd);
    a.rotation.z=s*.1;body.add(a);arms.push(a);
    const l=new THREE.Group();l.position.set(s*.12,.64,0);
    const th=new THREE.Mesh(G.thigh,M.skin);l.add(th);
    const sk=new THREE.Mesh(G.sock,sockM);sk.position.y=-.3;l.add(sk);
    if(!gk){const hp=new THREE.Mesh(G.hoop,M.red);hp.position.y=-.36;l.add(hp);}
    const bt=new THREE.Mesh(G.boot,M.navy);bt.position.set(0,-.6,.04);l.add(bt);
    g.add(l);legs.push(l);
  });
  if(pl.legend){const ring=new THREE.Mesh(new THREE.RingGeometry(.36,.46,32),new THREE.MeshStandardMaterial({color:COL.brass,metalness:.8,roughness:.3,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.015;g.add(ring);}
  // armband slot
  const band=new THREE.Mesh(G.band,M.gold);band.position.y=-.2;band.visible=false;arms[0].add(band);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.pl=pl;}});
  g.userData={body,arms,legs,band,head};
  return g;
}

// Labels
const labelCache=new Map();
function labelTexture(pl,variant){
  const key=pl.id+":"+variant;if(labelCache.has(key))return labelCache.get(key);
  const cv=document.createElement("canvas");cv.width=512;cv.height=128;const x=cv.getContext("2d");
  const pal={idle:["#FFFDF9","#0F1B36","#DB0A16","#FFFFFF"],nw:["#DB0A16","#FFFFFF","#FFFFFF","#DB0A16"],out:["#0F1B36","#FFFFFF","#5E6C93","#FFFFFF"]}[variant];
  let fs=64;x.font=`800 ${fs}px 'Big Shoulders Display', Impact, sans-serif`;
  const name=pl.label;while(x.measureText(name).width>340&&fs>30){fs-=2;x.font=`800 ${fs}px 'Big Shoulders Display', Impact, sans-serif`;}
  const tw=x.measureText(name).width;const badge=74;const pad=18;const W=Math.min(500,tw+badge+pad*2+8);const X=(512-W)/2,Y=18,H=92;
  x.shadowColor="rgba(15,27,54,.35)";x.shadowBlur=10;x.shadowOffsetY=4;
  x.fillStyle=pal[0];x.fillRect(X,Y,W,H);x.shadowColor="transparent";
  if(pl.legend){x.strokeStyle="#C9A24B";x.lineWidth=6;x.strokeRect(X+3,Y+3,W-6,H-6);}
  x.fillStyle=pal[2];x.fillRect(X,Y,badge,H);
  x.fillStyle=pal[3];x.font="600 30px 'IBM Plex Mono', monospace";x.textAlign="center";x.textBaseline="middle";x.fillText(POSAB[pl.pos],X+badge/2,Y+H/2+2);
  x.fillStyle=pal[1];x.font=`800 ${fs}px 'Big Shoulders Display', Impact, sans-serif`;x.textAlign="left";x.fillText(name,X+badge+pad,Y+H/2+4);
  if(pl.legend){x.fillStyle="#C9A24B";star(x,X+W-6,Y+8,13);}
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;labelCache.set(key,t);return t;
}
function star(x,cx,cy,r){x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5;const rr=i%2?r*.45:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();x.fill();}

/* ---------- Actors ---------- */
const actors=new Map(); // pl.id -> actor
const pickables=[];
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function getActor(pl){
  let a=actors.get(pl.id);if(a)return a;
  const fig=buildFigure(pl);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTexture(pl,"idle"),depthTest:false,transparent:true}));
  sprite.scale.set(2.1,.525,1);sprite.renderOrder=10;sprite.position.y=2.4;fig.add(sprite);
  a={pl,fig,sprite,variant:"idle",path:[],speed:4.6,state:"off",phase:Math.random()*6,walk:0,idleT:Math.random()*10,yaw:0,targetYaw:0,scale:1,targetScale:1,labelH:2.3,onArrive:null,belt:false,delay:0};
  fig.userData.actor=a;
  actors.set(pl.id,a);
  return a;
}
function setVariant(a,v){if(a.variant===v)return;a.variant=v;a.sprite.material.map=labelTexture(a.pl,v);a.sprite.material.needsUpdate=true;}
function addToScene(a){if(!a.fig.parent){scene.add(a.fig);a.fig.traverse(o=>{if(o.isMesh)pickables.push(o)});}}
function removeFromScene(a){if(a.fig.parent){scene.remove(a.fig);for(let i=pickables.length-1;i>=0;i--){if(pickables[i].userData.pl===a.pl)pickables.splice(i,1);}}a.state="off";a.path=[];a.onArrive=null;a.belt=false;}

// Formation slots
const ROWZ={G:-5.5,D:-2.35,M:.95,F:4.2};
function slotsFor(y){
  const sq=squadAt(y);const cap=captainOf(y);
  const out=new Map();
  ["G","D","M","F"].forEach(pos=>{
    const row=sq.filter(p=>p.pos===pos).sort((a,b)=>streakTo(b,y)-streakTo(a,y)||a.id-b.id);
    // centre the longest-serving, alternate outwards
    const ordered=[];row.forEach((p,i)=>{if(i%2===0)ordered.push(p);else ordered.unshift(p);});
    const n=ordered.length;const gap=n>10?1.5:n>8?1.65:1.8;
    ordered.forEach((p,i)=>{const x=(i-(n-1)/2)*gap;out.set(p.id,{x,z:ROWZ[pos]+(i%2?.35:-.05),lab:i%2?2.78:2.22,cap:p.name===cap});});
  });
  return out;
}

/* ---------- The manager on the touchline ---------- */
const MGR_SHORT={"George Graham":"GRAHAM","Stewart Houston":"HOUSTON","Bruce Rioch":"RIOCH","Arsène Wenger":"WENGER","Unai Emery":"EMERY","Mikel Arteta":"ARTETA"};
const mgrSpot=new THREE.Vector3(-PW/2-1.7,0,PD/2-4.2);
// dugout bench
(function(){const d=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(1.1,.5,4.2),M.navy);base.position.y=.25;const back=new THREE.Mesh(new THREE.BoxGeometry(.2,1.6,4.4),M.red);back.position.set(-.55,.8,0);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(1.8,.12,4.6),new THREE.MeshStandardMaterial({color:0xDDE4EE,transparent:true,opacity:.55,roughness:.1}));roof.position.set(-.1,1.75,0);roof.rotation.z=-.12;
  [base,back].forEach(m=>{m.castShadow=true;m.receiveShadow=true;d.add(m)});d.add(roof);d.position.set(mgrSpot.x-1.6,0,mgrSpot.z-2.6);scene.add(d);})();
function mgrLabel(name){const cv=document.createElement("canvas");cv.width=512;cv.height=128;const x=cv.getContext("2d");x.font="800 60px 'Big Shoulders Display', Impact, sans-serif";const tw=x.measureText(name).width;const W=tw+150,X=(512-W)/2;x.fillStyle="#0F1B36";x.fillRect(X,18,W,92);x.fillStyle="#C9A24B";x.fillRect(X,18,92,92);x.fillStyle="#0F1B36";x.font="600 26px 'IBM Plex Mono', monospace";x.textAlign="center";x.textBaseline="middle";x.fillText("MGR",X+46,66);x.fillStyle="#FBF8F4";x.font="800 60px 'Big Shoulders Display', Impact, sans-serif";x.textAlign="left";x.fillText(name,X+112,68);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return t;}
function buildManager(name){
  const g=new THREE.Group();const coat=M.navy;
  const body=new THREE.Group();g.add(body);
  const c=new THREE.Mesh(new THREE.CylinderGeometry(.27,.34,1.05,12),coat);c.position.y=.98;body.add(c);
  const scarf=new THREE.Mesh(new THREE.TorusGeometry(.13,.05,8,16),M.red);scarf.rotation.x=Math.PI/2;scarf.position.y=1.47;body.add(scarf);
  const head=new THREE.Mesh(G.head,M.skin);head.position.y=1.7;head.scale.set(1,1.08,1);body.add(head);
  const arms=[];[-1,1].forEach(s=>{const a=new THREE.Group();a.position.set(s*.32,1.4,0);const sl=new THREE.Mesh(new THREE.CylinderGeometry(.09,.08,.62,8),coat);sl.position.y=-.31;a.add(sl);const hd=new THREE.Mesh(G.hand,M.skin);hd.position.y=-.66;a.add(hd);a.rotation.z=s*.08;a.rotation.x=-.25;body.add(a);arms.push(a);});
  const legs=[];[-1,1].forEach(s=>{const l=new THREE.Group();l.position.set(s*.12,.48,0);const tr=new THREE.Mesh(new THREE.CylinderGeometry(.08,.07,.44,8),M.darkSteel);tr.position.y=-.2;l.add(tr);const sh=new THREE.Mesh(G.boot,M.rubber);sh.position.set(0,-.44,.04);l.add(sh);g.add(l);legs.push(l);});
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:mgrLabel(name),depthTest:false,transparent:true}));sp.scale.set(2.3,.575,1);sp.position.y=2.4;sp.renderOrder=11;g.add(sp);
  g.position.copy(mgrSpot);g.rotation.y=.55;g.userData={arms,body,name};
  return g;
}
let mgr=null,mgrOld=null,mgrT=1;
function setManager(y,animate){
  const name=MGR_SHORT[SN[y].m.split(" → ").pop()]||"";
  if(mgr&&mgr.userData.name===name)return;
  if(mgrOld){scene.remove(mgrOld);}
  mgrOld=animate?mgr:null;if(!animate&&mgr)scene.remove(mgr);
  mgr=buildManager(name);scene.add(mgr);
  if(animate){mgrT=0;mgr.scale.setScalar(.01);steam(mgrSpot.x,1,mgrSpot.z,10);}else{mgrT=1;}
}

/* ---------- Pods (incoming capsules) ---------- */
const podGeo=new THREE.CapsuleGeometry(.55,1.0,8,20);
const podBand=new THREE.TorusGeometry(.57,.06,8,32);
const pods=[];
function makePod(pl){const g=new THREE.Group();const b=new THREE.Mesh(podGeo,new THREE.MeshStandardMaterial({color:0xFBF8F4,roughness:.25,metalness:.1}));b.position.y=1.05;const r=new THREE.Mesh(podBand,M.red);r.rotation.x=Math.PI/2;r.position.y=1.05;const r2=r.clone();r2.position.y=1.45;r2.material=M.navy;
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTexture(pl,"nw"),depthTest:false,transparent:true}));tag.scale.set(2.5,.625,1);tag.position.y=2.55;tag.renderOrder=10;
  g.add(b,r,r2,tag);g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.position.set(INTAKE_X0-1,BELT_Y,0);scene.add(g);return g;}

/* ---------- Particles: steam & confetti ---------- */
const puffTex=canvasTex(128,128,(x,w,h)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,"rgba(255,255,255,.95)");g.addColorStop(.6,"rgba(255,255,255,.35)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,w,h);});
const puffs=[];
function steam(x,y,z,n=8){for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex,transparent:true,depthWrite:false,opacity:.9}));s.position.set(x+(Math.random()-.5)*1.2,y,z+(Math.random()-.5)*1.4);const sc=.6+Math.random()*.6;s.scale.set(sc,sc,1);scene.add(s);puffs.push({s,v:new THREE.Vector3((Math.random()-.5)*1.6,1.2+Math.random()*1.5,(Math.random()-.5)*1.6),life:0,max:1.2+Math.random()*.8});}}
const CONF_N=520;
const confGeo=new THREE.PlaneGeometry(.16,.24);
const confMat=new THREE.MeshStandardMaterial({side:THREE.DoubleSide,roughness:.5,metalness:.2});
const confetti=new THREE.InstancedMesh(confGeo,confMat,CONF_N);confetti.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
const confColors=[new THREE.Color(COL.red),new THREE.Color(0xFFFFFF),new THREE.Color(COL.gold),new THREE.Color(COL.red)];
const confData=[];for(let i=0;i<CONF_N;i++){confetti.setColorAt(i,confColors[i%4]);confData.push({p:new THREE.Vector3(0,-50,0),v:new THREE.Vector3(),r:new THREE.Euler(),w:new THREE.Vector3(),alive:false});}
confetti.frustumCulled=false;scene.add(confetti);
function burstConfetti(n){let c=0;for(const d of confData){if(c>=n)break;d.p.set((Math.random()-.5)*30,13+Math.random()*4,(Math.random()-.5)*14-1);d.v.set((Math.random()-.5)*2,-1.2-Math.random()*1.5,(Math.random()-.5)*2);d.r.set(Math.random()*6,Math.random()*6,Math.random()*6);d.w.set((Math.random()-.5)*8,(Math.random()-.5)*8,(Math.random()-.5)*8);d.alive=true;c++;}}
const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=new THREE.Vector3(1,1,1);

/* ===================================================================
   SIMULATION
   =================================================================== */
let curY=FIRST, playing=!reduceMotion, speed=2, cinema=true;
let seasonT=0, seasonDone=false, holdT=0, firstKick=-1;
const queue={arrivals:[],spawnIdx:0,spawnT:0};

function snapTo(y){
  // clear transient
  pods.forEach(p=>scene.remove(p.g));pods.length=0;pressState.busy=false;pressState.pod=null;ram.position.y=RAM_UP;
  queue.arrivals=[];
  const slots=slotsFor(y);
  actors.forEach(a=>{if(!slots.has(a.pl.id))removeFromScene(a);});
  slots.forEach((s,id)=>{const a=getActor(P[id]);addToScene(a);a.fig.position.set(s.x,PY,s.z);a.fig.scale.setScalar(1);a.scale=a.targetScale=1;a.path=[];a.state="squad";a.yaw=a.targetYaw=0;a.fig.rotation.y=0;a.belt=false;a.onArrive=null;a.delay=0;a.celebrate=0;a.labelH=s.lab;a.sprite.position.y=s.lab;a.fig.userData.band.visible=s.cap;setVariant(a,"idle");});
}

function startSeason(y,animate){
  if(!EMBED){try{history.replaceState(null,"","#"+y);}catch(e){}}
  if(animate&&!seasonDone&&curY!==y&&curY>=FIRST){snapTo(curY);}
  firstKick=-1;curY=y;seasonT=0;seasonDone=false;holdT=0;
  const s=SN[y];
  const ins=arrivalsAt(y),outs=departuresAt(y);
  updateHUD(y,ins,outs);
  setManager(y,animate);
  if(!animate){boardFlip={t:1,pending:null};trophyAnims.length=0;snapTo(y);setTrophies(y,false);drawBoard(y,{sq:squadAt(y).length,in:ins.length,out:outs.length});return;}
  SND.flip();boardFlip={t:0,pending:()=>drawBoard(y,{sq:squadAt(y).length,in:ins.length,out:outs.length})};
  const slots=slotsFor(y);
  // departures
  outs.forEach((pl,i)=>{
    const a=getActor(pl);if(!a.fig.parent){addToScene(a);}
    setVariant(a,"out");a.fig.userData.band.visible=false;
    a.state="leaving";a.delay=i*.22;
    const p=a.fig.position;const zLane=(i%2?.3:-.3);
    a.path=[new THREE.Vector3(Math.max(p.x+1.5,PW/2-1),PY,p.z*.4+zLane),new THREE.Vector3(DESP_X0-2.4,PY,zLane*.6),new THREE.Vector3(DESP_X0+.4,BELT_Y,0)];
    a.speed=5.4+Math.random()*.5;
    a.onArrive=()=>{a.belt=true;a.state="belt";a.targetYaw=Math.PI/2;SND.whoosh();};
  });
  // squad reshuffle
  slots.forEach((s,id)=>{
    const pl=P[id];
    if(ins.includes(pl))return;
    const a=getActor(pl);addToScene(a);setVariant(a,"idle");
    a.fig.userData.band.visible=s.cap;a.labelH=s.lab;
    const dx=a.fig.position.x-s.x,dz=a.fig.position.z-s.z;
    if(dx*dx+dz*dz>1e-6){a.delay=.4+Math.random()*.6;a.path=[new THREE.Vector3(s.x,PY,s.z)];a.speed=2.6;a.state="shuffle";a.onArrive=()=>{a.state="squad";a.targetYaw=0;};}
  });
  // arrivals queue
  queue.arrivals=ins.map(pl=>({pl,slot:slots.get(pl.id)}));queue.spawnIdx=0;queue.spawnT=outs.length?1.0:0.3;
  setTrophies(y,true);
  if(s.h.length){burstConfetti(s.f===1?520:220);SND.cheer(s.f===1?1:.6);}else if(s.cs){burstConfetti(90);}
}

function stepSeason(dt){
  seasonT+=dt;
  // spawn pods
  const stillWalking=[...actors.values()].some(a=>a.fig.parent&&a.state==="leaving");
  if(queue.spawnIdx<queue.arrivals.length&&!stillWalking){
    queue.spawnT-=dt;
    if(queue.spawnT<=0){const q=queue.arrivals[queue.spawnIdx++];const g=makePod(q.pl);pods.push({g,q,stage:"belt"});queue.spawnT=.8;}
  }
  // pods move
  const BELT_V=7.5;
  for(let i=pods.length-1;i>=0;i--){
    const pd=pods[i];
    if(pd.stage==="belt"){
      const ahead=pods.filter(o=>o!==pd&&o.stage!=="done"&&o.g.position.x>pd.g.position.x);
      const limit=ahead.length?Math.min(...ahead.map(o=>o.g.position.x))-1.6:PRESS_X;
      pd.g.position.x=Math.min(pd.g.position.x+BELT_V*dt,limit,PRESS_X);
      if(pd.g.position.x>=PRESS_X-.01&&!pressState.busy){pressState.busy=true;pressState.t=0;pressState.pod=pd;pd.stage="press";}
    }
  }
  // press cycle
  if(pressState.busy){
    pressState.t+=dt;const t=pressState.t;const pd=pressState.pod;
    if(t<.22){ram.position.y=THREE.MathUtils.lerp(RAM_UP,RAM_DOWN,easeIn(t/.22));}
    else if(t<.5){ram.position.y=RAM_DOWN;if(!pd.stamped){pd.stamped=true;SND.stamp();flash.intensity=6;steam(PRESS_X,BELT_Y+1.2,0,9);shake=.18;
        // reveal player
        scene.remove(pd.g);pd.stage="done";
        const a=getActor(pd.q.pl);addToScene(a);setVariant(a,"nw");a.fig.position.set(PRESS_X,BELT_Y,0);a.scale=.05;a.targetScale=1;a.fig.scale.setScalar(.05);
        a.fig.userData.band.visible=pd.q.slot.cap;a.labelH=pd.q.slot.lab;a.yaw=Math.PI/2;a.targetYaw=Math.PI/2;
        a.state="entering";a.delay=.35;a.speed=4.8;
        const s=pd.q.slot;
        a.path=[new THREE.Vector3(INTAKE_X1+.3,BELT_Y,0),new THREE.Vector3(INTAKE_X1+2.4,PY,0),new THREE.Vector3(-PW/2+1,PY,s.z*.5),new THREE.Vector3(s.x,PY,s.z)];
        a.onArrive=()=>{a.state="squad";a.targetYaw=0;a.celebrate=1.2;};
      }}
    else if(t<1.0){ram.position.y=THREE.MathUtils.lerp(RAM_DOWN,RAM_UP,easeOut((t-.5)/.5));}
    else{ram.position.y=RAM_UP;pressState.busy=false;const idx=pods.indexOf(pd);if(idx>=0)pods.splice(idx,1);}
  }
  // finished?
  const moving=[...actors.values()].some(a=>a.fig.parent&&(a.path.length||a.state==="belt"||a.state==="leaving"||a.state==="entering"));
  const done=queue.spawnIdx>=queue.arrivals.length&&pods.length===0&&!pressState.busy&&!moving;
  if(done&&!seasonDone){seasonDone=true;holdT=0;
    if(honoursOf(SN[curY]).length){actors.forEach(a=>{if(a.fig.parent&&a.state==="squad"){a.celebrate=1.2+Math.random()*.3;a.delay=Math.random()*.35;}});}
    actors.forEach(a=>{if(a.state==="squad"&&a.variant==="nw"){/* keep red tag through hold */}});}
  if(seasonDone){holdT+=dt;}
}
const easeIn=t=>t*t*t, easeOut=t=>1-Math.pow(1-t,3), easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
let shake=0;

function updateActors(dt,time){
  actors.forEach(a=>{
    if(!a.fig.parent)return;
    const f=a.fig;const u=f.userData;
    // scale
    a.scale+= (a.targetScale-a.scale)*Math.min(1,dt*7);f.scale.setScalar(a.scale);
    let moving=false;
    if(a.delay>0){a.delay-=dt;}
    else if(a.belt){f.position.x+=OUT_V*dt;moving=false;
      if(f.position.x>DESP_X1-1.2){a.targetScale=0;if(a.scale<.06){removeFromScene(a);}}
    }
    else if(a.path.length){
      const tgt=a.path[0];const d=new THREE.Vector3().subVectors(tgt,f.position);const dist=Math.hypot(d.x,d.z);
      const step=a.speed*dt;
      if(dist<=step||dist<1e-3){f.position.copy(tgt);a.path.shift();if(!a.path.length&&a.onArrive){const cb=a.onArrive;a.onArrive=null;cb();}}
      else{const k=step/dist;f.position.x+=d.x*k;f.position.z+=d.z*k;f.position.y+= (tgt.y-f.position.y)*Math.min(1,k*1.0);a.targetYaw=Math.atan2(d.x,d.z);moving=true;a.walk+=step*3.1;}
    }
    // yaw smoothing
    let dy=a.targetYaw-a.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));a.yaw+=dy*Math.min(1,dt*9);f.rotation.y=a.yaw;
    // limbs
    const sw=moving?Math.sin(a.walk)*.75:0;
    u.legs[0].rotation.x+= (sw-u.legs[0].rotation.x)*Math.min(1,dt*14);
    u.legs[1].rotation.x+= (-sw-u.legs[1].rotation.x)*Math.min(1,dt*14);
    let armA=moving?-sw*.8:Math.sin(time*1.2+a.phase)*.04;
    let lift=0;
    if(a.celebrate>0){a.celebrate-=dt;lift=Math.max(0,Math.sin((1.2-a.celebrate)/1.2*Math.PI))*.35;armA=0;u.arms[0].rotation.z=THREE.MathUtils.lerp(u.arms[0].rotation.z,-2.6,dt*10);u.arms[1].rotation.z=THREE.MathUtils.lerp(u.arms[1].rotation.z,2.6,dt*10);}
    else{u.arms[0].rotation.z+=(-.1-u.arms[0].rotation.z)*Math.min(1,dt*8);u.arms[1].rotation.z+=(.1-u.arms[1].rotation.z)*Math.min(1,dt*8);}
    u.arms[0].rotation.x+=(armA-u.arms[0].rotation.x)*Math.min(1,dt*14);
    u.arms[1].rotation.x+=(-armA-u.arms[1].rotation.x)*Math.min(1,dt*14);
    u.body.position.y=(moving?Math.abs(Math.sin(a.walk))*.06:Math.sin(time*1.6+a.phase)*.012)+lift;
    u.legs.forEach(l=>l.position.y=.64+lift);
    // idle head turns
    if(!moving&&a.state==="squad"){a.idleT-=dt;if(a.idleT<0){a.idleT=3+Math.random()*7;a.look=(Math.random()-.5)*1.1;}u.head.rotation.y+=((a.look||0)-u.head.rotation.y)*Math.min(1,dt*3);}
    else u.head.rotation.y*=.9;
    // label height
    a.sprite.position.y+= (a.labelH-a.sprite.position.y)*Math.min(1,dt*6);
  });
}

/* ===================================================================
   HUD
   =================================================================== */
const $=id=>document.getElementById(id);
const timeline=$("timeline");
SEASONS.forEach(s=>{
  const b=document.createElement("button");b.className="tick"+(s.f===1?" title":(s.h.length?" hon":""))+((s.y-2)%5===0?" lab":"");
  b.setAttribute("aria-label",seasonLabel(s.y)+(honoursOf(s).length?", won "+honoursOf(s).join(" and "):""));
  const ht=s.f===1?100:s.h.length?72:Math.max(28,62-s.f*3)||40;
  b.innerHTML=`<span class="col"><span class="bar" style="height:${s.f===0?46:ht}%"></span>${s.cs?'<span class="sh"></span>':""}</span><span class="yr">${shortSeason(s.y)}</span>`;
  b.addEventListener("click",()=>{jump(s.y);});
  timeline.appendChild(b);s.tick=b;
});
function updateHUD(y,ins,outs){
  const s=SN[y];
  const b=String((y+1)%100).padStart(2,"0");
  $("seasonTxt").innerHTML=`${y}<small>/</small>${b}`;
  $("runNo").textContent=String(s.i+1).padStart(2,"0")+" / 35";
  $("posTxt").textContent=s.f?ordinal(s.f)+(s.f===1?" · Champions":""):"In progress";
  $("mgrTxt").textContent=s.m;$("capTxt").textContent=s.c;
  $("honTxt").innerHTML=(s.cs?`<span class="fchip">Community Shield</span>`:"")+s.h.map(h=>`<span class="fchip gold">${h}</span>`).join("")+(s.l||[]).map(h=>`<span class="fchip lost">${h} runners-up</span>`).join("");
  $("noteTxt").textContent=s.n;
  const docket=(list,el,kind)=>{
    if(!list.length){el.innerHTML=`<li class="empty">${kind==="in"?"No first-team arrivals":"Nobody leaves the squad"}</li>`;return;}
    el.innerHTML=list.map((pl,i)=>{
      const si=kind==="in"?stintAt(pl,y):stintAt(pl,y-1);
      const via=kind==="in"?(pl.from[si]||""):(pl.to[si]||"");
      const ret=kind==="in"&&si>0;
      const code=(kind==="in"?"IN":"OUT")+"-"+String(y).slice(2)+"-"+String(i+1).padStart(2,"0");
      const served=kind==="out"?seasonsServed(pl,y-1):0;
      const dest=/^(Retired|Released)$/.test(via)?via.toLowerCase():(via?"to "+via:"left");
      const cleanIn=v=>v.replace(/ \(.*\)$/,m=>/loan/.test(m)?" (loan)":"");
      const viaTxt=kind==="in"?(via===A?"academy":(via?"from "+cleanIn(via):"")):(dest.replace(/ \(loan, .*\)/," (loan)")+(served?` · ${served} PL season${served>1?"s":""}`:""));
      const compact=list.length>4;
      return `<li class="${ret?"ret":""}" style="animation-delay:${(kind==="in"?.9:0)+i*.08}s" data-id="${pl.id}" tabindex="0" title="${pl.name} — ${viaTxt}">${compact?"":`<span class="code">${code}</span>`}<span class="nm">${pl.name}</span>${pl.legend?'<span class="star">★</span>':''}${list.length>6?"":`<span class="via">${viaTxt}</span>`}</li>`;
    }).join("");
  };
  docket(ins,$("inList"),"in");docket(outs,$("outList"),"out");
  fitLane($("inList"));fitLane($("outList"));
  $("inCount").textContent=ins.length;$("outCount").textContent=outs.length;
  const sq=squadAt(y);$("sqN").textContent=sq.length;
  let best=null,bn=0,bs=0;sq.forEach(pl=>{const n=streakTo(pl,y),pn=Math.min(n,y-FIRST+1);const score=n*10+(pl.legend?1:0);if(score>bs){bs=score;bn=pn;best=pl;}});
  $("longTxt").textContent=best?`${best.label} · ${bn} PL season${bn>1?"s":""}`:"—";
  SEASONS.forEach(t=>{t.tick.classList.toggle("cur",t.y===y);t.tick.classList.toggle("past",t.y<y);t.tick.classList.toggle("near",t.y!==y&&Math.abs(t.y-y)<=1&&false);});
  SEASONS.forEach(t=>{const near=t.tick.classList.contains("lab")&&t.y!==y&&Math.abs(t.y-y)<=2;t.tick.classList.toggle("hidelab",near);t.tick.querySelector(".yr").style.visibility=near?"hidden":"";});
  $("prog").style.width=((s.i)/(SEASONS.length-1)*100)+"%";
  // docket names clickable
  document.querySelectorAll(".lane li[data-id]").forEach(li=>{const go=()=>{const r=li.getBoundingClientRect();showCard(P[+li.dataset.id],{x:r.left,y:r.top-150});};li.addEventListener("click",go);li.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();go();}});});
}

function fitLane(ol){
  const lane=ol.closest(".lane");
  ol.querySelectorAll("li.more").forEach(m=>m.remove());
  const items=[...ol.querySelectorAll("li[data-id]")];
  items.forEach(li=>li.hidden=false);
  if(items.length<2)return;
  const addChip=(txt,fn)=>{const m=document.createElement("li");m.className="more";m.tabIndex=0;m.textContent=txt;m.onclick=fn;m.onkeydown=e=>{if(e.key==="Enter")fn();};ol.appendChild(m);return m;};
  if(lane.classList.contains("open")){addChip("Show less",()=>{lane.classList.remove("open");fitLane(ol);});return;}
  const maxRows=innerWidth>860?2:1;
  // rows are measured relative to the first chip, because the strip is bottom-anchored and moves as rows disappear
  const rows=els=>new Set(els.filter(e=>!e.hidden).map(e=>e.offsetTop)).size;
  if(rows(items)<=maxRows)return;
  const first=items[0].offsetTop;const rowH=items[0].offsetHeight+6;
  let n=0;items.forEach(li=>{if(li.offsetTop-first>=(maxRows-.5)*rowH){li.hidden=true;n++;}});
  const more=addChip("",()=>{lane.classList.add("open");fitLane(ol);});
  const vis=items.filter(li=>!li.hidden);
  const upd=()=>{more.textContent="+"+n+" more";};upd();
  while(rows([...vis,more])>maxRows&&vis.length>1){vis.pop().hidden=true;n++;upd();}
}
addEventListener("resize",()=>{fitLane($("inList"));fitLane($("outList"));});
function jump(y){y=Math.max(FIRST,Math.min(LAST,y));hideCard();if(y===curY+1){startSeason(y,true);}else{startSeason(y,false);}}
$("prevBtn").onclick=()=>jump(curY-1);
$("nightBtn").onclick=()=>{const v=nightGoal===0;setNight(v);try{localStorage.setItem("nn-factory-night",v?"1":"0");}catch(e){}};
// Night follows the site's own light/dark theme, unless the visitor has
// pressed the Night/Day button on this page (remembered in nn-factory-night).
{let pref=null;try{pref=localStorage.getItem("nn-factory-night");}catch(e){}
 setNight(pref?pref==="1":document.documentElement.dataset.theme==="dark");updateNight(10); // start in the right light, no fade on load
 new MutationObserver(()=>setNight(document.documentElement.dataset.theme==="dark")).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});}
$("nextBtn").onclick=()=>{if(curY<LAST)startSeason(curY+1,true);};
function setPlaying(v){playing=v;$("playLbl").textContent=v?"Pause":"Play";$("playBtn").setAttribute("aria-label",v?"Pause":"Play");$("playIco").innerHTML=v?'<path d="M3 2h4v12H3zM9 2h4v12H9z"/>':'<path d="M3 2v12l11-6z"/>';
  if(v&&curY===LAST&&seasonDone){startSeason(FIRST,false);snapTo(1991);setTrophies(1991,false);firstKick=.6;}}
$("playBtn").onclick=()=>setPlaying(!playing);
document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{speed=+b.dataset.sp;document.querySelectorAll(".seg button").forEach(o=>o.setAttribute("aria-pressed",o===b?"true":"false"));});
// Camera modes: "auto" follows the action; a preset flies to a spot and then hands over to the mouse; "free" is pure orbit.
const VIEWS={
  intake:{t:[-27,1.4,0],d:17,p:1.08,a:.42},
  squad:{t:[0,2.4,-1],d:28,p:1.12,a:0},
  despatch:{t:[25.5,1.4,0],d:17,p:1.08,a:-.42},
};
let camMode="auto",fly=null;
function markView(v){renderer.domElement.style.touchAction=camMode==="auto"?"pan-y":"none";document.querySelectorAll(".seg.view button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===v?"true":"false"));}
function setCinema(v){ if(v){camMode="auto";fly=null;controls.enabled=false;markView("auto");} else {camMode="free";fly=null;controls.enabled=true;markView(null);} cinema=v; }
function viewPose(name){
  const v=VIEWS[name];const portrait=camera.aspect<1;const d=v.d*(portrait?1.7:1);
  const t=new THREE.Vector3(...v.t);
  const off=new THREE.Vector3(Math.sin(v.a)*Math.sin(v.p),Math.cos(v.p),Math.cos(v.a)*Math.sin(v.p)).multiplyScalar(d);
  return {t,pos:t.clone().add(off)};
}
function flyTo(t,pos,label){cinema=false;camMode="fly";controls.enabled=false;fly={t:t.clone(),pos:pos.clone(),label};markView(label);}
function goView(name){ if(name==="auto"){setCinema(true);return;} const p=viewPose(name);flyTo(p.t,p.pos,name);}
document.querySelectorAll(".seg.view button").forEach(b=>b.onclick=()=>goView(b.dataset.v));
// Take over from Auto the moment the mouse is used, so the first drag or scroll is never lost.
function takeOver(){ if(camMode!=="free"){ cinema=false;camMode="free";fly=null;controls.enabled=true;markView(null);} }
const cvs=renderer.domElement;
let downAt=null;
cvs.addEventListener("pointerdown",e=>{downAt={x:e.clientX,y:e.clientY,touch:e.pointerType==="touch"};dswEl.focus({preventScroll:true});if(camMode==="fly"){fly=null;camMode="free";controls.enabled=true;markView(null);} if(camMode==="auto"&&e.pointerType!=="touch"){controls.enabled=true;}},{capture:true});
cvs.addEventListener("pointermove",e=>{if(!downAt||!e.buttons||camMode!=="auto")return;const dx=Math.abs(e.clientX-downAt.x),dy=Math.abs(e.clientY-downAt.y);
  // on a phone, a vertical swipe is the visitor scrolling the page, not grabbing the camera
  if(downAt.touch?(dx>12&&dx>dy*1.3):Math.hypot(dx,dy)>4)takeOver();});
addEventListener("pointerup",e=>{if(e.target!==cvs){downAt=null;if(camMode==="auto")controls.enabled=false;}});
cvs.addEventListener("pointerup",e=>{if(downAt&&Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)<6){pick(e);} if(camMode==="auto")controls.enabled=false; downAt=null;});
// Scroll: zoom toward whatever is under the cursor.
const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-1.0);
function groundAt(cx,cy){const r=cvs.getBoundingClientRect();ndc.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);const hit=new THREE.Vector3();return ray.ray.intersectPlane(groundPlane,hit)?hit:null;}
cvs.addEventListener("wheel",e=>{
  // Auto camera: let the page scroll past. Once the visitor has grabbed the camera (or pinches), the wheel zooms.
  if(camMode==="auto"&&!e.ctrlKey&&!e.metaKey)return;
  takeOver();
  if(e.deltaY<0){const hit=groundAt(e.clientX,e.clientY);if(hit){hit.x=THREE.MathUtils.clamp(hit.x,-40,40);hit.z=THREE.MathUtils.clamp(hit.z,-12,12);const shift=hit.sub(controls.target).multiplyScalar(.18);shift.y=0;controls.target.add(shift);camera.position.add(shift);}}
},{capture:true,passive:true});
// Double-click: fly in close to that spot.
cvs.addEventListener("dblclick",e=>{const hit=groundAt(e.clientX,e.clientY);if(!hit)return;hit.y=1.4;const dir=camera.position.clone().sub(controls.target).normalize();flyTo(hit,hit.clone().add(dir.multiplyScalar(12)),null);});

const dswEl=document.getElementById("dsw");
// the stage fills the screen below the sticky nav, whatever height the nav wraps to
function syncNav(){const n=document.querySelector(".nav");dswEl.style.setProperty("--navh",(n?Math.round(n.getBoundingClientRect().height):48)+"px");}
syncNav();addEventListener("resize",syncNav);
addEventListener("keydown",e=>{if(!dswEl.contains(document.activeElement))return;if(e.target.closest("button")&&(e.key===" "||e.key==="Enter"))return;if(e.key===" "){e.preventDefault();setPlaying(!playing);}else if(e.key==="ArrowRight"){$("nextBtn").click();}else if(e.key==="ArrowLeft"){jump(curY-1);}else if(e.key==="Escape")hideCard();else if(e.key==="1")goView("auto");else if(e.key==="2")goView("intake");else if(e.key==="3")goView("squad");else if(e.key==="4")goView("despatch");else if(e.key==="n"||e.key==="N")setNight(nightGoal===0);});

function pick(e){
  const r=renderer.domElement.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  ray.setFromCamera(ndc,camera);
  // sprites first (labels are easier targets)
  const sprites=[...actors.values()].filter(a=>a.fig.parent).map(a=>a.sprite);
  let hit=ray.intersectObjects(sprites,false)[0];
  let pl=hit?[...actors.values()].find(a=>a.sprite===hit.object).pl:null;
  if(!pl){const h=ray.intersectObjects(pickables,false)[0];if(h)pl=h.object.userData.pl;}
  if(pl){showCard(pl,{x:e.clientX,y:e.clientY});return;}
  const ah=ray.intersectObjects(adPickables,false)[0];
  if(ah)showAdCard({x:e.clientX,y:e.clientY});else hideCard();
}
function showCard(pl,at){
  const c=$("pcard");const y=curY;
  const stints=pl.stints.map(([a,b])=>`${a<FIRST?"Before 1992":seasonLabel(a)} – ${b===NOW?"present":seasonLabel(b)}`).join("<br>");
  const total=pl.stints.reduce((n,[a,b])=>n+(endOf(b)>LAST?LAST:b)-Math.max(a,FIRST)+1,0);
  const fromTxt=pl.from.map(f=>f===A?"Academy":f).join(" · ");
  const toTxt=pl.to.filter(Boolean).join(" · ")||(pl.stints.some(s=>s[1]===NOW)?"Still here":"—");
  const sp=SEASONS.map(s=>`<span class="${stintAt(pl,s.y)>=0?"on":""}${s.y===y?" now":""}"></span>`).join("");
  c.className="pcard"+(pl.legend?" leg":"");
  c.innerHTML=`<div class="head"><div><h3>${pl.name}</h3><span class="ps">${POSNAME[pl.pos].toUpperCase()}${pl.legend?" · CLUB ICON ★":""}</span></div><button class="fclose" aria-label="Close">×</button></div>
  <dl><dt>At club</dt><dd>${stints}</dd><dt>PL seasons</dt><dd>${total}</dd><dt>Arrived</dt><dd>${fromTxt}</dd><dt>Left for</dt><dd>${toTxt}</dd></dl>
  <div class="spark">${sp}</div><div class="axis"><span>92/93</span><span>09/10</span><span>26/27</span></div>`;
  c.hidden=false;c.querySelector(".fclose").onclick=hideCard;
  const W=innerWidth,H=innerHeight;const cw=250,ch=c.offsetHeight||260;
  let x=at?at.x+16:W/2-cw/2,yy=at?at.y-ch/2:H/2-ch/2;
  if(x+cw>W-16)x=(at?at.x-cw-16:W-cw-16);x=Math.max(16,x);yy=Math.max(16,Math.min(H-ch-16,yy));
  c.style.left=x+"px";c.style.top=yy+"px";
}
function hideCard(){$("pcard").hidden=true;}
function showAdCard(at){
  const c=$("pcard");c.className="pcard ad";
  c.innerHTML=SHOW_SPONSOR_SLOTS
   ?`<div class="head"><div><h3>Advertise here</h3><span class="ps">SPONSOR SLOTS · DIAL SQUARE WORKS</span></div><button class="fclose" aria-label="Close">×</button></div>
  <p>Put your brand on the factory floor, in front of Arsenal fans watching all 35 seasons.</p>
  <ul><li>Pitch-side LED boards</li><li>Factory wall billboards</li><li>Season presenting partner</li></ul>
  <a class="cta" href="${ADS.url}">Get in touch</a>`
   :`<div class="head"><div><h3>The Non-Negotiables</h3><span class="ps">THE REST OF THE SITE</span></div><button class="fclose" aria-label="Close">×</button></div>
  <p>The boards are ours. The rest of the site is fixtures in your timezone, away-day logistics and a column after every match.</p>
  <ul><li>The season timetable</li><li>The ticket desk, official channels only</li><li>The programme column</li></ul>
  <a class="cta" href="index.html">Back to the hub</a>`;
  c.hidden=false;c.querySelector(".fclose").onclick=hideCard;
  const W=innerWidth,H=innerHeight,cw=250,ch=c.offsetHeight||300;
  let x=at.x+16,y=at.y-ch/2;if(x+cw>W-16)x=at.x-cw-16;x=Math.max(16,x);y=Math.max(16,Math.min(H-ch-16,y));c.style.left=x+"px";c.style.top=y+"px";
}


/* ===================================================================
   CAMERA
   =================================================================== */
const camFocus=new THREE.Vector3(0,2.5,-1);
const camGoal=new THREE.Vector3(0,2.5,-1);
function cinemaGoal(time){
  const outs=[...actors.values()].some(a=>a.fig.parent&&(a.state==="leaving"||(a.state==="belt"&&a.fig.position.x<DESP_X1-1)));
  const ins=pods.some(p=>p.g.position.x>INTAKE_X0+11)||pressState.busy||[...actors.values()].some(a=>a.fig.parent&&a.state==="entering"&&a.fig.position.x<-9);
  let fx=0;
  if(!seasonDone){ if(ins) fx=-15; else if(outs) fx=18; else if(pods.length||queue.spawnIdx<queue.arrivals.length) fx=-15; else fx=0; }
  camGoal.set(fx,3.4,-1.5);
}
function fxWide(){return Math.abs(camFocus.x)>4;}
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=camera.aspect<1?62:38;camera.updateProjectionMatrix();
}
addEventListener("resize",resize);resize();

/* ===================================================================
   BOOT
   =================================================================== */
drawCabPlaque(0);
snapTo(1991);
startSeason(FIRST,false);snapTo(1991);setTrophies(1991,false);
drawBoard(FIRST,{sq:squadAt(FIRST).length,in:arrivalsAt(FIRST).length,out:0});
firstKick=playing?1.2:-1;
{const m=EMBED?null:START_HASH.match(/^#(\d{4})$/);const y=m?+m[1]:0;
 if(y>=FIRST&&y<=LAST){startSeason(y,false);firstKick=-1;}}
setPlaying(playing);
function shareSeason(){
  const url=new URL("factory.html#"+curY,location.href).href;
  const title=`Arsenal ${seasonLabel(curY)} · Dial Square Works`;
  const b=$("shareBtn"),lab=b.querySelector("span");
  const done=t=>{lab.textContent=t;b.setAttribute("data-done","");setTimeout(()=>{lab.textContent="Share";b.removeAttribute("data-done");},1800);};
  if(navigator.share){navigator.share({title,url}).catch(()=>{});return;}
  if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>done("Link copied"),()=>done("Copy the address bar"));}
  else done("Copy the address bar");
}
$("shareBtn").onclick=shareSeason;

const clockObj=new THREE.Clock();let time=0,renderedOnce=false;
let onScreen=false;
new IntersectionObserver(es=>{onScreen=es[0].isIntersecting;onScreen?SND.resume():SND.pause();},{threshold:.2}).observe(dswEl);
document.addEventListener("visibilitychange",()=>{document.hidden?SND.pause():onScreen&&SND.resume();});
$("soundBtn").onclick=()=>{const v=SND.toggle();const b=$("soundBtn");b.setAttribute("aria-pressed",v?"true":"false");b.querySelector("span").textContent=v?"Sound on":"Sound";};
function frame(){
  requestAnimationFrame(frame);
  if(!onScreen&&!document.hidden&&renderedOnce){clockObj.getDelta();return;}
  renderedOnce=true;
  tick(Math.min(clockObj.getDelta(),.05));
  renderer.render(scene,camera);
}
function tick(rdt){
  time+=rdt;
  const dt=rdt*speed;
  if(firstKick>0){firstKick-=rdt;if(firstKick<=0){startSeason(FIRST,true);}}
  else{
    stepSeason(dt);
    if(playing&&seasonDone&&holdT>2.2/Math.max(1,speed*.6)){ if(curY<LAST)startSeason(curY+1,true); else setPlaying(false);}
  }
  updateActors(dt,time);
  // manager swap + idle sway
  if(mgrT<1){mgrT=Math.min(1,mgrT+rdt*1.4);const e=easeOut(mgrT);if(mgr)mgr.scale.setScalar(Math.max(.01,e));if(mgrOld){mgrOld.scale.setScalar(Math.max(.01,1-e));if(mgrT>=1){scene.remove(mgrOld);mgrOld=null;}}}
  if(mgr){mgr.userData.body.rotation.y=Math.sin(time*.5)*.25;mgr.userData.arms.forEach((a,i)=>a.rotation.x=-.25+Math.sin(time*.8+i)*.05);}
  updateAds(rdt);updateNight(rdt);SND.setIntensity(seasonDone&&holdT>.4||!playing?0:1);
  // belts scroll
  beltTex.offset.x-=dt*7.5/2.2;beltTex2.offset.x-=dt*OUT_V/2.2;
  // press flash decay
  flash.intensity*=Math.pow(.02,rdt);
  // board flip
  if(boardFlip.t<1){boardFlip.t=Math.min(1,boardFlip.t+rdt*2.4);const t=boardFlip.t;if(t>=.5&&boardFlip.pending){boardFlip.pending();boardFlip.pending=null;}boardGroup.rotation.x=Math.sin(t*Math.PI)*-.9*(t<.5?1:1);boardGroup.scale.y=1-Math.sin(t*Math.PI)*.85;}
  else{boardGroup.rotation.x=0;boardGroup.scale.y=1;}
  // clock: one revolution of the minute hand per season
  const sp=seasonDone?1:Math.min(1,seasonT/6);
  clock.userData.mh.rotation.z=-(sp*Math.PI*2);clock.userData.hh.rotation.z=-((SN[curY].i+sp)/35*Math.PI*2);
  // gears
  gears.forEach(g=>g.g.rotation.z+=dt*.25*g.sp*(playing?1:.15));
  // bunting & strip curtains
  bunting.forEach(b=>{b.f.rotation.x=Math.sin(time*1.4+b.ph)*.18;});
  [inPortal,outPortal].forEach(pt=>pt.strips.forEach((s,i)=>{s.rotation.z=Math.sin(time*2+i)*.04;}));
  outPortal.strips.forEach((s,i)=>{const near=[...actors.values()].some(a=>a.belt&&a.fig.position.x>DESP_X1-3.5);s.rotation.z+=near?Math.sin(time*9+i)*.25:0;});
  // puffs
  for(let i=puffs.length-1;i>=0;i--){const p=puffs[i];p.life+=rdt;p.s.position.addScaledVector(p.v,rdt);p.v.multiplyScalar(.97);const k=p.life/p.max;p.s.material.opacity=.9*(1-k);const sc=(.6+k*2.2);p.s.scale.set(sc,sc,1);if(k>=1){scene.remove(p.s);p.s.material.dispose();puffs.splice(i,1);}}
  // confetti
  let anyC=false;
  confData.forEach((d,i)=>{if(d.alive){anyC=true;d.p.addScaledVector(d.v,rdt);d.v.x+=Math.sin(time*2+i)*rdt*.6;d.r.x+=d.w.x*rdt;d.r.y+=d.w.y*rdt;d.r.z+=d.w.z*rdt;if(d.p.y<0.05){d.p.y=0.05;d.v.set(0,0,0);d.w.set(0,0,0);d.ttl=(d.ttl||0)+rdt;if(d.ttl>4){d.alive=false;d.ttl=0;d.p.y=-50;}}}
    _q.setFromEuler(d.r);_m4.compose(d.p,_q,_s);confetti.setMatrixAt(i,_m4);});
  confetti.instanceMatrix.needsUpdate=true;
  // trophies dropping
  for(let i=trophyAnims.length-1;i>=0;i--){const ta=trophyAnims[i];ta.time+=rdt;const t=Math.min(1,ta.time/1.1);if(!ta.t.obj){trophyAnims.splice(i,1);continue;}const b=bounce(t);ta.t.obj.position.y=ta.t.pos.y+5*(1-b);ta.t.obj.rotation.y=(1-t)*6;if(t>=1)trophyAnims.splice(i,1);}
  // camera
  if(cinema){
    cinemaGoal(time);
    camFocus.lerp(camGoal,1-Math.pow(.25,rdt));
    const aspect=camera.aspect;const narrow=Math.min(1,aspect/1.55);
    const portrait=aspect<1;const wantFov=portrait?62:38;if(Math.abs(camera.fov-wantFov)>.1){camera.fov=wantFov;camera.updateProjectionMatrix();}
    const dist=portrait?(fxWide()?40:37):(fxWide()?35:32)/Math.max(.42,narrow);
    const sway=reduceMotion?0:Math.sin(time*.07)*.22;
    const pol=portrait?1.02:1.13;
    const off=new THREE.Vector3(Math.sin(sway)*Math.sin(pol),Math.cos(pol),Math.cos(sway)*Math.sin(pol)).multiplyScalar(dist);
    const tgt=camFocus.clone();if(portrait){tgt.y+=.4;tgt.z+=1.5;tgt.x*=.75;}
    camera.position.lerp(tgt.clone().add(off),1-Math.pow(.2,rdt));
    controls.target.copy(tgt);camera.lookAt(tgt);
  }else if(camMode==="fly"&&fly){
    const k=1-Math.pow(.04,rdt);
    camera.position.lerp(fly.pos,k);controls.target.lerp(fly.t,k);camera.lookAt(controls.target);
    if(camera.position.distanceTo(fly.pos)<.08&&controls.target.distanceTo(fly.t)<.05){camMode="free";controls.enabled=true;const lab=fly.label;fly=null;markView(lab);}
  }else{
    controls.update();
    // keep the camera inside the building and the target on the factory floor
    controls.target.x=THREE.MathUtils.clamp(controls.target.x,-42,42);controls.target.z=THREE.MathUtils.clamp(controls.target.z,-13,14);controls.target.y=THREE.MathUtils.clamp(controls.target.y,.3,12);
    camera.position.z=Math.max(camera.position.z,-14.5);camera.position.y=Math.max(camera.position.y,.6);
  }
  if(shake>0){shake-=rdt;camera.position.y+=Math.sin(time*80)*shake*.12;}
}
function bounce(t){const n1=7.5625,d1=2.75;if(t<1/d1)return n1*t*t;if(t<2/d1)return n1*(t-=1.5/d1)*t+.75;if(t<2.5/d1)return n1*(t-=2.25/d1)*t+.9375;return n1*(t-=2.625/d1)*t+.984375;}
frame();
if(/[?&]debug\b/.test(location.search))window.__debug={who(){const m=slotsFor(curY),o=[];m.forEach((sl,id)=>{const a=actors.get(id);if(!a||!a.fig.parent||Math.hypot(a.fig.position.x-sl.x,a.fig.position.z-sl.z)>.05)o.push([P[id].name,a&&a.state,a&&a.path.length,a&&a.fig.position.x.toFixed(2),a&&a.fig.position.z.toFixed(2),sl.x.toFixed(2),sl.z.toFixed(2),a&&a.delay]);});return o;},slots(){const m=slotsFor(curY);let bad=0;m.forEach((s,id)=>{const a=actors.get(id);if(!a||!a.fig.parent||Math.hypot(a.fig.position.x-s.x,a.fig.position.z-s.z)>.05)bad++;});return bad;},boardPending(){return !!boardFlip.pending},count(){return [...actors.values()].filter(a=>a.fig.parent).length},squad(y){return squadAt(y).length},get done(){return seasonDone},get playing(){return playing},advance(sec){for(let t=0;t<sec;t+=1/30)tick(1/30);},jump,startSeason,snapTo,get y(){return curY},setPlaying,setCinema,camera,controls};
})();

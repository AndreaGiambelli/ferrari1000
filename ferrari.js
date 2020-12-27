///////////////////////////////////////////////////////////////////////////////
/////////////////////////////// FERRARI 1000+ /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
////////////////// Visual storytelling & Data Visualization ///////////////////
///////////////////////////////////////////////////////////////////////////////
////////////////////////// Andrea Giambelli, 2020 /////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/////////////////////////// www.andreagiambelli.com ///////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Global variables

let colours = {
  red: "#d40000",
  yellow: "#fff200",
  yellow2: "#96872f",
  grey: "#383838",
  timeline: "#636363",
  black: "#0f0f0f",
  white: "#ffffff",
};

let raceNameDict = {
  Australian: "Aus",
  Malaysian: "Mal",
  Chinese: "Chi",
  Bahrain: "Bah",
  Spanish: "Spa",
  Monaco: "Mon",
  Turkish: "Tur",
  British: "Gbr",
  German: "Ger",
  Hungarian: "Hun",
  European: "Eur",
  Belgian: "Bel",
  Italian: "Ita",
  Singapore: "Sin",
  Japanese: "Jap",
  Brazilian: "Bra",
  "Abu Dhabi": "Abu",
  Canadian: "Can",
  French: "Fra",
  "United States": "Usa",
  "San Marino": "Smr",
  Austrian: "Aut",
  Argentine: "Arg",
  Luxembourg: "Lux",
  Portuguese: "Por",
  Pacific: "Pac",
  "South African": "Rsa",
  Mexican: "Mex",
  Korean: "Kor",
  Detroit: "Det",
  Dutch: "Ned",
  Dallas: "Dal",
  "United States West": "Usw",
  Swiss: "Sui",
  "Caesars Palace": "Cpl",
  Swedish: "Swe",
  "Indianapolis 500": "500",
  Moroccan: "Mor",
  Pescara: "Pes",
  Indian: "Ind",
  Russian: "Rus",
  Azerbaijan: "Aze",
  Styrian: "Sty",
  "70th Anniversary": "70A",
  Tuscan: "Tus",
  Eifel: "Eif",
  "Emilia Romagna": "Emi",
  Sakhir: "Skh",
};

let privateers = [
  "whitehead",
  "biondetti",
  "fischer",
  "reg_parnell",
  "landi",
  "rosier",
  "hirt",
  "tornaco",
  "comotti",
  "salvadori",
  "schoeller",
  "laurent",
  "hans_stuck",
  "swaters",
  "adolff",
  "terra",
  "claes",
  "scarlatti",
  "tomaso",
];

const hundredRaces = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

let ferrariRaces = [];
let raceInFocus;
let isFiltered;
let maxRaceInView;
let winsInView = 0;
let polesInView = 0;
let flInView = 0;
let wDcInView = 0;
let wCcInView = 0;
let xScaleSp;
let currentStoryLinks = null;
let windowWidth;
let numPerRow;
let size;
let mainCircleRadius;
let lineWidth;
let tiltAngle;
let topOffset;

if (window.innerWidth <= 414) {
  d3.select("body").classed("fixed", true);
  d3.select("#turn-device").classed("open", true);
}

/// READING DATA
d3.json("ferrariData.json").then(function (ferrariData) {
  console.log(ferrariData);

  const handleResize = () => {
    windowWidth = window.innerWidth;
    console.log(windowWidth);
    if (windowWidth <= 414) {
      d3.select("body").classed("fixed", true);
      d3.select("#turn-device").classed("open", true);
    } else {
      d3.select("body").classed("fixed", false);
      d3.select("#turn-device").classed("open", false);
      drawViz(ferrariData);
    }
  };

  window.addEventListener("resize", handleResize);

  /// VIZ ///
  function drawViz(dataset) {
    windowWidth = window.innerWidth;

    if (windowWidth <= 812) {
      topOffset = 500;
      console.log(topOffset);
    } else {
      topOffset = 100;
    }

    // Map Margins and dimensions
    let marginViz = { top: 30, right: 70, bottom: 30, left: 70 };
    let widthViz =
      (windowWidth >= 768 ? windowWidth * 0.7 : 500) -
      marginViz.left -
      marginViz.right;

    let grid, backgroundGrid, timeline, scaleGrid;
    numPerRow;
    if (windowWidth >= 1200) {
      numPerRow = 8;
    } else {
      numPerRow = 4;
    }
    size = (widthViz - marginViz.left - marginViz.right) / numPerRow;
    mainCircleRadius = size / 3.5;
    lineWidth = size / 20;
    tiltAngle = 14; // Fixed

    // Scale to set up grid
    scaleGrid = d3
      .scaleLinear()
      .domain([0, numPerRow - 1])
      .range([0, size * numPerRow]);

    let heightViz =
      scaleGrid(Math.floor(ferrariData.length / numPerRow)) + size;

    d3.select("#viz").selectAll("svg").remove();

    // Viz SVG
    let wrapperViz = d3
      .select("#viz")
      .append("svg")
      .attr("width", widthViz + marginViz.left + marginViz.right)
      .attr("height", heightViz + marginViz.top + marginViz.bottom);

    let bounds = wrapperViz
      .append("g")
      .attr(
        "transform",
        "translate(" + marginViz.left + "," + marginViz.top + ")"
      );

    // Initialize static elements
    bounds.append("g").attr("class", "timeline-group");
    bounds.append("g").attr("class", "background-group");
    bounds.append("g").attr("class", "races-group");

    // Setting height of sidebar stats wrapper to ensure stats are at the bottom
    d3.select("#story-stats-wrapper").style(
      "height",
      window.innerHeight * 0.8 + "px"
    );

    d3.select("#races-count-right").text(dataset.length);

    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// TIMELINE ////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    timeline = bounds.select(".timeline-group");

    timeline.selectAll(".yearsLine").remove();
    timeline.selectAll("#timeline-arcs").remove();

    let timelineRects = timeline
      .selectAll(".yearsLine")
      .data(d3.range(dataset.length / numPerRow))
      .enter()
      .append("rect")
      .attr("class", "yearsLine")
      .attr("x", size / 2 - 30 - 1)
      .attr("y", (d, i) => scaleGrid(i) + size / 2 - lineWidth / 2)
      .attr("width", size * numPerRow + 30 + 2)
      .attr("height", lineWidth)
      .attr("fill", colours.timeline)
      .attr("stroke", "none");

    let arcGeneratorRight = d3
      .arc()
      .innerRadius(scaleGrid(0.5) - lineWidth / 2)
      .outerRadius(scaleGrid(0.5) + lineWidth / 2)
      .startAngle(0)
      .endAngle(Math.PI);

    let arcGeneratorLeft = d3
      .arc()
      .innerRadius(scaleGrid(0.5) - lineWidth / 2)
      .outerRadius(scaleGrid(0.5) + lineWidth / 2)
      .startAngle(0)
      .endAngle(-Math.PI);

    let timelineArcs = timeline
      .append("g")
      .attr("id", "timeline-arcs")
      .selectAll("path")
      .data(d3.range(dataset.length / numPerRow - 1))
      .enter()
      .append("path")
      .attr("d", (d, i) => {
        if (i % 2 != 0) {
          return arcGeneratorLeft(d);
        } else {
          return arcGeneratorRight(d);
        }
      })
      .attr("fill", colours.timeline)
      .attr("stroke", "none")
      .style(
        "transform",
        (d, i) =>
          `translate(${
            i % 2 != 0 ? size / 2 - 40 : size * numPerRow + size / 2 + 40
          }px,  ${scaleGrid(i + 0.5) + size / 2}px)`
      );

    /////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////// BACKGROUND GROUPS ////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // Separate grid for dark background circles
    // Done to solve overlay positioning issues

    const backGroundUpdate = bounds
      .select(".background-group")
      .selectAll(".background-circle")
      .data(dataset, (d) => {
        return d ? `b${d.raceIdFerrari}` : this.id;
      });

    const backGroundEnter = backGroundUpdate
      .enter()
      .append("g")
      .attr("class", "background-circle")
      .attr("id", (d) => `b${d.raceIdFerrari}`)
      .attr("transform", function (d, i) {
        // Backwards on odd rows
        let n;
        if (Math.floor(i / numPerRow) % 2 === 0) {
          n = i % numPerRow;
        } else {
          n = numPerRow - (i % numPerRow) - 1;
        }

        // Vertical positioning
        const m = Math.floor(i / numPerRow);

        // console.log("x: " + n)
        // console.log("y: " + m)

        // Translating groups to grid position
        return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
      });

    backGroundEnter
      .append("g")
      .append("circle")
      .attr("cx", size / 2)
      .attr("cy", size / 2)
      .attr("r", mainCircleRadius * 1.7)
      .attr("fill", colours.black)
      .attr("class", "race-backrgound-circle1")
      .attr("stroke", (d) => (d.raceIdFerrari === 1000 ? colours.red : "none"))
      .attr("stroke-dasharray", (d) =>
        d.raceIdFerrari === 1000 ? "1px 2px" : "none"
      );

    const backGroundExit = backGroundUpdate.exit().remove();

    let aaa = backGroundEnter
      .merge(backGroundUpdate)
      .attr("transform", function (d, i) {
        // Backwards on odd rows
        let n;
        if (Math.floor(i / numPerRow) % 2 === 0) {
          n = i % numPerRow;
        } else {
          n = numPerRow - (i % numPerRow) - 1;
        }

        // Vertical positioning
        const m = Math.floor(i / numPerRow);

        // Translating groups to grid position
        return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
      });

    /////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////// MAIN GROUPS ///////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    const gridUpdate = bounds
      .select(".races-group")
      .selectAll(".race")
      .data(dataset, (d) => {
        return d ? `r${d.raceIdFerrari}` : this.id;
      });

    const gridEnter = gridUpdate
      .enter()
      .append("g")
      .attr("class", "race")
      .attr("id", (d) => `r${d.raceIdFerrari}`)
      .attr("transform", function (d, i) {
        // Backwards on odd rows
        let n;
        if (Math.floor(i / numPerRow) % 2 === 0) {
          n = i % numPerRow;
        } else {
          n = numPerRow - (i % numPerRow) - 1;
        }

        // Vertical positioning
        const m = Math.floor(i / numPerRow);

        // Translating groups to grid position
        return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
      });

    const gridExit = gridUpdate.exit().remove();

    let smallMultiple = gridEnter
      .merge(gridUpdate)
      .attr("transform", function (d, i) {
        // Backwards on odd rows
        let n;
        if (Math.floor(i / numPerRow) % 2 === 0) {
          n = i % numPerRow;
        } else {
          n = numPerRow - (i % numPerRow) - 1;
        }

        // Vertical positioning
        const m = Math.floor(i / numPerRow);

        // Translating groups to grid position
        return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
      });
    smallMultiple.selectAll("race-label").text((d) => d.raceDetails.raceAbbrev);

    // CLICK on race symbol - focus
    smallMultiple.on("click", function (d, i, n) {
      d3.event.stopPropagation();

      // Display and populate tooltip
      tooltipFunction(d);
    });

    // CLICK on body to reset focus state
    d3.select("body").on("click", function (d) {
      d3.select("#race-details-wrapper").style("display", "none");

      // Remove fade from all elements
      d3.selectAll(".label").style("opacity", 1);
      d3.selectAll(".race-main-circle").style("opacity", 1);
      d3.selectAll(".led-arc").style("opacity", 1);
      d3.selectAll(".year-label").style("opacity", 1);
      d3.selectAll(".driver-pole").style("opacity", 1);
      d3.selectAll(".driver-fl").style("opacity", 1);
      d3.selectAll(".driver-led").style("opacity", 1);
      d3.selectAll(".driver-championship").style("opacity", 1);
      d3.selectAll(".constructor-championship").style("opacity", 1);
      d3.selectAll(".first-row-triangle").style("opacity", 1);

      raceInFocus = undefined;
    });

    // Reset when race in focus exits viewport
    window.addEventListener(
      "scroll",
      function (event) {
        let array = [];

        for (let i = 1; i < 993; i++) {
          if (isInViewport(d3.select(`#r${i}`).node())) {
            array.push(parseInt(`${i}`));
          }
        }

        maxRaceInView = d3.max(array);

        d3.selectAll(".year-rect-overlay").attr("x", xScaleSp(maxRaceInView));

        winsInView = 0;
        polesInView = 0;
        flInView = 0;
        wDcInView = 0;
        wCcInView = 0;

        ferrariData.forEach((d) => {
          let winsCalc = d.drivers.map((e) => e.position);
          let polesCalc = d.drivers.map((e) => e.grid);
          let flCalc = d.drivers.map((e) => e.fLap1);
          let wDcCalc = d.drivers.map((e) => e.driChamp);
          let wCcCalc = d.drivers.map((e) => e.conChamp);

          if (d.raceIdFerrari <= maxRaceInView) {
            if (winsCalc.includes("1")) {
              winsInView++;
            }
            if (polesCalc.includes("1")) {
              polesInView++;
            }
            if (flCalc.includes("1")) {
              flInView++;
            }
            if (wDcCalc.includes("1")) {
              wDcInView++;
            }
            if (wCcCalc.includes("1")) {
              wCcInView++;
            }
          }
        });

        console.log(maxRaceInView);

        d3.select("#winsInView").text(`${winsInView}`);
        d3.select("#polesInView").text(`${polesInView}`);
        d3.select("#flInView").text(`${flInView}`);

        d3.select("#wDcSymbols").selectAll(".championship-symbol").remove();
        for (i = 0; i < wDcInView; i++) {
          d3.select("#wDcSymbols")
            .append("div")
            .attr("class", "championship-symbol");
        }
        d3.select("#wDcInViewValue").text(wDcInView);

        d3.select("#wCcSymbols").selectAll(".championship-symbol").remove();
        for (i = 0; i < wCcInView; i++) {
          d3.select("#wCcSymbols")
            .append("div")
            .attr("class", "championship-symbol")
            .append("img")
            .attr("src");
        }
        d3.select("#wCcInViewValue").text(wCcInView);

        if (maxRaceInView > 1 && maxRaceInView < 57) {
          // console.log("early years");
          d3.select("#story-title").text("The Early Years");
          d3.select("#story").html(
            "On May 21, 1950, <span>Scuderia Ferrari</span> makes its debut in the Formula 1 World Championship, in the second round of the newly-born series at the <a id='Mon.50'>Monaco GP</a>. Italian driver Alberto Ascari’s finishes second in the race, claiming the team’s maiden podium, while the first victory comes the following year, thanks to José Froilan Gonzalez at <a id='Gbr.51'>Silverstone</a>. The team’s constant growth and the retirement of early rivals Alfa Romeo, would set the stage for the first winning cycle of the Scuderia. Ascari takes back to back world championships in 1952 and 1953, totally dominating the series and setting <a href='https://en.wikipedia.org/wiki/Alberto_Ascari#Formula_One_records' target='_blank'>records that still stand to this day. </a>"
          );
        } else if (maxRaceInView > 58 && maxRaceInView < 88) {
          // console.log("early years");
          d3.select("#story").html(
            "Ascari would move to rival team Lancia, before passing in a tragic accident at Monza. Argentinian legend-in-the-making Juan Manuel Fangio joins Ferrari in 1956, and wins his 4th world championship in a dramatic fashion at the <a id='Ita.56'>Italian GP</a>: his car breaks down but teammate Peter Collins, himself a title contender, sportingly hands his own car to Fangio during a pit stop, allowing him to take the title. 1957 proves unsuccessful and brings more tragedies as two Ferrari drivers, Eugenio Castellotti and Alfonso De Portago are killed in non-F1 racing cars. Mike Hawthorn takes the Scuderia’s last title of the 50’s with just a single win at the <a id='Fra.58'>French GP</a>, in the cursed 1958 in which two drivers, Luigi Musso and Peter Collins, are killed while racing their Ferraris."
          );
        } else if (maxRaceInView > 88 && maxRaceInView < 149) {
          // console.log("early sixties");
          d3.select("#story").html(
            "The new ‘shark-nosed’ 156 model—the first Ferrari purposely designed as rear-engined—dominates the 1961 season, allowing Phil Hill to take the title, and Giancarlo Baghetti to claim a historic win on his F1 debut in <a id='Fra.61'>France</a>. The Scuderia is once again struck by tragedy when German driver Von Trips is killed in an accident at <a id='Ita.61'>Monza</a>, along with 14 spectators. The following years bring upheaval in the team as young engineer Mauro Forghieri is promoted to head the racing division. He and his team pen the 158 model, which British ace John Surtees races to the title in 1964, beating the mighty Jim Clark and his superior Lotus. Despite the team’s efforts the rest of the Sixties is not very successful against strong rivals like Lotus, Brabham, Cooper and McLaren. One of the few highlights is Ludovico Scarfiotti’s win at the <a id='Ita.66'>1966 Italian GP</a>, the last victory for an Italian on home soil to date. "
          );
        } else if (maxRaceInView > 150 && maxRaceInView < 232) {
          // console.log("60s-70s");
          d3.select("#story").html(
            "At the end of the Sixties, new drivers (Jacky Ickx, Chris Amon) and technological innovation (the appearance of front and rear wings on Ferrari cars) seem to pave the way for a new successful period. 1970’s 312B model, with its flat 12V engine looks incredibly fast in the hands of Ickx and Swiss Clay Regazzoni. However, several victories and a 1-2 at the season finale in <a id='Mex.70'>Mexico</a>, are not enough for the Belgian to beat Lotus’ Jochen Rindt, the only driver to be posthumously awarded the F1 championship. American Mario Andretti manages to win on his Ferrari debut at the <a id='Rsa.71'>1971 South African GP</a>, but the following seasons bring generally poor results and instability for the team. However, the 312 model would prove to be a very strong foundation for the years to come. "
          );
        } else if (
          // Early 1970s
          maxRaceInView >= 232 &&
          maxRaceInView < 312
        ) {
          // console.log("early 1970s");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "Ferrari is back battilng at the top of the pack in 1974, with Luca Cordero di Montezemolo heading the racing team, and a strong pair of drivers in Regazzoni and Austrian youngster Niki Lauda. Glory finally comes in 1975, as Lauda brings the driver’s title back to Maranello after 11 years and Regazzoni helps secure the Constructor’s Championship as well. Ferrari and Lauda dominate the following year, until the Austrian’s life-threatening accident at the <a id='Ger.76'>Nurburgring</a>. Lauda’s physical recovery is incredibly quick, but would famously give in at a soaked season finale in <a id='Jap.76'>Japan</a>, handing the title to British rising star James Hunt. The Austrian comes back strongly in ’77, winning his second title before leaving the team acrimoniously. Enzo Ferrari replaces him with a relatively unknown Canadian youngster by the name of Gilles Villeneuve"
          );
        } else if (
          // End of 1970s
          maxRaceInView >= 312 &&
          maxRaceInView < 345
        ) {
          // console.log("end of 1970s");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "With his spectacular, beyond-the-edge driving Villeneuve instantly becomes a favorite of racing fans, who cheer his maiden victory on home turf at <a id='Can.78'>Montreal</a> in 1978 and his epic duel with René Arnoux in <a id='Fra.79'>France</a> the following year.  He is joined by South African ace Jody Scheckter, who manages to clinch the ’79 title amid an exciting 1-2 for the team at the <a id='Ita.79'>Italian GP</a>. These results conclude a very successful decade for Ferrari, which saw the team win 4 Constructor’s and 3 Driver’s championships in 5 years—a stark contrast with the 1980 season which brings very poor results and sees a struggling Scheckter retiring at the end of the year. "
          );
        } else if (
          // The Turbo era
          maxRaceInView > 345 &&
          maxRaceInView < 436
        ) {
          // console.log("turbo era");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "By the early 80s turbo engines are the next big thing in the sport. Ferrari follows suit and develops its first turbo car (126CK), which Villeneuve uses to produce some of the most heroic drives in the history of the sport at <a id='Mon.81'>Monaco</a> and in <a id='Spa.81'>Spain</a>. Unfortunately they will stand as his last wins as he loses his life during the qualifying session for the 1982 Belgian GP. The year brings more heartbreak for the Scuderia: despite having the best car, another dramatic accident to Gilles’ teammate, Didier Pironi, effectively ends Ferrari’s bid for the driver title. The team can at least celebrate the Constructor’s title, repeating the result in ’83. Young Italian Michele Alboreto joins the team and battles with Alain Prost and his McLaren for a chance at the 1985 title, ultimately succumbing amid technical issues. His win in <a id='Ger.85'>Germany</a> is the last one for an Italian on a Ferrari to date. "
          );
        } else if (
          // 88-90
          maxRaceInView >= 441 &&
          maxRaceInView < 515
          // isInViewport(d3.select(`#r${436}`).node()) ||
          // isInViewport(d3.select(`#r${462}`).node())
        ) {
          // console.log("88-90");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "On August 14 1988 founder <span>Enzo Ferrari</span> passes away at age 90. Less than a month after, Gerhard Berger and Michele Alboreto honor him by scoring a historic 1-2 on home ground <a id='Ita.88'>at Monza</a>. It would stand as the only non-McLaren win that year. Famed designer John Barnard pens the 640, F1’s first semi-automatic gearbox car. The car proves successful in the hands of <a id='Bra.89'>Nigel Mansell</a> and triple world champion <a id='Fra.90'>Alain Prost</a>, who would go on to be a championship contender in 1990—only to lose after a crash with arch-rival Ayrton Senna at the <a id='Jap.90'>Japanese GP</a> in one of the sport’s most controversial moments. Young star Jean Alesi brings hope for 1991 and the future, but unfortunately the team would slip into one of the darkest period in its history, with lack of competitiveness and unstable leadership. "
          );
        } else if (
          // Digiuno
          maxRaceInView > 516 &&
          maxRaceInView < 576
        ) {
          // console.log("digiuno");
          d3.select("#story-title").text("Setting up for the comeback");
          d3.select("#story").html(
            "With the arrival of Jean Todt as team principal and the comeback of Luca di Montezemolo, Ferrari lays the foundation for a strong comeback. Gerhard Berger claims the team’s first victory in 4 years at the <a id='Ger.94'>1994 German GP</a>, while Jean Alesi gets his long-awaited first win the following year <a id='Can.95'>in Canada</a>. Nicola Larini takes the last podium to date for an Italian driver on a Ferrari, during the tragic <a id='Smr.94'>Imola weekend</a> which claimed the lives of Roland Ratzenberger and Ayrton Senna. "
          );
        } else if (
          // MSC
          maxRaceInView >= 576 &&
          maxRaceInView < 653
        ) {
          // console.log("Msc");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "Double world champion Michael Schumacher joins the team and takes a spectacular first win for Ferrari in the soaked <a id='Spa.96'>1996 Spanish GP</a>. With the best driver of his generation and a revamped technical team, the Scuderia is finally able to place a serious bid for the title in 97, which would end in misery after the controversial crash between Schumacher and Villeneuve at <a id='Eur.97'>European GP</a>. Finn Mika Hakkinen and his McLaren emerge the following year as new rivals, and not even Schumacher’s most heroic efforts would be enough to bring the title back to Maranello. The 1999 season takes an unexpected turn when the German is injured at the <a id='Gbr.99'>Silverstone</a>, which leaves his teammate Eddie Irvine to battle for the title with Hakkinen until <a id='Jap.99'>the last race</a>. The Finn takes the title again, but Ferrari celebrates its first Constructor’s championship in 16 years."
          );
        } else if (
          // 2000s
          maxRaceInView > 653 &&
          maxRaceInView < 764
        ) {
          // console.log("Msc 2000s");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "With a new teammate in Rubens Barrichello, and after another year spent battling with McLarens, at the <a id='Jap.00'>2000 Japanese GP</a> Michael Schumacher finally brings the Driver’s World Title back to Maranello after 21 years. This will be the start of the most successful cycle for the team to date, with the German and Ferrari winning 5 back to back championships, effectively dominating the series and crushing all sorts of records. Rising star Fernando Alonso and his Renault manage to break the cycle by winning titles in 2005. At the end of a final, heroic yet unsuccessful title bid the following year against the Spaniard, Michael Schumacher retires from the sport. The <a id='Chi.06'>2006 Chinese GP</a> would stand as his 91st and last victory, while his new teammate Felipe Massa takes his first one in <a id='Tur.06'>Turkey</a>. "
          );
        } else if (
          // Last Championships
          maxRaceInView >= 764 &&
          maxRaceInView < 824
        ) {
          // console.log("Last championships");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "Kimi Raikkonen joins Ferrari for 2007, winning on his debut with the team in <a id='Aus.07'>Australia</a>. McLaren’s opposition—with world champion Fernando Alonso and rookie Lewis Hamilton—is mighty but unstable, and the Finn manages to take the title in a spectacular finale at <a id='Bra.07'>Interlagos</a>. 2008 brings more success with Ferrari winning its 16th Constructor’s Championship, but also heartbreak when Felipe Massa gets dramatically close to winning the title <a id='Bra.08'>on his home turf</a>, only to be beaten by Lewis Hamilton with an overtake at the very last corner. "
          );
        } else if (
          // Early 2010s
          maxRaceInView > 824 &&
          maxRaceInView < 876
        ) {
          // console.log("Last championships");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "Fernando Alonso is brought in to replace the retired Raikkonen and, like the Finn, he’s <a id='Bah.10'>immediately successful</a>. 2010 proves to be an exciting three-way battle against McLarens and Red Bulls, with Sebastian Vettel managing to pip Alonso for the title at the very last race in <a id='Abu.10'>Abu Dhabi</a>. The Spaniard is able to place another, heroic, bid for the title in 2012. Despite not having the fastest car, he and Ferrari manage to get 3 wins and to challenge Vettel until the <a id='Bra.12'>season finale</a>—unfortunately for the Scuderia, without success. "
          );
        } else if (
          // Hybrid Era
          maxRaceInView >= 876 &&
          maxRaceInView < 981
        ) {
          // console.log("hybrid");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "The last Ferrari world champion to date, Kimi Raikkonen, rejoins the team for 2014—a challenging year for the Scuderia as the sport enters its Hybrid era. After 9 years, another German champion joins Ferrari the following season: Sebastian Vettel, who manages to win in his second race for the team at the <a id='Mal.15'>Malaysian GP</a>. The outfit from Maranello is finally back to being a title contender in 2017, scoring 5 wins including a 1-2 on the streets of <a id='Mon.17'>Monaco</a>. Lewis Hamilton and his Mercedes would ultimately claim the titles, amid technical woes, some errors and <a id='Sin.17'>a bit of bad luck</a> for the Scuderia. 2018 is a similar story: after a very strong first half of the season, Vettel’s and Ferrari’s efforts are not enough to beat Hamilton. "
          );
        } else if (
          // Latest victories
          maxRaceInView > 991 &&
          maxRaceInView < 1010
        ) {
          // console.log("latest");
          d3.select("#story-title").text("Title");
          d3.select("#story").html(
            "Young Monegasque Charles Leclerc replaces Raikkonen for the 2019 season, and claims spectacular back to back victories at <a id='Bel.19'>Spa</a> and <a id='Ita.19'>Monza</a>. Vettel leads a 1-2 at the following race in <a id='Sin.19'>Singapore</a>, claiming the Scuderia’s last victory to date. 2020, as the sport manages to put together a calendar of races despite the global pandemic, proves to be a very hard year in terms of results for the team—Leclerc’s second place in the <a id='Aut.20'>first race</a> would stand to be the best result of the whole season. Nevertheless, the season brings some opportunity for celebration as Ferrari reaches the 1000th race landmark on home turf at <a id='Tus.20'>Mugello</a>. 2021 will once again bring on change, with Carlos Sainz as Leclerc’s new teammate. All fans—<i>tifosi</i>—hope the Scuderia will be able to add some more red symbols to this timeline soon. "
          );
        } else {
          d3.select("#story").html("");
        }

        currentStoryLinks = d3.select("#story").selectAll("a");

        // console.log(currentStoryLinks);

        if (raceInFocus) {
          let inFocusNode = d3.select(`#r${raceInFocus.raceIdFerrari}`).node();
          // console.log(inFocusNode);
          if (isInViewport(inFocusNode)) {
            // console.log("in");
          } else {
            // console.log("out");
            // d3.select("#story-stats-wrapper").style("display", "block");
            d3.select("#race-details-wrapper").style("display", "none");

            // Remove fade from all elements
            d3.selectAll(".label").style("opacity", 1);
            d3.selectAll(".race-main-circle").style("opacity", 1);
            d3.selectAll(".led-arc").style("opacity", 1);
            d3.selectAll(".year-label").style("opacity", 1);
            d3.selectAll(".driver-pole").style("opacity", 1);
            d3.selectAll(".driver-fl").style("opacity", 1);
            d3.selectAll(".driver-led").style("opacity", 1);
            d3.selectAll(".driver-championship").style("opacity", 1);
            d3.selectAll(".constructor-championship").style("opacity", 1);

            raceInFocus = undefined;
          }
        }

        currentStoryLinks.on("click", function (d) {
          d3.event.stopPropagation();

          console.log(this.id);
          let linkRace = dataset.find(
            (e) => e.raceDetails.raceAbbrev === this.id
          );

          $(document).ready(function () {
            $("html, body").animate(
              {
                scrollTop:
                  $(`#r${raceInFocus.raceIdFerrari}`).offset().top - topOffset,
              },
              800
            );
          });
          raceInFocus = linkRace;

          // Timeout to set raceInFocus AFTER scroll is finished
          setTimeout(function () {
            tooltipFunction(linkRace);
          }, 800);

          console.log(linkRace);
        });
      },
      false
    );

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// WORLD CHAMPIONSHIP PATTERNS ////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // Driver World Championships
    gridEnter
      .filter((d) => d.drivers.map((e) => e.driChamp).includes("1"))
      .raise()
      .append("g")
      .attr("class", "driver-championship")
      .attr(
        "transform",
        `translate(${-mainCircleRadius}, ${-mainCircleRadius})`
      )
      .html(
        `<defs><pattern id="_10_dpi_30_4" data-name="10 dpi 30% 4" width="${
          size / 2
        }" height="${
          size / 2
        }" patternTransform="translate(1.39 3.07) scale(0.25)" patternUnits="userSpaceOnUse" viewBox="0 0 28.8 28.8"><rect width="28.8" height="28.8" fill="none" /><circle cx="28.8" cy="28.8" r="2.16" fill="${
          colours.red
        }" /><circle cx="14.4" cy="28.8" r="2.16" fill="${
          colours.red
        }" /><circle cx="28.8" cy="14.4" r="2.16" fill="${
          colours.red
        }" /><circle cx="14.4" cy="14.4" r="2.16" fill="${
          colours.red
        }" /><circle cx="7.2" cy="21.6" r="2.16" fill="${
          colours.red
        }" /><circle cx="21.6" cy="21.6" r="2.16" fill="${
          colours.red
        }" /><circle cx="7.2" cy="7.2" r="2.16" fill="${
          colours.red
        }" /><circle cx="21.6" cy="7.2" r="2.16" fill="${
          colours.red
        }" /><circle cy="28.8" r="2.16" fill="${
          colours.red
        }" /><circle cy="14.4" r="2.16" fill="${
          colours.red
        }" /><circle cx="28.8" r="2.16" fill="${
          colours.red
        }" /><circle cx="14.4" r="2.16" fill="${
          colours.red
        }" /><circle r="2.16" fill="${
          colours.red
        }" /></pattern></defs><g id="Isolation_Mode" data-name="Isolation Mode"><circle cx="33.05" cy="33.05" r="${mainCircleRadius}" fill="url(#_10_dpi_30_4)" /></g>`
      )
      .attr(
        "transform",
        `translate(${mainCircleRadius / 1.2}, ${
          mainCircleRadius / 2
        }), rotate(${-tiltAngle})`
      );

    // Constructor World Championships
    gridEnter
      .filter((d) => d.drivers.map((e) => e.conChamp).includes("1"))
      .raise()
      .append("g")
      .attr("class", "constructor-championship")
      .attr(
        "transform",
        `translate(${-mainCircleRadius}, ${-mainCircleRadius})`
      )
      .html(
        `<defs><pattern id="_10_dpi_30_4b" data-name="10 dpi 30% 4" width="${
          size / 2
        }" height="${
          size / 2
        }" patternTransform="translate(1.39 3.07) scale(0.25)" patternUnits="userSpaceOnUse" viewBox="0 0 28.8 28.8"><rect width="28.8" height="28.8" fill="none" /><circle cx="28.8" cy="28.8" r="2.16" fill="${
          colours.yellow
        }" /><circle cx="14.4" cy="28.8" r="1.5" fill="${
          colours.yellow
        }" /><circle cx="28.8" cy="14.4" r="1.5" fill="${
          colours.yellow
        }" /><circle cx="14.4" cy="14.4" r="1.5" fill="${
          colours.yellow
        }" /><circle cx="7.2" cy="21.6" r="1.5" fill="${
          colours.yellow
        }" /><circle cx="21.6" cy="21.6" r="1.5" fill="${
          colours.yellow
        }" /><circle cx="7.2" cy="7.2" r="1.5" fill="${
          colours.yellow
        }" /><circle cx="21.6" cy="7.2" r="1.5" fill="${
          colours.yellow
        }" /><circle cy="28.8" r="1.5" fill="${
          colours.yellow
        }" /><circle cy="14.4" r="1.5" fill="${
          colours.yellow
        }" /><circle cx="28.8" r="1.5" fill="${
          colours.yellow
        }" /><circle cx="14.4" r="1.5" fill="${
          colours.yellow
        }" /><circle r="1.5" fill="${
          colours.yellow
        }" /></pattern></defs><g id="Isolation_Mode" data-name="Isolation Mode"><circle cx="33.05" cy="33.05" r="${mainCircleRadius}" fill="url(#_10_dpi_30_4b)" /></g>`
      )
      .attr(
        "transform",
        `translate(${mainCircleRadius / 1.4}, ${
          mainCircleRadius / 1.9
        }), rotate(${-tiltAngle})`
      );

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////// LABELS /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // Race label
    gridEnter
      .append("text")
      .attr("x", size / 2)
      .attr("y", size)
      .attr("class", "label race-label")
      .attr("transform", `rotate(${-tiltAngle})`)
      .style("font-size", "6px")
      .style("text-transform", "uppercase")
      .style("fill", colours.white)
      .style("text-anchor", "middle")
      .text((d) => d.raceDetails.raceAbbrev);

    // Year label

    gridEnter
      .filter(
        (d, i) =>
          d.raceDetails.round === "1" && Math.floor(i / numPerRow) % 2 === 0
      )
      .append("rect")
      .attr("class", "year-rect")
      .attr("x", -size / 4)
      .attr("y", size / 2.4)
      .attr("width", size / 2)
      .attr("height", size / 6)
      .style("fill", colours.black)
      .style("display", isFiltered ? "none" : "block");

    gridEnter
      .filter(
        (d, i) =>
          d.raceDetails.round === "1" && Math.floor(i / numPerRow) % 2 != 0
      )
      .append("rect")
      .attr("class", "year-rect")
      .attr("x", size / 1.1)
      .attr("y", size / 2.4)
      .attr("width", size / 2.5)
      .attr("height", size / 6)
      .style("fill", colours.black)
      .style("display", isFiltered ? "none" : "block");

    gridEnter
      .append("text")
      .attr("class", "year-label")
      .attr("x", (d, i) => {
        if (Math.floor(i / numPerRow) % 2 === 0) {
          return -size / 20;
        } else {
          return size + size / 20;
        }
      })
      .attr("y", size / 1.9)
      .style("vertical-align", "middle")
      .style("font-size", "8px")
      .style("text-transform", "uppercase")
      .style("fill", colours.white)
      .style("text-anchor", "middle")
      .text((d, i) => {
        if (Math.floor(i / numPerRow) % 2 === 0) {
          return d.raceDetails.round === "1" ? d.year + "->" : "";
        } else {
          return d.raceDetails.round === "1" ? "<-" + d.year : "";
        }
      });

    // Hundred label
    gridEnter
      .filter((d) => hundredRaces.includes(parseInt(d.raceIdFerrari)))
      .append("text")
      .attr("class", "label")
      .attr("x", size / 1.3)
      .attr("y", size / 3)
      .attr("transform", `rotate(${-tiltAngle})`)
      .style("font-size", "16px")
      .style("font-family", "Epilogue")
      .style("font-weight", "bold")
      .style("text-transform", "uppercase")
      .style("fill", colours.white)
      .style("text-anchor", "middle")
      .text((d) => d.raceIdFerrari);

    // Main circle
    gridEnter
      .append("circle")
      .raise()
      .attr("cx", size / 2)
      .attr("cy", size / 2)
      .attr("r", mainCircleRadius)
      .style("z-index", "1000")
      .attr("fill", (d) => {
        let racePositions = d.drivers.map((e) => e.position);
        return racePositions.includes("1")
          ? colours.red
          : racePositions.includes("2") || racePositions.includes("3")
          ? colours.yellow
          : racePositions.includes("4") ||
            racePositions.includes("5") ||
            racePositions.includes("6")
          ? colours.yellow2
          : colours.grey;
      })
      .attr("class", "race-main-circle")
      .attr("stroke", "none");

    /////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// SYMBOLS //////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // Drivers strips structure
    let driversGroup = gridEnter
      .append("g")
      .attr("id", "drivers-group")
      .attr("transform", `translate(${size / 2}, ${size / 2}), rotate(-${14})`);

    let driverStripWidth = size / 30;
    let driverStripDistance = size / 9;

    let innerDriversGroup = driversGroup
      .append("g")
      .attr("id", (d) => d.raceDetails.raceAbbrev)
      .attr("transform", (d) => {
        // #of drivers in small multiples limited to 4
        let shortenedDriversLength =
          d.drivers.length <= 4 ? d.drivers.length : 4;
        return `translate(0, ${
          (-shortenedDriversLength * driverStripWidth -
            (shortenedDriversLength - 1) *
              (driverStripDistance - driverStripWidth)) /
          2
        })`;
      });

    singleDriverGroup = innerDriversGroup
      .selectAll(".single-driver-g")
      .data((d) => d.drivers)
      .enter()
      .filter((d, i) => i <= 3)
      .append("g")
      .attr("class", "single-driver-g")
      .attr("transform", (d, i) => {
        return `translate(0, ${driverStripDistance * i})`;
      });

    // Driver strips
    singleDriverGroup
      .append("rect")
      .attr("x", -mainCircleRadius)
      .attr("y", 0)
      .attr("width", (d) => {
        let lapsScale = d3
          .scaleLinear()
          .domain([0, 1])
          .range([0, mainCircleRadius * 2]);
        return lapsScale(d.lapsCompleted);
      })
      .attr("height", driverStripWidth)
      .attr("fill", colours.black);

    // Pole Position or first row
    singleDriverGroup
      .append("polygon")
      .attr("class", "first-row-triangle")
      .attr(
        "transform",
        `translate(${-mainCircleRadius - 8}, ${-driverStripWidth / 2})`
      )
      .attr("points", (d) => {
        return d.grid === "1"
          ? "0 0 0 6.16 5.33 3.08 0 0"
          : d.grid === "2"
          ? "0 0 0 3.23 2.8 1.61 0 0"
          : "";
      })
      .attr("fill", (d) => {
        return d.grid === "1"
          ? colours.white
          : d.grid === "2"
          ? colours.white
          : "none";
      })
      .attr("stroke", "none");

    // Fastest Lap
    singleDriverGroup
      .append("circle")
      .attr("class", "driver-fl")
      .attr("cx", mainCircleRadius + 5)
      .attr("cy", driverStripWidth / 2)
      .attr("r", size / 40)
      .attr("stroke", (d) => {
        if (d.fLap1) {
          return d.fLap1 === "1" ? colours.white : "none";
        }
      })
      .attr("fill", "none");

    // All laps led
    singleDriverGroup
      .append("circle")
      .attr("class", "driver-led")
      .attr("cx", mainCircleRadius + 5)
      .attr("cy", driverStripWidth / 2)
      .attr("r", size / 15)
      .attr("stroke", (d) => {
        if (d.rank) {
          return d.lapsLed / d.winnerLaps === 1 ? colours.white : "none";
        }
      })
      .attr("fill", "none");

    // Triangular shape for driver strips
    singleDriverGroup
      .append("polyline")
      .attr("points", (d) => {
        if (d.position === "1") {
          return `${mainCircleRadius * 0.45} ${driverStripWidth}
            ${mainCircleRadius * 0.45} -${size / 13}
            ${size / 3} ${driverStripWidth}
            ${mainCircleRadius * 0.45} ${driverStripWidth}`;
        } else if (d.position === "2" || d.position === "3") {
          return `${mainCircleRadius * 0.6} ${driverStripWidth}
          ${mainCircleRadius * 0.6} -${size / 22}
          ${size / 3} ${driverStripWidth}
          ${mainCircleRadius * 0.6} ${driverStripWidth}`;
        }
      })
      .attr("fill", colours.black);

    // Laps led arc
    let angleScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([-Math.PI / 2 + 1.5 * tiltAngle * (Math.PI / 180), 0]);

    gridEnter
      .append("g")
      .style("transform", `translate(${size / 2}px, ${size / 2}px)`)
      .attr("class", "led-arc")
      .append("path")
      .attr("d", (d) => {
        let sum = [];
        d.drivers.forEach((e) => sum.push(parseInt(e.lapsLed)));
        let sum2 = sum.reduce((a, b) => a + b, 0);

        let arcValue = d3
          .arc()
          .innerRadius(scaleGrid(0.32) - lineWidth / 4)
          .outerRadius(scaleGrid(0.32) + lineWidth / 4)
          // .startAngle(-Math.PI / 2 + tiltAngle * (Math.PI / 180))
          .startAngle(-Math.PI / 2 + 1.5 * tiltAngle * (Math.PI / 180))
          .endAngle(angleScale(sum2 / parseInt(d.drivers[0].winnerLaps)));
        return arcValue(d);
      })
      .attr("fill", colours.white)
      .attr("stroke", "none");
  }

  function drawSparklines(dataset) {

    let containerWidth = d3.select("#sp-wins").node().clientWidth
    // Sparklines - set the dimensions and margins of the graph
    let spMargin = { top: 5, right: 5, bottom: 5, left: 5 },
      spWidth = containerWidth*0.9 - spMargin.left - spMargin.right,
      spHeight = 50 - spMargin.top - spMargin.bottom;


    let spWinsSvg = d3
      .select("#sp-wins")
      .append("svg")
      .attr("width", spWidth + spMargin.left + spMargin.right)
      .attr("height", spHeight + spMargin.top + spMargin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + spMargin.left + "," + spMargin.top + ")"
      );

    let spPolesSvg = d3
      .select("#sp-poles")
      .append("svg")
      .attr("width", spWidth + spMargin.left + spMargin.right)
      .attr("height", spHeight + spMargin.top + spMargin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + spMargin.left + "," + spMargin.top + ")"
      );

    let spFlSvg = d3
      .select("#sp-fl")
      .append("svg")
      .attr("width", spWidth + spMargin.left + spMargin.right)
      .attr("height", spHeight + spMargin.top + spMargin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + spMargin.left + "," + spMargin.top + ")"
      );

    // Sparklines - x Scale
    xScaleSp = d3
      .scaleLinear()
      .domain(d3.extent(dataset, (d) => parseInt(d.raceIdFerrari)))
      .range([0, spWidth]);

    // Sparklines - y Scale Wins
    let yScaleSpWins = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(dataset, function (d) {
          return +d.cumulativeWins;
        }),
      ])
      .range([spHeight, 0]);

    // Sparklines - Wins area
    spWinsSvg
      .append("path")
      .datum(dataset)
      .attr("fill", "#d40000")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "none")
      .attr(
        "d",
        d3
          .area()
          .x(function (d) {
            return xScaleSp(d.raceIdFerrari);
          })
          .y0(yScaleSpWins(0))
          .y1(function (d) {
            return yScaleSpWins(d.cumulativeWins);
          })
      );
    // Sparklines - Wins line
    spWinsSvg
      .append("path")
      .datum(dataset)
      .attr("stroke", "#d40000")
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return xScaleSp(d.raceIdFerrari);
          })
          .y(function (d) {
            return yScaleSpWins(d.cumulativeWins);
          })
      );

    // Sparklines - Wins year rect
    spWinsSvg
      .append("rect")
      .attr("class", "year-rect-overlay")
      .attr("x", xScaleSp.range()[0])
      .attr("y", yScaleSpWins.range()[1] - 10)
      .attr("width", xScaleSp.range()[1])
      .attr("height", yScaleSpWins.range()[0] + 20)
      .style("stroke", "none")
      .style("fill", "#0f0f0f")
      .style("fill-opacity", "0.6");

    // Sparklines - Wins number
    spWinsSvg
      .append("text")
      .attr("x", spWidth - 10)
      .attr("y", spHeight - 10)
      .attr("text-anchor", "end")
      .attr("id", "winsInView")
      .attr("fill", colours.white)
      .text("0");

    // Sparklines - y Scale Poles
    let yScaleSpPoles = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(dataset, function (d) {
          return +d.cumulativePoles;
        }),
      ])
      .range([spHeight, 0]);

    // Sparklines - Poles area
    spPolesSvg
      .append("path")
      .datum(dataset)
      .attr("fill", "#d40000")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "none")
      .attr(
        "d",
        d3
          .area()
          .x(function (d) {
            return xScaleSp(d.raceIdFerrari);
          })
          .y0(yScaleSpPoles(0))
          .y1(function (d) {
            return yScaleSpPoles(d.cumulativePoles);
          })
      );
    // Sparklines - Poles line
    spPolesSvg
      .append("path")
      .datum(dataset)
      .attr("stroke", "#d40000")
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return xScaleSp(d.raceIdFerrari);
          })
          .y(function (d) {
            return yScaleSpPoles(d.cumulativePoles);
          })
      );

    // Sparklines - Poles year rect
    spPolesSvg
      .append("rect")
      .attr("class", "year-rect-overlay")
      .attr("x", xScaleSp.range()[0])
      .attr("y", yScaleSpPoles.range()[1] - 10)
      .attr("width", xScaleSp.range()[1])
      .attr("height", yScaleSpPoles.range()[0] + 20)
      .style("stroke", "none")
      .style("fill", "#0f0f0f")
      .style("fill-opacity", "0.6");

    // Sparklines - Poles number
    spPolesSvg
      .append("text")
      .attr("x", spWidth - 10)
      .attr("y", spHeight - 10)
      .attr("text-anchor", "end")
      .attr("id", "polesInView")
      .attr("fill", colours.white)
      .text("0");

    // Sparklines - y Scale Fl
    let yScaleSpFl = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(dataset, function (d) {
          return +d.cumulativeFl;
        }),
      ])
      .range([spHeight, 0]);

    // Sparklines - Fl area
    spFlSvg
      .append("path")
      .datum(dataset)
      .attr("fill", "#d40000")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "none")
      .attr(
        "d",
        d3
          .area()
          .x(function (d) {
            return xScaleSp(d.raceIdFerrari);
          })
          .y0(yScaleSpFl(0))
          .y1(function (d) {
            return yScaleSpFl(d.cumulativeFl);
          })
      );
    // Sparklines - Fl line
    spFlSvg
      .append("path")
      .datum(dataset)
      .attr("stroke", "#d40000")
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return xScaleSp(d.raceIdFerrari);
          })
          .y(function (d) {
            return yScaleSpFl(d.cumulativeFl);
          })
      );

    // Sparklines - Fl year rect
    spFlSvg
      .append("rect")
      .attr("class", "year-rect-overlay")
      .attr("x", xScaleSp.range()[0])
      .attr("y", yScaleSpFl.range()[1] - 10)
      .attr("width", xScaleSp.range()[1])
      .attr("height", yScaleSpFl.range()[0] + 20)
      .style("stroke", "none")
      .style("fill", "#0f0f0f")
      .style("fill-opacity", "0.6");

    // Sparklines - Fl number
    spFlSvg
      .append("text")
      .attr("x", spWidth - 10)
      .attr("y", spHeight - 10)
      .attr("text-anchor", "end")
      .attr("id", "flInView")
      .attr("fill", colours.white)
      .text("0");
  }

  drawViz(ferrariData);
  drawSparklines(ferrariData);

  function tooltipFunction(raceObj) {
    raceInFocus = raceObj;

    let thisNode = d3.select(`#r${raceObj.raceIdFerrari}`).node();
    console.log("NOWW");
    // console.log(thisNode);

    let ctm = thisNode.getCTM();
    console.log(thisNode.getCTM());

    if (ctm.e < 160 && numPerRow === 8) {
      d3.select("#race-details-wrapper").style("left", `${ctm.e + size / 2}px`);
    } else if (ctm.e < 140 && numPerRow === 4) {
      d3.select("#race-details-wrapper").style("left", `${ctm.e + size / 2}px`);
    } else if (ctm.e > 320 && numPerRow === 4) {
      d3.select("#race-details-wrapper").style(
        "left",
        `${ctm.e - raceObj.drivers.length * 60}px`
      );
    } else {
      d3.select("#race-details-wrapper").style(
        "left",
        `${ctm.e - 160 + size / 2}px`
      );
    }

    d3.select("#race-details-wrapper")
      .style("display", "block")
      .style("top", (c) => {
        return innerWidth > 812 ? `${ctm.f + 100}px` : `${ctm.f + 70}px`;
      });

    // Fade all elements
    d3.selectAll(".label").style("opacity", 0.3);
    d3.selectAll(".race-main-circle").style("opacity", 0.3);
    d3.selectAll(".led-arc").style("opacity", 0.3);
    d3.selectAll(".year-label").style("opacity", 0.3);
    d3.selectAll(".driver-pole").style("opacity", 0.3);
    d3.selectAll(".driver-fl").style("opacity", 0.3);
    d3.selectAll(".driver-led").style("opacity", 0.3);
    d3.selectAll(".driver-championship").style("opacity", 0.3);
    d3.selectAll(".constructor-championship").style("opacity", 0.3);
    d3.selectAll(".first-row-triangle").style("opacity", 0.3);

    // Highlight selected
    d3.select(thisNode).selectAll(".label").style("opacity", 1);
    d3.select(thisNode).selectAll(".race-main-circle").style("opacity", 1);
    d3.select(thisNode).selectAll(".led-arc").style("opacity", 1);
    d3.select(thisNode).selectAll(".driver-pole").style("opacity", 1);
    d3.select(thisNode).selectAll(".driver-fl").style("opacity", 1);
    d3.select(thisNode).selectAll(".driver-led").style("opacity", 1);
    d3.select(thisNode).selectAll(".driver-championship").style("opacity", 1);
    d3.select(thisNode)
      .selectAll(".constructor-championship")
      .style("opacity", 1);
    d3.select(thisNode).selectAll(".first-row-triangle").style("opacity", 1);

    // Tooltip - race title
    d3.select("#race-header-title").text(
      `${raceObj.year} ${raceObj.raceDetails.raceName}`
    );

    console.log(raceObj.raceIdFerrari);

    d3.select("#circuit-image img").remove();
    d3.select("#car-model img").remove();
    // Tooltip - circuit image
    d3.select("#circuit-image")
      .append("img")
      .attr("class", raceObj.circuitName.name)
      .attr(
        "src",
        // `SVG/svgCircuits/Circuits_${raceObj.circuitName.circuitRef}.svg`

        circuitMap.find(
          (c) =>
            c.name === raceObj.circuitName.circuitRef &&
            c.yearFirst <= raceObj.year &&
            c.yearLast >= raceObj.year
        ).svgPath
      )
      .attr("width", 80)
      .attr("height", 80);

    // Tooltip - race circuit
    d3.select("#race-circuit").text(raceObj.circuitName.name);

    // Tooltip - race date
    let formatDate = d3.timeFormat("%B %d");
    let dateString = raceObj.raceDetails.date + "  14:00:00 GMT";
    let raceDate = new Date(Date.parse(dateString));
    d3.select("#race-date").text(formatDate(raceDate));

    // Sidebar - race count text
    d3.select("#races-count").text("Race #" + raceObj.raceIdFerrari);

    // Sidebar - race count chart

    let countScale = d3
      .scaleLinear()
      .domain([0, ferrariData.length])
      .range([0, 100]);

    d3.select("#races-count-chart").selectAll("svg").remove();

    let countSvg = d3
      .select("#races-count-chart")
      .append("svg")
      .attr("width", "100%")
      .attr("height", 8)
      .append("g");

    countSvg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", "100%")
      .attr("height", 3)
      .attr("fill", "#330b0b");

    countSvg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", `${countScale(raceObj.raceIdFerrari)}%`)
      .attr("height", 3)
      .attr("fill", colours.red);

    // Tooltip - driver divs
    let driverDivs = d3
      .select("#drivers")
      .selectAll(".driver-div")
      .data(raceObj.drivers)
      .join("div")
      .attr("class", "driver-div")
      .text("");

    driverDivs
      .append("img")
      .attr("class", "driver-helmet")
      .attr("src", (e) => {
        if (e.driver === "michael_schumacher" && +e.raceYear >= 2000) {
          return `SVG/SVG_michael_schumacher_2.svg`;
        } else {
          return `SVG/SVG_${e.driver}.svg`;
        }
      })
      .attr("width", 50)
      .attr("height", 50);
    driverDivs
      .append("p")
      .attr("class", "driver-number")
      .text((e) => e.number);
    driverDivs
      .append("p")
      .attr("class", "driver-name")
      .text((e) => e.name);

    // Driver result area
    let driverResultWrapper = driverDivs
      .append("div")
      .attr("class", "tooltip-driver-result-wrapper");

    driverResultWrapper
      .append("div")
      .attr("class", "tooltip-driver-position")
      .style("background", (e) => {
        return e.position === "1"
          ? colours.red
          : e.position === "2" || e.position === "3"
          ? colours.yellow
          : e.position === "4" || e.position === "5" || e.position === "6"
          ? colours.yellow2
          : colours.grey;
      })
      .append("p")
      .text((e) => {
        if (e.position.includes("N")) {
          return "/";
        } else {
          return e.position;
        }
      });

    let driverDetailsWrapper = driverResultWrapper
      .append("div")
      .attr("class", "tooltip-driver-details-wrapper");

    let driverDetailsSymbols = driverDetailsWrapper
      .append("div")
      .attr("class", "tooltip-driver-symbols");

    // Pole Position symbol
    driverDetailsSymbols
      .append("svg")
      .attr("width", "16px")
      .attr("height", "16px")
      .append("polygon")
      .attr("transform", `translate(6, 6), rotate(${-tiltAngle})`)
      .attr("points", "0 0 0 6.16 5.33 3.08 0 0")
      .attr("fill", (e) => {
        return e.grid === "1" ? colours.white : colours.grey;
      })
      .append("title")
      .text("Pole Position");

    // Fl symbol
    driverDetailsSymbols
      .append("svg")
      .attr("width", "16px")
      .attr("height", "16px")
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", (e) => {
        return e.fLap1 === "1" ? colours.white : colours.grey;
      })
      .attr("stroke-width", 1)
      .attr("cx", 8)
      .attr("cy", 8)
      .attr("r", 4)
      .append("title")
      .text("Fastest Lap");

    // All laps led symbol
    driverDetailsSymbols
      .append("svg")
      .attr("width", "16px")
      .attr("height", "16px")
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", (e) => {
        // console.log(e.lapsLed);
        // console.log(e.winnerLaps);
        return e.lapsLed / e.winnerLaps === 1 ? colours.white : colours.grey;
      })
      .attr("stroke-width", 1)
      .attr("cx", 8)
      .attr("cy", 8)
      .attr("r", 7)
      .append("title")
      .text("All Laps Led");

    let driverDetailsSymbolsLabels = driverDetailsWrapper
      .append("div")
      .attr("class", "tooltip-driver-symbols-labels");
    driverDetailsSymbolsLabels
      .append("p")
      .text("PP")
      .attr("fill", (e) => {
        return e.grid === "1" ? colours.white : colours.grey;
      })
      .append("title")
      .text("Pole Position");
    driverDetailsSymbolsLabels
      .append("p")
      .text("FL")
      .attr("fill", (e) => {
        return e.fLap1 === "1" ? colours.white : colours.grey;
      })
      .append("title")
      .text("Fastest Lap");
    driverDetailsSymbolsLabels
      .append("p")
      .text("LL")
      .attr("fill", (e) => {
        return e.lapsLed / e.winnerLaps === 1 ? colours.white : colours.grey;
      })
      .append("title")
      .text("All Laps Led");

    // Tooltip - Driver laps led area
    // let driverLapsLed = driverDivs
    //   .append("div")
    //   .attr("id", "tooltip-driver-laps-led");

    // let countLapsLedScale = d3.scaleLinear().domain([0, 1]).range([0, 100]);

    // driverLapsLed.selectAll("svg").remove();

    // let driverLapsLedSvg = driverLapsLed
    //   .append("svg")
    //   .attr("width", "90%")
    //   .attr("height", 8)
    //   .append("g");

    // driverLapsLedSvg
    //   .append("rect")
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .attr("width", "100%")
    //   .attr("height", 3)
    //   .attr("fill", "#330b0b");

    // driverLapsLedSvg
    //   .append("rect")
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .attr("width", (e) => {
    //     console.log(e);
    //     return `${countLapsLedScale(e.lapsLed / e.winnerLaps)}%`;
    //   })
    //   .attr("height", 3)
    //   .attr("fill", colours.red);

    // Tooltip - Driver cars
    let driverCar = driverDivs.append("div").attr("id", "tooltip-driver-car");
    driverCar
      .append("img")
      .attr("class", "car-image")
      .attr("src", (e) => {
        let carString = e.car.replace("/", "-");
        return `SVG/svgCars/Cars_${carString}.svg`;
      })
      .attr("width", 70);

    driverCar.append("p").text((e) => e.car);

    if (innerWidth <= 812) {
      d3.select("#race-details-wrapper").style("width", (c) => {
        return raceObj.drivers.length <= 2
          ? "250px"
          : raceObj.drivers.length === 3
          ? "350px"
          : "450px";
      });

      d3.selectAll(".driver-div").style("width", (c) => {
        return raceObj.drivers.length <= 2
          ? "50%"
          : raceObj.drivers.length === 3
          ? "33%"
          : "24%";
      });
    }
  }

  // Checking if in viewport
  const isInViewport = function (elem) {
    var bounding = elem.getBoundingClientRect();
    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    );
  };
});

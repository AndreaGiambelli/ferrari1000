// Context variables

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

let circuitsMap = [
  {
    name: "estoril",
    yearFirst: 1984,
    yearLast: 1993,
    svgPath: "SVG/svgCircuits/Circuits_estoril.svg",
  },
  {
    name: "estoril",
    yearFirst: 1994,
    yearLast: 1996,
    svgPath: "SVG/svgCircuits/Circuits_albert_park.svg",
  },
];

const hundredRaces = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

// Global variables
let ferrariRaces = [];
let allFerrariRaces;
let raceInFocus;
let filter;
let isFiltered;
let maxRaceInView;
let winsInView = 0;
let polesInView = 0;
let flInView = 0;
let wDcInView = 0;
let wCcInView = 0;
let winsMap = [];
let polesMap = [];
let flMap = [];
let wDcMap = [];
let wCcMap = [];
let xScaleSp;
let currentStoryLinks = null;

d3.csv("f1db_csv/races.csv").then(function (racesData) {
  racesData.forEach((r) => {
    ferrariRaces.push({
      raceIdOverall: r.raceId,
      year: r.year,
      raceDetails: {
        round: r.round,
        circuitId: r.circuitId,
        raceName: r.name,
        raceAbbrev:
          raceNameDict[r.name.replace(" Grand Prix", "")] +
          "." +
          r.year.slice(2, 4),
        date: r.date,
        url: r.url,
      },
    });
  });

  d3.csv("f1db_csv/circuitMap.csv").then(function (circuitMap) {
    console.log(circuitMap);
  });

  d3.csv("f1db_csv/circuits.csv").then(function (circuitsData) {
    ferrariRaces.forEach((d) => {
      d.circuitName = circuitsData.find(
        (e) => e.circuitId === d.raceDetails.circuitId
      );
    });

    d3.csv("f1db_csv/results_modified.csv").then(function (resultsData) {
      d3.csv("f1db_csv/drivers.csv").then(function (driversData) {
        ferrariRaces.forEach((d) => {
          let drivers = resultsData
            .filter((e) => e.raceId === d.raceIdOverall) // Find corresponding race result
            .filter((e) => e.constructorId === "6") // Filter for Ferrari cars
            .filter((e) => !privateers.includes(e.driver)) // Filter for Ferrari works drivers
            .sort((a, b) => +a.number - +b.number); // Sort by driver race numbers

          d.drivers = drivers;

          d.drivers.forEach(
            (d) =>
              (d.name =
                driversData.find((e) => e.driverId === d.driverId).forename +
                " " +
                driversData.find((e) => e.driverId === d.driverId).surname)
          );
        });

        ferrariRaces.forEach((d, i) => {
          // Storing full race laps (laps completed by winner)
          let winnerResult = resultsData
            .filter((e) => e.raceId === d.raceIdOverall) // Find corresponding race result
            .filter((e) => e.positionOrder === "1");

          d.drivers.forEach((e) => {
            e.winnerLaps = parseInt(winnerResult[0].laps);
            e.lapsCompleted = e.laps / e.winnerLaps;
          });
        });

        function filterRaces(item) {
          if (
            item.raceDetails.raceName === "Swiss Grand Prix" &&
            item.year === "1982"
          ) {
            return false;
          }
          if (
            item.raceDetails.raceName === "Belgian Grand Prix" &&
            item.year === "1982"
          ) {
            return false;
          }
          // All races, no filter
          return item.drivers.length;
        }
        let ferrariCompleteRaces = ferrariRaces
          .filter(filterRaces)
          .sort((a, b) => +a.year - +b.year);
        ferrariCompleteRaces.forEach((d, i) => (d.raceIdFerrari = i + 1));

        // Cumulative values
        ferrariCompleteRaces.forEach((d, i) => {
          // Cumulative Wins
          let winsCalc = d.drivers.map((e) => e.position);
          if (winsCalc.includes("1")) {
            winsMap.push(...winsCalc);
            winsMap = winsMap.filter((f) => f === "1");
          }
          d.cumulativeWins = winsMap.length;

          // Cumulative Poles
          let polesCalc = d.drivers.map((e) => e.grid);
          if (polesCalc.includes("1")) {
            polesMap.push(...polesCalc);
            polesMap = polesMap.filter((f) => f === "1");
          }
          d.cumulativePoles = polesMap.length;

          // Cumulative Fastest Laps
          let flCalc = d.drivers.map((e) => e.fLap1);
          if (flCalc.includes("1")) {
            flMap.push(...flCalc);
            flMap = flMap.filter((f) => f === "1");
          }
          d.cumulativeFl = flMap.length;
        });
        console.log(ferrariCompleteRaces); // 994 races with Ferrari + 6 races in 2020 = 1000

        /// VIZ ///

        // Map Margins and dimensions
        let marginViz = { top: 30, right: 70, bottom: 30, left: 70 },
          widthViz = 1000 - marginViz.left - marginViz.right;

        let grid, backgroundGrid, timeline, scaleGrid;
        const numPerRow = 8;
        const size = (widthViz - marginViz.left - marginViz.right) / numPerRow;
        const mainCircleRadius = size / 3.5;
        let lineWidth = 4;
        let tiltAngle = 14;

        // let heightViz =
        //   (size * ferrariCompleteRaces.length) / numPerRow -
        //   marginViz.top -
        //   marginViz.bottom;
        let heightViz = 13000;
        // Viz SVG
        let wrapperViz = d3
          .select("#viz")
          .append("svg")
          // .style("background", "gray")
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

        function drawViz(dataset) {
          // Setting height of sidebar stats wrapper to ensure stats are at the bottom
          d3.select("#story-stats-wrapper").style(
            "height",
            window.innerHeight * 0.8 + "px"
          );

          d3.select("#races-count-right").text(dataset.length);

          console.log(dataset);

          // Scale to set up grid
          scaleGrid = d3
            .scaleLinear()
            .domain([0, numPerRow - 1])
            .range([0, size * numPerRow]);

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
            .attr("height", "4px")
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

              // Translating groups to grid position
              return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
            });

          // backGroundEnter.append("text").attr("fill", "green");
          backGroundEnter
            .append("g")
            .append("circle")
            .attr("cx", size / 2)
            .attr("cy", size / 2)
            .attr("r", mainCircleRadius * 1.7)
            .attr("fill", colours.black)
            .attr("class", "race-backrgound-circle1")
            .attr("stroke", "none");

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
          // aaa.selectAll("text").text((d) => d.raceIdFerrari);

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

          let bbb = gridEnter
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
          bbb.selectAll("race-label").text((d) => d.raceDetails.raceAbbrev);

          // grid = bounds
          //   .select(".races-group")
          //   .selectAll(".race")
          //   .data(dataset, (d) => {
          //     return d ? `r${d.raceIdFerrari}` : this.id;
          //   })
          //   .join(
          //     (enter) =>
          //       enter
          //         .append("g")
          //         .attr("class", "race")
          //         .attr("id", (d) => `r${d.raceIdFerrari}`),
          //     (update) =>
          //       update.attr("transform", function (d, i) {
          //         // Horizontal positioning

          //         // Regular:
          //         // const n = i % numPerRow;

          //         // Backwards on odd rows
          //         let n;
          //         if (Math.floor(i / numPerRow) % 2 === 0) {
          //           n = i % numPerRow;
          //         } else {
          //           n = numPerRow - (i % numPerRow) - 1;
          //         }

          //         // Vertical positioning
          //         const m = Math.floor(i / numPerRow);

          //         //   console.log("xi: " + i + " " + numPerRow + " n: " + n + " xn: " + (12 - n))

          //         // Translating groups to grid position
          //         return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
          //       }),
          //     (exit) => exit.remove()
          //   )
          //   .attr("transform", function (d, i) {
          //     // Horizontal positioning

          //     // Regular:
          //     // const n = i % numPerRow;

          //     // Backwards on odd rows
          //     let n;
          //     if (Math.floor(i / numPerRow) % 2 === 0) {
          //       n = i % numPerRow;
          //     } else {
          //       n = numPerRow - (i % numPerRow) - 1;
          //     }

          //     // Vertical positioning
          //     const m = Math.floor(i / numPerRow);

          //     //   console.log("xi: " + i + " " + numPerRow + " n: " + n + " xn: " + (12 - n))

          //     // Translating groups to grid position
          //     return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
          //   })
          //

          // CLICK on race symbol - focus
          bbb.on("click", function (d, i, n) {
            d3.event.stopPropagation();

            // Display and populate tooltip
            tooltipFunction(d)
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

              d3.selectAll(".year-rect-overlay").attr(
                "x",
                xScaleSp(maxRaceInView)
              );

              winsInView = 0;
              polesInView = 0;
              flInView = 0;
              wDcInView = 0;
              wCcInView = 0;

              ferrariCompleteRaces.forEach((d) => {
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

              d3.select("#winsInView").text(`${winsInView}`);
              d3.select("#polesInView").text(`${polesInView}`);
              d3.select("#flInView").text(`${flInView}`);
              d3.select("#wDcInView").text(`WDC: ${wDcInView}`);
              d3.select("#wCcInView").text(`Constructors: ${wCcInView}`);

              // The 1970s
              if (
                isInViewport(d3.select(`#r${230}`).node()) ||
                isInViewport(d3.select(`#r${267}`).node())
              ) {
                // console.log("1970s");
                d3.select("#story-title").text("Title");
                d3.select("#story").text("1970s");
              } else if (
                // The Turbo era
                isInViewport(d3.select(`#r${317}`).node()) ||
                isInViewport(d3.select(`#r${363}`).node())
              ) {
                // console.log("turbo era");
                d3.select("#story-title").text("Title");
                d3.select("#story").text("inizio turbo era, gilles, alboreto");
              } else if (
                // 88-90
                isInViewport(d3.select(`#r${436}`).node()) ||
                isInViewport(d3.select(`#r${462}`).node())
              ) {
                // console.log("88-90");
                d3.select("#story-title").text("Title");
                d3.select("#story").html(
                  "On August 14 1988 founder <span>Enzo Ferrari</span> passes away at age 90. Less than a month after, Gerhard Berger and Michele Alboreto honor him by scoring a historic 1-2 on home ground <a id='Ita.88'>at Monza</a>. It would stand as the only non-McLaren win that year. Famed designer John Barnard pens the 640, F1’s first semi-automatic gearbox car. The car proves successful in the hands of <a id='Bra.89'>Nigel Mansell</a> and triple world champion <a id='Fra.90'>Alain Prost</a>, who would go on to be a championship contender in 1990—only to lose after a crash with arch-rival Ayrton Senna at the <a id='Jap.90'>Japanese GP</a> in one of the sport’s most controversial moments. Young star Jean Alesi brings hope for 1991 and the future, but unfortunately the team would slip into one of the darkest period in its history, with lack of competitiveness and unstable leadership. "
                );
              } else if (
                // Digiuno
                isInViewport(d3.select(`#r${473}`).node()) ||
                isInViewport(d3.select(`#r${515}`).node())
              ) {
                // console.log("digiuno");
                d3.select("#story-title").text("Title");
                d3.select("#story").text(
                  "Setting up for the comeback With the arrival of Jean Todt as team principal and the comeback of Luca di Montezemolo, Ferrari lays the foundation for a strong comeback. Gerhard Berger claims the team’s first victory in 4 years at the 1994 German GP, while Jean Alesi gets his long-awaited first win the following year in Canada. Nicola Larini takes the last podium to date for an Italian driver on a Ferrari, during the tragic Imola weekend which claimed the lives of Roland Ratzenberger and Ayrton Senna. "
                );
              } else if (
                // MSC
                isInViewport(d3.select(`#r${566}`).node()) ||
                isInViewport(d3.select(`#r${606}`).node())
              ) {
                // console.log("Msc");
                d3.select("#story-title").text("Title");
                d3.select("#story").text(
                  "Dawn of the Schumacher era Double world champion Michael Schumacher joins the team and takes a spectacular first win for Ferrari in the soaked 1996 Spanish GP. 2 more wins follow that year. With the best driver of his generation and new key technical figures, the team is finally able to place a serious bid for the title in 97, which would end in misery after the controversial crash between Schumacher and Villeneuve at European GP. Finn Mika Hakkinen and his McLaren emerge the following year as new rivals, and not even Schumacher’s most heroic efforts would be enough to bring the title back to Maranello. The 1999 season takes an unexpected turn when the German is injured at the British GP, which leaves his teammate Eddie Irvine to battle for the title with Hakkinen until the last race. The Finn takes the title again, but Ferrari celebrates its first Constructor’s championship in 16 years."
                );
              } else if (
                // 2000s
                isInViewport(d3.select(`#r${619}`).node()) ||
                isInViewport(d3.select(`#r${702}`).node())
              ) {
                // console.log("Msc 2000s");
                d3.select("#story-title").text("Title");
                d3.select("#story").text("Msc 2000s");
              } else if (
                // Last Championships
                isInViewport(d3.select(`#r${741}`).node()) ||
                isInViewport(d3.select(`#r${811}`).node())
              ) {
                // console.log("Last championships");
                d3.select("#story-title").text("Title");
                d3.select("#story").text("Last Championships, Alonso");
              } else if (
                // Hybrid Era
                isInViewport(d3.select(`#r${870}`).node()) ||
                isInViewport(d3.select(`#r${981}`).node())
              ) {
                // console.log("hybrid");
                d3.select("#story-title").text("Title");
                d3.select("#story").text("Hybrid Era");
              } else if (
                // Latest victories
                isInViewport(d3.select(`#r${982}`).node()) ||
                isInViewport(d3.select(`#r${993}`).node())
              ) {
                // console.log("latest");
                d3.select("#story-title").text("Title");
                d3.select("#story").text("Latest victories");
              } else {
                d3.select("#story").text("none");
              }

              currentStoryLinks = d3.select("#story").selectAll("a");
              
                console.log(currentStoryLinks)
                currentStoryLinks.on("click", function (d) {
                  console.log(this.id);
                  let test = dataset.find(e=>e.raceDetails.raceAbbrev === this.id).raceIdFerrari
                  console.log(test)
                });

              if (raceInFocus) {
                let inFocusNode = d3
                  .select(`#r${raceInFocus.raceIdFerrari}`)
                  .node();
                console.log(inFocusNode);
                if (isInViewport(inFocusNode)) {
                  console.log("in");
                } else {
                  console.log("out");
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
                d.raceDetails.round === "1" &&
                Math.floor(i / numPerRow) % 2 === 0
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
                d.raceDetails.round === "1" &&
                Math.floor(i / numPerRow) % 2 != 0
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
            .attr("x", size / 1.5)
            .attr("y", size / 3)
            .attr("transform", `rotate(${-tiltAngle})`)
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
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

          // Laps led arc
          let angleScale = d3
            .scaleLinear()
            .domain([0, 1])
            .range([-Math.PI / 2 + tiltAngle * (Math.PI / 180), 0]);

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
                .innerRadius(scaleGrid(0.35) - lineWidth / 4)
                .outerRadius(scaleGrid(0.35) + lineWidth / 4)
                .startAngle(-Math.PI / 2 + tiltAngle * (Math.PI / 180))
                .endAngle(angleScale(sum2 / parseInt(d.drivers[0].winnerLaps)));
              return arcValue(d);
            })
            .attr("fill", colours.white)
            .attr("stroke", "none");

          // Drivers strips structure
          let driversGroup = gridEnter
            .append("g")
            .attr("id", "drivers-group")
            .attr(
              "transform",
              `translate(${size / 2}, ${size / 2}), rotate(-${14})`
            );

          let driverStripWidth = 3;
          let driverStripDistance = 10;

          let innerDriversGroup = driversGroup
            .append("g")
            .attr("id", (d) => d.raceDetails.raceAbbrev)
            .attr(
              "transform",
              (d) =>
                `translate(0, ${
                  (-d.drivers.length * driverStripWidth -
                    (d.drivers.length - 1) *
                      (driverStripDistance - driverStripWidth)) /
                  2
                })`
            );

          singleDriverGroup = innerDriversGroup
            .selectAll(".single-driver-g")
            .data((d) => d.drivers)
            .enter()
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
            .append("circle")
            .attr("class", "driver-pole")
            .attr("cx", -mainCircleRadius - 5)
            .attr("cy", driverStripWidth / 2)
            .attr("r", (d) => {
              return d.grid === "1" ? "3px" : d.grid === "2" ? "2px" : "0px";
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
            .attr("r", "2px")
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
            .attr("r", "6px")
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
            ${mainCircleRadius * 0.45} -7
            32 ${driverStripWidth}
            ${mainCircleRadius * 0.45} ${driverStripWidth}`;
              } else if (d.position === "2" || d.position === "3") {
                return `${mainCircleRadius * 0.6} ${driverStripWidth}
          ${mainCircleRadius * 0.6} -4
          32 ${driverStripWidth}
          ${mainCircleRadius * 0.6} ${driverStripWidth}`;
              }
            })
            .attr("fill", colours.black);
        }

        function drawSparklines(dataset) {
          // Sparklines - set the dimensions and margins of the graph
          let spMargin = { top: 5, right: 5, bottom: 5, left: 5 },
            spWidth = 160 - spMargin.left - spMargin.right,
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

        drawViz(ferrariCompleteRaces);
        drawSparklines(ferrariCompleteRaces);

        function tooltipFunction(raceObj) {
          raceInFocus = raceObj;

          let thisNode = d3.select(`#r${raceObj.raceIdFerrari}`).node()
            console.log(raceObj);
            console.log(thisNode);


            let ctm = thisNode.getCTM();
            console.log(thisNode.getCTM());

            // d3.select("#story-stats-wrapper").style("display", "none");
            d3.select("#race-details-wrapper")
              .style("display", "block")
              .style("left", `${ctm.e - 100}px`)
              .style("top", `${ctm.f + 100}px`);

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

            // Highlight selected
            d3.select(thisNode).selectAll(".label").style("opacity", 1);
            d3.select(thisNode).selectAll(".race-main-circle").style("opacity", 1);
            d3.select(thisNode).selectAll(".led-arc").style("opacity", 1);
            d3.select(thisNode).selectAll(".driver-pole").style("opacity", 1);
            d3.select(thisNode).selectAll(".driver-fl").style("opacity", 1);
            d3.select(thisNode).selectAll(".driver-led").style("opacity", 1);
            d3.select(thisNode)
              .selectAll(".driver-championship")
              .style("opacity", 1);
            d3.select(thisNode)
              .selectAll(".constructor-championship")
              .style("opacity", 1);

            // Tooltip - race title
            d3.select("#race-header-title").text(
              `${raceObj.year} ${raceObj.raceDetails.raceName}`
            );

            d3.select("#temp-image img").remove();
            // Tooltip - circuit image
            d3.select("#temp-image")
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
            let dateString = raceObj.raceDetails.date + "T14:00:00+0000";
            let raceDate = new Date(Date.parse(dateString));
            d3.select("#race-date").text(formatDate(raceDate));

            // Sidebar - race count text
            d3.select("#races-count").text("Race #" + raceObj.raceIdFerrari);

            // Sidebar - race count chart

            let countScale = d3.scaleLinear().domain([0, 1000]).range([0, 100]);

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
                  : e.position === "4" ||
                    e.position === "5" ||
                    e.position === "6"
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

            let driverDetailsLead = driverDetailsWrapper
              .append("div")
              .attr("class", "tooltip-driver-lead");

            // Pole Position symbol
            driverDetailsSymbols
              .append("svg")
              .attr("width", "16px")
              .attr("height", "16px")
              .append("circle")
              .attr("fill", (e) => {
                return e.grid === "1" ? colours.white : colours.grey;
              })
              .attr("stroke", "none")
              .attr("cx", 8)
              .attr("cy", 8)
              .attr("r", 4)
              .append("title")
              .text("test");

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
              .attr("r", 4);

            // All laps led symbol
            driverDetailsSymbols
              .append("svg")
              .attr("width", "16px")
              .attr("height", "16px")
              .append("circle")
              .attr("fill", "none")
              .attr("stroke", (e) => {
                console.log(e.lapsLed);
                console.log(e.winnerLaps);
                return e.lapsLed / e.winnerLaps === 1
                  ? colours.white
                  : colours.grey;
              })
              .attr("stroke-width", 1)
              .attr("cx", 8)
              .attr("cy", 8)
              .attr("r", 7);
        }

        // Filtering test
        filter = () => {
          console.log("filter");
          isFiltered = true;

          let filterFerrariCompleteRaces = ferrariCompleteRaces.filter(
            (d) => d.circuitName.circuitRef === "melbourne"
          );
          drawViz(filterFerrariCompleteRaces);
          grid.selectAll(".year-label").style("display", "none");
          grid.selectAll(".year-rect").style("display", "none");
        };

        unfilter = () => {
          console.log("unfilter");
          isFiltered = false;
          drawViz(ferrariCompleteRaces);
          grid.selectAll(".year-label").style("display", "block");
          grid.selectAll(".year-rect").style("display", "block");
        };

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
    });
  });
});

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

const hundredRaces = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

// Global variables
let ferrariRaces = [];
let allFerrariRaces;
let raceInFocus;
let filter;

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

        ferrariRaces.forEach((d) => {
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
          backgroundGrid = bounds
            .select(".background-group")
            .selectAll(".background-circle")
            .data(dataset)
            .join("g")
            .attr("class", "background-circle")
            .attr("transform", function (d, i) {
              let n;
              if (Math.floor(i / numPerRow) % 2 === 0) {
                n = i % numPerRow;
              } else {
                n = numPerRow - (i % numPerRow) - 1;
              }
              const m = Math.floor(i / numPerRow);
              return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
            });

          //Base circle
          // Dark background
          backgroundGrid
            .append("circle")
            .attr("cx", size / 2)
            .attr("cy", size / 2)
            .attr("r", mainCircleRadius * 1.7)
            .attr("fill", (d) => colours.black)
            .attr("class", "race-backrgound-circle")
            .attr("stroke", "none");

          /////////////////////////////////////////////////////////////////////////////////////////////////
          ///////////////////////////////////////// MAIN GROUPS ///////////////////////////////////////////
          /////////////////////////////////////////////////////////////////////////////////////////////////

          // let binGroup = bounds
          //   .select(".races-group")
          //   .selectAll(".bin")
          //   .data(dataset);

          // const oldBinGroups = binGroup.exit();
          // oldBinGroups.remove();

          // const newBinGroups = binGroup
          //   .enter()
          //   .append("g")
          //   .merge(binGroup)
          //   .attr("class", "bin")
          //   .attr("transform", function (d, i) {
          //     let n;
          //     if (Math.floor(i / numPerRow) % 2 === 0) {
          //       n = i % numPerRow;
          //     } else {
          //       n = numPerRow - (i % numPerRow) - 1;
          //     }
          //     const m = Math.floor(i / numPerRow);
          //     return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
          //   });

          // newBinGroups
          //   .append("rect")
          //   .attr("height", 0)
          //   .attr("x", 0)
          //   .attr("y", 0)
          //   .attr("width", 20)
          //   .attr("height", 20)
          //   .style("fill", (d) => {
          //     let racePositions = d.drivers.map((e) => e.position);
          //     return racePositions.includes("1") ? colours.red : "white";
          //   });

          // newBinGroups.append("text").attr("x", 0).attr("y", 0);

          /// BEGIN TEST

          // Drivers strips structure
          // let tdriversGroup = newBinGroups
          //   .append("g")
          //   .attr("id", "drivers-group")
          //   .attr(
          //     "transform",
          //     `translate(${size / 2}, 0), rotate(-${14})`
          //   );

          // let tdriverStripWidth = 3;
          // let tdriverStripDistance = 10;

          // let tinnerDriversGroup = tdriversGroup
          //   .append("g")
          //   .attr("id", (d) => d.raceDetails.raceAbbrev)
          //   .attr(
          //     "transform",
          //     (d) =>
          //       `translate(0, ${
          //         (-d.drivers.length * tdriverStripWidth -
          //           (d.drivers.length - 1) *
          //             (tdriverStripDistance - tdriverStripWidth)) /
          //         2
          //       })`
          //   );

          // tsingleDriverGroup = tinnerDriversGroup
          //   .selectAll(".single-driver-g")
          //   .data((d) => d.drivers)
          //   .enter()
          //   .append("g")
          //   .attr("class", "single-driver-g")
          //   .attr("transform", (d, i) => {
          //     return `translate(0, ${tdriverStripDistance * i})`;
          //   });

          // // Driver strips
          // tsingleDriverGroup
          //   .append("rect")
          //   .attr("x", -mainCircleRadius)
          //   .attr("y", 0)
          //   .attr("width", (d) => {
          //     let lapsScale = d3
          //       .scaleLinear()
          //       .domain([0, 1])
          //       .range([0, mainCircleRadius * 2]);
          //     return lapsScale(d.lapsCompleted);
          //   })
          //   .attr("height", tdriverStripWidth)
          //   .attr("fill", "yellowgreen");

          /// END TEST

          // binGroup = newBinGroups.merge(binGroup);

          // console.log(binGroup);

          // binGroup
          //   .select("text")
          //   .text((d) => d.raceIdFerrari)
          //   .style("fill", "white");

          gridGroup = bounds
            .select(".races-group")
            .selectAll(".race")
            .data(dataset);

          const oldGridGroup = gridGroup.exit();
          console.log(gridGroup);
          console.log(oldGridGroup);

          oldGridGroup.remove();

          grid = gridGroup
            .enter()
            .append("g")
            .attr("class", "race")
            .attr("id", (d) => "r" + d.raceIdFerrari)
            .attr("transform", function (d, i) {
              // Horizontal positioning

              // Regular:
              // const n = i % numPerRow;

              // Backwards on odd rows
              let n;
              if (Math.floor(i / numPerRow) % 2 === 0) {
                n = i % numPerRow;
              } else {
                n = numPerRow - (i % numPerRow) - 1;
              }

              // Vertical positioning
              const m = Math.floor(i / numPerRow);

              //   console.log("xi: " + i + " " + numPerRow + " n: " + n + " xn: " + (12 - n))

              // Translating groups to grid position
              return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
            })
            .on("click", function (d, i, n) {
              d3.event.stopPropagation();

              raceInFocus = d;

              d3.select("#sidebar").style("visibility", "visible");

              // Fade all elements
              d3.selectAll(".label").style("opacity", 0.5);
              d3.selectAll(".race-main-circle").style("opacity", 0.5);
              d3.selectAll(".led-arc").style("opacity", 0.5);
              d3.selectAll(".year-label").style("opacity", 0.5);
              d3.selectAll(".driver-pole").style("opacity", 0.5);
              d3.selectAll(".driver-fl").style("opacity", 0.5);
              d3.selectAll(".driver-led").style("opacity", 0.5);
              d3.selectAll(".driver-championship").style("opacity", 0.5);
              d3.selectAll(".constructor-championship").style("opacity", 0.5);

              // Highlight selected
              d3.select(this).selectAll(".label").style("opacity", 1);
              d3.select(this)
                .selectAll(".race-main-circle")
                .style("opacity", 1);
              d3.select(this).selectAll(".led-arc").style("opacity", 1);
              d3.select(this).selectAll(".driver-pole").style("opacity", 1);
              d3.select(this).selectAll(".driver-fl").style("opacity", 1);
              d3.select(this).selectAll(".driver-led").style("opacity", 1);
              d3.select(this)
                .selectAll(".driver-championship")
                .style("opacity", 1);
              d3.select(this)
                .selectAll(".constructor-championship")
                .style("opacity", 1);

              // Sidebar - race title
              d3.select("#race-header-title").text(
                `${d.year} ${d.raceDetails.raceName}`
              );

              d3.select("#temp-image img").remove();
              // Sidebar - circuit image
              d3.select("#temp-image")
                .append("img")
                .attr("class", d.circuitName.name)
                .attr(
                  "src",
                  `SVG/svgCircuits/Circuits_${d.circuitName.circuitRef}.svg`
                )
                .attr("width", 100)
                .attr("height", 100);

              // Sidebar - race circuit
              d3.select("#race-circuit").text(d.circuitName.name);

              // Sidebar - race date
              let formatDate = d3.timeFormat("%B %d");
              let dateString = d.raceDetails.date + "T14:00:00+0000";
              let raceDate = new Date(Date.parse(dateString));
              d3.select("#race-date").text(formatDate(raceDate));

              // Sidebar - race count text
              d3.select("#races-count").text("Race #" + d.raceIdFerrari);

              // Sidebar - race count chart

              let countScale = d3
                .scaleLinear()
                .domain([0, 1000])
                .range([0, 100]);

              let countSvg = d3
                .select("#races-count")
                .append("svg")
                .attr("width", "100%")
                .attr("height", 20)
                .append("g");

              countSvg
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", "100%")
                .attr("height", 5)
                .attr("fill", colours.grey);

              countSvg
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", `${countScale(d.raceIdFerrari)}%`)
                .attr("height", 5)
                .attr("fill", colours.red);

              // Sidebar - driver divs
              let driverDivs = d3
                .select("#drivers")
                .selectAll(".driver-div")
                .data(d.drivers)
                .join("div")
                .attr("class", "driver-div")
                .text("");

              driverDivs
                .append("img")
                .attr("class", "driver-helmet")
                .attr("src", (e) => {
                  return `SVG/SVG_${e.driver}.svg`;
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

              // driverDivs.join("p").text((e) => e.name)
            });

          // Reset focus
          d3.select("body").on("click", function (d) {
            d3.select("#sidebar").style("visibility", "hidden");

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

          // Reset when race in focus goes exits viewport
          window.addEventListener(
            "scroll",
            function (event) {
              if (raceInFocus) {
                let inFocusNode = d3
                  .select(`#r${raceInFocus.raceIdFerrari}`)
                  .node();
                console.log(inFocusNode);
                if (isInViewport(inFocusNode)) {
                  console.log("in");
                } else {
                  console.log("out");
                  d3.select("#sidebar").style("visibility", "hidden");

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
          grid
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
          grid
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
          grid
            .append("text")
            .attr("x", size / 2)
            .attr("y", size)
            .attr("class", "label")
            .attr("transform", `rotate(${-tiltAngle})`)
            .style("font-size", "6px")
            .style("text-transform", "uppercase")
            .style("fill", colours.white)
            .style("text-anchor", "middle")
            .text((d) => d.raceDetails.raceAbbrev);

          // Year label
          grid
            .filter(
              (d, i) =>
                d.raceDetails.round === "1" &&
                Math.floor(i / numPerRow) % 2 === 0
            )
            .append("rect")
            .attr("x", -size / 4)
            .attr("y", size / 2.4)
            .attr("width", size / 2)
            .attr("height", size / 6)
            .style("fill", colours.black);

          grid
            .filter(
              (d, i) =>
                d.raceDetails.round === "1" &&
                Math.floor(i / numPerRow) % 2 != 0
            )
            .append("rect")
            .attr("x", size / 1.1)
            .attr("y", size / 2.4)
            .attr("width", size / 2.5)
            .attr("height", size / 6)
            .style("fill", colours.black);

          grid
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
          grid
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
          grid
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

          grid
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
          let driversGroup = grid
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

        drawViz(ferrariCompleteRaces);

        // Filtering test
        filter = () => {
          console.log("filter");
          let filterFerrariCompleteRaces = ferrariCompleteRaces.filter(
            (d) => d.raceIdFerrari === 500
          );
          drawViz(filterFerrariCompleteRaces);
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

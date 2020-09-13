let ferrariRaces = [];
let allFerrariRaces;

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

const scroller = scrollama();

let raceInFocus;

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
      // let circuitLookup =
      d.circuitName = circuitsData.find(
        (e) => e.circuitId === d.raceDetails.circuitId
      );
      //   d.circuitUrl = circuitsData.find((e) => (e.circuitId === d.circuitId)).url;
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

          //   d.drivers.forEach(d => {
          //     d.constructorId = +d.constructorId;
          //     d.driverId = +d.driverId;
          //     d.fastestLap = +d.fastestLap;
          //     d.fastestLapSpeed = +d.fastestLapSpeed;
          //     d.grid = +d.grid;
          //     d.laps = +d.laps;
          //     d.milliseconds = +d.milliseconds;
          //     d.number = +d.number;
          //     d.points = +d.points;
          //     d.position = +d.position;
          //     d.positionOrder = +d.positionOrder;
          //     d.raceId = +d.raceId;
          //     d.resultId = +d.resultId;
          //   })
        });

        ferrariRaces.forEach((d) => {
          // Calculating full race laps (laps completed by winner)
          let winnerResult = resultsData
            .filter((e) => e.raceId === d.raceIdOverall) // Find corresponding race result
            .filter((e) => e.positionOrder === "1");

          // console.log(winnerLaps)
          d.raceDetails.fullLaps = winnerResult;

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

          // Filter test
          // let racePositions;
          // if (item.drivers.length) {
          //   racePositions = item.drivers.map((e) => e.position);
          // } else {
          //   racePositions = "0";
          // }
          // return (
          //   (item.drivers.length && !racePositions.includes("1")) &&
          //   !racePositions.includes("2") &&
          //   !racePositions.includes("3")
          // );
        }
        let ferrariCompleteRaces = ferrariRaces
          .filter(filterRaces)
          .sort((a, b) => +a.year - +b.year);
        ferrariCompleteRaces.forEach((d, i) => (d.raceIdFerrari = i + 1));
        console.log(ferrariCompleteRaces); // 994 races with Ferrari + 6 races in 2020 = 1000

        // Filtering doesn't work

        // console.log(ferrariCompleteRaces);
        // let test = [...ferrariCompleteRaces]

        // test.filter((d, i) => {
        //   // let racePositions = d.drivers.map((e) => e.position);
        //   // return racePositions.includes("1");
        //   d.year === "1954"
        // });

        // console.log(test)

        /// VIZ ///

        // Map Margins and dimensions
        var marginViz = { top: 30, right: 70, bottom: 30, left: 70 },
          widthViz = 1000 - marginViz.left - marginViz.right;

        let grid, timeline, scaleGrid;
        const numPerRow = 8;
        const size = (widthViz - marginViz.left - marginViz.right) / numPerRow;
        const mainCircleRadius = size / 3.5;
        let lineWidth = 4;
        let tiltAngle = 14;

        // let heightViz =
        //   (size * ferrariCompleteRaces.length) / numPerRow -
        //   marginViz.top -
        //   marginViz.bottom;
        let heightViz = 12000;
        // Viz SVG
        var svgViz = d3
          .select("#viz")
          .append("svg")
          // .style("background", "gray")
          .attr("width", widthViz + marginViz.left + marginViz.right)
          .attr("height", heightViz + marginViz.top + marginViz.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + marginViz.left + "," + marginViz.top + ")"
          );

        scaleGrid = d3
          .scaleLinear()
          .domain([0, numPerRow - 1])
          .range([0, size * numPerRow]);

        timeline = svgViz
          .selectAll(".yearsLine")
          .data(d3.range(ferrariCompleteRaces.length / numPerRow))
          .enter()
          .append("rect")
          .attr("class", "yearsLine")
          .attr("x", size / 2 - 30 - 1)
          .attr("y", (d, i) => scaleGrid(i) + size / 2 - lineWidth / 2)
          .attr("width", size * numPerRow + 30 + 2)
          .attr("height", "4px")
          // .attr("x1", size/2)
          // .attr("y1", (d, i) => scaleGrid(i) + size / 2)
          // .attr("x2", size*numPerRow + size/2)
          // .attr("y2", (d, i) => scaleGrid(i) + size / 2)
          // .attr("stroke-width", lineWidth)
          // .attr("stroke", "white")
          .attr("fill", colours.timeline)
          .attr("stroke", "none");

        var arcGeneratorRight = d3
          .arc()
          .innerRadius(scaleGrid(0.5) - lineWidth / 2)
          .outerRadius(scaleGrid(0.5) + lineWidth / 2)
          .startAngle(0)
          .endAngle(Math.PI);

        var arcGeneratorLeft = d3
          .arc()
          .innerRadius(scaleGrid(0.5) - lineWidth / 2)
          .outerRadius(scaleGrid(0.5) + lineWidth / 2)
          .startAngle(0)
          .endAngle(-Math.PI);

        svgViz
          .append("g")
          .attr("id", "timeline-arcs")
          .selectAll("path")
          .data(d3.range(ferrariCompleteRaces.length / numPerRow - 1))
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

        grid = svgViz
          .append("g")
          .attr("class", "races-group")
          .selectAll(".race")
          .data(ferrariCompleteRaces)
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

            // Fade all elements
            d3.selectAll(".label").style("opacity", 0.5);
            d3.selectAll(".race-main-circle").style("opacity", 0.5);
            d3.selectAll(".led-arc").style("opacity", 0.5);
            d3.selectAll(".year-label").style("opacity", 0.5);
            d3.selectAll(".driver-pole").style("opacity", 0.5);
            d3.selectAll(".driver-fl").style("opacity", 0.5);
            d3.selectAll(".driver-led").style("opacity", 0.5);

            // Highlight selected
            d3.select(this).selectAll(".label").style("opacity", 1);
            d3.select(this).selectAll(".race-main-circle").style("opacity", 1);
            d3.select(this).selectAll(".led-arc").style("opacity", 1);
            d3.select(this).selectAll(".driver-pole").style("opacity", 1);
            d3.select(this).selectAll(".driver-fl").style("opacity", 1);
            d3.select(this).selectAll(".driver-led").style("opacity", 1);

            // Sidebar - race title
            d3.select("#race-header-title").text(
              `${d.year} ${d.raceDetails.raceName}`
            );

            d3.select("#temp-image img").remove();
            // Sidebar - circuit image
            d3.select("#temp-image")
              .append("img")
              .attr("class", d.circuitName.name)
              .attr("src", (d) => {
                return "SVG/svgCircuits/Suzuka_1987_2002.svg";
              })
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

            let countScale = d3.scaleLinear().domain([0, 1000]).range([0, 100]);

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
          // Remove fade from all elements
          d3.selectAll(".label").style("opacity", 1);
          d3.selectAll(".race-main-circle").style("opacity", 1);
          d3.selectAll(".led-arc").style("opacity", 1);
          d3.selectAll(".year-label").style("opacity", 1);
          d3.selectAll(".driver-pole").style("opacity", 1);
          d3.selectAll(".driver-fl").style("opacity", 1);
          d3.selectAll(".driver-led").style("opacity", 1);

          raceInFocus = undefined;
        });

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
                d3.select("#sidebar").remove();

                // Remove fade from all elements
                d3.selectAll(".label").style("opacity", 1);
                d3.selectAll(".race-main-circle").style("opacity", 1);
                d3.selectAll(".led-arc").style("opacity", 1);
                d3.selectAll(".year-label").style("opacity", 1);
                d3.selectAll(".driver-pole").style("opacity", 1);
                d3.selectAll(".driver-fl").style("opacity", 1);
                d3.selectAll(".driver-led").style("opacity", 1);

                raceInFocus = undefined;
              }
            }
          },
          false
        );

        //Base circle
        // Dark background
        grid
          .append("circle")
          .attr("cx", size / 2)
          .attr("cy", size / 2)
          .attr("r", mainCircleRadius * 1.6)
          .attr("fill", (d) => colours.black)
          .attr("class", "race-backrgound-circle")
          .attr("stroke", "none");

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
              d.raceDetails.round === "1" && Math.floor(i / numPerRow) % 2 === 0
          )
          .append("rect")
          .attr("x", -size / 4)
          .attr("y", size / 2.3)
          .attr("width", size / 2)
          .attr("height", size / 6)
          .style("fill", colours.black);

        grid
          .filter(
            (d, i) =>
              d.raceDetails.round === "1" && Math.floor(i / numPerRow) % 2 != 0
          )
          .append("rect")
          .attr("x", size / 1.1)
          .attr("y", size / 2.3)
          .attr("width", size / 3)
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
          .attr("cx", size / 2)
          .attr("cy", size / 2)
          .attr("r", mainCircleRadius)
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

        // 1-2 Test
        // grid
        //   .append("circle")
        //   .attr("cx", size / 2 + 18)
        //   .attr("cy", size / 2 + 18)
        //   .attr("r", "2px")
        //   .attr("fill", (d) => {
        //     let racePositions = d.drivers.map((e) => e.position);

        //     return racePositions.includes("1") && racePositions.includes("2")
        //       ? "#d40000"
        //       : "black";
        //   })
        //   .attr("class", "race-circle")
        //   .attr("stroke", "none");

        // LAPS LED ARC
        let angleScale = d3
          .scaleLinear()
          .domain([0, 1])
          .range([-Math.PI / 2 + tiltAngle * (Math.PI / 180), 0]);
        console.log(angleScale(1));

        // Full lapsled arc
        // grid
        //   .append("g")
        //   .style("transform", `translate(${size / 2}px, ${size / 2}px)`)
        //   .attr("id", "arcTest")
        //   .append("path")
        //   .attr("d", (d) => arcTest(d))
        //   .attr("fill", "white")
        //   .attr("stroke", "none");

        // Laps led arc
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

        // driversGroup
        //   .append("circle")
        //   .attr("cx", 0)
        //   .attr("cy", 0)
        //   .attr("r", "3px")
        //   .attr("fill", "green");

        let driverStripWidth = 3;
        let driverStripDistance = 10;

        let innerDriversGroup = driversGroup
          .append("g")
          .attr("id", (d) => d.raceDetails.raceAbbrev)
          // .attr("transform", (d) => `translate(0, ${0})`)

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
        // .attr("fill", d=>{console.log(d.drivers.length * 8)})

        // innerDriversGroup
        // .append("circle")
        // .attr("cx", 0)
        // .attr("cy", 0)
        // .attr("r", "3px")
        // .attr("fill", "pink");

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

        let spacingVert = 20;

        //////// FORMATTING

        const toOrdinalSuffix = (num) => {
          const int = parseInt(num),
            digits = [int % 10, int % 100],
            ordinals = ["st", "nd", "rd", "th"],
            oPattern = [1, 2, 3, 4],
            tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
          return oPattern.includes(digits[0]) && !tPattern.includes(digits[1])
            ? int + ordinals[digits[0] - 1]
            : int + ordinals[3];
        };

        // Checking if in viewport
        var isInViewport = function (elem) {
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

        // d3.selectAll(".race").style("display", "none")

        //Make an SVG Container
        // var svgContainer = d3
        //   .select("body")
        //   .append("svg")
        //   .attr("width", 1000)
        //   .attr("height", 1000);

        // //Draw the line
        // var yearsLine = svgContainer
        //   .append("g")
        //   .selectAll("yearsLine")
        //   .data(d3.range(ferrariCompleteRaces.length / 30))
        //   .enter()
        //   .append("line")
        //   .attr("x1", 25)
        //   .attr("y1", (d, i) => i * spacingVert)
        //   .attr("x2", 975)
        //   .attr("y2", (d, i) => i * spacingVert)
        //   .attr("stroke-width", lineWidth)
        //   .attr("stroke", "black");

        // var arcGeneratorRight = d3
        //   .arc()
        //   .innerRadius(9)
        //   .outerRadius(11)
        //   .startAngle(0)
        //   .endAngle(Math.PI);

        // var arcGeneratorLeft = d3
        //   .arc()
        //   .innerRadius(9)
        //   .outerRadius(11)
        //   .startAngle(0)
        //   .endAngle(-Math.PI);

        // svgContainer
        //   .append("g")
        //   .attr("id", "second")
        //   .selectAll("path")
        //   .data(d3.range(ferrariCompleteRaces.length / 30 - 1))
        //   .enter()
        //   .append("path")
        //   .attr("d", (d, i) => {
        //     if (i % 2 != 0) {
        //       return arcGeneratorLeft(d);
        //     } else {
        //       return arcGeneratorRight(d);
        //     }
        //   })
        //   .attr("stroke-width", 2)
        //   .attr("stroke", "black")
        //   .style(
        //     "transform",
        //     (d, i) =>
        //       `translate(${i % 2 != 0 ? 25 : 975}px,  ${i * spacingVert + 10}px`
        //   );

        function handleStepEnter(r) {
          console.log("enter");
          console.log(r);
          // if (parseInt(r.element.id) === 211) {
          //   console.log("test1");
          // }
        }
        function handleStepExit(r) {
          console.log("exit");
          console.log(r);
          // console.log(parseInt(r.element.id));
          // console.log(raceInFocus);
          // if (parseInt(r.element.id) === 211) {
          //   console.log("tes2t");
          //   d3.select("#race-header").remove();
          // }
        }
        function handleResize() {}

        function init() {
          // 1. call a resize on load to update width/height/position of elements
          // handleResize();

          // 2. setup the scrollama instance
          // 3. bind scrollama event handlers (this can be chained like below)
          scroller
            .setup({
              step: ".race-step", // the step elements
              offset: 0.5, // set the trigger to be 1/2 way down screen
              debug: true, // display the trigger offset for testing
            })
            .onStepEnter(handleStepEnter)
            .onStepExit(handleStepExit);

          // setup resize event
          window.addEventListener("resize", handleResize);
        }
        init();
      });
    });
  });
});

// function type(d) {}

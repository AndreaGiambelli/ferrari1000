let ferrariRaces = [];
let allFerrariRaces;

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
            .filter((e) => e.constructorId === "6") // Filter for Ferrari drivers
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
            e.winnerLaps = winnerResult[0].laps;
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
          return item.drivers.length;
        }
        let yyy = ferrariRaces
          .filter(filterRaces)
          .sort((a, b) => +a.year - +b.year);
        yyy.forEach((d, i) => (d.raceIdFerrari = i + 1));
        console.log(yyy); // 994 races with Ferrari + 6 races in 2020 = 1000

        console.log(yyy);

        /// VIZ ///

        d3.select("body").style("background", "#0f0f0f");

        // Map Margins and dimensions
        var marginViz = { top: 30, right: 30, bottom: 30, left: 50 },
          widthViz = 1000 - marginViz.left - marginViz.right;

        let grid, timeline, scaleGrid;
        const numPerRow = 12;
        const size = (widthViz - marginViz.left) / numPerRow;
        let lineWidth = 4;

        // let heightViz = size * numPerRow - marginViz.top - marginViz.bottom;
        let heightViz = 10000;
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
          .data(d3.range(yyy.length / numPerRow))
          .enter()
          .append("rect")
          .attr("class", "yearsLine")
          .attr("x", size / 2 - 1)
          .attr("y", (d, i) => scaleGrid(i) + size / 2 - lineWidth / 2)
          .attr("width", size * numPerRow + 2)
          .attr("height", "4px")
          // .attr("x1", size/2)
          // .attr("y1", (d, i) => scaleGrid(i) + size / 2)
          // .attr("x2", size*numPerRow + size/2)
          // .attr("y2", (d, i) => scaleGrid(i) + size / 2)
          // .attr("stroke-width", lineWidth)
          // .attr("stroke", "white")
          .attr("fill", "#636363")
          .attr("stroke", "none");

        var arcGeneratorRight = d3
          .arc()
          .innerRadius(scaleGrid(0.5) - lineWidth / 2)
          .outerRadius(scaleGrid(0.5) + lineWidth / 2)
          .startAngle(0)
          .endAngle(Math.PI);

        console.log(scaleGrid(1));

        var arcGeneratorLeft = d3
          .arc()
          .innerRadius(scaleGrid(0.5) - lineWidth / 2)
          .outerRadius(scaleGrid(0.5) + lineWidth / 2)
          .startAngle(0)
          .endAngle(-Math.PI);

        svgViz
          .append("g")
          .attr("id", "second")
          .selectAll("path")
          .data(d3.range(yyy.length / numPerRow - 1))
          .enter()
          .append("path")
          .attr("d", (d, i) => {
            if (i % 2 != 0) {
              return arcGeneratorLeft(d);
            } else {
              return arcGeneratorRight(d);
            }
          })
          .attr("fill", "white")
          .attr("stroke", "none")
          .style(
            "transform",
            (d, i) =>
              `translate(${
                i % 2 != 0 ? size / 2 : size * numPerRow + size / 2
              }px,  ${scaleGrid(i + 0.5) + size / 2}px)`
          );

        grid = svgViz
          .selectAll(".race")
          .data(yyy)
          .enter()
          .append("g")
          .attr("class", "race")
          .attr("transform", function (d, i) {

            // Horizontal positioning
            
            // Regular: 
            // const n = i % numPerRow;

            // Backwards on odd rows
            let n;
            if (Math.floor(i / numPerRow) % 2 === 0) {
              n = i % numPerRow;
            } else {
              n = 12 - (i % numPerRow) - 1;
            }

            // Vertical positioning
            const m = Math.floor(i / numPerRow);

            //   console.log("xi: " + i + " " + numPerRow + " n: " + n + " xn: " + (12 - n))

            // Translating groups to grid position
            return `translate(${scaleGrid(n)}, ${scaleGrid(m)})`;
          });

        // Circles

        //Base circle

        console.log(size);

        // Dark background
        grid
          .append("circle")
          .attr("cx", size / 2)
          .attr("cy", size / 2)
          .attr("r", size / 2.2)
          .attr("fill", "#0f0f0f")
          .attr("class", "race-circle")
          .attr("stroke", "none");

        // Main circle
        grid
          .append("circle")
          .attr("cx", size / 2)
          .attr("cy", size / 2)
          .attr("r", size / 3.5)
          .attr("fill", (d) => {
            let racePositions = d.drivers.map((e) => e.position);
            return racePositions.includes("1")
              ? "#d40000"
              : racePositions.includes("2") || racePositions.includes("3")
              ? "#fff200"
              : racePositions.includes("4") ||
                racePositions.includes("5") ||
                racePositions.includes("6")
              ? "#ffb500"
              : "#383838";
          })
          .attr("class", "race-circle")
          .attr("stroke", "none");

        grid
          .append("circle")
          .attr("cx", size / 2)
          .attr("cy", size / 2)
          .attr("r", "3px")
          .attr("fill", (d) => {
            let racePositions = d.drivers.map((e) => e.grid);
            return racePositions.includes("1") ? "#fff200" : "grey";
          })
          .attr("class", "race-circle")
          .attr("stroke", "none");

        grid
          .append("circle")
          .attr("cx", size / 2 + 18)
          .attr("cy", size / 2 + 18)
          .attr("r", "2px")
          .attr("fill", (d) => {
            let racePositions = d.drivers.map((e) => e.position);

            return racePositions.includes("1") && racePositions.includes("2")
              ? "#d40000"
              : "black";
          })
          .attr("class", "race-circle")
          .attr("stroke", "none");

        var arcTest = d3
          .arc()
          .innerRadius(scaleGrid(0.35) - lineWidth / 4)
          .outerRadius(scaleGrid(0.35) + lineWidth / 4)
          .startAngle(-Math.PI / 2)
          .endAngle(0);

        // LAPS LED ARC

        let angleScale = d3
          .scaleLinear()
          .domain([0, 1])
          .range([-Math.PI / 2, 0]);
        console.log(angleScale(1));

        // Full white arc
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
          .attr("id", "arcTestValue")
          .append("path")
          .attr("d", (d) => {
            let sum = [];
            d.drivers.forEach((e) => sum.push(parseInt(e.lapsLed)));
            let sum2 = sum.reduce((a, b) => a + b, 0);

            let arcValue = d3
              .arc()
              .innerRadius(scaleGrid(0.35) - lineWidth / 4)
              .outerRadius(scaleGrid(0.35) + lineWidth / 4)
              .startAngle(-Math.PI / 2)
              .endAngle(angleScale(sum2 / parseInt(d.drivers[0].winnerLaps)));
            return arcValue(d);
          })
          .attr("fill", "white")
          .attr("stroke", "none");

        // Drivers strips
        grid
          .append("g")
          .attr("transform", "translate(-30, 10), rotate(-15)")
          .selectAll(".testRect")
          .data((d) => d.drivers)
          .enter()
          .append("rect")
          .attr("x", size / 2)
          .attr("y", (d, i) => size / 2 + 8 * i)
          .attr("width", (d) => {
            let lapsScale = d3
              .scaleLinear()
              .domain([0, 1])
              .range([0, size / 1.75]);
            return lapsScale(d.lapsCompleted);
          })
          .attr("height", "2")
          .attr("fill", "black");

        // Race label
        grid
          .append("text")
          .attr("x", size / 2)
          .attr("y", size)
          .style("font-size", "6px")
          .style("fill", "white")
          .style("text-anchor", "middle")
          .text((d) => d.raceDetails.raceAbbrev);

        let spacingVert = 20;

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
        //   .data(d3.range(yyy.length / 30))
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
        //   .data(d3.range(yyy.length / 30 - 1))
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
      });
    });
  });
});

// function type(d) {}

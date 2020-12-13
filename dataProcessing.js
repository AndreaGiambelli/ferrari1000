// Context variables

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


// Global variables
let ferrariRacesGood = [];
let winsMap = [];
let polesMap = [];
let flMap = [];
  
const hundredRaces = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

d3.csv("f1db_csv/races.csv").then(function (racesData) {
  racesData.forEach((r) => {
    ferrariRacesGood.push({
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
    ferrariRacesGood.forEach((d) => {
      d.circuitName = circuitsData.find(
        (e) => e.circuitId === d.raceDetails.circuitId
      );
    });

    d3.csv("f1db_csv/results_modified.csv").then(function (resultsData) {
      d3.csv("f1db_csv/drivers.csv").then(function (driversData) {
        ferrariRacesGood.forEach((d) => {
            let drivers = resultsData
              .filter((e) => e.raceId === d.raceIdOverall) // Find corresponding race result
              .filter((e) => e.constructorId === "6") // Filter for Ferrari cars
              .filter((e) => !privateers.includes(e.driver) || (e.driver === "whitehead" && d.year === "1950")) // Filter for Ferrari works drivers
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
  
          ferrariRacesGood.forEach((d, i) => {
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
          let ferrariCompleteRaces = ferrariRacesGood
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
        console.log(ferrariCompleteRaces); 
      });
    });
  });
});

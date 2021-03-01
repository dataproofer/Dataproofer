var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");
var voidLngLat = new DataprooferTest();

/**
 * Verify that columns assumed to contain longitude or latitudes have non-zero values.
 * These are values at 0º,0º.
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
voidLngLat
  .name("Void coordinates")
  .description(
    "Check for non-existent longitude and latitude values in columns presumed to contain geographic coordinates"
  )
  .methodology(function (rows, columnHeads) {
    // Search for columns that could have longitude and/or latitude values
    var potentialDoubleCoordinates = [
      "latlon",
      "latitude/longitude",
      "longitude/latitude",
      "lonlat",
      "lnglat",
    ];

    var potentialLats = ["latitude", "lat"];

    var potentialLons = ["longitude", "lng", "lon", "long"];

    // keep track of the columns which match our criteria
    var doubleColumns = [];
    var latColumns = [];
    var lonColumns = [];
    // NOTE: in the future the selectedColumns might override this
    columnHeads.forEach(function (column) {
      var lower = column.toLowerCase();
      if (potentialDoubleCoordinates.indexOf(lower) >= 0) {
        doubleColumns.push(column);
      } else if (
        potentialLats.indexOf(lower) >= 0 ||
        lower.indexOf("latitude") >= 0
      ) {
        latColumns.push(column);
      } else if (
        potentialLons.indexOf(lower) >= 0 ||
        lower.indexOf("longitude") >= 0
      ) {
        lonColumns.push(column);
      }
    });

    var voidCoords = {};
    columnHeads.forEach(function (column) {
      voidCoords[column] = 0;
    });
    var cellsToHighlight = [];
    var testState = "passed";
    if (latColumns.length || lonColumns.length || doubleColumns.length) {
      rows.forEach(function (row) {
        var highlightRow = {};
        columnHeads.forEach(function (column) {
          highlightRow[column] = 0;
        });
        doubleColumns.forEach(function (column) {
          var cell = row[column];
          if (typeof cell === "string") {
            var coords = cell.split(",");
            var num1 = parseFloat(coords[0]);
            var num2 = parseFloat(coords[1]);
            if (num1 === 0 && num2 === 0) {
              // null island
              testState = "failed";
              voidCoords[column] += 1;
              highlightRow[column] = 1;
            } else {
              highlightRow[column] = 0;
            }
          } else {
            // this isn't in a format we recognize
            testState = "failed";
            voidCoords[column] += 1;
            highlightRow[column] = 1;
          }
        });
        // we want to know if both columns are zero to detect null island
        var zeros = {
          lat: false,
          lon: false,
        };
        // checks a single column (either lat or lon)
        // we break it out into this function so we can iterate over
        // the columns which are suspected to be lat/lon
        function checkColumn(column, latlon) {
          var cell = row[column];
          if (util.isEmpty(cell)) {
            // if the cell is empty its definitely not a valid lat/lon
            testState = "failed";
            voidCoords[column] += 1;
            highlightRow[column] = 1;
          } else if (util.isNumeric(cell)) {
            // if the cell has a numeric value, we check to make sure its in the valid range
            var num = parseFloat(cell);
            if (num === 0) {
              zeros[latlon] = column;
            }
            highlightRow[column] = 0;
          } else {
            // this test could be overly aggressive if we wrongly guess
            // that a column contains lat/lon by name only
            testState = "failed";
            voidCoords[column] += 1;
            highlightRow[column] = 1;
            //highlightRow[column] = 0;
          }
        }
        lonColumns.forEach(function (column) {
          checkColumn(column, "lon");
        });
        latColumns.forEach(function (column) {
          checkColumn(column, "lat");
        });
        if (zeros.lon && zeros.lat) {
          testState = "failed";
          voidCoords[zeros.lon] += 1;
          voidCoords[zeros.lat] += 1;
          highlightRow[zeros.lon] = 1;
          highlightRow[zeros.lat] = 1;
        }
        cellsToHighlight.push(highlightRow);
      });
    }

    var result = {
      testState: testState,
      highlightCells: cellsToHighlight,
    };
    return result;
  })
  .conclusion(function (result) {
    var conclusionStr =
      'You have latitudes and longitudes that are "0,0" - which is the ocean off west Africa. This is likely a mistake.<br>';
    var columns = Object.keys(result.columnWise);
    columns.forEach(function (column) {
      // Column foo:
      var currCount = result.columnWise[column];
      if (currCount > 0) {
        conclusionStr += 'column "' + column + '": ';
        conclusionStr += result.columnWise[column] + " cells, ";
        conclusionStr += util.percent(
          result.columnWise[column] / result.highlightCells.length
        );
        conclusionStr += "<br>";
      }
    });
    return conclusionStr;
  });

module.exports = voidLngLat;

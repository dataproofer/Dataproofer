var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");
var columnsContainsSpecialChars = new DataprooferTest();

/**
 * Calculates the percentage of rows that contain special, non-typical Latin characters for each column
 * Source: http://www.w3schools.com/charsets/ref_html_utf8.asp
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
columnsContainsSpecialChars
  .name("Special Letters & Characters")
  .description(
    "Determine which cells contain wingdings, boxes, or accented characters. These can cause errors with some visualization & analysis tools."
  )
  .methodology(function (rows, columnHeads) {
    var testState = "passed";
    // we will want to mark cells to be highlighted here
    var cellsToHighlight = [];

    function containsSpecialChar(str) {
      var result = false;
      // look for characters outside typical Latin
      // character codes
      // http://www.w3schools.com/charsets/ref_html_utf8.asp
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 127) result = true;
      }
      return result;
    }
    // look through the rows
    rows.forEach(function (row) {
      // we make a row to keep track of cells we want to highlight
      var currentRow = {};
      columnHeads.forEach(function (columnHead) {
        var cell = row[columnHead];
        if (util.isString(cell) && containsSpecialChar(cell)) {
          currentRow[columnHead] = 1;
          testState = "warn";
        } else {
          currentRow[columnHead] = 0;
        }
      });
      // push our marking row onto our cells array
      cellsToHighlight.push(currentRow);
    });
    var result = {
      testState: testState,
      highlightCells: cellsToHighlight,
    };
    return result;
  })
  .conclusion(function (result) {
    var conclusionStr = "";
    var columns = Object.keys(result.columnWise);
    columns.forEach(function (column) {
      // generate result string
      var currCount = result.columnWise[column];
      if (currCount > 0) {
        conclusionStr += column + ": ";
        conclusionStr += result.columnWise[column] + " cells, ";
        conclusionStr += util.percent(
          result.columnWise[column] / result.highlightCells.length
        );
        conclusionStr += " of column <br>";
      }
    });
    return conclusionStr;
  });

module.exports = columnsContainsSpecialChars;

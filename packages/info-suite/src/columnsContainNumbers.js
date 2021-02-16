var _ = require("lodash");
var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");

var columnsContainNumbers = new DataprooferTest();

/**
 * Determine the percentage of rows that are numbers for each column
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
columnsContainNumbers
  .name("Numeric cells")
  .description(
    "Determine the percentage of rows that are numbers for each column"
  )
  .methodology(function (rows, columnHeads) {
    var numbers = {};
    var testState = "info";
    columnHeads.forEach(function (columnHead) {
      numbers[columnHead] = 0;
    });
    var cellsToHighlight = []; // we will want to mark cells to be highlighted here
    // look through the rows
    rows.forEach(function (row) {
      // we make a row to keep track of cells we want to highlight
      var currentRow = {};
      columnHeads.forEach(function (columnHead) {
        var cell = row[columnHead];
        var strippedCell = util.stripNumeric(cell);
        // this will only be true if the cell is a number
        if (util.isNumeric(strippedCell)) {
          numbers[columnHead] += 1;
          currentRow[columnHead] = 1;
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
    var columns = _.keys(result.columnWise);
    columns.forEach(function (column) {
      // Column foo:
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

module.exports = columnsContainNumbers;

var _ = require("lodash");
var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");

var columnsContainStrings = new DataprooferTest();

/**
 * Determine the percentage of rows that are strings for each column
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
columnsContainStrings
  .name("String cells")
  .description(
    "Determine the percentage of rows that are strings for each column"
  )
  .methodology(function (rows, columnHeads) {
    var strings = {};
    var testState = "info";
    columnHeads.forEach(function (columnHead) {
      strings[columnHead] = 0;
    });
    var cellsToHighlight = []; // we will want to mark cells to be highlighted here
    // look through the rows
    rows.forEach(function (row) {
      // we make a row to keep track of cells we want to highlight
      var currentRow = {};
      columnHeads.forEach(function (columnHead) {
        var cell = row[columnHead];
        var strippedCell = cell;
        // first we check to make sure the string isn't a number, and then if its a string
        // this is because data always comes as a string from the spreadsheet
        if (
          !util.isNumeric(util.stripNumeric(strippedCell)) &&
          // TODO: check for date when we get it
          util.isString(strippedCell)
        ) {
          strings[columnHead] += 1;
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

module.exports = columnsContainStrings;

var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");
var maxInteger = new DataprooferTest();

/**
 * Indicates a integer at its upper signed limit is 2,147,483,647 (MySQL or PostgreSQL) or its upper unsigned limit (MySQL) of 4,294,967,295.
 * Common database programs, like MySQL, have a cap on how big of a number it can save.
 * Please see the [MySQL documentation](https://dev.mysql.com/doc/refman/5.7/en/integer-types.html) for more information.
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
maxInteger
  .name("Integer at its SQL upper limit")
  .description(
    "If a column contains numbers, make sure it's not 2,147,483,647 or 4,294,967,295. Common database programs like like MySQL and PostgreSQL limit to the size of numbers it can calculate."
  )
  .conclusion(
    "It's possible this data was exported from SQL improperly. Consult your source."
  )
  .methodology(function (rows, columnHeads) {
    var testState = "passed";
    var maxInts = {};
    columnHeads.forEach(function (columnHead) {
      maxInts[columnHead] = 0;
    });
    // we will want to mark cells to be highlighted here
    var cellsToHighlight = [];
    // look through the rows
    rows.forEach(function (row) {
      // we make a row to keep track of cells we want to highlight
      var currentRow = {};
      columnHeads.forEach(function (columnHead) {
        var cell = row[columnHead];
        var strippedCell = util.stripNumeric(cell);
        var f = parseFloat(strippedCell);
        // this will only be true if the cell is a number
        if (typeof f === "number" && (f === 2147483647 || f === 4294967295)) {
          maxInts[columnHead] += 1;
          currentRow[columnHead] = 1;
          testState = "failed";
        } else {
          currentRow[columnHead] = 0;
        }
      });
      // push our marking row onto our cells array
      cellsToHighlight.push(currentRow);
    });
    var result = {
      testState: testState,
      highlightCells: cellsToHighlight, // a mirror of the dataset, but with a 1 or 0 for each cell if it should be highlighted or not
    };
    return result;
  });

module.exports = maxInteger;

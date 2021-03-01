var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");
var maxBigInteger = new DataprooferTest();

/**
 * Indicates an `bigint` at its upper signed limit (MySQL or PostgreSQL) of 9,223,372,036,854,775,807 or its upper unsigned limit (MySQL) of 18,446,744,073,709,551,616.
 * Common database programs, like MySQL, have a cap on how big of a number it can save.
 * Please see the [MySQL documentation](https://dev.mysql.com/doc/refman/5.7/en/integer-types.html) or [PostgreSQL documentation](http://www.postgresql.org/docs/9.5/interactive/datatype-numeric.html) for more information.
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
maxBigInteger
  .name("Big integer at its SQL upper limit")
  .description(
    "If a column contains numbers, make sure it's not 9,223,372,036,854,775,807 or 18,446,744,073,709,551,616. Common database programs like MySQL and PostgreSQL limit to the size of numbers it can store."
  )
  .conclusion(
    "It's possible this data was exported from SQL improperly. Consult your source."
  )
  .methodology(function (rows, columnHeads) {
    var maxBigInts = {};
    columnHeads.forEach(function (columnHead) {
      maxBigInts[columnHead] = 0;
    });
    // we will want to mark cells to be highlighted here
    var cellsToHighlight = [];
    var testState = "passed";
    // look through the rows
    rows.forEach(function (row) {
      // we make a row to keep track of cells we want to highlight
      var currentRow = {};
      columnHeads.forEach(function (columnHead) {
        var cell = row[columnHead];
        var strippedCell = util.stripNumeric(cell);
        var f = parseFloat(strippedCell);
        // this will only be true if the cell is a number
        if (
          typeof f === "number" &&
          (f === 9223372036854775807 || f === 18446744073709551615)
        ) {
          maxBigInts[columnHead] += 1;
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

module.exports = maxBigInteger;

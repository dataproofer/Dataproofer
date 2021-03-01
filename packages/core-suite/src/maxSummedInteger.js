var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");
var maxSummedInteger = new DataprooferTest();

/**
 * Indicates a summed integers at its upper limit of 2,097,152.
 * Please see the [Integrity Checks](https://github.com/propublica/guides/blob/master/data-bulletproofing.md#integrity-checks-for-every-data-set) section of the ProPublica [Data Bulletproofing Guide](https://github.com/propublica/guides/blob/master/data-bulletproofing.md) for more information.
 *
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
maxSummedInteger
  .name("Summed integer at its upper limit")
  .description(
    "If a column contains numbers, make sure it's not 2,097,152. Common database programs like MySQL limit to the size of numbers it can calculate."
  )
  .conclusion(
    "It's possible this data was exported from SQL improperly. Consult your source."
  )
  .methodology(function (rows, columnHeads) {
    var testState = "passed";
    var maxSummedInts = {};
    columnHeads.forEach(function (columnHead) {
      maxSummedInts[columnHead] = 0;
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
        if (typeof f === "number" && f === 2097152) {
          maxSummedInts[columnHead] += 1;
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

module.exports = maxSummedInteger;

var DataprooferTest = require("dataproofertest-js");
var stringsHaveExactly255Characters = new DataprooferTest();

/**
 * Determine the cells that have exactly 255 characters (SQL upper limit error). See ProPublica's bad data guide for further information
 * https://github.com/propublica/guides/blob/master/data-bulletproofing.md#integrity-checks-for-every-data-set
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
stringsHaveExactly255Characters
  .name("Words at their character limit")
  .description(
    "Determine the cells that have exactly 255 characters. Database programs like SQL have a limit to the length of words it can output."
  )
  .conclusion(
    "Strings that are exactly 255 characters are suspicious because it could be an export problem. Double-check with your source that you have all the data."
  )
  .methodology(function (rows, columnHeads) {
    var testState = "passed";
    var strings = {};
    columnHeads.forEach(function (columnHead) {
      strings[columnHead] = 0;
    });
    var cellsToHighlight = []; // we will want to mark cells to be highlighted here
    var has255 = false;
    // look through the rows
    rows.forEach(function (row) {
      var currentRow = {}; // we make a row to keep track of cells we want to highlight
      columnHeads.forEach(function (columnHead) {
        var cell = row[columnHead];
        if (cell && cell.length === 255) {
          currentRow[columnHead] = 1;
          strings[columnHead] += 1;
          has255 = true; // we want to know if it occurrs at least once
        } else {
          currentRow[columnHead] = 0;
        }
      });
      cellsToHighlight.push(currentRow); // push our marking row onto our cells array
    });

    if (has255) testState = "failed";

    var result = {
      testState: testState,
      highlightCells: cellsToHighlight, // a mirror of the dataset, but with a 1 or 0 for each cell if it should be highlighted or not
    };
    return result;
  });

module.exports = stringsHaveExactly255Characters;

var DataprooferTest = require("dataproofertest-js");
var numberOfRowsIs65k = new DataprooferTest();

/**
 * Test to see if number of rows is exactly 65,536 rows (cutoff by Excel)
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
numberOfRowsIs65k
  .name("Potentially missing rows")
  .description(
    "Test to see if number of rows is exactly 65,536 rows (cutoff by Excel)"
  )
  .conclusion(
    "This dataset has exactly 65,536 rows, which is an export cutoff in Excel. Double-check with your source that you have all the data."
  )
  .methodology(function (rows, columnHeads) {
    var testState = "passed";
    if (rows.length === 65536) {
      testState = "failed";
    }
    var result = {
      testState: testState,
    };
    return result;
  });

module.exports = numberOfRowsIs65k;

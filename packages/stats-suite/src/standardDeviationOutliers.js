var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");
var ss = require("simple-statistics");
var _ = require("lodash");
var standardDeviationOutliers = new DataprooferTest();

/**
 * Outlier detection using [standard deviation](https://en.wikipedia.org/wiki/standard_deviation)
 * Examples in comparison with median absolute deviations:
 * * [simple-statistics.js](http://simplestatistics.org/docs/#samplestandarddeviation)
 * * [agate.py](http://agate-stats.readthedocs.org/en/0.3.1/index.html)
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
standardDeviationOutliers
  .name("Outliers from the mean")
  .description(
    "Outliers are numbers more than three standard deviations from the mean. <i>Note: this is a less robust test and may miss potential outliers.</i>"
  )
  .methodology(function (rows, columnHeads) {
    var outliersCount = 0;
    var testState = "info";
    var deviations = 3;
    var columnsAsArraysObj = {};
    // we will count number of numeric + empty cells to see if a column is
    // predominantly numeric. We wont count empty cells in outliers calculation
    var columnsNumericCount = {};
    var columnsEmptyCount = {};
    var columnsOutliersCount = {};

    // we will want to keep track of columns which have a standard deviation of 0, which indicates
    // most elements are the same (and results in bad distance calculation)
    var stdDevZeroColumns = [];

    // convert rows to columns to calculate the deviation
    _.each(columnHeads, function (columnHead) {
      columnsAsArraysObj[columnHead] = [];
      columnsNumericCount[columnHead] = 0;
      columnsEmptyCount[columnHead] = 0;
      columnsOutliersCount[columnHead] = 0;
    });

    var cellsToHighlight = [];
    // add values from selected columns' cells row by row to the new columns objects
    _.each(rows, function (row, rowIndex) {
      var cellsRow = {};
      _.each(columnHeads, function (currColumn) {
        cellsRow[currColumn] = 0;
        var value = util.stripNumeric(row[currColumn]);
        if (util.isNumeric(value)) {
          columnsAsArraysObj[currColumn].push(parseFloat(value));
          columnsNumericCount[currColumn]++;
        } else if (util.isEmpty(row[currColumn])) {
          columnsEmptyCount[currColumn]++;
        }
      });
      cellsToHighlight.push(cellsRow);
    });

    // examples in comparison with MAD:
    // * http://simplestatistics.org/docs/#samplestandarddeviation
    // * http://agate-stats.readthedocs.org/en/0.3.1/index.html
    _.each(columnHeads, function (columnHead) {
      // we qualify a column for analysis if it is "mostly" numeric
      // we add # of empty rows to this count
      var numeric = columnsNumericCount[columnHead];
      var empty = columnsEmptyCount[columnHead];
      var ratio = (numeric + empty) / rows.length;
      if (ratio < 0.9) {
        return;
      }
      var currentColumn = columnsAsArraysObj[columnHead];
      var mean = ss.mean(currentColumn);
      var stdDev = ss.sampleStandardDeviation(currentColumn);
      //  if stdDev == 0 we have a lot of identical values and should let the user know
      if (stdDev === 0) {
        stdDevZeroColumns.push(columnHead);
        return;
      }
      _.each(rows, function (row, rowIndex) {
        var value = util.stripNumeric(row[columnHead]);
        if (util.isNumeric(value)) {
          var dist = Math.abs(value - mean) / stdDev;
          if (dist > deviations) {
            // we found an outlier
            columnsOutliersCount[columnHead]++;
            // eslint-disable-next-line no-unused-vars
            outliersCount++;
            cellsToHighlight[rowIndex][columnHead] = 1;
            // TODO: save highlight cells
          }
        }
      });
    });

    // testState = (outliersCount > 0)? false : true;

    return {
      testState: testState,
      highlightCells: cellsToHighlight,
    };
  })
  .conclusion(function (result) {
    var conclusionStr = "";
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

module.exports = standardDeviationOutliers;

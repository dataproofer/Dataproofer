var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");
var ss = require("simple-statistics");
var _ = require("lodash");
var medianAbsoluteDeviationOutliers = new DataprooferTest();

/**
 * Outlier detection using [median absolute deviation](https://en.wikipedia.org/wiki/Median_absolute_deviation)
 * Examples in comparison with standard deviation:
 * * [simple-statistics.js](http://simplestatistics.org/docs/#mad)
 * * [agate.py](http://agate-stats.readthedocs.org/en/0.3.1/index.html)
 *
 * @param  {Array} rows - an array of objects representing rows in the spreadsheet
 * @param  {Array} columnHeads - an array of strings for column names of the spreadsheet
 * @return {Object} describing the result
 */
medianAbsoluteDeviationOutliers
  .name("Outliers from the median")
  .description(
    "Outliers are numbers more than three median absolute deviations from the median. <i>Note: this is a more robust test for detecting potential outliers.</i>"
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

    // we will want to keep track of columns which have a mad of 0, which indicates
    // most elements are the same (and results in bad distance calculation)
    var madZeroColumns = [];

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

    // Tutorial for detecting outliers with MAD
    // * http://eurekastatistics.com/using-the-median-absolute-deviation-to-find-outliers
    // for more, see the following:
    // * https://en.wikipedia.org/wiki/Median_absolute_deviation
    // examples in comparison with standard deviation:
    // * http://simplestatistics.org/docs/#mad
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
      var median = ss.median(currentColumn);
      var mad = ss.mad(currentColumn);
      //  if mad == 0 we have a lot of identical values and should let the user know
      if (mad === 0) {
        madZeroColumns.push(columnHead);
        return;
      }
      _.each(rows, function (row, rowIndex) {
        var value = util.stripNumeric(row[columnHead]);
        if (util.isNumeric(value)) {
          var dist = Math.abs(value - median) / mad;
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

    // testState = (outliersCount > 0)? "info" : "fail";

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

module.exports = medianAbsoluteDeviationOutliers;

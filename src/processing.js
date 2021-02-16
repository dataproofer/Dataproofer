const path = require("path");
const _ = require("lodash");
const d3 = require("d3");
const xlsx = require("xlsx");
const io = require("indian-ocean");
const DataprooferTest = require("dataproofertest-js");
const util = require("dataproofertest-js/util");

var Processor = function () {
  return this;
};

Processor.prototype = {
  sampleRows: function (rows, sampleOpts, currFilepath) {
    var self = this,
      sampleMin = sampleOpts.sampleMin,
      sampleMax = sampleOpts.sampleMax,
      sampleRatio = sampleOpts.sampleRatio,
      totalRows = rows.length;

    var sampleSize = Math.round(sampleRatio * totalRows);
    if (sampleSize < 1000 && totalRows < 1000) {
      // test all the rows if there's less than a thousand in total
      sampleSize = totalRows;
    } else if (sampleMin) {
      sampleSize = sampleMin;
    } else if (sampleMax) {
      sampleSize = sampleMax;
    }

    var currRemainingRows, sampledRows;
    if (self.remainingRows && self.filepath === currFilepath) {
      currRemainingRows = self.remainingRows;
    } else {
      self.filepath = currFilepath;
      currRemainingRows = self.remainingRows = rows;
    }
    sampledRows = currRemainingRows.slice(0, sampleSize);
    self.sampleProgress = sampledRows.length / currRemainingRows.length;
    self.remainingRows = currRemainingRows.slice(
      sampleSize,
      currRemainingRows.length
    );
    self.sampledRows = sampledRows;
    self.totalRows = totalRows;
    // console.log("full sampleSize", sampleSize);
    // console.log("sampleSize processor", self);
    return self;
  },

  load: function (config) {
    var self = this,
      filepath = path.resolve(config.filepath),
      ext = config.ext,
      // user can optionally pass in rows and columnHeads already parsed
      rows = config.rows,
      columnHeads = config.columnHeads,
      // user can change sample sizes in the CLI
      sampleMin = config.sampleOpts.sampleMin,
      sampleMax = config.sampleOpts.sampleMax,
      sampleRatio = config.sampleOpts.sampleRatio;
    var sampleOpts = {
      sampleRatio: sampleRatio,
      sampleMin: sampleMin,
      sampleMax: sampleMax,
    };

    if (ext) {
      // Parse the csv with d3
      var nonExcelExtensions = ["csv", "tsv", "psv"];
      var excelExtensions = ["xlsx", "xls"];
      if (nonExcelExtensions.indexOf(ext) > -1) {
        rows = io.readDataSync(filepath);
      } else if (excelExtensions.indexOf(ext) > -1) {
        var sheets = xlsx.readFile(filepath).Sheets;
        var firstSheetName = Object.keys(sheets)[0];
        var excelCsvRows = xlsx.utils.sheet_to_csv(sheets[firstSheetName]);
        rows = d3.csvParse(excelCsvRows);
      } else {
        rows = [];
      }
    }
    if (!columnHeads || !columnHeads.length) {
      columnHeads = Object.keys(rows[0]);
    }

    // TODO: use webworkers or something so we don't need an upper limit
    // for now, use sampling
    var sampleConfig = self.sampleRows(rows, sampleOpts, filepath);
    var { sampledRows, totalRows, sampleProgress } = sampleConfig;
    return {
      rows: sampledRows,
      totalRows: totalRows,
      sampleProgress: sampleProgress,
      columnHeads: columnHeads,
      config: config,
    };
  },

  run: function (config) {
    var suites = config.suites;
    var Renderer = config.renderer;
    var input = config.input;

    var loaded = config.loaded;

    var columnHeads = loaded.columnHeads;
    var rows = loaded.rows;
    var sampleProgress = loaded.sampleProgress;
    var totalRows = loaded.totalRows;
    // Initialize the renderer
    var renderer = new Renderer({
      filename: loaded.filename,
      suites: suites,
      columnHeads: columnHeads,
      rows: rows,
      sampleProgress: sampleProgress,
      totalRows: totalRows,
    });

    var badColumnHeadsTest = new DataprooferTest()
      .name("Missing or duplicate column headers")
      .description("Check for errors in the header of the spreadsheet")
      .methodology(function (rows, columnHeads) {
        var badHeaderCount = 0;
        var badColumnHeads = [];
        var testState = "passed";

        columnHeads.forEach(function (columnHead, counts) {
          if (counts[columnHead] || util.isEmpty(columnHead)) {
            var subColumnHead = "Column " + counts;
            badColumnHeads.push(subColumnHead);
            badHeaderCount += 1;
          } else {
            counts[columnHead] = 0;
          }
          return counts;
        }, {});

        if (badHeaderCount > 0) testState = "failed";

        var result = {
          testState: testState,
          badColumnHeads: badColumnHeads,
        };
        return result;
      });
    badColumnHeadsTest.active = true;

    var result = badColumnHeadsTest.proof(rows, columnHeads);
    renderer.addResult("dataproofer-info-suite", badColumnHeadsTest, result);

    var cleanedColumnHeads = _.without(
      columnHeads,
      result.badColumnHeads.join(", ")
    );
    var cleanedRows = rows;

    var testsNestArr = suites.map(function (suite) {
      var suiteTestsArr = suite.tests.map(function (test) {
        test.suiteName = suite.name;
        return test;
      });
      return suiteTestsArr;
    });
    // do a shallow flatten to get an array of tests
    var testsFlatArr = _.flatten(testsNestArr);
    var testPromisesArr = testsFlatArr
      .filter(function (test) {
        // run tests flagged test.active === true
        return test.active === true;
      })
      .map(function (test) {
        var testPromise = new Promise(function (resolve) {
          var result = test.proof(cleanedRows, cleanedColumnHeads, input);
          resolve(result);
        });
        testPromise.then(function (result) {
          // aggregate the number of highlighted cells for each column
          result.columnWise = {};
          if (result && result.highlightCells) {
            cleanedColumnHeads.forEach(function (column) {
              result.columnWise[column] = result.highlightCells.reduce(
                function (count, row) {
                  // if there is a value in this cell, increment count, otherwise leave it alone
                  return row[column] ? count + 1 : count;
                },
                0
              );
            });
          }
          // call the test's conclusion function, if any
          test.conclusion(result);
          // incrementally report as tests run
          renderer.addResult(test.suiteName, test, result);
          return renderer;
        });
        testPromise.catch(function (reason) {
          renderer.addError(test.suiteName, test, reason);
        });
        return testPromise;
      });
    var testsPromise = Promise.all(testPromisesArr).then(
      function (values) {
        renderer.done();
        return renderer;
      },
      function (reason) {
        console.error("Tests failed! Reason: ", reason); // Error!
      }
    );
    return testsPromise;
  },
};

module.exports = Processor;

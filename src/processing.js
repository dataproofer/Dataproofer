var _ = require("lodash");
var d3 = require("d3");
var xlsx = require("xlsx");
var indianOcean = require("indian-ocean");
var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");

var Processor = {
  sampleRows: function(rows, sampleOpts, currFilepath) {
    var self = this,
      sampleMin = sampleOpts.sampleMin,
      sampleMax = sampleOpts.sampleMax,
      sampleRatio = sampleOpts.sampleRatio,
      totalRows = rows.length;

    var sampleSize = sampleRatio * totalRows;
    console.log("sampleRatio", sampleRatio)
    console.log("totalRows", totalRows)
    console.log("possible sampleSize", sampleSize)
    if (sampleSize < sampleMin && totalRows < sampleMin) {
      // test all the rows if there's less than a thousand in total
      sampleSize = totalRows;
    } else if (sampleSize < sampleMin) {
      // test at least 1000 rows
      sampleSize = sampleMin;
    } else if (sampleSize > sampleMax) {
      // test at most 10,000 rows
      sampleSize = sampleMax;
    } else {
      // otherwise, sample rows
      sampleSize = sampleSize;
    }

    var currRemainingRows, sampledRows;
    if (self.remainingRows && self.filepath === currFilepath) {
      currRemainingRows = self.remainingRows;
    } else {
      self.filepath = currFilepath;
      currRemainingRows = self.remainingRows = rows;
    }
    sampledRows = currRemainingRows.slice(0, sampleSize);
    self.sampleProgress = ( sampledRows.length / currRemainingRows.length );
    self.remainingRows = currRemainingRows;
    self.sampledRows = sampledRows;
    self.totalRows = totalRows;
    console.log("full sampleSize", sampleSize);
    console.log("sampleSize processor", self);
    return self;
  },

  load: function(config) {
    var filepath = config.filepath,
      ext = config.ext,
      // user can optionally pass in rows and columnHeads already parsed
      rows = config.rows,
      columnHeads = config.columnHeads,
      // user can change sample sizes in the CLI
      sampleMin = config.sampleOpts.sampleMin || 1000,
      sampleMax = config.sampleOpts.sampleMax || 10000,
      sampleRatio = config.sampleOpts.sampleRatio || 0.25;
    var sampleOpts = {
      sampleRatio: sampleRatio,
      sampleMin: sampleMin,
      sampleMax: sampleMax
    };

    if(!rows && ext) {
      // Parse the csv with d3
      var nonExcelExtensions = [
        "csv",
        "tsv",
        "psv"
      ];
      var excelExtensions = [
        "xlsx",
        "xls"
      ];
      if (nonExcelExtensions.indexOf(ext) > -1) {
        rows = indianOcean.readDataSync(filepath);
      } else if (excelExtensions.indexOf(ext) > -1) {
        var sheets = xlsx.readFile(filepath).Sheets;
        var firstSheetName = _.keys(sheets)[0];
        var excelCsvRows = xlsx.utils.sheet_to_csv(sheets[firstSheetName]);
        rows = d3.csvParse(excelCsvRows);
      } else {
        rows = [];
      }
    }
    if(!columnHeads || !columnHeads.length) {
      columnHeads = Object.keys(rows[0]);
    }

    // TODO: use webworkers or something so we don't need an upper limit
    // for now, use sampling
    var sampleConfig = Processor.sampleRows(rows, sampleOpts, filepath);
    var { sampledRows, totalRows, sampleProgress } = sampleConfig;
    return {
      rows: sampledRows,
      totalRows: totalRows,
      sampleProgress: sampleProgress,
      columnHeads: columnHeads,
      config: config
    };
  },

  run: function(config) {
    var suites = config.suites;
    var Renderer = config.renderer;
    var input = config.input;

    var loaded = config.loaded;

    var columnHeads = loaded.columnHeads;
    var rows = loaded.rows;

    // Initialize the renderer
    var renderer = new Renderer({
      filename: loaded.filename,
      suites: suites,
      columnHeads: columnHeads,
      rows: rows
    });

    var badColumnHeadsTest = new DataprooferTest()
      .name("Missing or duplicate column headers")
      .description("Check for errors in the header of the spreadsheet")
      .methodology(function(rows, columnHeads) {
        //console.log("checking column headers", columnHeads.length);
        var badHeaderCount = 0;
        var badColumnHeads = [];
        var testState = "passed";

        _.forEach(columnHeads, function(columnHead, counts) {
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
          badColumnHeads: badColumnHeads
        };
        return result;
      });
    badColumnHeadsTest.active = true;

    var result = badColumnHeadsTest.proof(rows, columnHeads);
    renderer.addResult("dataproofer-info-suite", badColumnHeadsTest, result);

    var cleanedColumnHeads = _.without(columnHeads, result.badColumnHeads.join(", "));
    var cleanedRows = rows;

    var testsNestArr = suites.map(function(suite) {
      var suiteTestsArr = suite.tests.map(function(test) {
        test.suiteName = suite.name;
        return test;
      });
      return suiteTestsArr;
    });
    // do a shallow flatten to get an array of tests
    var testsFlatArr = _.flatten(testsNestArr);
    var testPromisesArr = testsFlatArr
      .filter(function(test) {
        // run tests flagged test.active === true
        return test.active === true;
      })
      .map(function(test) {
        var testPromise = new Promise(function(resolve, reject) {
          var result = test.proof(cleanedRows, cleanedColumnHeads, input);
          resolve(result)
        });
        testPromise.then(function(result) {
          // aggregate the number of highlighted cells for each column
          result.columnWise = {};
          if(result && result.highlightCells) {
            cleanedColumnHeads.forEach(function(column) {
              result.columnWise[column] = result.highlightCells.reduce(function(count, row) {
                // if there is a value in this cell, increment count, otherwise leave it alone
                return !!row[column] ? count + 1 : count;
              }, 0);
            });
          }
          // call the test's conclusion function, if any
          test.conclusion(result)
          // incrementally report as tests run
          renderer.addResult(test.suiteName, test, result);
          return renderer;
        });
        testPromise.catch(function(reason) {
          renderer.addError(test.suiteName, test, reason);
        });
        return testPromise;
      });
    var testsPromise = Promise.all(testPromisesArr)
      .then(function(values) {
        renderer.done();
        return renderer;
      }, function(reason) {
        console.log('reason', reason); // Error!
      });
    return testsPromise;
  }
};

exports.load = Processor.load;
exports.run = Processor.run;

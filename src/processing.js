var _ = require("lodash");
var d3 = require("d3");
var xlsx = require("xlsx");
var indianOcean = require("indian-ocean");
var DataprooferTest = require("dataproofertest-js");
var util = require("dataproofertest-js/util");

exports.load = function(config) {
  var filepath = config.filepath;
  var ext = config.ext;

  // user can optionally pass in rows and columnHeads already parsed
  var rows = config.rows;
  var columnHeads = config.columnHeads;

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
      //console.log("rows", rows);
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
    // TODO: we may want to turn this into an array
    columnHeads = Object.keys(rows[0]);
  }

  // TODO: use webworkers or something so we don't need an upper limit
  //var trueRows = rows.length;

  return {
    rows: rows,
    columnHeads: columnHeads,
    //trueRows: trueRows,
    config: config
  };
};
// TODO: refactor into class more like DataprooferTest so we can chain
// configuration and separate initializing from running tests
exports.run = function(config) {
  //var filename = config.filename;
  //var filepath = config.filepath;
  //var ext = config.ext;
  var suites = config.suites;
  var Renderer = config.renderer;
  var input = config.input;

  var loaded = config.loaded;

  var columnHeads = loaded.columnHeads;
  var rows = loaded.rows;

  // Initialize the renderer
  var renderer = new Renderer({
    filename: loaded. filename,
    suites: suites,
    columnHeads: columnHeads,
    rows: rows
    //trueRows: loaded.trueRows
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
        resolve(renderer);
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
};

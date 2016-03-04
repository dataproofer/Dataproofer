var d3 = require('d3');
var DataprooferTest = require('dataproofertest-js');

/**
 * The
 * @param  {Object} configuration including filename and suites
 * @return {undefined}
 */

// TODO: refactor into class more like DataprooferTest so we can chain
// configuration and seperate initializing from running tests
exports.run = function(config) {
  var filename = config.filename;
  var fileString = config.fileString;
  var suites = config.suites;
  var Renderer = config.renderer;
  var input = config.input;

  // user can optionally pass in rows and columnHeads already parsed
  // (i.e. from Tabletop)
  var rows = config.rows;
  var columnHeads = config.columnHeads;

  console.log("processing!", filename, suites)


  if(!rows && fileString) {
    // Parse the csv with d3
    rows = d3.csv.parse(fileString);
  }
  if(!columnHeads || !columnHeads.length) {
    // TODO: we may want to turn this into an array
    columnHeads = Object.keys(rows[0])
  }

  // Initialize the renderer
  var renderer = new Renderer({
    filename: filename,
    suites: suites,
    fileString: fileString,
    columnHeads: columnHeads,
    rows: rows
  });

  var badColumnHeadsTest = new DataprooferTest()
    .name("Missing or Duplicate Column Headers")
    .description('Check for errors in the header of the spreadsheet')
    .methodology(function(rows, columnHeads) {
      console.log("checking column headers", columnHeads.length);
      var badHeaderCount = 0;
      var badColumnHeads = [];
      var summary;
      var passed;

      _.reduce(columnHeads, function(counts, columnHead) {
        if (counts[columnHead] || columnHead.length < 1 || columnHead === null) {
          badColumnHeads.push(columnHead);
          badHeaderCount += 1;
        } else {
          counts[columnHead] = 0;
        }
        return counts;
      }, {});

      if (badHeaderCount > 0) {
        passed = false
        columnOrcolumnHeads = badHeaderCount > 1 ? "columnHeads" : "column";
        summary = _.template(`
          We found <span class="test-value"><%= badHeaderCount  %></span> <%= columnOrcolumnHeads %> a missing header. You should make sure all columns have a unique, descriptive name.
        `)({
          'badHeaderCount': badHeaderCount,
          'columnOrcolumnHeads': columnOrcolumnHeads
        });
      } else if (badHeaderCount === 0) {
        passed = true
        summary = 'No errors found in the header of the spreadsheet'
        //consoleMessage = "No anomolies detected";
      } else {
        passed = false
        summary = "We had problems reading your column headers"
      }

      var result = {
        passed: passed,
        summary: summary,
        badColumnHeads: badColumnHeads
      }
      return result;
    })

  var result = badColumnHeadsTest.proof(rows, columnHeads)
  renderer.addResult('dataproofer-core-suite', badColumnHeadsTest, result)

  var cleanedcolumnHeads = _.without(columnHeads, result.badColumnHeads.join(', '));
  var cleanedRows = rows

  // TODO: use async series? can run suites in series for better UX?
  suites.forEach(function(suite) {
    console.log("running suite", suite)
    // TODO: use async module to run asynchronously?
    suite.tests.forEach(function(test) {
      try {
        // run the test!
        var result = test.proof(cleanedRows, cleanedcolumnHeads, input)
        // incrementally report as tests run
        renderer.addResult(suite.name, test, result);
      } catch(e) {
        // uh oh! report an error (different from failing a test)
        renderer.addError(suite.name, test, e);
      }
    })
  })
  renderer.done();
}

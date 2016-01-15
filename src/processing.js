var fs = require('fs');
var d3 = require('d3');

/**
 * The 
 * @param  {Object} configuration including filename and suites
 * @return {undefined}
 */
exports.run = function(config) {
  var filename = config.filename;
  var fileString = config.fileString;
  var suites = config.suites;
  var Renderer = config.renderer;

  console.log("processing!", filename, suites)
  // we always test against the core suite
  var testSuites = [require('dataproofer-core-suite')]
  // if the user selected optional suites we require those
  suites.forEach(function(suite) {
    testSuites.push(require(suite))
  })

  // Parse the csv with d3
  var rows = d3.csv.parse(fileString);
  //console.log("ROWS", rows)

  // Initialize the renderer
  var renderer = new Renderer({
    filename: filename, 
    suites: testSuites,
    fileString: fileString,
    rows: rows
  });

  // TODO: use async series? can run suites in series for better UX?
  testSuites.forEach(function(suite) {
    // TODO: use async module to run asynchronously?
    suite.tests.forEach(function(test) {
      try {
        // run the test!
        var result = test(rows, fileString)
        // incrementally report as tests run
        renderer.addResult(suite.name, test.name, result);
      } catch(e) {
        // uh oh! report an error (different from failing a test)
        renderer.addError(suite.name, test.name, e);
      }
    })
  })
  renderer.done();

  

}
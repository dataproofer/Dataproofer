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

  // user can optionally pass in rows and columns already parsed (i.e. from Tabletop)
  var rows = config.rows;
  var columns = config.columns;

  console.log("processing!", filename, suites)
  // we always test against the core suite
  var testSuites = [require('dataproofer-core-suite')]
  // if the user selected optional suites we require those
  suites.forEach(function(suite) {
    testSuites.push(require(suite))
  })

  if(!rows && fileString) {
    // Parse the csv with d3
    rows = d3.csv.parse(fileString);
  }
  if(!columns || !columns.length) {
    // TODO: we may want to turn this into an array
    columns = Object.keys(rows[0])
  }

  // Initialize the renderer
  var renderer = new Renderer({
    filename: filename, 
    suites: testSuites,
    fileString: fileString,
    columns: columns,
    rows: rows
  });

  // TODO: use async series? can run suites in series for better UX?
  testSuites.forEach(function(suite) {
    // TODO: use async module to run asynchronously?
    suite.tests.forEach(function(test) {
      try {
        // run the test!
        var result = test(rows, columns)
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
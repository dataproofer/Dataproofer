var fs = require('fs');
var d3 = require('d3');

// TODO: This may be overridden somehow in the future
var Renderer = require('./rendering')

/**
 * The 
 * @param  {Object} configuration including filename and suites
 * @return {undefined}
 */
exports.run = function(config) {
  var file = config.file;
  var suites = config.suites;
  console.log("processing!", file, suites)
  // we always test against the core suite
  var testSuites = [require('dataproofer-core-suite')]
  // if the user selected optional suites we require those
  suites.forEach(function(suite) {
    testSuites.push(require(suite))
  })

  // TODO: this should be somehow configured to render to different environments
  var renderer = new Renderer({
    file: config.file, 
    suites: testSuites
  });

  //READ FILE
  fs.readFile(file, function(err, data) {
    if(err) {
      // no file no cry
      return renderer.error(err)
    }

    var str = data.toString();
    // Parse the csv with d3
    var rows = d3.csv.parse(str);

    // TODO: use async series? can run suites in series for better UX?
    testSuites.forEach(function(suite) {
      // TODO: use async module to run asynchronously
      suite.tests.forEach(function(test) {
        try {
          // run the test!
          var result = test(rows, str)
          // incrementally report as tests run
          renderer.addResult(suite.name, test.name, result);
        } catch(e) {
          // uh oh! report an error (different from failing a test)
          renderer.addError(suite.name, test.name, e);
        }
      })
    })
    renderer.done();

  })
  

}

module.exports = Renderer;
/**
 * Render the results for all tests in a given set of suites for a dataset
 * @class
 * @param  {Object} configuration including filename and suites
 * @return {undefined}
 */
function Renderer(config) {
  var results = this.results = {}
  config.suites.forEach(function(suite) {
    results[suite.name] = {};
  })

}

/**
 * A horrible run-time error has occured, we should let the user know and abort everything.
 * @param  {Object} error object. should contain a `message` property
 * @return {undefined}
 */
Renderer.prototype.error = function(error) {
  console.log("MAY DAY")
  console.error(error);
}

/**
 * The renderer can render results as they come so we can show progress to the user as tests complete.
 * @param {String} the name of the suite
 * @param {String} the name of the test
 * @param {Object} the result object.
 */
Renderer.prototype.addResult = function(suite, test, result) {
  console.log("add result", suite, test, result)
  this.results[suite][test] = result;
  // TODO: update rendering
}

/**
 * Notify that an error occurred while running a specific test
 * @param {String} the name of the suite
 * @param {String} the name of the test
 * @param {Object} the error object. should contain a `message` property
 */
Renderer.prototype.addError = function(suite, test, error) {
  console.log("Test error", suite, test)
  console.error(error)
}

/**
 * Indicate that we are finished rendering
 * @return {undefined}
 */
Renderer.prototype.done = function() {
  // finish up
  console.log("proofed.")
}

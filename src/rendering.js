/**
 * Render the results for all tests in a given set of suites for a dataset
 * @class
 * @param  {Object} configuration including filename and suites
 * @return {undefined}
 */
function Renderer(config) {
  Object.assign(this, config);
  var results = (this.results = {});
  config.suites.forEach(function (suite) {
    // console.log("suite name", suite);
    results[suite.name] = {};
  });
}

/**
 * A horrible run-time error has occured, we should let the user know and abort everything.
 * @param  {Object} error object. should contain a `message` property
 * @return {undefined}
 */
Renderer.prototype.error = function (error) {
  console.error(error);
};

/**
 * The renderer can render results as they come so we can show progress to the user as tests complete.
 * @param {String} the name of the suite
 * @param {String} the name of the test
 * @param {Object} the result object.
 */
Renderer.prototype.addResult = function (suite, test, result) {
  this.results[suite][test.name()] = result;
  this.results[suite][test.name()].conclusion = test.conclusion();
};

/**
 * Notify that an error occurred while running a specific test
 * @param {String} the name of the suite
 * @param {String} the name of the test
 * @param {Object} the error object. should contain a `message` property
 */
Renderer.prototype.addError = function (suite, test, error) {
  console.warn("Test error:\n", suite, "\n", test.name());
  console.error(error.stack || error);
};

/**
 * Indicate that we are finished rendering
 * @return {undefined}
 */
Renderer.prototype.done = function () {
  // finish up
  if (!this.json) {
    console.info("\ntotal rows", this.totalRows);
    console.info("rows sampled", this.rows.length);
  }
};

module.exports = Renderer;

// All test suites will have a name and a list
exports = module.exports = {
  name: "dataproofer-stats-suite",
  fullName: "Statistical Data Tests",
  tests: [], // the list of main tests to be run in the suite
};

var medianAbsoluteDeviationOutliers = require("./src/medianAbsoluteDeviationOutliers");
var standardDeviationOutliers = require("./src/standardDeviationOutliers");

exports.tests.push(standardDeviationOutliers, medianAbsoluteDeviationOutliers);

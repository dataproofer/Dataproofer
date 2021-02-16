// All test suites will have a name and a list
exports = module.exports = {
  name: "dataproofer-geo-suite",
  fullName: "Geographic Data Tests",
  tests: [], // the list of main tests to be run in the suite
};

var invalidLngLat = require("./src/invalidLngLat");
var voidLngLat = require("./src/voidLngLat");

exports.tests.push(invalidLngLat, voidLngLat);

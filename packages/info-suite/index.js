// All test suites will have a name and a list
exports = module.exports = {
  name: "dataproofer-info-suite", // a hyphenated, unique name
  fullName: "Information & Diagnostics", // a full name used for display in the desktop app
  tests: [], // the list of main tests to be run in the suite
};

var columnsContainNumbers = require("./src/columnsContainNumbers");
var columnsContainStrings = require("./src/columnsContainStrings");

exports.tests.push(columnsContainNumbers, columnsContainStrings);

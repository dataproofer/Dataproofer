// All test suites will have a name and a list
exports = module.exports = {
  name: "dataproofer-core-suite",
  fullName: "Core Data Tests",
  tests: [], // the list of main tests to be run in the suite
  subtests: [], // a list of tests that can be triggered by the main tests but wont be run automatically
};

var columnsContainNothing = require("./src/columnsContainNothing");
var columnsContainsSpecialChars = require("./src/columnsContainsSpecialChars");
var checkDuplicateRows = require("./src/checkDuplicateRows");
var maxInteger = require("./src/maxInteger");
var maxSmallInteger = require("./src/maxSmallInteger");
var maxBigInteger = require("./src/maxBigInteger");
var maxSummedInteger = require("./src/maxSummedInteger");
var numberOfRowsIs65k = require("./src/numberOfRowsIs65k");
var stringsHaveExactly255Characters = require("./src/stringsHaveExactly255Characters");

exports.tests.push(
  columnsContainNothing,
  columnsContainsSpecialChars,
  checkDuplicateRows,
  numberOfRowsIs65k,
  stringsHaveExactly255Characters,
  maxInteger,
  maxSummedInteger,
  maxSmallInteger,
  maxBigInteger
);

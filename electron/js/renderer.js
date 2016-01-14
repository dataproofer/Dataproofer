var _ = require('lodash')
var d3 = require('d3')

// TODO: make this requirable from ./processor.js
//module.exports = HTMLRenderer;
function HTMLRenderer(config) {
  console.log("new renderer", config)
  var results = this.results = {}
  config.suites.forEach(function(suite) {
    results[suite.name] = {};
  })
}

HTMLRenderer.prototype.error = function(error) {
  console.log("MAY DAY")
  console.error(error);
}

HTMLRenderer.prototype.addResult = function(suite, test, result) {
  console.log("add result", suite, test, result)
  this.results[suite][test] = result;
  // TODO: update rendering
}

HTMLRenderer.prototype.addError = function(suite, test, error) {

}

HTMLRenderer.prototype.done = function() {
  // finish up
  console.log("proofed.")
}


var _ = require('lodash')
var d3 = require('d3')

var HTMLRenderer = require('../src/rendering.js');

HTMLRenderer.prototype.addResult = function(suite, test, result) {
  console.log("add result", suite, test, result)
  this.results[suite][test] = result;
  // TODO: update rendering
}
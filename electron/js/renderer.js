var _ = require('lodash')
var d3 = require('d3')

var Renderer = require('../src/rendering.js');
function HTMLRenderer(config) {
  Renderer.call(this, config)
  window.rows = config.rows;
  console.log("constructed")
}

HTMLRenderer.prototype = Object.create(Renderer.prototype)
HTMLRenderer.prototype.constructor = HTMLRenderer;

HTMLRenderer.prototype.addResult = function(suite, test, result) {
  console.log("add result", suite, test, result)
  this.results[suite][test] = result;
  // TODO: update rendering
}
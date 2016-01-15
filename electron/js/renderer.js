var _ = require('lodash')
var d3 = require('d3')

var Renderer = require('../src/rendering.js');
function HTMLRenderer(config) {
  Renderer.call(this, config)
  window.rows = config.rows;
  this.resultList = [];
  console.log("constructed")
}

HTMLRenderer.prototype = Object.create(Renderer.prototype, {})
HTMLRenderer.prototype.constructor = HTMLRenderer;

HTMLRenderer.prototype.addResult = function(suite, test, result) {
  console.log("add result", suite, test, result)
  this.results[suite][test] = result;
  this.resultList.push({ suite: suite, test: test, result: result })

  // TODO: update rendering
  var tests = d3.select(".test-results").selectAll(".test")
    .data(this.resultList)

  var testsEnter = tests.enter().append("div").classed("test", true)
  testsEnter.append("div").classed("passfail", true)
  testsEnter.append("div").classed("message", true)

  tests.select("div.passfail").html(function(d) { 
    return d.result.passed ? "<span class='icon icon-check'></span>" : "<span class='icon icon-canceled-circle'></span>" 
  })

  tests.select("div.message").html(function(d) {
    return d.result.template || d.result.message
  })

  tests.attr({
  })
}
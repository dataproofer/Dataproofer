var _ = require('lodash')
var d3 = require('d3')
var jQuery = $ = require('jquery')
var SlickGrid = require('slickgrid/grid')

var Renderer = require('../src/rendering.js');
function HTMLRenderer(config) {
  Renderer.call(this, config)
  window.rows = config.rows;
  this.resultList = [];
  console.log("constructed")

  var columns = [];
  Object.keys(rows[0]).forEach(function(col) {
    columns.push({id: col, name: col, field: col})
  })

  var options = {
    editable: false,
    enableAddRow: false,
    enableCellNavigation: true,
    //cellHighlightCssClass: "changed",
    //cellFlashingCssClass: "current-server" 
  }
  var grid = new SlickGrid("#grid", rows, columns, options);
  this.grid = grid;
}

HTMLRenderer.prototype = Object.create(Renderer.prototype, {})
HTMLRenderer.prototype.constructor = HTMLRenderer;

HTMLRenderer.prototype.addResult = function(suite, test, result) {
  console.log("add result", suite, test, result)
  this.results[suite][test] = result;
  this.resultList.push({ suite: suite, test: test, result: result })

  // A reference to our SlickGrid table so we can manipulate it via the fingerprint
  var grid = this.grid;

  var tests = d3.select(".test-results").selectAll(".test")
    .data(this.resultList)

  var testsEnter = tests.enter().append("div").classed("test", true)
  testsEnter.append("div").classed("passfail", true)
  testsEnter.append("div").classed("message", true)
  testsEnter.append("div").classed("fingerprint", true).each(function(d) {
    if(d.result.highlightCells) {
      d3.select(this).append("canvas")
    }
  })

  tests.select("div.passfail").html(function(d) { 
    return d.result.passed ? "<span class='icon icon-check'></span>" : "<span class='icon icon-cancel-circled'></span>" 
  })

  tests.select("div.message").html(function(d) {
    var html = '<span class="test-header">' + (d.result.title || "") + '</span><br/>'
    html += d.result.template || d.result.message || ""
    return html
  })

  tests.select("div.fingerprint").each(function(d) {
    if(!d.result.highlightCells) return;

    // TODO: put this in a component/reusable chart thingy
    var width = 200;
    var height = 100;
    var cellWidth = 2;
    var cellHeight = 1;

    var rows = d.result.highlightCells.slice(0, 500);
    var cols = Object.keys(rows[0]);
    cellWidth = width / cols.length;
    height = cellHeight * rows.length;

    var canvas = d3.select(this).select("canvas").node();
    var context = canvas.getContext("2d")
    canvas.width = width;
    canvas.height = height;
    
    rows.forEach(function(row, i) {
      cols.forEach(function(col, j) {
        context.fillStyle = row[col] ? "#d88282" : "#ddd";
        context.fillRect(j*cellWidth, i*cellHeight, cellWidth, cellHeight)
      })
    })

    var drag = d3.behavior.drag()
      .on("drag", function(d,i){ 
        var mouse = d3.mouse(this);
        var x = mouse[0];
        var y = mouse[1];
        if(y < 0) y = 0;
        var row = y; // for now our cells are 1 pixel high so this works
        var col = Math.floor(x / width * cols.length);
        console.log("row, col", row, col)
        grid.scrollCellIntoView(row, col)
        grid.scrollRowIntoView(row)
        grid.removeCellCssStyles("highlighted")
        var column = cols[col];
        var changes = {}
        changes[row] = {}
        changes[row][column] = "changed"
        grid.addCellCssStyles("highlighted", changes)
        //grid.scrollRowToTop(row)
      })
    d3.select(this).select("canvas").call(drag)
  })
}
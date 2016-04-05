var _ = require('lodash');
var d3 = require('d3');
var Renderer = require('dataproofer').Rendering;
var util = require("dataproofertest-js/util");

function HTMLRenderer(config) {
  //console.log('config', config);
  Renderer.call(this, config)
  window.rows = config.rows;
  this.rows = config.rows;
  this.columnHeads = config.columnHeads;
  var resultList = []
  this.resultList = resultList;

  var data = []
  var headers = _.keys( rows[0] )
  _.forEach( rows, function(row) {
    data.push( _.values(row) )
  });
  var topBarHeight = document.getElementById('info-top-bar').getBoundingClientRect().height;
  var containerWidth = window.innerWidth / 2;
  var containerHeight = window.innerHeight - topBarHeight;
  var handsOnTable = new Handsontable(document.getElementById('grid'),
    {
      data: data,
      strechH: "all",
      autoWrapRow: true,
      autoWrapCol: true,
      wordWrap: false,
      width: containerWidth,
      height: containerHeight,
      rowHeaders: true,
      colHeaders: headers,
      //columnSorting: true,
      sortIndicator: true,
      readOnly: true,
      manualRowResize: true,
      manualColumnResize: true,
      comments: true,
      autoColumnSize: {
        "samplingRatio": 23
      },
      currentRowClassName: 'currentRow',
      currentColClassName: 'currentCol',
    });

  this.handsOnTable = handsOnTable
  window.handsOnTable = handsOnTable // for debugging

  resultsHeight = containerHeight + 'px'
  // we just remove everything rather than get into update pattern
  d3.select(".step-3-results").selectAll("*").remove();
  d3.select(".step-3-results")
    .style('height', resultsHeight)
    /*
    .selectAll(".suite")
    .data(config.suites)
    .enter().append("div")
    .attr({
      class: function(d) { return "suite " + d.name + (d.active ? " active" : "" )}
    })
    .append("h2").text(function(d) { return d.fullName })
    */
  //d3.select(".test-results").selectAll(".test").remove();
}

HTMLRenderer.prototype = Object.create(Renderer.prototype, {})
HTMLRenderer.prototype.constructor = HTMLRenderer;

HTMLRenderer.prototype.addResult = function(suite, test, result) {
  //console.log("add result", suite, test.name(), result)
  //this.resultList[suite].push({ suite: suite, test: test, result: result || {} })
  this.resultList.push({ suite: suite, test: test, result: result || {} })

  var columnHeads = this.columnHeads;
  var rows = this.rows;
  var resultList = this.resultList;

  // setup/update the comments in our Hands On Table
  //renderCellComments(rows, columnHeads, this.resultList, this.handsOnTable);

  var container = d3.select(".step-3-results")
  // rerender all the columns
  var columns = container.selectAll(".column")
    .data(columnHeads)

  var columnsEnter = columns.enter().append("div").classed("column", true)
  // render the column header
  columnsEnter.append("div").classed("column-header", true)
    .text(function(d) { return d})

  // Want to separate out tests that failed and tests that passed here

  // Summarize testsPassed.length, and then append all failed tests like normal

  console.log("Result list: ", resultList)

  passedResults = _.filter(resultList, function(d){
    return d.result.passed
  })

  failedResults = _.filter(resultList, function(d){
    return !d.result.passed
  })

  //console.log("Passed list", passedResults)
  //console.log("Failed list", failedResults)

  /*
  var testsPassed = columnsEnter.append("h4")
    
  testsPassed.html("<div class='icon icon-check'></div> " + passedResults.length + " tests passed ")
  */

  var tests = columns.selectAll(".test")
    .data(function(column) {
      return failedResults.map(function(d) {
        return { test: d.test, result: d.result, suite: d.suite, column: column}
      })
    })

  var testsEnter = tests.enter().append("div")
  .attr("class", function(d) {
     return 'test';// + (d.test.active ? " active" : "" )
  })
  testsEnter.append("div").classed("passfail", true)
  testsEnter.append("div").classed("summary", true)
  testsEnter.append("div").classed("description", true)
  testsEnter.append("div").classed("conclusion", true)
  testsEnter.append("div").classed("visualization", true)

  var that = this;
  tests.on("click", function(d) {
    console.log(d);
    var dis = d3.select(this)
    dis.classed("active", !dis.classed("active"))
    //that.renderFingerPrint({ test: d.test.name() })
  })
  tests.on("mouseover", function(d) {
    that.renderFingerPrint({ test: d.test.name(), column: d.column })
  })
  tests.on("mouseout", function(d) {
    that.renderFingerPrint()
  })

  tests.select("div.passfail").html(function(d) {
    passFailIconHtml = ""
    if (d.result.passed === true) {
      passFailIconHtml += "<div class='icon icon-check'></div>"
    } else if (d.result.passed === false) {
      passFailIconHtml += "<div class='icon icon-cancel-circled'></div>"
    } else {
      passFailIconHtml += "<div class='icon icon-neutral'></div>"
    }
    return passFailIconHtml
  })

  tests.sort(function(a,b) {
    var aColumn = a.column;
    var aColumnWise = a.result.columnWise || {} // not gauranteed to exist
    var bColumn = b.column;
    var bColumnWise = b.result.columnWise || {} // not gauranteed to exist
    var aNum = aColumnWise[aColumn] || 0
    var bNum = bColumnWise[bColumn] || 0
    return bNum - aNum
  })

  tests.select("div.summary").html(function(d) {
    var column = d.column;
    var name = d.test.name();
    var columnWise = d.result.columnWise || {} // not gauranteed to exist

    var simpleFormat = d3.format(",%");

    var num = columnWise[column] || 0;
    var string = name +  " (" + util.percent(num/rows.length) + ")"
    return string
  }).classed("interesting", function(d) {
    var column = d.column;
    var columnWise = d.result.columnWise || {} // not gauranteed to exist
    var num = columnWise[column] || 0;
    return !!num;
  })
  .attr("title", function(d){
    return d.test.description()
  })

  /*
  tests.select("div.description").html(function(d) {
    return d.test.description()
  })
  */

  
  tests.select("div.conclusion").html(function(d) {
    return d.test.conclusion ? d.test.conclusion(d.result) : "";
  })

  /*
  var handsOnTable = this.handsOnTable
  tests.select("div.fingerprint").each(function(d) {
    if(!d.result.highlightCells || !d.result.highlightCells.length) return;
    var that = this;
    drawFingerPrint(d, handsOnTable, that);
  })
  */
}

HTMLRenderer.prototype.done = function() {
  var columnHeads = this.columnHeads;
  var rows = this.rows;
  var resultList = this.resultList;
  var handsOnTable = this.handsOnTable;
  this.comments = renderCellComments(rows, columnHeads, resultList, handsOnTable)
  var that = this;
  setTimeout(function() {
    that.renderFingerPrint()
  }, 100)

  handsOnTable.addHook('afterColumnSort', function(columnIndex) {
    that.renderFingerPrint({col: columnIndex })
  })
  handsOnTable.addHook('afterOnCellMouseDown', function(evt, coords) {
    console.log("clicked", coords)
    that.renderFingerPrint({col: coords.col, row: coords.row })
  })
}

HTMLRenderer.prototype.destroy = function() {
  this.handsOnTable.destroy();
  d3.select("#grid").selectAll("*").remove();
}
HTMLRenderer.prototype.renderFingerPrint = function(options) {
  if(!options) options = {};

  var columnIndex = options.col;
  var rowIndex = options.row;
  var test = options.test;
  var column = options.column;

  var rows = this.rows;
  var columnHeads = this.columnHeads;
  var comments = this.comments;
  var handsOnTable = this.handsOnTable;

  var width = 200;
  var resultsBBOX = d3.select(".step-3-results").node().getBoundingClientRect();
  var height = resultsBBOX.height;
  var cellWidth = 2;
  var cellHeight = 1;

  var cols = Object.keys(rows[0]);
  cellWidth = width / cols.length;
  cellHeight = height / rows.length;

  var canvas = d3.select('#fingerprint').node();
  var context = canvas.getContext("2d")
  canvas.width = width;
  canvas.height = height;

  var overlay = d3.select('#fingerprint-overlay')

  var colorScale = d3.scale.ordinal()
  .domain([1, 2, 3])
  .range(["#ed8282","#da8282", "#d88282"])

  function renderPrint() {
    context.fillStyle = "#fff"
    context.fillRect(0, 0, width, height);
    var transformRowIndex = 0;
    comments.forEach(function(comment) {
      var array = [];
      if(test) {
        array = comment.array.filter(function(d) { return d === test })
      } else {
        array = comment.array;
      }
      // only render this cell if its got items in the array
      if(!array.length && !comment.array.length) return;
      if((!array.length && comment.array.length) || (columnHeads.indexOf(column) !== comment.col)) {
        context.fillStyle = "#ddd";
      } else {
        context.fillStyle = colorScale(array.length)//"#d88282"
      }

      //transformRowIndex = Handsontable.hooks.run(handsOnTable, 'modifyRow', comment.row)
      var transformRowIndex;
      if(handsOnTable.sortIndex && handsOnTable.sortIndex.length) {
        transformRowIndex = handsOnTable.sortIndex[comment.row][0]
      } else {
        transformRowIndex  = comment.row;
      }
      context.fillRect(comment.col * cellWidth, transformRowIndex * cellHeight, cellWidth, cellHeight)
    })
  }
  renderPrint();


  function renderCol(col) {
    context.strokeStyle = "#444"
    context.strokeRect(col * cellWidth, 0, cellWidth, height)
  }
  function renderRow(row) {
    context.strokeStyle = "#444"
    context.strokeRect(0, row * cellHeight, width, cellHeight)
  }
  if(columnIndex || columnIndex === 0) {
    renderCol(columnIndex)
  }
  if(rowIndex || rowIndex === 0) {
    renderRow(rowIndex)
  }

  var that = this;
  var drag = d3.behavior.drag()
    .on("drag.fp", function(d,i){
      var mouse = d3.mouse(canvas);
      var x = mouse[0];
      var y = mouse[1];
      if(y < 0) y = 0;
      var row = Math.floor(y / height * rows.length); // for now our cells are 1 pixel high so this works
      var col = Math.floor(x / width * cols.length);
      //console.log("row, col", row, col)
      handsOnTable.selectCell(row, col, row, col, true);

      //that.renderFingerPrint(row, col);
      renderPrint();
      renderCol(col);
      renderRow(row);
    })
  d3.select(canvas).call(drag)
}

function renderCellComments(rows, columnHeads, resultList, handsOnTable) {
  // setup/update the comments
  var comments = [];
  var commentCollector = [];
  _.each(rows, function(row, rowIndex) {
    commentCollector[rowIndex] = {}
    _.each(columnHeads, function(columnHead) {
      // keep an object with each key
      commentCollector[rowIndex][columnHead] = [];
    });
  });

  // loop over resultList
  resultList.forEach(function(d){
    if(d.result && d.result.highlightCells && d.result.highlightCells.length) {
      _.each(rows, function(row, rowIndex) {
        _.each(columnHeads, function(columnHead) {
          var value = d.result.highlightCells[rowIndex][columnHead];
          //console.log("value", value, rowIndex, columnHead)
          if(value) {
            //commentCollector[rowIndex][columnHead].push({ test: d.test.name(), value: value  })
            commentCollector[rowIndex][columnHead].push(d.test.name())
          }
        })
      });
    }
  })
  _.each(rows, function(row, rowIndex) {
    _.each(columnHeads, function(columnHead, columnIndex) {
      var array = commentCollector[rowIndex][columnHead]
      if(array && array.length && array.length > 0) {
        var string = array.join("\n")
        comments.push({row: rowIndex, col: columnIndex, comment: string, array: array})
      }
    });
  });
  handsOnTable.updateSettings({cell: comments})
  return comments;
}

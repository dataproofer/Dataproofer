var _ = require("lodash");
var d3 = require("d3");
var Renderer = require("dataproofer").Rendering;
var util = require("dataproofertest-js/util");

function HTMLRenderer(config) {
  //console.log('config', config);
  Renderer.call(this, config);
  var rows = window.rows = config.rows;
  this.rows = config.rows;
  this.columnHeads = config.columnHeads;
  var resultList = [];
  this.resultList = resultList;

  var data = [];
  var headers = _.map(_.keys(rows[0]), function(header, idx) {
    if (util.isEmpty(header)) return "Column " + idx;
    return header;
  });
  _.forEach( rows, function(row) {
    data.push( _.values(row) );
  });
  d3.select(".grid-footer").classed("hidden", false);
  d3.selectAll(".test:not(.active)")
    .classed("hidden", true);
  d3.selectAll(".toggle").classed("hidden", true);
  d3.selectAll(".suite-hed").classed("hidden", true);
  d3.select(".column-3")
    .classed("hidden", false)
    .select("#grid")
    .selectAll("*")
    .remove();
  var column2Height = d3.select(".column-2").node().getBoundingClientRect().height;
  var gridFooterHeight = d3.select(".grid-footer").node().getBoundingClientRect().height;
  var containerWidth = window.innerWidth - d3.select(".column-1").node().getBoundingClientRect().width - d3.select(".column-3").node().getBoundingClientRect().width;
  var containerHeight = column2Height - gridFooterHeight; // heights of grid header and footer
  console.log("containerHeight", containerHeight);
  var handsOnTable = new Handsontable(document.getElementById("grid"),
    {
      data: data,
      autoWrapRow: true,
      autoWrapCol: true,
      wordWrap: false,
      width: containerWidth,
      height: containerHeight,
      colWidths: 100,
      colHeaders: headers,
      rowHeaders: true,
      readOnly: true,
      columnSorting: true,
      manualRowResize: true,
      manualColumnResize: true,
      comments: true,
      commentedCellClassName: "htCommentCell",
      autoColumnSize: {
        "samplingRatio": 23
      },
      search: {
        callback: searchResultSelect
      }
    });

  this.handsOnTable = handsOnTable;
  window.handsOnTable = handsOnTable; // for debugging
  d3.select("#file-loader-button")
    .classed("loaded", true)
    .html("<i class='fa fa-arrow-up' aria-hidden='true'></i> Load New File");
    // .on("click", function() {
    //   document.location.reload(true);
    // });

  function searchResultSelect(instance, row, col, value, result) {
    Handsontable.Search.DEFAULT_CALLBACK.apply(this, arguments);
    if (result) {
      handsOnTable.selectCell(row, col);
    }
  }

  var searchFiled = document.getElementById("search-field");
  Handsontable.Dom.addEvent(searchFiled, "keyup", function (event) {
    handsOnTable.search.query(this.value);
    handsOnTable.render();
  });
  // var resultsHeight = containerHeight + "px";
  // we just remove everything rather than get into update pattern
  // d3.select(".step-3-results").selectAll("*").remove();
  // d3.select(".step-3-results")
  //   .style("height", resultsHeight)
  //   .selectAll(".suite")
  //   .data(config.suites)
  //   .enter().append("div")
  //   .attr({
  //     class: function(d) { return "suite " + d.name + ((d.active) ? " active" : "" );}
  //   })
  //   .append("h2").text(function(d) { return d.fullName; });
  //d3.select(".test-results").selectAll(".test").remove();
}

HTMLRenderer.prototype = Object.create(Renderer.prototype, {});
HTMLRenderer.prototype.constructor = HTMLRenderer;

HTMLRenderer.prototype.addResult = function(suite, test, result) {
  //console.log("add result", suite, test.name(), result)
  //this.resultList[suite].push({ suite: suite, test: test, result: result || {} })
  this.resultList.push({ suite: suite, test: test, result: result || {} });
  // console.log("add result!", test.name(), result)
};

HTMLRenderer.prototype.done = function() {
  var columnHeads = this.columnHeads;
  var rows = this.rows;
  var resultList = this.resultList;
  var handsOnTable = this.handsOnTable;
  this.comments = renderCellComments(rows, columnHeads, resultList, handsOnTable);
  var that = this;
  setTimeout(function() {
    that.renderFingerPrint();
  }, 100);

  handsOnTable.addHook("afterColumnSort", function(columnIndex) {
    that.renderFingerPrint({col: columnIndex });
  });
  handsOnTable.addHook("afterOnCellMouseDown", function(evt, coords) {
    console.log("clicked", coords);
    that.renderFingerPrint({col: coords.col, row: coords.row });
  });

  // Want to separate out tests that failed and tests that passed here

  // Summarize testsPassed.length, and then append all failed tests like normal

  var passedResults = _.filter(resultList, function(d){
    return d.result.passed;
  });

  // var failedResults = _.filter(resultList, function(d) {
  //   return !d.result.passed;
  // });

  if (passedResults.length === resultList.length) {
    d3.select(".column-1").classed("all-passed", true);
    d3.select(".test-sets ul").style("display", "none");
  } else {
    d3.select(".column-1").classed("all-passed", false);
    d3.select(".test-sets ul").style("display", "block");
  }
  //console.log("Passed list", passedResults)
  //console.log("Failed list", failedResults)
  /*
  var testsPassed = columnsEnter.append("h4")
  testsPassed.html("<div class='icon icon-check'></div> " + passedResults.length + " tests passed ")
  */

  /*
  var tests = columns.selectAll(".test")
    .data(function(column) {
      return failedResults.map(function(d) {
        return { test: d.test, result: d.result, suite: d.suite, column: column};
      });
    });
  */
  console.log("resultList", resultList);
  var tests = d3.selectAll(".test")
    .data(resultList, function(d) { return d.suite + "-" + d.test.name(); });

  tests.select("i.fa-info-circle")
    .each(function(d) {
      d3.select(this)
        .attr("original-title", function(d) {
          return d.test.conclusion();
        });
    });

  var timeout;
  var filterResults = function (d) {
    console.log("filter, clearing", timeout, d.result.highlightCells);
    clearTimeout(timeout);
    that.renderFingerPrint({ test: d.test.name(), column: d.column });
    that.highlightGrid({ highlightCells: d.result.highlightCells || [], testName: d.test.name() });
  };

  var clearFilteredResults = function(d) {
    // debounce
    timeout = setTimeout(function() {
      console.log("cleared!");
      that.renderFingerPrint();
      that.highlightGrid();
    }, 300);
  };
  that.clearFilteredResults = clearFilteredResults;

  tests.classed("pass", function(d) {
    return d.result.passed;
  })
  .classed("fail", function(d) {
    return !d.result.passed;
  })
  .on("mouseover", filterResults)
  .on("mouseout", clearFilteredResults);

  // tests.append("div").classed("passfail", true);
  // tests.append("div").classed("summary", true)
  //   .on("mouseover", function(d) {
  //     var infoBtn = d3.select(this.parentNode).select(".info-btn");
  //     infoBtn.classed("opaque", false);
  //   })
  //   .on("mouseout", function(d) {
  //     var infoBtn = d3.select(this.parentNode).select(".info-btn");
  //     if (!infoBtn.classed("nonopaque")) infoBtn.classed("opaque", true);
  //   })

  // tests.append("button").classed("filter-btn", true)
  //   .html("<i class='fa fa-filter'></i> Filter");

  // tests.select(".filter-btn").on("click", function(d) {
  //   var isFiltered = d3.select(this.parentNode).classed("filtered");
  //   if (isFiltered) {
  //     d3.selectAll(".test").classed("filtered", false);
  //     d3.selectAll(".filter-btn").classed("nonopaque", false);
  //     clearFilteredResults(d);
  //     that.renderFingerPrint();
  //     d3.selectAll("#grid").classed("filtered-cells", false);
  //   } else {
  //     d3.selectAll(".test").classed("filtered", false);
  //     d3.selectAll(".filter-btn").classed("nonopaque", false);
  //     d3.select(this.parentNode).classed("filtered", true);
  //     d3.select(this).classed("nonopaque", true);
  //     filterResults(d);
  //     that.renderFingerPrint({ test: d.test.name(), column: d.column });
  //     d3.selectAll("#grid").classed("filtered-cells", true);
  //   }
  // })
  // .on("mouseover", function (d) {
  //   var isFiltered = d3.selectAll(".filtered")[0].length > 0;
  //   if (!isFiltered) that.renderFingerPrint({ test: d.test.name(), column: d.column });
  // })
  // .on("mouseout", function(d) {
  //   var isFiltered = d3.selectAll(".filtered")[0].length > 0;
  //   if (!isFiltered) that.renderFingerPrint();
  // });

  // tests.select("div.summary").html(function(d) {
  //   var column = d.column;
  //   var name = d.test.name();
  //   var columnWise = d.result.columnWise || {}; // not gauranteed to exist
  //   var num = columnWise[column] || 0;
  //   var string = name + ": " + util.percent(num / rows.length);
  //   return string;
  // }).classed("interesting", function(d) {
  //   var column = d.column;
  //   var columnWise = d.result.columnWise || {}; // not gauranteed to exist
  //   var num = columnWise[column] || 0;
  //   return !!num;
  // })
  // .attr("title", function(d){
  //   return d.test.description();
  // });
  // d3.selectAll("div.summary")
  //   .each(function() {
  //     // d3.select(this.parentNode)
  //     //   .classed("hidden", false);
  //   });
  // d3.selectAll("div.summary:not(.interesting)")
  //   .each(function() {
  //     // d3.select(this.parentNode)
  //     //   .classed("hidden", true);
  //   });

  // tests.select("div.conclusion").html(function(d) {
  //   return d.test.conclusion ? d.test.conclusion(d.result) : "";
  // });


  /*d3.select(".step-3-results").style("display", "block")
    .insert("div", ":first-child")
    .html(function() {
      var headersCheck = renderer.resultList[0];
      var missingHeadersStr = "";
      if (!headersCheck.result.passed) {
        missingHeadersStr += "<div class='info'>";
        missingHeadersStr += "<i class='fa fa-exclamation-triangle'></i>";
        missingHeadersStr += " Ignored ";
        missingHeadersStr += headersCheck.result.badColumnHeads.join(", ");
        missingHeadersStr += " because of missing or duplicate column headers";
        missingHeadersStr += "</div>";
      }
      return missingHeadersStr;
    });

  d3.select(".step-3-results").insert("div", ":first-child")
    .attr("class", "summary-results")
    .html(function() {
      var totalTests = renderer.resultList.length;
      var failedTests = 0;
      var passedTests = 0;
      renderer.resultList.forEach(function(test) {
        if (!test.result.passed) {
          failedTests += 1;
        } else {
          passedTests += 1;
        }
      });
      //var resultsStr = "<span>" + failedTests + " / " + totalTests + " checks failed</span><br>";
      var resultsStr = "<span>" + passedTests + " / " + totalTests + " checks passed</span>";
      return resultsStr;
    });
    */
};

HTMLRenderer.prototype.destroy = function() {
  this.handsOnTable.destroy();
  d3.select("#grid").selectAll("*").remove();
};

HTMLRenderer.prototype.highlightGrid = function(options) {
  if(!options) options = {};
  var highlightCells = options.highlightCells;
  var testName = options.testName;

  var comments = this.comments;
  var handsOnTable = this.handsOnTable;

  // var rowsToShow = [];
  if (highlightCells && testName) {
    var currentComments = _.filter(comments, function(comment) {
      return comment.array.indexOf(testName) > -1;
    });
    handsOnTable.updateSettings({
      cell: currentComments,
      commentedCellClassName: "htCommentCell filtered"
    });
    if (currentComments[0]) {
      // console.log(currentComments[0]);
      handsOnTable.selectCell(
        currentComments[0].row,
        currentComments[0].col,
        currentComments[0].row,
        currentComments[0].col,
        true
      );
    }
  } else {
    handsOnTable.updateSettings({
      cell: comments,
      commentedCellClassName: "htCommentCell"
    });
    handsOnTable.deselectCell();
  }
};

HTMLRenderer.prototype.renderFingerPrint = function(options) {
  if(!options) options = {};

  var columnIndex = options.col;
  var rowIndex = options.row;
  var test = options.test;
  // var column = options.column;

  var rows = this.rows;
  // var columnHeads = this.columnHeads;
  var comments = this.comments;
  var handsOnTable = this.handsOnTable;
  var clearFilteredResults = this.clearFilteredResults;

  var width = 200;
  var resultsBBOX = d3.select(".column-3").node().getBoundingClientRect();
  var height = resultsBBOX.height;
  var cellWidth = 2;
  var cellHeight = 1;

  var cols = Object.keys(rows[0]);
  cellWidth = width / cols.length;
  cellHeight = height / rows.length;

  var canvas = d3.select("#fingerprint").node();
  var context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  // var colorScale = d3.scale.ordinal()
  //   .domain([1, 2, 3])
  //   .range(["#ed8282","#da8282", "#d88282"]);

  function renderPrint() {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    comments.forEach(function(comment) {
      var array = [];
      if(test) {
        array = comment.array.filter(function(d) { return d === test; });
      } else {
        array = comment.array;
      }
      // only render this cell if its got items in the array
      if(!array.length && !comment.array.length) return;
      if(!array.length && comment.array.length) { //} || (columnHeads.indexOf(column) !== comment.col)) {
        context.fillStyle = "#ddd";
      } else {
        context.fillStyle = "#EFE7B8"; //"#e03e22" //colorScale(array.length); //"#d88282"
      }

      //transformRowIndex = Handsontable.hooks.run(handsOnTable, 'modifyRow', comment.row)
      var transformRowIndex;
      if(handsOnTable.sortIndex && handsOnTable.sortIndex.length) {
        transformRowIndex = handsOnTable.sortIndex[comment.row][0];
      } else {
        transformRowIndex  = comment.row;
      }
      context.fillRect(comment.col * cellWidth, transformRowIndex * cellHeight, cellWidth, cellHeight);
    });
  }
  renderPrint();


  function renderCol(col) {
    context.strokeStyle = "#444";
    context.strokeRect(col * cellWidth, 0, cellWidth, height);
  }
  function renderRow(row) {
    context.strokeStyle = "#444";
    context.strokeRect(0, row * cellHeight, width, cellHeight);
  }
  if(columnIndex || columnIndex === 0) {
    renderCol(columnIndex);
  }
  if(rowIndex || rowIndex === 0) {
    renderRow(rowIndex);
  }

  function selectGridCell (d,i) {
    var selectFiltered = d3.selectAll(".filtered");
    var isFiltered = (selectFiltered[0].length > 0)? true : false;

    if (isFiltered) {
      d3.selectAll(".test").classed("filtered", false);
      clearFilteredResults();
    }
    var mouse = d3.mouse(canvas);
    var x = mouse[0];
    var y = mouse[1];
    if (y < 0) y = 0;
    var row = Math.floor(y / height * rows.length); // for now our cells are 1 pixel high so this works
    var col = Math.floor(x / width * cols.length);
    //console.log("row, col", row, col)
    handsOnTable.selectCell(row, col, row, col, true);

    //that.renderFingerPrint(row, col);
    renderPrint();
    renderCol(col);
    renderRow(row);
  }

  var drag = d3.behavior.drag()
    .on("drag.fp", selectGridCell);
  d3.select(canvas)
    .call(drag)
    .on("click.fp", selectGridCell);
};

function renderCellComments(rows, columnHeads, resultList, handsOnTable) {
  // setup/update the comments
  var comments = [];
  var commentCollector = [];
  _.each(rows, function(row, rowIndex) {
    commentCollector[rowIndex] = {};
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
            commentCollector[rowIndex][columnHead].push(d.test.name());
          }
        });
      });
    }
  });

  _.each(rows, function(row, rowIndex) {
    _.each(columnHeads, function(columnHead, columnIndex) {
      var array = commentCollector[rowIndex][columnHead];
      if(array && array.length && array.length > 0) {
        var string = array.join("\n");
        comments.push({row: rowIndex, col: columnIndex, comment: string, array: array});
      }
    });
  });

  handsOnTable.updateSettings({cell: comments});
  return comments;
}

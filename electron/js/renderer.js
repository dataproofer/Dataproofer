var _ = require("lodash");
var d3 = require("d3");
var Renderer = require("dataproofer").Rendering;
var util = require("dataproofertest-js/util");

function HTMLRenderer(config) {
  Renderer.call(this, config);
  var rows = window.rows = config.rows;
  this.rows = rows;
  this.columnHeads = config.columnHeads;
  var resultList = [];
  this.resultList = resultList;

  d3.select(".grid-footer").classed("hidden", false);
  d3.selectAll(".test:not(.active)")
    .classed("hidden", true);
  d3.selectAll(".tests-wrapper").classed("hidden", function() {
    return d3.select(this)
      .selectAll(".test")
      .classed("hidden");
  });
  d3.selectAll(".suite").classed("hidden", function() {
    return d3.select(this)
      .select(".tests-wrapper")
      .classed("hidden");
  });
  d3.selectAll(".toggle").classed("hidden", true);
  d3.selectAll(".test label").style("pointer-events", "none");
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

  d3.select("#grid").classed("hidden", false);
  d3.select("#grid-container")
  .style({
    width: containerWidth + "px",
    height: containerHeight + "px"
  });
  d3.select("#grid").style({
    width: containerWidth + "px",
    height: containerHeight + "px"
  });

  var data = [];
  var headers = _.map(_.keys(rows[0]), function(header, idx) {
    if (util.isEmpty(header)) return "Column " + idx;
    return header;
  });
  _.forEach( rows , function(row) {
    data.push( _.values(row) );
  });

  var handsOnTable = new Handsontable(document.getElementById("grid"),
    {
      data: data,
      readOnly: true,
      autoWrapRow: true,
      autoWrapCol: true,
      wordWrap: false,
      width: containerWidth,
      height: containerHeight,
      colWidths: 100,
      rowHeight: 24,
      colHeaders: headers,
      rowHeaders: true,
      columnSorting: false,
      manualRowResize: false,
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
  window.handsOnTable = handsOnTable;
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

  var searchTimeout;
  this.searchHandler = function (event) {
    if(searchTimeout) clearTimeout(searchTimeout);
    setTimeout(function() {
      handsOnTable.search.query(event.target.value);
      handsOnTable.render();
    }, 500)
  }
  var searchField = document.getElementById("search-field");
  Handsontable.Dom.addEvent(searchField, "keydown", this.searchHandler);
};
HTMLRenderer.prototype = Object.create(Renderer.prototype, {});
HTMLRenderer.prototype.constructor = HTMLRenderer;

HTMLRenderer.prototype.addResult = function(suite, test, result) {
  this.resultList.push({ suite: suite, test: test, result: result || {} });
};

HTMLRenderer.prototype.destroy = function() {
  var searchField = document.getElementById("search-field");
  Handsontable.Dom.removeEvent(searchField, "keydown", this.searchHandler)
  this.handsOnTable.destroy();
  d3.select("#grid").selectAll("*").remove();
}

HTMLRenderer.prototype.done = function() {
  var columnHeads = this.columnHeads;
  var rows = this.rows;
  var resultList = this.resultList;
  var handsOnTable = this.handsOnTable;

  this.comments = renderCellComments(rows, columnHeads, resultList, handsOnTable);
  this.highlightGrid();

  var that = this;
  setTimeout(function() {
    that.renderFingerPrint();
  }, 100);

  handsOnTable.addHook("afterColumnSort", function(columnIndex) {
    that.renderFingerPrint({col: columnIndex });
  });
  handsOnTable.addHook("afterOnCellMouseDown", function(evt, coords) {
    that.renderFingerPrint({col: coords.col, row: coords.row });
  });

  // Want to separate out tests that failed and tests that passed here

  // Summarize testsPassed.length, and then append all failed tests like normal

  d3.select(".test-sets")
    .insert("div", ":first-child")
    .html(function() {
      var headersCheck = resultList[0];
      var missingHeadersStr = "<div class='header-info'>";
      if (headersCheck.result.testState === "failed") {
        missingHeadersStr += "<i class='fa fa-times-circle'></i>";
        missingHeadersStr += " Ignored ";
        missingHeadersStr += headersCheck.result.badColumnHeads.join(", ");
        missingHeadersStr += " because it had a missing or duplicate column header. Dataproofer requires unique column header names.";
        missingHeadersStr += "</div>";
      } else {
        missingHeadersStr += "<i class='fa fa-check-circle'></i>";
        missingHeadersStr += " No missing or duplicate column headers";
      }
      return missingHeadersStr;
    });

  var passedResults = _.filter(resultList, function(d){
    return d.result.testState === "passed";
  });

  var numPassed = passedResults.length;
  var numTests = resultList.length; //missing headers counted but not shown

  d3.select(".test-sets")
    .insert("div", ":first-child")
    .attr("class", "summary")
    .html(function() {
      return numPassed + " passed out of " + numTests + " total";
    });

  var tests = d3.selectAll(".test")
    .data(resultList, function(d) { return d.suite + "-" + d.test.name(); });

  tests.select("i.fa-question-circle")
    .each(function(d) {
      d3.select(this)
        .attr("original-title", function(d) {
          var tooltipStr = "";
          if (d.result.passed !== "passed") {
            tooltipStr += d.test.conclusion();
          } else {
            tooltipStr += d.test.description();
          }

          return tooltipStr;
        });
    });

  var timeout;
  var filterResults = function (d) {
    clearTimeout(timeout);
    that.renderFingerPrint({ test: d.test.name(), column: d.column });
    that.highlightGrid({ highlightCells: d.result.highlightCells || [], testName: d.test.name() });
  };

  var clearFilteredResults = function(d) {
    // debounce
    timeout = setTimeout(function() {
      that.renderFingerPrint();
      that.highlightGrid();
    }, 300);
  };
  that.clearFilteredResults = clearFilteredResults;

  tests.classed("pass", function(d) {
    return d.result.testState === "passed";
  })
  .classed("fail", function(d) {
    return d.result.testState === "failed";
  })
  .classed("warn", function(d) {
    return d.result.testState === "warn";
  })
  .classed("info", function(d) {
    return d.result.testState === "info";
  })
  .on("mouseover", filterResults)
  .on("mouseout", clearFilteredResults);

  tests.insert("i", "label")
    .attr("class", function(d) {
      if (d.result.testState === "passed") return "fa-check-circle";
      if (d.result.testState === "failed") return "fa-times-circle";
      if (d.result.testState === "warn") return "fa-exclamation-circle";
      if (d.result.testState === "info") return "fa-info-circle";
    })
    .classed("result-icon fa", true);


};

HTMLRenderer.prototype.highlightGrid = function(options) {
  if(!options) options = {};
  var highlightCells = options.highlightCells;
  var testName = options.testName;

  var comments = [];
  if(options.testName) {
    comments = this.comments;
  } else {
    this.comments.filter(function(comment) {
      return comment.array.filter(function(d) { return d.testState !== "info" }).length > 0
    });
  }
  var handsOnTable = this.handsOnTable;

  // var rowsToShow = [];
  if (highlightCells && testName) {
    var currentComments = _.filter(comments, function(comment) {
      return comment.array
        .map(function(d) { return d.name })
        .indexOf(testName) > -1;
    });
    handsOnTable.updateSettings({
      cell: currentComments,
      commentedCellClassName: "htCommentCell filtered"
    });
    if (currentComments[0]) {
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

  function renderPrint() {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    comments.forEach(function(comment) {
      var array = [];
      if(test) {
        array = comment.array.filter(function(d) { return d.name === test; });
      } else {
        array = comment.array.filter(function(d) { return d.testState === "failed" || d.testState === "warn" });
      }
      // only render this cell if its got items in the array
      if(!array.length && !comment.array.length) return;
      if(!array.length && comment.array.length) {
        context.fillStyle = "#ddd"; // default state if info/pass
      } else {
        if(test) {
          context.fillStyle = "#e03e22"; // if a test is highlighted we show it's cells as red
        } else {
          context.fillStyle = "#EFE7B8"; //default state if array has failed/warn elements
        }
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
    handsOnTable.selectCell(row, col, row, col, true);

    renderPrint();
    renderCol(col);
    renderRow(row);
  }

  var drag = d3.drag()
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
          if(value) {
            commentCollector[rowIndex][columnHead].push({name: d.test.name(), testState: d.result.testState});
          }
        });
      });
    }
  });

  _.each(rows, function(row, rowIndex) {
    _.each(columnHeads, function(columnHead, columnIndex) {
      var array = commentCollector[rowIndex][columnHead];
      if(array && array.length && array.length > 0) {
        var names = array.map(function(d) { return d.name })
        var string = names.join("\n");
        comments.push({row: rowIndex, col: columnIndex, comment: string, array: array});
      }
    });
  });

  return comments;
}

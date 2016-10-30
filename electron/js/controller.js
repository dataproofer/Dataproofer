var jQ = require("jquery");
require("tipsy-browserify")(jQ);
var d3 = require("d3");
var _ = require("lodash");
var Processor = require("dataproofer").Processing;
var gsheets = require("gsheets");
var ipc = require("electron").ipcRenderer;

// libraries required to run test inline
// var requireFromString = require("require-from-string");
var DataprooferTest = require("dataproofertest-js");
var uuid = require("uuid");

console.log("dataproofer app version", require("./package.json").version);
console.log("dataproofer lib version", require("dataproofer").version);

// keep track of global renderer
var renderer;

var SUITES = [
  require("dataproofer-info-suite"),
  require("dataproofer-core-suite"),
  require("dataproofer-stats-suite"),
  require("dataproofer-geo-suite")
];

// turn on all tests by default
SUITES.forEach(function(suite) {
  suite.tests.forEach(function(test) {
    if (test.active === false) return; // don't overwrite a test's default setting if it's set to false
    test.active = true;
  });
});
// We receive this event on startup. It should happen before the suites are rendered;
// There is a possible edge case when loading from last file where this could
// happen after step 2 & 3, thereby missing the saved ones until next rerendering.
ipc.on("load-saved-tests", function(evt, loaded) {
  //console.log("Loading saved checks", loaded);
  var suite = {
    name: "local-tests",
    fullName: "Custom Checks",
    active: true,
    tests: []
  };
  loaded.forEach(function(testFile) {
    var test = loadTest(testFile);
    if (test) {
      suite.tests.push(test);
    }
  });
  SUITES.splice(0, 0, suite);
});

function loadTest(testFile) {
  var test = new DataprooferTest();
  var methodology;
  try {
    eval("methodology = (function(){ return " + testFile.methodology + "})();");
  } catch (e) {
    methodology = function(rows, columnHeads) {
      alert("error loading test", testFile);
      console.error(e.stack);
    };
    test.code = testFile.methodology;
  }
  test.name(testFile.name)
    .description(testFile.description)
    .methodology(methodology);
  test.local = true;
  test.active = true;
  test.filename = testFile.filename;
  return test;
}

function deleteTest(test) {
  ipc.send("delete-test", test.filename);
  var localSuite = SUITES[0];
  var index = localSuite.tests.indexOf(test);
  localSuite.tests.splice(index, 1);
  renderCurrentStep();
}

function duplicateTest(test) {
  var newTest = {
    name: test.name() + " copy",
    description: test.description(),
    filename: uuid.v1(),
    local: true,
    active: true,
    methodology: test._methodology.toString()
  };
  ipc.send("save-test", newTest);
  var loadedTest = loadTest(newTest);
  SUITES[0].tests.push(loadedTest); // assuming the first suite is always local
  renderCurrentStep(); // we should only be here on step 2
  return loadedTest;
}

ipc.on("last-test-config", function(event, testConfig) {
  loadTestConfig(testConfig);
});

function loadTestConfig(config) {
  //console.log("Loading check configuration.", config);
  if (!config) return;
  // update the active status of each suite and test found in the config.
  // if nothing is found for a given test in the config, then nothing is done to it.
  // by default we activate everything so any new tests will be active by default.
  SUITES.forEach(function(suite) {
    var configSuite = config[suite.name];
    if (configSuite) {
      //suite.active = configSuite.active;
      suite.tests.forEach(function(test) {
        var configTest = configSuite.tests[test.name()];
        if (configTest) test.active = configTest.active;
      });
    }
  });
  // TODO: if this happens any time other than initialization, we'd
  // need to rerender step2 (and subsequently re-run the tests);
}

function saveTestConfig() {
  // We save the test config (whether each test/suite is active) whenever
  // the active state of any test changes
  var testConfig = {};
  SUITES.forEach(function(suite) {
    testConfig[suite.name] = {
      tests: {}
    };
    suite.tests.forEach(function(test) {
      testConfig[suite.name].tests[test.name()] = {
        active: test.active
      };
    });
  });
  //console.log("Saving check configuration.", testConfig)
  // TODO: people may want to save various configurations under different names
  // like workspaces in illustrator/IDE
  ipc.send("test-config", {
    name: "latest",
    config: testConfig
  });
}

// We keep around a reference to the most recently used processorConfig
// it can be set on load (the node process sends it over);
// or when a user chooses a file or loads a google sheet
var lastProcessorConfig = {};

// the current step in the process we are on
var currentStep = 1;
var rerunFlag = false;
renderNav();

// update the navigation depending on what step we are on
function renderNav() {
  var back = d3.select("#back-button");
  var forward = d3.select("#forward-button");
  switch (currentStep) {
    case 1:
      back.style("display", "none");
      forward.style("display", "none");
      break;
    case 2:
      back.style("display", "none")
        .html("<i class='fa fa-chevron-circle-left'></i> Load data");
      forward.style("display", "inline-block")
        .html("Run tests <i class='fa fa-chevron-circle-right'></i>");
      break;
    case 3:
      back.style("display", "inline-block")
        .html("<i class='fa fa-chevron-circle-left'></i> Pick tests");
      forward.style("display", "inline-block")
        .html("Test again <i class='fa fa-chevron-circle-right'></i>");
      break;
  }
}

// convenience function to render whatever step we are currently on
function renderCurrentStep() {
  switch (currentStep) {
    case 1:
      renderStep1(lastProcessorConfig);
      break;
    case 2:
      renderStep2(lastProcessorConfig);
      break;
    case 3:
      renderStep3(lastProcessorConfig);
      break;
  }
}

d3.select("#back-button").on("click", function() {
  currentStep--;
  renderNav();
  renderCurrentStep();
});
d3.select("#forward-button").on("click", function() {
  if(currentStep < 3) {
    currentStep++;
  }
  renderNav();
  renderCurrentStep();
});

// This function updates the step 1 UI once a file has been loaded
function renderStep1(processorConfig) {
  clear();
  // get rid of everything from step 2
  d3.select(".test-sets").selectAll("*").remove();
  var column1 = d3.select(".column-1");
  column1.node().scrollTop = 0;
  column1.select(".test-sets").style('min-height', null);
}

// This function renders step 2, the UI for selecting which tests to activate
function renderStep2(processorConfig) {
  var container = d3.select(".test-sets");
  clear();
  d3.select(".column-2")
    .style("background-image", "url(img/empty-state-2.png)");
  d3.select("#file-loader-button")
    .classed("loaded", true)
    .html("<i class='fa fa-search' aria-hidden='true'></i> Select New File");
    // .on("click", function() {
    //   document.location.reload(true);
    // });

  d3.select("#forward-button").classed("rounded", true);

  d3.select("#current-file-name").text(processorConfig.loaded.config.filename);
  var infoOffsetTop = d3.select("#info-top-bar").property("offsetTop");
  d3.select(".column-1")
    .transition()
    .duration(750)
    .tween("scroll.info", scrollTween(infoOffsetTop));

  function scrollTween(offset) {
    return function() {
      offset -= d3.select(".top-bar").property("scrollHeight");
      var i = d3.interpolateNumber(this.scrollTop, offset);
      return function(t) { d3.select(".column-1").node().scrollTop = i(t); };
    };
  }

  // Handle large file sizes with a warning
  var loaded = processorConfig.loaded;
  // arbitrary number, for loops will get more expensive from here...
  var ncolumns = Object.keys(loaded.rows[0]).length;
  var nrows = loaded.rows.length;
  //console.log("cols", ncolumns, "rows", nrows, "cells", nrows * ncolumns);
  if(nrows * ncolumns > 100000) {
    d3.select("#file-size-warning").classed("hidden", false);
  }

  // Remove 'all tests passed' indicator if going back to tests from step 3
  // we just remove everything rather than get into update pattern
  container.selectAll("*").remove();

  // create the containers for each suite
  var filteredSuites = _.filter(processorConfig.suites, function(suite) {
    return suite.tests.length > 0;
  });
  var suites = container.append("ul");
  var suitesEnter = suites
    .selectAll(".suite")
    .data(filteredSuites)
    .enter().append("li")
    .attr("id", function(d) { return d.name; })
    .attr("class", "suite");
  suitesEnter.append("input")
    .attr("class", "toggle")
    .attr("type", "checkbox")
    .attr("id", function(d, i) { return "suite-" + i; })
    .each(suiteState)
    .on("change.suite", function(d) {
      var dis = d3.select(this);
      var active = dis.property("checked");
      d.tests.forEach(function(test) {
        test.active = active;
      });
      updateTestsActiveState();
      saveTestConfig();
    });

  suitesEnter.append("label")
    .attr("class", "suite-hed")
    .attr("for", function(d, i) {
      return "suite-" + i;
    })
    .text(function(d) {
      return d.fullName; //+ " – " + d.active;
    });

  function suiteState(d) {
    var activeCount = 0;
    d.tests.forEach(function(test) {
      if(test.active) activeCount++;
    });
    if (activeCount === 0) {
      d3.select(this)
        .property("checked", false)
        .property("indeterminate", false);
    } else if (activeCount === d.tests.length) {
      d3.select(this)
        .property("checked", true)
        .property("indeterminate", false);
    } else {
      // we have some active tests
      d3.select(this)
        .property("checked", null)
        .property("indeterminate", true);
    }
  }

  // render the tests
  var testWrapper = suitesEnter.append("ul")
    .attr("class", "tests-wrapper");

  var tests = testWrapper
    .selectAll(".test")
    .data(function(d) {
      // we format the data to match closer to what it will look like when we
      // get results
      var results = d.tests.map(function(t) {return { test: t, suite: d.name };});
      return results;
    }, function(d) {
      // key function so we can uniquely update this later
      return d.suite + "-" + d.test.name();
    });

  var testsEnter = tests.enter().append("li")
    .classed("test", true)
    .classed("onoff", true)
    .attr("id", function(d) {
      return d.test.name().replace(/\s+/g, "-").toLowerCase();
    });

  testsEnter.append("button").classed("delete-test", true)
    .html("<span class=\"icon icon-cancel-squared\"></span>")
    .style("display", function(d) {
      if (d.test.filename) return "block";
      return "none";
    })
    .on("click", function(d) {
      deleteTest(d.test);
    });

  testsEnter.append("input")
    .attr("class", "toggle")
    .attr("type", "checkbox")
    .attr("id", function(d, i) {
      return d3.select(this.parentNode).attr("id") + "-test-" + i;
    })
    .on("change.test", toggleTests);

  updateTestsActiveState();
  function updateTestsActiveState() {
    testWrapper.selectAll(".test")
      .classed("active", function(d) {
        return d.test.active;
      });
    testWrapper.selectAll(".test")
      .select("input")
      .property("checked", function(d) {
        return d.test.active;
      });
  }

  testsEnter.append("label")
    .attr("for", function(d, i) {
      return d3.select(this.parentNode).attr("id") + "-test-" + i;
    })
    .text(function(d) { return d.test.name(); });

  testsEnter.append("div")
    .attr("class", "info-wrapper")
    .append("i")
    .attr("original-title", function(d) { return d.test.description(); })
    .attr("class", "fa fa-question-circle")
    .attr("aria-hidden", "true")
    .each(function(d) {
      jQ(this).tipsy({
        html: true,
        gravity: jQ.fn.tipsy.autoNS
      });
    });


  function toggleTests(d) {
    d.test.active = !d.test.active;
    saveTestConfig();
    updateTestsActiveState();
    suitesEnter.select("input")
      .each(suiteState);
  }

  // testsEnter.append("div").classed("message", true);
  testsEnter.append("button").classed("edit-test", true)
    .html(function(d) {
      if (d.local) return "<i class='fa fa-file-code-o'></i>";
      return "<i class='fa fa-file-code-o'></i>";
    })
    .on("click", function(d) {
      renderTestEditor(d.test);
    });

  testsEnter.on("dblclick", function(d) {
    renderTestEditor(d.test);
    d3.event.preventDefault();
    d3.event.stopPropagation();
  });
}

function renderStep3(processorConfig) {
  // rerun if there's more rows
  if (rerunFlag) {
    rerunStep3(processorConfig);
    return;
  }
  // set the flag to true after the first run if there's more rows
  if (processorConfig.loaded.sampleProgress < 1) rerunFlag = true;
  // make sure we can scroll enough to hide the loader/logo
  d3.select(".test-sets").style('min-height', "100%");
  // var loaded = Processor.load(loadConfig);
  // processorConfig.loaded = loaded;
  renderer = Processor.run(processorConfig);
  // make sure the tests ares still scrolled to the top
  var topBar = d3.select(".top-bar").property("scrollHeight");
  var offsetTop = d3.select("#info-top-bar").property("offsetTop") - topBar;
  var column1 = d3.select(".column-1");
  column1.node().scrollTop = offsetTop;
}

function rerunStep3(processorConfig) {
  // make sure we can scroll enough to hide the loader/logo
  d3.select(".test-sets").style('min-height', "100%");
  var loadConfig = processorConfig.loaded.config;
  var loaded = Processor.load(loadConfig);
  processorConfig.loaded = loaded;
  renderer = Processor.run(processorConfig);
  // make sure the tests ares still scrolled to the top
  var topBar = d3.select(".top-bar").property("scrollHeight");
  var offsetTop = d3.select("#info-top-bar").property("offsetTop") - topBar;
  var column1 = d3.select(".column-1");
  column1.node().scrollTop = offsetTop;
}

function clear() {
  d3.select("#current-file-name").text("");
  d3.select("#file-size-warning").classed("hidden", true);
  d3.select("#progress-bar").classed("hidden", true);
  d3.select(".column-1").classed("all-passed", false);
  d3.select(".column-3").classed("hidden", true);
  d3.select(".grid-footer").classed("hidden", true);
  d3.selectAll("#nav-buttons button")
    .classed("rounded", false)
    .classed("hidden", false);
  d3.select(".column-2")
    .style("background-image", "none")

  if (typeof renderer === "object") {
    renderer.then(
      function(htmlRenderer) {
        htmlRenderer.destroy();
      }, function(reason) {
        console.log("handsOnTable destroy", reason);
    });
  }

  d3.selectAll(".tests-wrapper").classed("hidden", false);
  d3.selectAll(".test").classed("hidden", false);
  d3.selectAll(".toggle").classed("hidden", false);
  d3.selectAll(".test label").style("pointer-events", "auto");
  d3.selectAll(".suite-hed").classed("hidden", false);
}


function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}
var dropZone = d3.select(".window-content").node();
dropZone.addEventListener("dragover", handleDragOver, false);
dropZone.addEventListener("drop", handleFileSelect, false);


// This handles file selection via the button
document.getElementById("file-loader").addEventListener("change", handleFileSelect, false);

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  d3.select("#file-loader-button").text("Loading");
  var files = evt.target.files;
  if(!files && evt.dataTransfer) files = evt.dataTransfer.files;
  if (!files || !files.length) return;
  for (var i = 0, f; i < files.length; i++) {
    var file = files[i];
    var allowFileExtensions = [
      "csv",
      "tsv",
      "psv",
      "xlsx",
      "xls"
    ];
    var currFileName = file.name;
    var currExt = currFileName.split(".").pop();
    var reader = new FileReader();
    if (allowFileExtensions.indexOf(currExt) > -1) {
      // Closure to capture the file information.
      reader.onload = (function(progress) {
        var contents = progress.target.result;

        // we send our "server" the file so we can load it by defualt
        if (file.size < 5000000) // 5MB
          ipc.send("file-selected", JSON.stringify({
            name: file.name,
            path: file.path,
            contents: contents
          }));

        var loadConfig = {
          ext: currExt,
          filepath: file.path,
          // fileString: contents,
          filename: currFileName,
          sampleOpts: {
            sampleSize: 0.25,
            sampleMin: 1000,
            sampleMax: 10000
          }
        };
        var loaded = Processor.load(loadConfig);
        var processorConfig = {
          suites: SUITES,
          renderer: HTMLRenderer,
          input: {},
          loaded: loaded
        };
        lastProcessorConfig = processorConfig;
        renderStep1(processorConfig);
        currentStep = 2;
        renderNav();
        renderCurrentStep();
      });
    } else {
      var fileTypes = allowFileExtensions.join(", ").toUpperCase();
      alert("Must upload one of the following file types: " + fileTypes);
    }
  }
  reader.readAsText(file);
}

ipc.on("last-file-selected", function(event, file) {
  var loadConfig = {
    ext: file.name.split(".").pop(),
    filepath: file.path,
    filename: file.name,
    sampleOpts: {
      sampleSize: 0.25,
      sampleMin: 1000,
      sampleMax: 10000
    }
  };
  var loaded = Processor.load(loadConfig);
  lastProcessorConfig = {
    suites: SUITES,
    renderer: HTMLRenderer,
    input: {},
    loaded: loaded
  };
});

function loadLastFile() {
  renderStep1(lastProcessorConfig);
  renderStep2(lastProcessorConfig);
  currentStep = 3;
  renderNav();
  renderCurrentStep();
}

d3.select("#spreadsheet-button").on("click", handleSpreadsheet);
d3.select("#spreadsheet-input").on("keyup", function() {
  if (d3.event.keyIdentifier == "Enter") {
    handleSpreadsheet();
  }
});

window.onerror = function(message) {
  console.log(arguments);
  console.log(message);
  //alert(message);
};

function handleSpreadsheet() {
  var keyRegex = /\/d\/([\w-_]+)/;
  var spreadsheetInputStr = d3.select("#spreadsheet-input").node().value;
  var match = spreadsheetInputStr.match(keyRegex);
  var gid = spreadsheetInputStr;
  if (match) {
    gid = match[1];
  }

  /*
  // TODO: get worksheet info and present the user with a choice
  gsheets.getSpreadsheet(gid, function(err, response) {
  if(err) {
    console.log(err);
  };
  console.log("response", response);
  });
  */
  gsheets.getWorksheetById(gid, "od6", process);

  function handleGsheetsError(err) {
    alert(err.toString());
  }

  function process(err, sheet) {
    // console.log(err);
    // console.log(sheet);
    if (err) {
      handleGsheetsError(err);
      console.log("gsheets error", err);
    } else if (sheet) {
      //console.log("sheet", sheet);
      var columnHeads = Object.keys(sheet.data[0]);
      var rows = sheet.data;
      var trueRows = rows.length;
      var config = {
        title: sheet.title,
        updated: sheet.updated
      };
      var loaded = {
        rows: rows,
        columnHeads: columnHeads,
        trueRows: trueRows,
        config: config
      };
      var processorConfig = {
        filename: sheet.title,
        suites: SUITES,
        renderer: HTMLRenderer,
        loaded: loaded,
        input: {}
      };
      lastProcessorConfig = processorConfig;
      renderStep1(config);
      currentStep = 2;
      renderCurrentStep();
      renderNav();
    } else {
      alert("Warning: must use non-empty worksheet");
    }
  }
}

var testEditor = d3.select(".test-editor");
testEditor.style("display", "none");

function hideEditor() {
  testEditor.style("display", "none");
  d3.select("#info-top-bar").style("display", "block");
}

// setup CodeMirror editor

function renderTestEditor(test) {

  d3.select("#info-top-bar").style("display", "none");
  testEditor.select("#test-editor-js").selectAll("*").remove();
  testEditor.selectAll("button").remove();

  testEditor.append("button")
    .attr("id", "cancel-test")
    .html("<i class='fa fa-chevron-circle-left'></i> Return")
    .on("click", function() {
      hideEditor();
    });

  testEditor.append("button")
    .attr("id", "copy-test")
    .html("<i class='fa fa-files-o'></i> Duplicate")
    .on("click", function() {
      // saving without passing in the filename will inform the server
      // to generate a new filename
      /*
    var newTestFile = save(uuid.v1());
    var newTest = loadTest(newTestFile);
    SUITES[0].tests.push(newTest); // assuming the first suite is always local
    renderCurrentStep(); // we should only be here on step 2
    */
      duplicateTest(test);
      hideEditor();
    });

  var saveTest = testEditor.append("button").attr("id", "save-test").text("Save")
    .style("display", "none")
    .on("click", function() {
      save(test.filename);
      renderCurrentStep();
      hideEditor();
    });
  if (test.local) {
    saveTest.style("display", "inline-block");
  }

  testEditor.style("display", "block");
  var nameInput = d3.select("#test-editor-name");
  nameInput.node().value = test.name();

  var descriptionInput = d3.select("#test-editor-description");
  descriptionInput.node().value = test.description();

  var methodology;
  if (test.code) {
    // if there was an error with the test, we want to load the last code string
    // rather than try using the methodology. this property will only be present
    // if loadTest failed to eval the methodology
    methodology = test.code;
  } else {
    methodology = test._methodology.toString();
  }

  var codeMirror = window.CodeMirror(d3.select("#test-editor-js").node(), {
    tabSize: 2,
    value: methodology,
    mode: "javascript",
    htmlMode: true,
    lineNumbers: true,
    theme: "mdn-like",
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
      "Cmd-/": "toggleComment",
      "Ctrl-/": "toggleComment"
    },
    viewportMargin: Infinity
  });

  function save(filename) {
    var name = nameInput.node().value;
    var newTest = {
      name: name,
      description: descriptionInput.node().value,
      filename: filename,
      local: true,
      active: true,
      methodology: codeMirror.getValue()
    };

    // if we had code saved on here, remove it
    delete test.code;

    ipc.send("save-test", newTest);
    test.name(newTest.name);
    test.description(newTest.description);
    var loadedTest = loadTest(newTest);
    test.methodology(loadedTest.methodology());
    test.code = loadedTest.code; // if there was an error loading, it will appear here
    return newTest;
  }

  /*
  nameInput.on("change", save);
  descriptionInput.on("change", save);
  codeMirror.on("change", save);
  */
}

// Enable context menu
// http://electron.atom.io/docs/all/#render-process
// The remote module is required to call main process modules
const {remote} = require("electron");
const {Menu, MenuItem} = remote;
var rightClickPosition = null;
var menu = new Menu();
menu.append(new MenuItem({
  label: "Inspect Element",
  click: function() {
    remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y);
  }
}));

window.addEventListener("contextmenu", function(e) {
  e.preventDefault();
  rightClickPosition = {
    x: e.x,
    y: e.y
  };
  menu.popup(remote.getCurrentWindow());
}, false);

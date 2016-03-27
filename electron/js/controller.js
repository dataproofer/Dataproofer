var d3 = require('d3');
var Processor = require('dataproofer').Processing
var gsheets = require('gsheets')
var ipc = require("electron").ipcRenderer

console.log("dataproofer app version", require('./package.json').version)
console.log("dataproofer lib version", require('dataproofer').version)


var SUITES = [
  require('dataproofer-info-suite'),
  require('dataproofer-core-suite'),
  require('dataproofer-stats-suite'),
  require('dataproofer-geo-suite'),
]

// turn on all tests by default
SUITES.forEach(function(suite) {
  if(suite.active !== false) {
    // only set it to active if the property doesn't exist or is already true
    suite.active = true;
  }
  suite.tests.forEach(function(test){
    if(test.active === false) return; // don't overwrite a test's default setting if it's set to false
    test.active = true;
  })
})

// We keep around a reference to the most recently used processorConfig
// it can be set on load (the node process sends it over)
// or when a user chooses a file or loads a google sheet
var lastProcessorConfig = {}

// the current step in the process we are on
var currentStep = 1;
renderNav();

// update the navigation depending on what step we are on
function renderNav() {
  var back = d3.select("#back-button")
  var forward = d3.select("#forward-button")
  var grid = d3.select("#grid")
  switch(currentStep) {
    case 1:
      back.style("display", "none")
      forward.style("display", "none")
      grid.style("display", "none")
      break;
    case 2:
      back.style("display", "inline-block")
        .text("Load data")
      forward.style("display", "inline-block")
        .text("Run Tests")
      grid.style("display", "none")
      break;
    case 3:
      back.style("display", "inline-block")
        .text("Select Tests")
      forward.style("display", "none")
      grid.style("display", "inline-block")
      break;
  }
}

// convenience function to render whatever step we are currently on
function renderCurrentStep() {
  switch(currentStep) {
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
})
d3.select("#forward-button").on("click", function() {
  currentStep++;
  renderNav();
  renderCurrentStep();
})

// This function updates the step 1 UI once a file has been loaded
function renderStep1(processorConfig) {
  var step1 = d3.select(".step-1-data")
  clear();
  d3.select(".step-1-data").style("display", "block")
}

// This function renders step 2, the UI for selecting which tests to activate
function renderStep2(processorConfig) {
  var container = d3.select(".step-2-select-content")


  d3.select(".step-2-select").style("display", "block")
  d3.select(".step-3-results").style("display", "none")
  d3.select(".step-1-data").style("display", "none")

  // we just remove everything rather than get into update pattern
  container.selectAll(".suite").remove();
  // create the containers for each suite
  var suites = container.selectAll(".suite")
    .data(processorConfig.suites)
  var suitesEnter = suites.enter().append("div")
    .attr({
      id: function(d) { return d.name },
      class: function(d) { return "suite " + (d.active ? "active" : "") }
    })
  suitesHeds = suitesEnter.append("div")
    .attr("class", "suite-hed")
  suitesHeds.append("h2")
    .text(function(d) { return d.fullName })
  suitesHeds.append("input")
    .attr({
      "class": "toggle",
      "type": "checkbox",
      "id": function(d,i){return 'suite-' + i;}
    }).each(function(d) {
      if(d.active) {
        d3.select(this).attr("checked", true)
      } else {
        d3.select(this).attr("checked", null)
      }
    })
  suitesHeds.append('label')
    .attr('for', function(d,i){return 'suite-' + i;})
    .on("click", function(d) {
      d.active = !d.active;
      d3.select(this.parentNode.parentNode).classed("active", d.active)
      console.log("suite", d)
      // saveTestConfig();
    })

  // render the tests
  var tests = suitesEnter.selectAll(".test")
    .data(function(d) { return d.tests })

  var testsEnter = tests.enter().append("div")
  .attr("class", function(d) { return d.active ? "test active" : "test" })


  onOff = testsEnter.append("div").classed("onoff", true)
  onOff.append("input")
    .attr({
      "class": "toggle",
      "type": "checkbox",
      "id": function(d,i){return d3.select(this.parentNode.parentNode.parentNode).attr('id') + '-test-' + i;}
    }).each(function(d) {
      if(d.active) {
        d3.select(this).attr("checked", true)
      } else {
        d3.select(this).attr("checked", null)
      }
    })
  onOff.append('label')
    .attr('for', function(d,i){return d3.select(this.parentNode.parentNode.parentNode).attr('id') + '-test-' + i;})

  testsEnter.append("div").classed("message", true)

  tests.select("div.message").html(function(d) {
    var html = '<h3 class="test-header">' + (d.name() || "") + '</h3>'
    html += d.description() || ""
    return html
  })
  tests.select('label')
    .on("click", function(d) {
      console.log("test", d)
      d.active = !d.active;
      d3.select(this.parentNode.parentNode).classed("active", d.active)
      // saveTestConfig();
    })

  d3.select("#current-file-name").text(processorConfig.filename)

  d3.select(".run-tests")
    .text("Run tests")
    .on("click", function() {
      currentStep = 3;
      renderNav();
      renderCurrentStep();
    })
}

function renderStep3(processorConfig) {
  Processor.run(processorConfig)
  d3.select(".step-3-results").style("display", "block")
  d3.select(".step-2-select").style("display", "none")
}

function clear() {
  d3.select("#current-file-name").text("");
  d3.select(".step-1-data").style("display", "none")
  d3.select(".step-2-select").style("display", "none")
  d3.select(".step-3-results").style("display", "none")

  d3.select(".step-2-select").selectAll(".suite").remove();
  d3.select(".step-3-results").selectAll(".suite").remove();
  d3.select("#grid").selectAll("*").remove();
}

// This handles file selection via the button
document.getElementById('file-loader').addEventListener('change', handleFileSelect, false);
function handleFileSelect(evt) {
  var files = evt.target.files
  if(!files || !files.length) return;
  for(var i = 0, f; i < files.length; i++) {
    var file = files[i];
    //console.log("loading file", file.name, file);


    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(progress) {
      var contents = progress.target.result;

      // we send our "server" the file so we can load it by defualt
      ipc.send("file-selected", JSON.stringify({name: file.name, path: file.path, contents: contents}));

      processorConfig = {
        fileString: contents,
        filename: file.name,
        // TODO: replace this with activeSuites
        suites: SUITES,
        renderer: HTMLRenderer,
        input: {}
      }
      lastProcessorConfig = processorConfig;
      renderStep1(processorConfig);
      currentStep = 2
      renderNav();
      renderCurrentStep();
    })
  }
  reader.readAsText(file);
}

// if we receive a saved file we load it
ipc.on("last-file-selected", function(event, file) {
  //console.log("last file selected was", file)
  lastProcessorConfig = {
    fileString: file.contents,
    filename: file.name,
    suites: SUITES,
    renderer: HTMLRenderer,
    input: {}
  }

})
function loadLastFile() {
  renderStep1(lastProcessorConfig);
  renderStep2(lastProcessorConfig);
  currentStep = 3;
  renderNav();
  renderCurrentStep();
}


d3.select('#spreadsheet-button').on('click', handleSpreadsheet);
d3.select("#spreadsheet-input").on("keyup", function() {
  if(d3.event.keyIdentifier == 'Enter') {
    handleSpreadsheet();
  }

})
window.onerror = function(message) {
  console.log(arguments)
  console.log(message)
}
function handleSpreadsheet() {
  var keyRegex = /\/d\/([\w-_]+)/
  var spreadsheetInputStr = d3.select("#spreadsheet-input").node().value
  var match = spreadsheetInputStr.match(keyRegex)
  var gid = spreadsheetInputStr;
  if(match) {
    gid = match[1]
  }

  /*
  // TODO: get worksheet info and present the user with a choice
  gsheets.getSpreadsheet(gid, function(err, response) {
    if(err) {
      console.log(err)
    }
    console.log("response", response)
  })
  */
  gsheets.getWorksheetById(gid, 'od6', process)

  function handleGsheetsError(err) {
    d3.select("#gsheets-response").text(err.toString() )
  }

  function process(err, sheet) {
    // console.log(err);
    // console.log(sheet);
    if (err) {
      handleGsheetsError(err);
      console.log(err);
    }
    else if (sheet) {
      //console.log("sheet", sheet);
      var column_names = Object.keys(sheet.data[0]);
      var config = {
        //fileString: contents,
        filename: sheet.title,
        columnsHeads: column_names,
        rows: sheet.data,
        suites: SUITES,
        renderer: HTMLRenderer,
        input: {}
      };
      lastFileConfig = config;
      renderStep1(config);
      currentStep = 2;
      renderCurrentStep();
      renderNav();
    } else {
      console.log("Warning: must use non-empty worksheet")
    }
  }
};

// Enable context menu
// http://stackoverflow.com/questions/32636750/how-to-add-a-right-click-menu-in-electron-that-has-inspect-element-option-like
// The remote module is required to call main process modules
var remote = require('remote');
var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');
var rightClickPosition = null;
var menu = new Menu();
menu.append(new MenuItem({ label: 'Inspect Element', click: function() {
  remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y);
} }));

window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  rightClickPosition = {x: e.x, y: e.y};
  menu.popup(remote.getCurrentWindow());
}, false);

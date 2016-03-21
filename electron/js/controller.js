var d3 = require('d3');
var Processor = require('dataproofer').Processing
var gsheets = require('gsheets')
var ipc = require("electron").ipcRenderer

console.log("dataproofer app version", require('./package.json').version)
console.log("dataproofer lib version", require('dataproofer').version)

// TODO: handle reload button

var SUITES = [
  require('dataproofer-core-suite'),
  require('dataproofer-stats-suite'),
  require('dataproofer-geo-suite')
]

// turn on all tests by default
SUITES.forEach(function(suite) {
  suite.active = true;
  suite.tests.forEach(function(test){
    test.active = true;
  })
})


// This function updates the step 1 UI once a file has been loaded
function renderStep1(processorConfig) {
  var step1 = d3.select(".step-1-data")

  step1.selectAll("h3.filename").remove();
  step1.append("h3").classed("filename", true).text(processorConfig.filename)
  clear();
}

// This function renders step 2, the UI for selecting which tests to activate
function renderStep2(processorConfig) {
  var container = d3.select(".step-2-select-content")

  d3.select(".step-2-select").style("display", "block")
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
    .text(function(d) { return d.name })
  suitesHeds.append("input")
    .attr({
      "class": "toggle",
      "type": "checkbox",
      "id": function(d,i){return 'suite-' + i;}
    })
  suitesHeds.append('label')
    .attr('for', function(d,i){return 'suite-' + i;})
    .on("click", function(d) {
      d.active = !d.active;
      d3.select(this.parentNode.parentNode).classed("active", d.active)
      console.log("suite", d)
    })

  // render the tests
  var tests = suitesEnter.selectAll(".test")
    .data(function(d) { return d.tests })

  var testsEnter = tests.enter().append("div")
  .attr("class", function(d) { return d.active ? "test active" : "test" })
  testsEnter.append("div").classed("message", true)
  onOff = testsEnter.append("div").classed("onoff", true)
  onOff.append("input")
    .attr({
      "class": "toggle",
      "type": "checkbox",
      "id": function(d,i){return d3.select(this.parentNode.parentNode.parentNode).attr('id') + '-test-' + i;}
    })
  onOff.append('label')
    .attr('for', function(d,i){return d3.select(this.parentNode.parentNode.parentNode).attr('id') + '-test-' + i;})

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
    })

  d3.select("#current-file-name").text(processorConfig.filename)

  d3.select(".run-tests")
    .text("Run tests")
    .on("click", function() {
      renderStep3(processorConfig)
    })
}

function renderStep3(processorConfig) {
  Processor.run(processorConfig)
  d3.select(".step-3-results").style("display", "block")
  d3.select(".step-2-select").style("display", "none")
}

function clear() {
  d3.select(".step-2-select").style("display", "block")
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
    console.log("loading file", file.name, file);


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
      renderStep1(processorConfig);
      renderStep2(processorConfig);
    })
  }
  reader.readAsText(file);
}

// if we receive a saved file we load it
var lastFileConfig = {}
ipc.on("last-file-selected", function(event, file) {
  console.log("last file selected was", file)
  lastFileConfig = {
    fileString: file.contents,
    filename: file.name,
    suites: SUITES,
    renderer: HTMLRenderer,
    input: {}
  }

})
function loadLastFile() {
  renderStep1(lastFileConfig);
  renderStep2(lastFileConfig);
  renderStep3(lastFileConfig);
  Processor.run(lastFileConfig)
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
      console.log("sheet", sheet);
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
      renderStep1(config);
      renderStep2(config);
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
var currentWindow = remote.getCurrentWindow();
var rightClickPosition = null;
var menu = new Menu();
menu.append(new MenuItem({ label: 'Inspect Element', click: function() {
  currentWindow.inspectElement(rightClickPosition.x, rightClickPosition.y);
} }));

window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  rightClickPosition = {x: e.x, y: e.y};
  menu.popup(currentWindow);
}, false);

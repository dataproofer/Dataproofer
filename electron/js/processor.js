var d3 = require('d3');
var Processor = require('dataproofer').Processing
var gsheets = require('gsheets')
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

// TODO: stop abusing global variables
var processorConfig = {};

function renderStep2() {
  var container = d3.select(".step-2-select")

  // we just remove everything rather than get into update pattern
  container.selectAll(".suite").remove();
  // create the containers for each suite
  var suites = container.selectAll(".suite")
    .data(processorConfig.suites)
  var suitesEnter = suites.enter().append("div")
    .attr({
      class: function(d) { return d.name + " suite " + (d.active ? "active" : "") }
    })
  suitesEnter
    .append("h2").text(function(d) { return d.name })
    .on("click", function(d) {
      d.active = !d.active;
      d3.select(this.parentNode).classed("active", d.active)
      console.log("suite", d)
    })

  // render the tests
  var tests = suitesEnter.selectAll(".test")
    .data(function(d) { return d.tests })

  var testsEnter = tests.enter().append("div")
  .attr("class", function(d) { return d.active ? "test active" : "test" })
  testsEnter.append("div").classed("message", true)
  testsEnter.append("div").classed("onoff", true)

  tests.select("div.message").html(function(d) {
    var html = '<span class="test-header">' + (d.name() || "") + '</span><br/>'
    html += d.description() || ""
    return html
  })
  tests.on("click", function(d) {
    console.log("test", d)
    d.active = !d.active;
    d3.select(this).classed("active", d.active)
  })

  d3.select(".run-tests")
    .text("Run tests")
    .on("click", function() {
      Processor.run(processorConfig)
    })
}


document.getElementById('file-loader').addEventListener('change', handleFileSelect, false);
function handleFileSelect(evt) {
  var files = evt.target.files
  if(!files || !files.length) return;
  for(var i = 0, f; i < files.length; i++) {
  //files.forEach(function(file) {
    var file = files[i];
    console.log("loading file", file.name, file);
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(progress) {
      var contents = progress.target.result;
      processorConfig = {
        fileString: contents,
        filename: file.name,
        // TODO: replace this with activeSuites
        suites: SUITES,
        renderer: HTMLRenderer,
        input: {}
      }
      renderStep2();
    })
  }//)
  reader.readAsText(file);
}


d3.select('.tabletop-loader').on('click', handleSpreadsheet);
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
  gsheets.getWorksheetById(match[1], 'od6', process)

  function process(err, sheet) {
    // console.log(err);
    // console.log(sheet);
    if (err) {
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
      Processor.run(config);
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

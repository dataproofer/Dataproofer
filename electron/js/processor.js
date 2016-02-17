var d3 = require('d3');
var Processor = require('dataproofer').Processing
var gsheets = require('gsheets')
console.log("dataproofer app version", require('./package.json').version)
console.log("dataproofer lib version", require('dataproofer').version)

// TODO: handle reload button

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
      var config = {
        fileString: contents,
        filename: file.name,
        suites: [],
        renderer: HTMLRenderer,
        input: {}
      }
      Processor.run(config)
    })
  }//)
  reader.readAsText(file);
}


d3.select('.tabletop-loader').on('click', handleSpreadsheet);
d3.select("#spreadsheet-input").on("keyup", function() {
  console.log(d3.event)
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
        suites: [],
        renderer: HTMLRenderer,
        input: {}
      };
      Processor.run(config);
    } else {
      console.log("Warning: must use non-empty worksheet")
    }
  }
};

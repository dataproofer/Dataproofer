var d3 = require('d3');
var Processor = require('dataproofer').Processing
var Tabletop = require('tabletop')
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
  Tabletop.init({
    key: match[1],
    callback: process,
    simpleSheet: false,
    simple_url: true,
    debug: true
  });

  function process(data, tabletop) {
    // console.log("tabletop", tabletop)
    // console.log("data", data);
    // console.log("sheets", Object.keys(data));
    // Assuming the last spreadsheet will work
    var sheets = Object.keys(data);
    var sheet = data[sheets[sheets.length - 1]]
    console.log("sheet", data[sheets[0]]);
    var config = {
      //fileString: contents,
      filename: sheet.name,
      columns: sheet.column_names,
      rows: sheet.elements,
      suites: [],
      renderer: HTMLRenderer,
      input: {}
    }
    Processor.run(config)
  }
};

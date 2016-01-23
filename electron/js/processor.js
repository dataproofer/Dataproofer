var d3 = require('d3');
var Processor = require('../src/processing')
var Tabletop = require('tabletop')

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
  // this is a hack to get around tabletop's apparent lack of error handling
  // unless I'm missing something they assume the url given to the library will always be valid...
  // and emit uncaught errors if so.
  if(message && message.indexOf('Uncaught TypeError') == 0) {
    console.log("TABLETOP ERROR, invalid URL")
  }
}
function handleSpreadsheet() {

  var url = d3.select("#spreadsheet-input").node().value
  console.log("url", url)
  try {
    Tabletop.init({
      key: url,
      callback: process,
      simpleSheet: false
    });
  } catch(e) {
    // TODO error modal support
    console.log("error", e)
  }
    
  function process(data, tabletop) {
    //console.log("tabletop", tabletop)
    //console.log("data", data);

    // For now we just assume the first sheet in the spreadsheet will work
    var sheets = Object.keys(data);
    var sheet = data[sheets[0]]

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
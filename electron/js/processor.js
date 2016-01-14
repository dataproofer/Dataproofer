var d3 = require('d3');
var Processor = require('../src/processing')

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
        renderer: HTMLRenderer
      }
      Processor.run(config)
    })
  }//)
  reader.readAsText(file);
}
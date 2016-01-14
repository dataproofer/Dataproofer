var _ = require('lodash')
var d3 = require('d3')
var s = `this 
  is a string`

console.log("S!", s)

const ipcRenderer = require('electron').ipcRenderer;
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

ipcRenderer.on('asynchronous-reply', function(event, arg) {
  //console.log(arg); // prints "pong"
});
ipcRenderer.send('asynchronous-message', 'ping'); 
ipcRenderer.on('render-test', function(event, arg1, arg2){
  //console.log("got render-test message", arg1)
})
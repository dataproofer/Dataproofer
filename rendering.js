
module.exports = function(config) {
  console.log("rendering", config)

  var results = []


  this.error = function() {
    // a horrible run-time error has occured, we should let the user know and abort everything.
    console.log("MAY DAY")
  }

  this.addResult = function() {
    console.log("add result", arguments)

    // update rendering
  }
  // an error occurred 
  this.addError = function() {

  }

  this.done = function() {
    // finish up
    console.log("proofed.")
  }
  return this;
}
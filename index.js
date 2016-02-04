#!/usr/bin/env node
/**
 * CLI Interface to Dataproofer
 */

var Processing = require('./src/processing');
var Rendering = require('./src/rendering');

var pkg = require('./package.json')
module.exports = {
  Processing: Processing,
  Rendering: Rendering,
  version: pkg.version
}

// this module is being run from the command line
if(require.main === module) {
  // we take in the filename from the args, if its not there we prompt for it
  var filename = process.argv[2];
  var questions;
  if(filename) {
    questions = [];
  } else {
    questions = [
      {type: "input", name: "file", message: "Please enter the filename of the dataset you would like to proof"},
    ]
  }
  // We prompt for optional suites to test against
  questions.push({
    type: "checkbox", name: "suites", message: "Select optional test suites to run against your dataset.",
    // TODO: make these real suites. perhaps pull them from a config?
    choices: [
      {name: "Mapping & Geographic", value: "dataproofer-geo-suite"}, 
      {name: "Statistics", value:"dataproofer-stats-suite"},
      {name: "A+", value:"dataproofer-foo-suite"}
    ]
  })

  var inquirer = require("inquirer");
  inquirer.prompt(questions, function( answers ) {
    // TODO: check for file existing
    var config = {
      suites: answers.suites,
      renderer: Rendering
    }
    var filename = filename || answers.file;
    //READ FILE
    fs.readFile(filename, function(err, data) {
      if(err) {
        // no file no cry
        return console.error(err);
      }
      config.fileString = data.toString(); 
      Processing.run(config)
    });
  });
}
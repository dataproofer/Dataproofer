#!/usr/bin/env node

var processing = require('./processing')

exports.processing = processing;

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
      file: filename || answers.file,
      suites: answers.suites
    }
    processing.run(config)
  });
}
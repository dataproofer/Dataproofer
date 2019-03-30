#!/usr/bin/env node
/**
 * CLI Interface to Dataproofer
 */

var Processor = require("./processing");
var Rendering = require("./rendering");
var Processing = new Processor();

var pkg = require("./package.json");

var chalk = require("chalk");
var program = require("commander");
var rw = require("rw");

module.exports = {
  Processing: Processing,
  Rendering: Rendering,
  version: pkg.version
};

// this module is being run from the command line
if(require.main === module) {
  var SUITES = [
    require("dataproofer-info-suite"),
    require("dataproofer-core-suite"),
    require("dataproofer-stats-suite"),
    require("dataproofer-geo-suite")
  ];

  var list = function(val) {
    return val.split(",");
  };

  var toLower = function(str) {
    return str.toLowerCase();
  };

  program
    .version(pkg.version)
    .description("A proofreader for your data")
    .usage("<file>")
    .option("-o, --out <file>", "file to output results. default stdout")
    .option("-c, --core", "run tests from the core suite")
    .option("-i, --info", "run tests from the info suite")
    .option("-s, --stats", "run tests from the statistical suite")
    .option("-g, --geo", "run tests from the geographic suite")
    .option("-t, --tests <list>", "comma-separated list to use", list)
    .option("-j, --json", "output JSON of test results")
    .option("-J, --json-pretty", "output an indented JSON of test results")
    .option("-S, --summary", "output overall test results, excluding pass/fail results")
    .option("-v, --verbose", "include descriptions about each column")
    .option("-x, --exclude", "exclude tests that passed")
    .option("-m, --sampleMin <int>", "minimum number of rows to sample and test. default 1000", Number.toInteger)
    .option("-M, --sampleMax <int>", "maximum number of rows to sample and test. default 10000", Number.toInteger)
    .option("-r, --sampleRatio <float>", "ratio of rows to sample from total rows. default 0.25 (i.e. sample 25% of the total rows)", Number.toFloat);

  program.on("--help", function(){
    console.log("  Examples:");
    console.log("");
    console.log(" $ dataproofer my_data.csv");
    console.log("");
  });

  program.parse(process.argv);

  var make_red = function make_red(txt) {
    return chalk.bold(txt); //display the help text in red on the console
  };

  if (!process.argv.slice(2).length) {
    program.outputHelp(make_red);
    return;
  }

  for (var suite of SUITES) {
    if (suite.name.indexOf("core") > -1 && program.core === true) {
      suite.tests.forEach(function(test) { test.active = true; });
    } else if (suite.name.indexOf("info") > -1 && program.info === true) {
      suite.tests.forEach(function(test) { test.active = true; });
    } else if (suite.name.indexOf("stats") > -1 && program.stats === true) {
      suite.tests.forEach(function(test) { test.active = true; });
    } else if (suite.name.indexOf("geo") > -1 && program.geo === true) {
      suite.tests.forEach(function(test) { test.active = true; });
    } else if (program.tests) {
      suite.tests.forEach(function(test) {
        var inputTests = program.tests.map(toLower);
        var currTest = test.name().toLowerCase();
        if (inputTests.indexOf(currTest) > -1) test.active = true;
      });
    } else if (
      program.core !== true &&
      program.info !== true &&
      program.stats !== true &&
      program.geo !== true &&
      program.tests !== true
    ) {
      suite.tests.forEach(function(test) { test.active = true; });
    }
  }

  var filepath = program.args[0];
  //READ FILE

  var allowFileExtensions = [
    "csv",
    "tsv",
    "psv",
    "xlsx",
    "xls"
  ];

  var currFileName = filepath.split("/").pop(),
    currExt = currFileName.split(".").pop(),
    currSampleRatio = program.sampleRatio ? program.sampleRatio : 0.25,
    currSampleMin = program.sampleMin ? program.sampleMin : 1000,
    currSampleMax = program.sampleMax ? program.sampleMax : 10000,
    sampleOpts = {
      sampleRatio: currSampleRatio,
      sampleMin: currSampleMin,
      sampleMax: currSampleMax
    };

  if (allowFileExtensions.indexOf(currExt) > -1) {
    var loadConfig = {
      ext: currExt,
      filepath: filepath,
      filename: currFileName,
      sampleOpts: sampleOpts
    };
    var loaded = Processing.load(loadConfig);
    var processorConfig = {
      suites: SUITES,
      renderer: Rendering,
      loaded: loaded
    };
    var results = Processing.run(processorConfig).results;
    var suiteNames = Object.keys(results);

    suiteNames.forEach(function(suiteName) {
      var testNames = Object.keys(results[suiteName]);
      totalTests += testNames.length;
      testNames.forEach(function(testName) {
        var test = results[suiteName][testName];
        if (program.exclude && test.testState === "passed") {
          delete results[suiteName][testName];
        }
      });
    });

    var totalTests = 0;
    var totalPassed = 0;
    var resultStr = "";
    suiteNames.forEach(function(suiteName) {
      var testNames = Object.keys(results[suiteName]);
      totalTests += testNames.length;
      testNames.forEach(function(testName) {
        var test = results[suiteName][testName];
        resultStr += testName + ": ";
        switch (test.testState) {
          case "passed":
            totalPassed += 1;
            resultStr += chalk.green(test.testState) + "\n";
            break;
          case "warn":
            resultStr += chalk.yellow(test.testState) + "\n";
            break;
          case "failed":
            resultStr += chalk.red(test.testState) + "\n";
            break;
          case "info":
            resultStr += chalk.blue(test.testState) + "\n";
            break;
        }
        if (program.verbose === true && test.testState !== "passed") {
          resultStr += chalk.dim(test.conclusion.replace(/<br\>/g, "\n")) + "\n";
        }
      });
    });

    var summaryStr = chalk.green(
      totalPassed + " tests passed out of " + totalTests + "\n"
    );
    
    if (program.watch === true || program.suites === true || program.tests === true) {
      process.stderr.write(chalk.red("Error: This feature is not currently implemented"));
      return;
    }
    process.stdout.write(summaryStr);
    // console.log(program);

    var done = function() {
      process.stdout.write("\n### DONE ###");
    };

    var outPath = program.out ? program.out : "/dev/stdout";
    
    if (program.out) resultStr = resultStr.replace(/\[\d+m/g, "");
    if (program.json === true) {
      rw.writeFileSync(outPath, JSON.stringify(results), "utf-8");
      done();
      return;
    }
    if (program.jsonPretty === true) {
      rw.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
      done();
      return;
    }
    if (program.summary !== true) {
      rw.writeFileSync(outPath, resultStr, "utf-8");
      done();
      return;
    }
  } else {
    process.stderr.write(
      chalk.red("Error: Must use a supported filetype. Currently supported filetypes: " + allowFileExtensions.join(", "), "utf-8")
    );
  }
}

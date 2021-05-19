#!/usr/bin/env node
/**
 * CLI Interface to Dataproofer
 */

const pkg = require("./package.json");
const Processor = require("./processing");
const Rendering = require("./rendering");
const Processing = new Processor();

const chalk = require("chalk");
const rw = require("rw");
const program = require("commander");

// this module is being run from the command line
if (require.main === module) {
  const SUITES = [
    require("dataproofer-info-suite"),
    require("dataproofer-core-suite"),
    require("dataproofer-stats-suite"),
    require("dataproofer-geo-suite"),
  ];

  var list = function (val) {
    return val.split(",");
  };

  var toLower = function (str) {
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
    .option(
      "-S, --summary",
      "output overall test results, excluding pass/fail results"
    )
    .option("-v, --verbose", "include descriptions about each column")
    .option("-x, --exclude", "exclude tests that passed")
    .option(
      "-m, --sampleMin <int>",
      "minimum number of rows to sample and test",
      parseInt
    )
    .option(
      "-M, --sampleMax <int>",
      "maximum number of rows to sample and test",
      parseInt
    )
    .addOption(
      new program.Option(
        "-r, --sampleRatio <float>",
        "ratio of rows to sample from total rows",
        parseFloat
      ).default(0.25, "25% of the total rows")
    );

  program.on("--help", function () {
    console.info("  Examples:");
    console.info("");
    console.info(" $ dataproofer my_data.csv");
    console.info("");
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
    if (suite.name.indexOf("core") > -1 && program.opts().core === true) {
      suite.tests.forEach(function (test) {
        test.active = true;
      });
    } else if (
      suite.name.indexOf("info") > -1 &&
      program.opts().info === true
    ) {
      suite.tests.forEach(function (test) {
        test.active = true;
      });
    } else if (
      suite.name.indexOf("stats") > -1 &&
      program.opts().stats === true
    ) {
      suite.tests.forEach(function (test) {
        test.active = true;
      });
    } else if (suite.name.indexOf("geo") > -1 && program.opts().geo === true) {
      suite.tests.forEach(function (test) {
        test.active = true;
      });
    } else if (program.opts().tests) {
      suite.tests.forEach(function (test) {
        var inputTests = program.opts().tests.map(toLower);
        var currTest = test.name().toLowerCase();
        if (inputTests.indexOf(currTest) > -1) test.active = true;
      });
    } else if (
      program.opts().core !== true &&
      program.opts().info !== true &&
      program.opts().stats !== true &&
      program.opts().geo !== true &&
      program.opts().tests !== true
    ) {
      suite.tests.forEach(function (test) {
        test.active = true;
      });
    }
  }

  var filepath = program.args[0];
  //READ FILE
  var allowFileExtensions = ["csv", "tsv", "psv", "xlsx", "xls"];

  var currFileName = filepath.split("/").pop(),
    currExt = currFileName.split(".").pop(),
    sampleOpts = {
      sampleRatio: program.opts().sampleRatio,
      sampleMin: program.opts().sampleMin,
      sampleMax: program.opts().sampleMax,
    };

  if (allowFileExtensions.indexOf(currExt) > -1) {
    var loadConfig = {
      ext: currExt,
      filepath: filepath,
      filename: currFileName,
      sampleOpts: sampleOpts,
    };
    var loaded = Processing.load(loadConfig);
    var processorConfig = {
      suites: SUITES,
      renderer: Rendering,
      loaded: loaded,
      json: program.opts().json || program.opts().jsonPretty,
    };
    Processing.run(processorConfig).then(function (processor) {
      const { results } = processor;
      var suiteNames = Object.keys(results);

      suiteNames.forEach(function (suiteName) {
        var testNames = Object.keys(results[suiteName]);
        totalTests += testNames.length;
        testNames.forEach(function (testName) {
          var test = results[suiteName][testName];
          if (program.opts().exclude && test.testState === "passed") {
            delete results[suiteName][testName];
          }
        });
      });

      var totalTests = 0;
      var totalPassed = 0;
      var resultStr = "\n";
      suiteNames.forEach(function (suiteName) {
        var testNames = Object.keys(results[suiteName]);
        totalTests += testNames.length;
        testNames.forEach(function (testName) {
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
              totalTests -= 1;
              resultStr += chalk.blue(test.testState) + "\n";
              break;
          }
          if (program.opts().verbose === true && test.testState !== "passed") {
            resultStr +=
              chalk.dim(test.conclusion.replace(/<br>/g, "\n")) + "\n";
          }
        });
      });

      var summaryPct = totalPassed / totalTests;
      var summaryColor = () => {
        if (summaryPct < 0.7) {
          // below 70% is failing
          return "red";
        } else if (summaryPct >= 0.7 && summaryPct <= 0.9) {
          // between 70% and 90% is average
          return "yellow";
        } else if (summaryPct > 0.9) {
          // above 90% is excellent
          return "green";
        }
      };
      var testStr = totalPassed > 1 ? "tests" : "test";
      var summaryStr = chalk`\n{${summaryColor()} {bold ${Math.round(
        summaryPct * 100
      )}%}\n${totalPassed} ${testStr} passed out of ${totalTests}}\n`;

      if (
        program.opts().watch === true ||
        program.opts().suites === true ||
        program.opts().tests === true
      ) {
        process.stderr.write(
          chalk.red("Error: This feature is not currently implemented")
        );
        return;
      }

      var done = function () {
        process.stdout.write(summaryStr);
        process.stdout.write("\n### PROOFED ###\n\n");
      };

      var outPath = program.opts().out ? program.opts().out : "/dev/stdout";

      if (program.opts().out) resultStr = resultStr.replace(/\[\d+m/g, "");
      if (program.opts().json === true) {
        rw.writeFileSync(outPath, JSON.stringify(results), "utf-8");
        return;
      }
      if (program.opts().jsonPretty === true) {
        rw.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
        return;
      }
      if (program.opts().summary !== true) {
        rw.writeFileSync(outPath, resultStr, "utf-8");
        done();
        return;
      }
    });
  } else {
    process.stderr.write(
      chalk.red(
        "Error: Must use a supported filetype. Currently supported filetypes: " +
          allowFileExtensions.join(", "),
        "utf-8"
      )
    );
  }
}

module.exports = {
  Processing: Processing,
  Rendering: Rendering,
  version: pkg.version,
};

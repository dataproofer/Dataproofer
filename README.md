# Dataproofer

![](http://i.imgur.com/n38R14S.png)

## A proofreader for your data. Currently in beta.

Every day, more and more data is created. Journalists, analysts, and data visualizers turn that data into stories and insights.

But before you can make use of any data, you need to know if it’s reliable. Is it weird? Is it clean? Can I use it to write or make a viz?

This used to be a long manual process, using valuable time and introducing the possibility for human error. People can’t always spot every mistake every time, no matter how hard they try.

Data proofer is built to automate this process of checking a dataset for errors or potential mistakes.

## Getting Started (Desktop)
Download a .zip of the latest release [from the Dataproofer releases page](https://github.com/dataproofer/Dataproofer/releases).

Drag the app into your applications folder.

Select your dataset, which can be either a CSV on your computer, or a Google Sheet that you’ve published to the web.

Once you select your dataset, you can choose which suites and tests run by turning them on or off.

Proof your data, get your results, and feel confident about your dataset.

## Getting Started (Command Line)
```
npm install -g dataproofer
```
Read the documentation
```
dataproofer --help
>  Usage: dataproofer <file>

  A proofreader for your data

  Options:

    -h, --help          output usage information
    -V, --version       output the version number
    -o, --out <file>    file to output results. default stdout
    -c, --core          run tests from the core suite
    -i, --info          run tests from the info suite
    -a, --stats         run tests from the statistical suite
    -g, --geo           run tests from the geographic suite
    -t, --tests <list>  comma-separated list to use
    -j, --json          output JSON of test results
    -J, --json-pretty   output an indented JSON of test results
    -S, --summary       output overall test results, excluding pass/fail results
    -v, --verbose       include descriptions about each column
    -x, --exclude       exclude tests that passed

  Examples:

    $ dataproofer my_data.csv
```
Run a test
```
dataproofer data.csv
```
Save the results
```
dataproofer --json data.csv --out data.json
```
Learn how to run specific test suites or tests and output longer or shorter summaries, use the `--help` flag.

Found a bug? [Let us know](https://github.com/dataproofer/Dataproofer/issues/new).

## Table of Contents

* [Getting Started (Desktop)](https://github.com/dataproofer/Dataproofer#getting-started-desktop)
* [Getting Started (Command Line)](https://github.com/dataproofer/Dataproofer#getting-started-command-line)
* [Test Suites](https://github.com/dataproofer/Dataproofer#test-suites)
  * [Info](https://github.com/dataproofer/Dataproofer#information--diagnostics)
  * [Core](https://github.com/dataproofer/Dataproofer#core-suite)
  * [Geo](https://github.com/dataproofer/Dataproofer#geo-suite)
  * [Stats](https://github.com/dataproofer/Dataproofer#stats-suite)
* [Development](https://github.com/dataproofer/Dataproofer#development)
  * [How You Can Help](https://github.com/dataproofer/Dataproofer#how-you-can-help)
  * [Modifying a test suite](https://github.com/dataproofer/Dataproofer#modifying-a-test-suite)
  * [Create a new test](https://github.com/dataproofer/Dataproofer#creating-a-new-test)
    * [name](https://github.com/dataproofer/Dataproofer#name)
    * [description](https://github.com/dataproofer/Dataproofer#description)
    * [methodology](https://github.com/dataproofer/Dataproofer#methodology)
    * [helper scripts](https://github.com/dataproofer/Dataproofer#helper-scripts)
  * [Troubleshooting](https://github.com/dataproofer/Dataproofer#troubleshooting-a-test-that-wont-run)
  * [Test iteration](https://github.com/dataproofer/Dataproofer#iterating-on-tests)
  * [Packaging the Desktop App](https://github.com/dataproofer/Dataproofer#packaging-an-executable)
  * [Releasing new versions](https://github.com/dataproofer/Dataproofer#release)
* [Sources](https://github.com/dataproofer/Dataproofer#sources)
* [Thank You](https://github.com/dataproofer/Dataproofer#thank-you)

![](http://i.imgur.com/3YekdjW.png)

## Test Suites
### [Information & Diagnostics](https://github.com/dataproofer/info-suite)
A set of tests that infer descriptive information based on the contents of a table's cells.

+ Check for numeric values in columns
+ Check for strings in columns

### [Core Suite](https://github.com/dataproofer/core-suite)
A set of tests related to common problems and data checks — namely, making sure data has not been truncated by looking for specific cut-off indicators.

+ Check for duplicate rows
+ Check for empty columns (no values)
+ Check for special, non-typical Latin characters/letters in strings
+ Check for **big integer** cut-offs as defined by MySQL and PostgreSQL, common database programs
+ Check for **integer** cut-offs as defined by MySQL and PostgreSQL, common database programs
+ Check for **small integer** cut-offs as defined by MySQL and PostgreSQL, common database programs
+ Check for whether there are exactly 65k rows — an indication there may be missing rows lost when the
data was exported from a database
+ Check for strings that are exactly 255 characters — an indication there may be missing data lost when the data was exported from MySQL

### [Geo Suite](https://github.com/dataproofer/geo-suite)
A set of tests related to common geographic data problems.

+ Check for invalid latitude and longitude values (values outside the range of -180º to 180º)
+ Check for void latitude and longitude values (values at 0º,0º)

### [Stats Suite](https://github.com/dataproofer/stats-suite)
A set of test related to common statistical used to detect outlying data.

+ Check for outliers within a column relative to the column's median
+ Check for outliers within a column relative to the column's mean

![](http://i.imgur.com/3YekdjW.png)

## Development

```
git clone https://github.com/dataproofer/Dataproofer.git 
cd Dataproofer
yarn
```

### How You Can Help

#### Write a test
See our [test to-do list](https://github.com/dataproofer/Dataproofer/issues?q=is%3Aissue+is%3Aopen+label%3Atest) and leave a comment

#### Add a feature
See our [features list](https://github.com/dataproofer/Dataproofer/issues?utf8=✓&q=is%3Aissue+is%3Aopen+-label%3Atest+) and leave a comment

#### Short on time?
See our [smaller issues](https://github.com/dataproofer/Dataproofer/issues?q=is%3Aopen+is%3Aissue+label%3Asmall) and leave a comment

#### Got more time?
See our [medium-sized issues](https://github.com/dataproofer/Dataproofer/issues?utf8=%E2%9C%93&q=is%3Aopen+is%3Aissue+label%3Amedium) and leave a comment

#### Plenty of time?
See our [larger issues](https://github.com/dataproofer/Dataproofer/issues?utf8=%E2%9C%93&q=is%3Aopen+is%3Aissue+label%3Alarge) and leave a comment

### Modifying a test suite
All tests belong to a suite, which is essentially just a node module that packages a group of tests together. In order to modify a test or add a new test to a suite, you will want to clone the project and link it. Let's say we want to modify the [core-suite](https://github.com/dataproofer/core-suite).
```
git clone https://github.com/dataproofer/core-suite.git
cd core-suite
npm install
npm link

cd ../Dataproofer
cd electron
npm link dataproofer-core-suite
```
Now when you change anything inside `core-suite` (like editing a test or making a new one) you can see your changes reflected when you run the app. Follow the instructions below for creating a new test in your suite!

![](http://i.imgur.com/3YekdjW.png)

### Creating a new test
+ Make a copy of the [basic test template](https://github.com/dataproofer/suite-template/blob/master/src/myTest.js)
+ Read the comments and follow along with links
+ Let us know if you're running into trouble dataproofer [at] dataproofer.org
+ `require` that test in a suite's [index.js](https://github.com/dataproofer/suite-template/blob/master/index.js)
+ Add that test to the `exports` in [index.js](https://github.com/dataproofer/suite-template/blob/master/index.js)

Tests are made up of a few parts. Here's a brief over-view. For a more in-depth look, dive into the [documentation](https://github.com/dataproofer/dataproofertest-js/blob/master/DOCUMENTATION.md#util).

#### .name()
This is the name of your test. It shows up in the test-selection screen as well as on the results page

#### .description()
This is a text-only description of what the test does, and what it is meant to check. Imagine you are explaining it to a remarkably intelligent 5-year-old.

#### .methodology()
This is where the code your test executes lives. Pass it a function that takes in **rows** and **columnHeads**

**rows** is an array of objects from the data. The object uses column headers as the key, and the row’s value as the value.

So if your data looks like this:
```
President         | Year
------------------------
George Washington | 1789
John Adams        | 1797
Thomas Jefferson  | 1801
```

Then the first object in your array of rows will look like this:

```
{ president: ‘George Washington’, year: ‘1789’ } and so on
```

Generally, to run a test, you are going to want to loop over each row and do some operations on it — counting cells and using conditionals to detect unwanted values.

#### Helper Scripts
Helper scripts help you test and display the results of Dataproofer tests. These are a small set of functions we've found ourselves reusing.

+ isEmpty: detect if a cell is empty
+ isNumeric: detect if a cell contains a number
+ stripNumeric: remove number formatting like "$" or "%"
+ percent: return a number with a "%" sign

For more information, please see the full `util` [documentation](https://github.com/dataproofer/dataproofertest-js/blob/master/DOCUMENTATION.md#util)

![](http://i.imgur.com/3YekdjW.png)

### Troubleshooting a test that won't run
Tests are run inside a try catch loop in `src/processing.js`. You may wish to temporarily remove the try/catch while iterating on a test.
Otherwise, for now we recommend heavy doses of console.log and the Chrome debugger.

### Iterating on tests
Dataproofer saves a copy of the most recently loaded file in the Application Data directory provided to it by the OS.
You can quickly load the file and run the tests by typing `loadLastFile()` in the console. This saves you several clicks for loading the file and clicking the run button while you are iterating on a test.
If you want to temporarily avoid any clicks you can add the function call to the `ipc.on("last-file-selected",` event handler in `electron/js/controller.js`

### Packaging an executable

```
./build-executables.sh
```

This will create a new folder inside `Dataproofer/executables` that contains a Mac OS X, Windows, & Linux.

### Release a new version
We can push releases to GitHub manually for now:
```
git tag -a 'v0.1.1' -m "first release"
git push && git push --tags
```
The binary (Dataproofer.app) can be uploaded to the [releases page](https://github.com/dataproofer/Dataproofer/releases) for the tag you pushed, and should be zipped up first (Right click and choose "Compress Dataproofer")

![](http://i.imgur.com/3YekdjW.png)

# Sources

- [A Guide to Bulletproofing Your Data](https://github.com/propublica/guides/blob/master/data-bulletproofing.md), by [ProPublica](https://www.propublica.org/)
- [Checklist to bulletproof your data work](http://www.tommeagher.com/blog/2012/06/checklist.html), by [Tom Meagher](http://www.tommeagher.com/blog/2012/06/checklist.html) (Data Editor, [The Marshall Project](https://www.themarshallproject.org))
- [The Quartz guide to bad data](https://github.com/Quartz/bad-data-guide), by [Chris Groskopf](github.com/onyxfish) (Things Reporter, [Quartz](http://qz.com))
- [OpenNewsLabs Data Smells](https://github.com/OpenNewsLabs/datasmells), by [Aurelia Moser](https://github.com/auremoser) ([Mozilla Science Lab](https://www.mozillascience.org/))
- SRCCON panel notes
  - [Handguns and tequila: Avoiding data disasters](https://old.etherpad-mozilla.org/MmSOTIOIDg)
  - [How NOT to Skew with Statistics](https://old.etherpad-mozilla.org/bOwBSAeLe5)

## Thank You
![vocativ-logo](https://cloud.githubusercontent.com/assets/1578563/14050100/e23d531e-f276-11e5-920a-b882eca5933a.png)<br>
![knight-logo](https://cloud.githubusercontent.com/assets/1578563/14050167/4b12f330-f277-11e5-9773-1f69b9c2484f.png)

A huge thank you to the [Vocativ](http://vocativ.com) and the [Knight Foundation](http://knightfoundation.org/). This project was funded in part by the Knight Foundation's [Prototype Fund](http://knightfoundation.org/funding-initiatives/knight-prototype-fund/).

### Special Thanks
* Alex Koppelman (interviewee), Editorial Director @ Vocativ
* Allee Manning (interviewee), Data Reporter @ Vocativ
* Allegra Denton (design consulting), Designer @ Vocativ
* Brian Byrne (interviewee), Data Reporter @ Vocativ
* Daniel Littlewood (video producer), Special Projects Producer @ Vocativ
* EJ Fox (project lead), Dataviz Editor @ Vocativ
* Gerald Rich (lead developer), Interactive Producer @ Vocativ
* Ian Johnson (lead developer), Dataproofer
* Jason Das (UX and design), Dataproofer
* Joe Presser (video producer), Dataproofer
* Julia Kastner (concept & name consulting), Project Manager @ Vocativ
* Kelli Vanover (design consulting), Product Manager @ Vocativ
* Markham Nolan (interviewee), Visuals Editor @ Vocativ
* Rob Di Ieso (design consulting), Art Director @ Vocativ

... and the countless journalists who've encouraged us along the way. Thank you!

# Dataproofer

![](http://i.imgur.com/ZhUKb0G.png)

## A proofreader for your data.

Every day, more and more data is created. Journalists, analysts, and data visualizers turn that data into stories and insights.

But before you can make use of any data, you need to know if it’s reliable. Is it weird? Is it clean? Can I use it to write or make a viz?

This used to be a long manual process, using valuable time and introducing the possibility for human error. People can’t always spot every mistake every time, no matter how hard they try.

Data proofer is built to automate this process of checking a dataset for errors or potential mistakes.

## Tests
### Core Suite
+ Check for duplicate rows
+ Check for excel error dates
+ Check for empty columns (no values)
+ Check for numeric values
+ Check for whether there are exactly 65k rows (potential export error)
+ Check for strings that are exactly 255 characters (potential export error)

## Geo Suite
+ Check for valid latitude and longitude values

## Stats Suite
+ Check for outliers within a column
—

# Getting started using Dataproofer
Download a .zip of the latest release [from the Dataproofer releases page](https://github.com/dataproofer/Dataproofer/releases).

Drag the app into your applications folder.

Select your dataset, which can be either a CSV on your computer, or a Google Sheet that you’ve published to the web.

Once you select your dataset, you can choose which suites and tests run by turning them on or off.

Proof your data, get your results, and feel confident about your dataset.

# Getting started making tests for Dataproofer
## Bootstrapping

```
git clone git@github.com:dataproofer/Dataproofer.git
cd Dataproofer/src
npm install
cd ../electron
npm install
```

## Development


While we are developing you will need to clone [core-suite](https://github.com/dataproofer/core-suite/tree/master) into the folder that contains the dataproofer repo (not into the dataproofer repo itself.)

```
cd Dataproofer
./init.sh
```

If you update the core library (`index.js` or `src/*`) you will need to `npm install` inside `Dataproofer/electron` for it to be updated, as we are relying on the "file:" dependency which copies the source instead of downloading it.

You can run the CLI version with a file name or it will prompt you for one
```
node index sample-datasets/isis-attack-sites.csv
```
or
```
node index
```

### Creating a new test
+ Make a copy of "testTemplate.js"
+ Write your test
+ Require that test in a suite's *index.js*
+ Add that test to the exports in index.js

Tests are made up of a few parts

#### .name()
This is the name of your test. It shows up in the test-selection screen as well as on the results page

#### .description()
This is a text-only description of what the test does, and what it is meant to check. Imagine you are explaining it to a remarkably intelligent 5-year-old.

#### .methodology()
This is where the code your test executes lives. Pass it a function that takes in **rows** and **columnHeads**

**rows** is an array of objects from the data. The object uses column headers as the key, and the row’s value as the value.

So if your data looks like this:
```
President | Year
George Washington | 1789
John Adams | 1797
Thomas Jefferson | 1801
```

Then the first object in your array of rows will look like this:

```
{ president: ‘George Washington’, year: ‘1789’ } and so on
```

Generally, to run a test, you are going to want to loop over each row and do some operations on it — counting cells and using conditionals to detect unwanted values.


### Troubleshooting a test that won't run
Tests are run inside a try catch loop in `src/processing.js`. You may wish to temporarily remove the try/catch while iterating on a test.
Otherwise, for now we recommend heavy doses of console.log and the Chrome debugger. 

### Iterating on tests
Dataproofer saves a copy of the most recently loaded file in the Application Data directory provided to it by the OS.
You can quickly load the file and run the tests by typing `loadLastFile()` in the console. This saves you several clicks for loading the file and clicking the run button while you are iterating on a test.
If you want to temporarily avoid any clicks you can add the function call to the `ipc.on("last-file-selected",` event handler in `electron/js/controller.js`

# Packaging an executable

```
cd Dataproofer/electron
npm run package
```

This will create a new folder inside `Dataproofer/executables` that contains a Mac OS X app. The package command only generates the Mac app but could be extended to include Windows & Linux.


# Release
We can push releases to GitHub manually for now:
```
git tag -a 'v0.1.1' -m "first release"
git push && git push --tags
```
The binary (Dataproofer.app) can be uploaded to the [releases page](https://github.com/dataproofer/Dataproofer/releases) for the tag you pushed, and should be zipped up first (Right click and choose "Compress Dataproofer")



## Sources

- [A Guide to Bulletproofing Your Data](https://github.com/propublica/guides/blob/master/data-bulletproofing.md), by [ProPublica](https://www.propublica.org/)
- [Checklist to bulletproof your data work](http://www.tommeagher.com/blog/2012/06/checklist.html), by [Tom Meagher](http://www.tommeagher.com/blog/2012/06/checklist.html) (Data Editor, The Marshall Project)
- [The Quartz guide to bad data](https://github.com/Quartz/bad-data-guide), by [Quartz](http://qz.com)

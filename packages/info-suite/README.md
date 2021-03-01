# suite-template
A template to write data checks for the Dataproofer desktop app or any JavaScript application.

* [Documentation](https://github.com/dataproofer/info-suite/blob/master/README.md)
* [Repository](https://github.com/dataproofer/info-suite/)
* [Issues](https://github.com/dataproofer/info-suite/issues)

## Table of Contents

* [Tests](https://github.com/dataproofer/info-suite#tests)
  * [numberOfRows.js](https://github.com/dataproofer/info-suite#numberofrowsjs)
  * [columnsContainNumbers.js](https://github.com/dataproofer/info-suite#columnscontainnumbersjs)
  * [columnsContainNothing.js](https://github.com/dataproofer/info-suite#columnscontainnothingjs)
* [Development](https://github.com/dataproofer/info-suite#development)
  * [Getting Started](https://github.com/dataproofer/info-suite#getting-started)
  * [Writing Tests](https://github.com/dataproofer/stats-suite#writing-tests)
  * [Building Docs](https://github.com/dataproofer/info-suite#building-docs)

## Tests

### numberOfRows.js

[src/numberOfRows.js:12-22](https://github.com/dataproofer/info-suite/blob/e302a25d3f139124e69ad779c22195ec977861c4/src/numberOfRows.js#L12-L22 "Source code on GitHub")

Count and display the number of rows

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

### columnsContainNumbers.js

[src/columnsContainNumbers.js:16-66](https://github.com/dataproofer/info-suite/blob/e302a25d3f139124e69ad779c22195ec977861c4/src/columnsContainNumbers.js#L16-L66 "Source code on GitHub")

Determine the percentage of rows that are numbers for each column

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

### columnsContainNothing.js

[src/columnsContainNothing.js:16-67](https://github.com/dataproofer/info-suite/blob/e302a25d3f139124e69ad779c22195ec977861c4/src/columnsContainNothing.js#L16-L67 "Source code on GitHub")

Calculates the percentage of rows that are empty for each column

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

## Development

### Getting Started

```
git clone git@github.com:dataproofer/info-suite.git
cd info-suite
npm install
```

### Writing Tests

* [How To](https://github.com/dataproofer/Dataproofer#creating-a-new-test)
* [Helper Scripts](https://github.com/dataproofer/dataproofertest-js/blob/master/DOCUMENTATION.md#util)
* Templates
  * [Basic Test](https://github.com/dataproofer/suite-template/blob/master/src/myTest.js)
  * [Advanced Test](https://github.com/dataproofer/suite-template/blob/master/src/myAdvancedTest.js)

### Building Docs

We use [documentation.js](https://github.com/documentationjs/documentation), but have created a handy script for regenerating documentation.

```
npm run docs
```

Then open up and check your docs in [DOCUMENTATION.md](https://github.com/dataproofer/info-suite/blob/master/DOCUMENTATION.md)

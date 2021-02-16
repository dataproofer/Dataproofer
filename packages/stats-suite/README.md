# stats-suite
Suite of statistical tests for [Dataproofer](https://github.com/dataproofer/Dataproofer)

* [Documentation](https://github.com/dataproofer/stats-suite/blob/master/README.md)
* [Repository](https://github.com/dataproofer/stats-suite/)
* [Issues](https://github.com/dataproofer/stats-suite/issues)

## Table of Contents

* [Tests](https://github.com/dataproofer/stats-suite#tests)
  * [standardDeviationOutliers.js](https://github.com/dataproofer/stats-suite#standarddeviationoutliersjs)
  * [medianAbsoluteDeviationOutliers.js](https://github.com/dataproofer/stats-suite#medianabsolutedeviationoutliersjs)
* [Development](https://github.com/dataproofer/stats-suite#development)
  * [Getting Started](https://github.com/dataproofer/stats-suite#getting-started)
  * [Writing Tests](https://github.com/dataproofer/stats-suite#writing-tests)
  * [Building Docs](https://github.com/dataproofer/stats-suite#documentation)

## Tests

### standardDeviationOutliers.js

[src/standardDeviationOutliers.js:18-132](https://github.com/dataproofer/stats-suite/blob/3bf0ba467787a998d1b5436e9212342708cc2d11/src/standardDeviationOutliers.js#L18-L132 "Source code on GitHub")

Outlier detection using [standard deviation](https://en.wikipedia.org/wiki/standard_deviation)
Examples in comparison with median absolute deviations:

-   [simple-statistics.js](http://simplestatistics.org/docs/#samplestandarddeviation)
-   [agate.py](http://agate-stats.readthedocs.org/en/0.3.1/index.html)

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

### medianAbsoluteDeviationOutliers.js

[src/medianAbsoluteDeviationOutliers.js:18-136](https://github.com/dataproofer/stats-suite/blob/3bf0ba467787a998d1b5436e9212342708cc2d11/src/medianAbsoluteDeviationOutliers.js#L18-L136 "Source code on GitHub")

Outlier detection using [median absolute deviation](https://en.wikipedia.org/wiki/Median_absolute_deviation)
Examples in comparison with standard deviation:

-   [simple-statistics.js](http://simplestatistics.org/docs/#mad)
-   [agate.py](http://agate-stats.readthedocs.org/en/0.3.1/index.html)

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

## Development

### Getting Started

```
git clone git@github.com:dataproofer/stats-suite.git
cd stats-suite
npm install
```

### Writing Tests

* [How to](https://github.com/dataproofer/Dataproofer#creating-a-new-test)
* [Helper scripts documentation](https://github.com/dataproofer/dataproofertest-js/blob/master/DOCUMENTATION.md#util)
* Templates
  * [Basic test](https://github.com/dataproofer/suite-template/blob/master/src/myTest.js)
  * [Advanced test](https://github.com/dataproofer/suite-template/blob/master/src/myAdvancedTest.js)

### Building Docs

We use [documentation.js](https://github.com/documentationjs/documentation), but have created a handy script for regenerating documentation.

```
npm run docs
```

Then open up and check your docs in [DOCUMENTATION.md](https://github.com/dataproofer/info-suite/blob/master/DOCUMENTATION.md)
# core-suite

Core suite of tests for Dataproofer. These tests relate to common problems and data checks — namely, making sure data has not been truncated by looking for specific cut-off indicators.

-   [Documentation](https://github.com/dataproofer/core-suite/blob/master/README.md)
-   [Repository](https://github.com/dataproofer/core-suite/)
-   [Issues](https://github.com/dataproofer/core-suite/issues)

## Table of Contents

-   [Tests](https://github.com/dataproofer/core-suite#tests)
    -   [columnsContainNothing.js](https://github.com/dataproofer/core-suite#columnsContainNothing.js)
    -   [columnsContainsSpecialChars](https://github.com/dataproofer/core-suite#columnsContainsSpecialChars.js)
    -   [stringsHaveExactly255Characters.js](https://github.com/dataproofer/core-suite#stringsHaveExactly255Charactersjs)
    -   [maxBigInteger.js](https://github.com/dataproofer/core-suite#maxBigIntegerjs)
    -   [maxInteger.js](https://github.com/dataproofer/core-suite#maxIntegerjs)
    -   [maxSmallInteger.js](https://github.com/dataproofer/core-suite#maxSmallIntegerjs)
    -   [maxSummedInteger.js](https://github.com/dataproofer/core-suite#maxSummedIntegerjs)
    -   [checkDuplicateRows.js](https://github.com/dataproofer/core-suite#checkDuplicateRowsjs)
    -   [numberOfRowsIs65k.js](https://github.com/dataproofer/core-suite#numberOfRowsIs65kjs)
-   [Development](https://github.com/dataproofer/core-suite#development)
    -   [Getting Started](https://github.com/dataproofer/core-suite#getting-started)
    -   [Writing Tests](https://github.com/dataproofer/stats-suite#writing-tests)
    -   [Building Docs](https://github.com/dataproofer/core-suite#building-docs)

## Tests

# columnsContainNothing.js

Calculates the percentage of rows that are empty for each column

**Parameters**

-   `rows` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array of objects representing rows in the spreadsheet
-   `columnHeads` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array of strings for column names of the spreadsheet

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** describing the result

# columnsContainsSpecialChars.js

Calculates the percentage of rows that contain special, non-typical Latin characters for each column
Source: <http://www.w3schools.com/charsets/ref_html_utf8.asp>

**Parameters**

-   `rows` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array of objects representing rows in the spreadsheet
-   `columnHeads` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array of strings for column names of the spreadsheet

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** describing the result

# stringsHaveExactly255Characters.js

[src/stringsHaveExactly255Characters.js:14-66](https://github.com/dataproofer/core-suite/blob/master/src/stringsHaveExactly255Characters.js#L14-L66 "Source code on GitHub")

Determine the cells that have exactly 255 characters (SQL upper limit error). See ProPublica's bad data guide for further information
<https://github.com/propublica/guides/blob/master/data-bulletproofing.md#integrity-checks-for-every-data-set>

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

# maxBigInteger.js

[src/maxBigInteger.js:15-71](https://github.com/dataproofer/core-suite/blob/master/src/maxBigInteger.js#L15-L71 "Source code on GitHub")

Indicates an `bigint` at its upper signed limit (MySQL or PostgreSQL) of 9,223,372,036,854,775,807 or its upper unsigned limit (MySQL) of 18,446,744,073,709,551,616.
Common database programs, like MySQL, have a cap on how big of a number it can save.
Please see the [MySQL documentation](https://dev.mysql.com/doc/refman/5.7/en/integer-types.html) or [PostgreSQL documentation](http://www.postgresql.org/docs/9.5/interactive/datatype-numeric.html) for more information.

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

# maxInteger.js

[src/maxInteger.js:15-71](https://github.com/dataproofer/core-suite/blob/master/src/maxInteger.js#L15-L71 "Source code on GitHub")

Indicates a integer at its upper signed limit is 2,147,483,647 (MySQL or PostgreSQL) or its upper unsigned limit (MySQL) of 4,294,967,295.
Common database programs, like MySQL, have a cap on how big of a number it can save.
Please see the [MySQL documentation](https://dev.mysql.com/doc/refman/5.7/en/integer-types.html) for more information.

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

# maxSmallInteger.js

[src/maxSmallInteger.js:15-71](https://github.com/dataproofer/core-suite/blob/master/src/maxSmallInteger.js#L15-L71 "Source code on GitHub")

Indicates an `smallint` at its upper signed limit (MySQL or PostgreSQL) of 32,767 or its upper unsigned limit (MySQL) of 65,535.
Common database programs, like MySQL, have a cap on how big of a number it can save.
Please see the [MySQL documentation](https://dev.mysql.com/doc/refman/5.7/en/integer-types.html) or [PostgreSQL documentation](http://www.postgresql.org/docs/9.5/interactive/datatype-numeric.html) for more information.

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

# maxSummedInteger.js

[src/maxSummedInteger.js:15-71](https://github.com/dataproofer/core-suite/blob/master/src/maxSummedInteger.js#L15-L71 "Source code on GitHub")

Indicates a summed integers at its upper limit of 2,097,152.
Please see the [Integrity Checks](https://github.com/propublica/guides/blob/master/data-bulletproofing.md#integrity-checks-for-every-data-set) section of the ProPublica [Data Bulletproofing Guide](https://github.com/propublica/guides/blob/master/data-bulletproofing.md) for more information.

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

# checkDuplicateRows.js

[src/checkDuplicateRows.js:13-73](https://github.com/dataproofer/core-suite/blob/master/src/checkDuplicateRows.js#L13-L73 "Source code on GitHub")

Check for any duplicate rows in the spreadsheet. Optionally

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet
-   `input` **Object** accept user input, such as selected Columns

Returns **Object** describing the result

# numberOfRowsIs65k.js

[src/numberOfRowsIs65k.js:12-31](https://github.com/dataproofer/core-suite/blob/master/src/numberOfRowsIs65k.js#L12-L31 "Source code on GitHub")

Test to see if number of rows is exactly 65,536 rows (cutoff by Excel)

**Parameters**

-   `rows` **Array** an array of objects representing rows in the spreadsheet
-   `columnHeads` **Array** an array of strings for column names of the spreadsheet

Returns **Object** describing the result

## Development

### Getting Started

    git clone git@github.com:dataproofer/core-suite.git
    cd core-suite
    npm install

### Writing Tests

-   [How to](https://github.com/dataproofer/Dataproofer#creating-a-new-test)
-   [Helper Scripts](https://github.com/dataproofer/dataproofertest-js/blob/master/DOCUMENTATION.md#util)
-   Templates
    -   [Basic Test](https://github.com/dataproofer/suite-template/blob/master/src/myTest.js)
    -   [Advanced Test](https://github.com/dataproofer/suite-template/blob/master/src/myAdvancedTest.js)

### Building Docs

We use [documentation.js](https://github.com/documentationjs/documentation), but have created a handy script for regenerating documentation.

    npm run docs

Then open up and check your docs in [DOCUMENTATION.md](https://github.com/dataproofer/info-suite/blob/master/DOCUMENTATION.md)

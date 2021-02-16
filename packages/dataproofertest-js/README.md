# DataprooferTest

Creates an individual test instance to be used with the [Dataproofer app](https://github.com/dataproofer/Dataproofer/), or as a standalone data check in your JavaScript.

`var myTest = new DataprooferTest()`

* [API Documentation](https://github.com/dataproofer/dataproofertest-js/blob/master/DOCUMENTATION.md)
* [Repository](https://github.com/dataproofer/dataproofertest-js/)
* [Issues](https://github.com/dataproofer/dataproofertest-js/issues)

# Table of Contents

* [Development](https://github.com/dataproofer/suite-template-suite#development)
  * [Getting Started](https://github.com/dataproofer/stats-suite#getting-started)
  * [Writing Tests](https://github.com/dataproofer/stats-suite#writing-tests)
  * [Building Docs](https://github.com/dataproofer/suite-template#building-docs)

## Development

### Getting Started
```
git clone git@github.com:dataproofer/dataproofertest-js.git
cd dataproofertest-js
npm run bootstrap
```

### Writing Tests

* [How To](https://github.com/dataproofer/Dataproofer#creating-a-new-test)
* [Helper scripts](https://github.com/dataproofer/dataproofertest-js/blob/master/DOCUMENTATION.md#util)
* Templates
  * [Basic Test](https://github.com/dataproofer/suite-template/blob/master/src/myTest.js)
  * [Advanced Test](https://github.com/dataproofer/suite-template/blob/master/src/myAdvancedTest.js)

### Building Docs

We use [documentation.js](https://github.com/documentationjs/documentation), but have created a handy script for regenerating documentation.

```
npm run docs
```

Then open up and check your docs in [DOCUMENTATION.md](https://github.com/dataproofer/info-suite/blob/master/DOCUMENTATION.md)
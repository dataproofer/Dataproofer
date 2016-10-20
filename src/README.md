```
npm install dataproofer
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
node index.js data.csv
```
Save the results
```
node index.js --json data.csv --out data.json
```
Learn how to run specific test suites or tests and output longer or shorter summaries, use the `--help` flag.

Found a bug? [Let us know](https://github.com/dataproofer/Dataproofer/issues/new).

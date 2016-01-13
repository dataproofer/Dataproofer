# Dataproofer

Spellcheck for data

## Bootstrap

```
git clone git clone git@github.com:dataproofer/dataproofer.git
git clone git@github.com:dataproofer/core-suite.git
cd core-suite/
npm install
cd ../Dataproofer
npm install
```

## Dev

While we are developing you will need to clone [core-suite](https://github.com/dataproofer/core-suite/tree/master)
```
cd core-suite
npm link
cd ../dataproofer
npm link dataproofer-core-suite
```
You can run the CLI version with a file name or it will prompt you for one
```
node index sample-datasets/isis-attack-sites.csv
```
or
```
node index
```

## Sources

- [A Guide to Bulletproofing Your Data](https://github.com/propublica/guides/blob/master/data-bulletproofing.md), by [ProPublica](https://www.propublica.org/)
- [Checklist to bulletproof your data work](http://www.tommeagher.com/blog/2012/06/checklist.html), by [Tom Meagher](http://www.tommeagher.com/blog/2012/06/checklist.html) (Data Editor, The Marshall Project)
- [The Quartz guide to bad data](https://github.com/Quartz/bad-data-guide), by [Quartz](http://qz.com)
# Dataproofer

Spellcheck for data

—

## Bootstrap

```
git clone git@github.com:dataproofer/dataproofer.git
cd dataproofer/src
npm install
cd ../electron
npm install
```

## Dev


While we are developing you will need to clone [core-suite](https://github.com/dataproofer/core-suite/tree/master) into the folder that contains the dataproofer repo, not into the dataproofer repo itself.
```
git clone git@github.com:dataproofer/core-suite.git
git clone git@github.com:dataproofer/stats-suite.git
git clone git@github.com:dataproofer/geo-suite.git

cd core-suite
npm link
cd stats-suite
npm link
cd geo-suite
npm link

cd ../Dataproofer/src
npm link dataproofer-core-suite
npm link dataproofer-stats-suite
npm link dataproofer-geo-suite

npm link
cd ../electron
npm link dataproofer
```
You can run the electron app from the `Dataproofer/electron` folder
```
cd Dataproofer/electron
npm run electron
```
If you update the core library (`index.js` or `src/*`) you will need to `npm install` inside `Dataproofer/electron` for it to be updated, as we are currently relying on the "file:" dependency which copies the source instead of downloading it.

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
+ Require that test in the the suite's *index.js* 
+ Add that test to the exports in index.js 

Tests are made up a few parts

#### .name()
This is the name of your test, and how it appears in the test-selection screen as well as on the results page 

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

Generally, to perform your test, you are going to want to loop over each row and perform some operations on it.


### Troubleshooting a test that won't run
? 

# Packaging an executable

```
cd Dataproofer/electron
npm run package
```
This will create a new folder inside `Dataproofer/executables` that contains a Mac OS X app. The package command currently only generates the Mac app but could easily be extended to include Windows & Linux.


# Release
We can push releases to GitHub manually for now:
```
git tag -a 'v0.1.1' -m "first release"
git push && git push --tags
```
The binary (Dataproofer.app) can be uploaded to the [releases page](https://github.com/dataproofer/Dataproofer/releases) for the tag you just pushed, and should be zipped up first (Right click and choose "Compress Dataproofer")



## Sources

- [A Guide to Bulletproofing Your Data](https://github.com/propublica/guides/blob/master/data-bulletproofing.md), by [ProPublica](https://www.propublica.org/)
- [Checklist to bulletproof your data work](http://www.tommeagher.com/blog/2012/06/checklist.html), by [Tom Meagher](http://www.tommeagher.com/blog/2012/06/checklist.html) (Data Editor, The Marshall Project)
- [The Quartz guide to bad data](https://github.com/Quartz/bad-data-guide), by [Quartz](http://qz.com)

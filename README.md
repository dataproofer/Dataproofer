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
cd electron
npm install
```

## Dev

While we are developing you will need to clone [core-suite](https://github.com/dataproofer/core-suite/tree/master)
```
cd core-suite
npm link
cd ../Dataproofer
npm link dataproofer-core-suite
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

# Packaging an executable

```
cd Dataproofer
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
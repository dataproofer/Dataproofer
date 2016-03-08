#!/usr/bin/env bash

cd ..
# git clone git@github.com:dataproofer/core-suite.git
# git clone git@github.com:dataproofer/stats-suite.git
git clone git@github.com:dataproofer/geo-suite.git

# cd core-suite
# echo `pwd`
# npm install && npm link
cd stats-suite
echo `pwd`
npm install && npm link
cd ../geo-suite
npm install && npm link

cd ../Dataproofer/src
npm link dataproofer-core-suite
npm link dataproofer-stats-suite
npm link dataproofer-geo-suite

npm link
cd ../electron
npm link dataproofer
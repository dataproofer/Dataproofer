#!/usr/bin/env bash

# update all the repos
# use git pull without specifying origin in case you are working from a branch

git pull
cd ..

cd dataproofertest-js
git pull

cd ../info-suite
git pull

cd ../core-suite
git pull

cd ../stats-suite
git pull

cd ../geo-suite
git pull


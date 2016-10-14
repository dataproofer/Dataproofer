#!/usr/bin/env bash

# update all the repos
# use git pull without specifying origin in case you are working from a branch

git pull origin master
cd ..

cd dataproofertest-js
git pull origin master

cd ../info-suite
git pull origin master

cd ../core-suite
git pull origin master

cd ../stats-suite
git pull origin master

cd ../geo-suite
git pull origin master

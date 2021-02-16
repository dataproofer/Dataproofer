#!/usr/bin/env bash

# update all the repos
# use git pull without specifying origin in case you are working from a branch

git pull origin main
cd ..

cd dataproofertest-js
git pull origin main

cd ../info-suite
git pull origin main

cd ../core-suite
git pull origin main

cd ../stats-suite
git pull origin main

cd ../geo-suite
git pull origin main

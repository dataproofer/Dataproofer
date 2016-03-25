#!/usr/bin/env bash

# we unlink the repositories
echo 'unlinking repositories'
cd electron
npm install dataproofer
npm install dataproofer-info-suite
npm install dataproofer-core-suite
npm install dataproofer-stats-suite
npm install dataproofer-geo-suite

echo 'building for Mac'
./node_modules/.bin/electron-packager . Dataproofer --platform=darwin --arch=x64 --icon='icons/_dp-robot.png.icns' --version=0.36.11  --out=../executables --overwrite

echo 'building for Windows'
./node_modules/.bin/electron-packager . Dataproofer --platform=win32 --arch=x64 --icon='icons/_dp-robot.png.ico' --version=0.36.11 --out=../executables --overwrite

echo 'building for Linux'
./node_modules/.bin/electron-packager . Dataproofer --platform=linux --arch=x64 --version=0.36.11 --out=../executables --overwrite



#echo 'relinking'
#npm link dataproofer
#npm link dataproofer-info-suite
#npm link dataproofer-core-suite
#npm link dataproofer-stats-suite
#npm link dataproofer-geo-suite

echo Building React app...
react-scripts build

rm -r dist
mkdir dist
cp -r logs dist
cp config.json dist

echo Compiling typescript...
npx tsc

echo Creating executables...
pkg .

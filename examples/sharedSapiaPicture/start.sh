#!/bin/bash
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
pjsFile="$DIR/../../dist/p-j-s.min.js"

if [ ! -f "$pjsFile" ]
then 
  echo "missing p-j-s.min.js. run 'npm run build' at project root directory"
  exit 1
fi

cp $pjsFile $DIR
$DIR/node_modules/serve/bin/serve $DIR
#!/bin/bash
## 
# This script lint all stage file before commit
##

# go to the docker folder in case of script is running from an other place
BASEDIR=$(dirname "$0")
cd $BASEDIR/..
ROOT_DIR=$(pwd)

foldres=("back" "cypress" "front" "front-admin");

for folder in "${foldres[@]}"; do
  echo "-------------------------- RUNNING eslint for $folder ...."
  cd ${ROOT_DIR}/${folder}
  if [ ! -f "./node_modules/.bin/eslint" ]; then
    yarn
  fi
  yarn lint

  if [[ $? != 0 ]]; then
    cd ${ROOT_DIR}
    exit 1
  fi
done

cd ${ROOT_DIR}
exit 0;
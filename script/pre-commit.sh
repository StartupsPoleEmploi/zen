#!/bin/bash
## 
# This script lint all stage file before commit
##

# go to the docker folder in case of script is running from an other place
BASEDIR=$(dirname "$0")
cd $BASEDIR/..
ROOT_DIR=$(pwd)

filesChange=$(git diff --staged --name-only --raw);
foldres=("back" "cypress" "front" "front-admin");

for folder in "${foldres[@]}"; do
  arrayFile=();
  for file in $filesChange; do
    # test if file exist && file in folder && file whit .js extention
    if [[ -f $file ]] && [[ $file = $folder\/* ]] && [[ $file = $folder\/*.js ]]; then
      fileWithoutFolderName=$(echo $file | sed "s/$folder\///");
      arrayFile=( "${arrayFile[@]}" $fileWithoutFolderName );
    fi
  done

  echo "-------------------------- RUNNING eslint for $folder ...."
  sizeArray=${#arrayFile[@]}
  if [[ $sizeArray -gt 0 ]]; then
    cd ${ROOT_DIR}/${folder}
    if [ ! -f "./node_modules/.bin/eslint" ]; then
      yarn
    fi
    ./node_modules/.bin/eslint ${arrayFile[@]}

    if [[ $? != 0 ]]; then
      cd ${ROOT_DIR}
      exit 1
    fi
  fi
done

cd ${ROOT_DIR}
exit 0;
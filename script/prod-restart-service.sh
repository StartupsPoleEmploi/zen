#!/bin/bash
if [[ $# -eq 0 ]] ; then
    echo 'Please provide service name'
    exit 1
fi

docker-compose build $1 && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --no-deps -d $1

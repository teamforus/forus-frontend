#!/bin/bash

rm -rf src/node_modules
mkdir -p dist

if [ "$1" == "compile" ] || [ "$1" == "c" ] || [ "$1" == "-compile" ] || [ "$1" == "-c" ]
then
    docker-compose up -d && docker-compose exec app sh -c "cd src && npm i && yes n | gulp init && gulp compile"
    exit 1
fi

docker-compose up -d && docker-compose exec app sh -c "cd src && npm i && yes n | gulp init && gulp"

#!/bin/bash

# make folders for docker-compose volumes for apache2
mkdir -p dist/forus-platform.provider.general
mkdir -p dist/forus-platform.sponsor.general
mkdir -p dist/forus-platform.validator.general
mkdir -p dist/forus-webshop-general.panel

docker-compose up -d && docker-compose exec app sh -c "cd src && npm i && yes n | gulp init && gulp compile"

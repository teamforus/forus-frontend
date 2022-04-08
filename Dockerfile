### STAGE 1: Build ###    
# We label our stage as 'builder'
FROM node:14-alpine as builder

COPY src/package.json src/package-lock.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent 
## unnecessary npm installs at each build
RUN npm i --force && mkdir -p -- /ng-app/src/node_modules && cp -RT ./node_modules ./ng-app/src/node_modules
RUN npm install gulp-cli -g

WORKDIR /ng-app

COPY src src

## Build the angular app in production mode and store the artifacts in dist folder
RUN cd src && gulp init && gulp compile

### STAGE 2: Setup apache2
FROM httpd:2.4

ENV APACHE_DOCUMENT_ROOT=/usr/local/apache2/htdocs
COPY docker/docker-compose/apache2/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY docker/docker-compose/apache2/httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf

RUN rm -rf /usr/local/apache2/htdocs/*
# From 'builder' stage copy over the artifacts in dist folder
# to default apache2 public folder
COPY --from=builder /ng-app/dist/forus-webshop-general.panel /usr/local/apache2/htdocs/webshop
COPY --from=builder /ng-app/dist/forus-platform.provider.general /usr/local/apache2/htdocs/provider
COPY --from=builder /ng-app/dist/forus-platform.validator.general /usr/local/apache2/htdocs/validator
COPY --from=builder /ng-app/dist/forus-platform.sponsor.general /usr/local/apache2/htdocs/sponsor
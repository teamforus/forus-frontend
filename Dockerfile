### STAGE 1: Build ###    
# We label our stage as 'builder'
FROM node:13-alpine as builder

RUN apk update \
    && apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++

COPY src/package.json src/package-lock.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent 
## unnecessary npm installs at each build
RUN npm i --force && mkdir -p -- /ng-app/src/node_modules && cp -RT ./node_modules ./ng-app/src/node_modules
RUN npm install gulp-cli -g

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN cd src && gulp init && gulp compile

### STAGE 2: Setup ###

FROM nginx:1.19.10-alpine

## Copy our default nginx config
COPY nginx/default.conf /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

ARG IMPLEMENTATION_NAME

## From 'builder' stage copy over the artifacts in dist folder 
## to default nginx public folder
COPY --from=builder /ng-app/dist/forus-webshop-$IMPLEMENTATION_NAME.panel /usr/share/nginx/$IMPLEMENTATION_NAME
COPY --from=builder /ng-app/dist/forus-platform.provider.$IMPLEMENTATION_NAME /usr/share/nginx/$IMPLEMENTATION_NAME/provider
COPY --from=builder /ng-app/dist/forus-platform.validator.$IMPLEMENTATION_NAME /usr/share/nginx/$IMPLEMENTATION_NAME/validator
COPY --from=builder /ng-app/dist/forus-platform.sponsor.$IMPLEMENTATION_NAME /usr/share/nginx/$IMPLEMENTATION_NAME/sponsor

CMD ["nginx", "-g", "daemon off;"]
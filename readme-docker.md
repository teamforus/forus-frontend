# Dockerize Forus

- [Docker compose](#docker-compose)
- [Docker image](#docker-image)

## Git
### Get project from git
First you need to get project from git

``` 
git clone git@github.com:teamforus/forus-frontend.git forus-frontend
```

### Checkout branch
Go to the new created folder `forus-frontend` and pull project from any branch you want

```
git checkout <BRANCH_NAME>
```

## Docker compose

Same as backend, after build and start container you can edit project files (switch to another branch for example).
Here we must get project from git, run start script for docker-compose (where will be installed all dependencies and compiled assets).

### Start docker containers
Next you can run sh command, that will copy env file (if it's not exists), run docker containers, install node modules, compile assets and connect your folder with project to container (volume).
This command will watch project files - if you need only compile assets - add argument ```-compile``` or ```-c``` to script

``` 
./docker/cmd/start-docker-compose.sh
```

### Install npm packages and compile (optional)
If you need to run npm installer (for node modules) or compile front assets (if there are some changes in package.json or you didn't use watch files and have changes in project files), you can use next commands

``` 
docker-compose exec app sh -c "cd src && npm install"
docker-compose exec app sh -c "cd src && gulp compile"
```

### Links
If everything done - frontend will be available on next urls:
```
http://localhost:3000 - Webshop
http://localhost:3001 - Provider dashboard
http://localhost:3002 - Sponsor dashboard
http://localhost:3003 - Validator dashboard
```

### Stop containers
To stop containers:

``` 
docker-compose down
```

## Docker image
You can use docker image for forus frontend, build it (later it will be available on docker hub) and start it

### Build docker image
First you need to build docker image

``` 
docker build -t forus-io/forus-frontend .
```

### Start docker containers
After you can run command to start docker containers (for node, apache2)

``` 
./docker/cmd/start.sh
```

### Links
If everything done - frontend will be available on next urls:
```
http://localhost:3000 - Webshop
http://localhost:3001 - Provider dashboard
http://localhost:3002 - Sponsor dashboard
http://localhost:3003 - Validator dashboard
```

### Stop containers
To stop container:

``` 
docker stop forus-frontend
```

## Dockerize Forus

- [Docker compose](#docker-compose)
- [Docker image](#docker-image)

## Docker compose

Same as backend, after build and start container you can edit project files (switch to another branch for example).

First you need to get project from git

``` 
git clone git@github.com:teamforus/forus-frontend.git forus-frontend
```
go to the new created folder `forus-frontend` and pull project from any branch you want

```
git checkout <BRANCH_NAME>
```

Next you can run sh command, that will copy env file (if it's not exists), run docker containers, install node modules, compile assets and connect your folder with project to container (volume).

``` 
./docker/cmd/start-docker-compose.sh
```

If you need to run npm installer (for node modules) and compile front assets (if there are some changes in package.json or in project files), you can use next commands

``` 
docker-compose exec app sh -c "cd src && npm install"
docker-compose exec app sh -c "cd src && gulp compile"
```

If everything done - frontend will be available on next urls:
```
http://localhost:2000 - Webshop
http://localhost:3000 - Provider dashboard
http://localhost:4000 - Sponsor dashboard
http://localhost:5000 - Validator dashboard
```

To stop containers:

``` 
docker-compose down
```

## Docker image

Same as for docker compose you need to get project from git

``` 
git clone git@github.com:teamforus/forus-frontend.git forus-frontend
```

go to the new created folder `forus-backend` and pull project from any branch you want and pull project from any branch you want

```
git checkout <BRANCH_NAME>
```

Then you need to build docker image (later it will be available form docker hub)

``` 
docker build -t forus-io/forus-frontend .
```

After you can run command to start docker containers (for php, apache2 and mysql)

``` 
./docker/cmd/start.sh
```

If everything done - frontend will be available on next urls:
```
http://localhost:2000 - Webshop
http://localhost:3000 - Provider dashboard
http://localhost:4000 - Sponsor dashboard
http://localhost:5000 - Validator dashboard
```

To stop container:

``` 
docker stop forus-frontend
```

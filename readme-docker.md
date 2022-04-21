# Dockerize Forus

- [Installation](#installation)
- [Docker compose](#docker-compose)
- [Docker image](#docker-image)

# Installation

**Repositories:**  
Frontend: [https://github.com/teamforus/forus-frontend](https://**github**.com/teamforus/forus-frontend)  
Backend: [https://github.com/teamforus/forus-backend](https://github.com/teamforus/forus-backend) 

## Get the project from github
First, you need to clone the project from GitHub:
```bash
git clone git@github.com:teamforus/forus-frontend.git forus-frontend
```

### Checkout to the branch you want to test:
Go to the newly created folder `forus-frontend` and checkout to the branch you want to test:
```
cd forus-frontend
git checkout <BRANCH_NAME>
```

## Docker compose
___
Same as the backend, after you build and start the container you can edit project files (or switch to another branch for example).

## Start and run the docker compose for the first time
___
Next, you can run a bash script, to perform the next operations:
- Create the .env file from .env.example (if it doesn't already exist).
- Start the containers.
- Install node modules.
- Compile the assets.
- Connect your project directory as container volume.

By default this script will build the project and watch for the changes. 
But if you only want to build the project without watching add `-compile` or `-c` flag.

``` 
./docker/cmd/start-docker-compose.sh
```

## Links
___

If everything fine - the front-ends will be available at following urls:   

[http://localhost:3000](http://localhost:3000) - Webshop  
[http://localhost:3001](http://localhost:3001) - Provider dashboard  
[http://localhost:3002](http://localhost:3002) - Sponsor dashboard  
[http://localhost:3003](http://localhost:3003) - Validator dashboard 

## Stop the containers
___ 

To stop containers run:

``` 
docker-compose down
```

## Restart the container
___ 

To start again existing container, without `npm install` and `full rebuild` run:

``` 
docker-compose up -d
```
But to be able to edit the code and see the changes you made, you will have to manually run the builder (see: `Build the assets` section)

## Installing/Updating node modules
___

To install/reinstall node module: 
``` 
docker-compose exec app sh -c "cd src && npm install"
```

## Build the assets
___

To build the project use:
``` 
docker-compose exec app sh -c "cd src && gulp compile"
```

To build the project and watch for the change use:
``` 
docker-compose exec app sh -c "cd src && gulp"
``` 


# Docker image
Another way to run the project, is to use a prebuilt docker image.

You can either build the forus-frontend image yourself locally or download the image from docker-hub (will be available later).

## Build docker image:
First build docker image:

``` 
docker build -t forus-io/forus-frontend .
```

## Start the containers:
The next command will start the containers (`node`, `apache2`)
After you can run command to start docker containers (for node, apache2)

``` 
./docker/cmd/start.sh
```

## Links
___

If everything fine - the front-ends will be available at following urls:   

[http://localhost:3000](http://localhost:3000) - Webshop  
[http://localhost:3001](http://localhost:3001) - Provider dashboard  
[http://localhost:3002](http://localhost:3002) - Sponsor dashboard  
[http://localhost:3003](http://localhost:3003) - Validator dashboard  

### Stop containers
To stop the containers use:

``` 
docker stop forus-frontend
```

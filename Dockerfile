FROM node:carbon

WORKDIR /usr/src/app

# Bundle app source
COPY . .

EXPOSE 3000

RUN apt-get update && apt-get upgrade -y
RUN apt-get install mc nano -y

RUN npm i npm@latest -g
RUN npm i gulp@latest -g
RUN npm install http-server@latest -g
RUN cd _src && npm install && gulp init && gulp compile

CMD bash -c "cd ./_src && gulp pug && cd ../ && http-server ./html -p 3000"

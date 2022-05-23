FROM node:17.9.0-buster

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

ENTRYPOINT [ "npm", "start" ]

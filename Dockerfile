FROM node:18-alpine3.14
RUN mkdir /app
WORKDIR /app 
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app/

CMD [ "node", "/app/index.js"]

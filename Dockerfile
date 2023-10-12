FROM node:18-alpine3.16

RUN npm install pm2 -g

WORKDIR /app

COPY *.json ./

COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3100

CMD ["pm2-runtime", "dist/index.js"]
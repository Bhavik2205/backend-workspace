FROM node:18
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
EXPOSE 3100
CMD [ "node", "dist/index.js" ]
FROM node:18-alpine

WORKDIR /usr/src/index

RUN apk add git openssh

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 3000 50000

CMD ["node", "dist/main"]

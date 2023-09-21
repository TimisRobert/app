FROM node:18-bullseye-slim as builder

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-*.yaml ./

COPY packages/api/package.json ./packages/api/package.json
COPY packages/core/package.json ./packages/core/package.json

RUN pnpm install

COPY . .

WORKDIR /usr/src/app/packages/api

RUN pnpm build 

FROM node:18-bullseye-slim

COPY --from=builder --chown=nobody:root /usr/src/app/packages/api/.build ./

USER nobody

CMD [ "node", "main.mjs" ]

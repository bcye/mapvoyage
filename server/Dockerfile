FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json .
COPY bun.lockb .
RUN bun install --frozen-lockfile --production

ENV NODE_ENV=production
ENV WIKITEXT_DIR=/wikitext

COPY . .

WORKDIR /usr/src/app/scripts
RUN bun install --frozen-lockfile --production

WORKDIR /usr/src/app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]
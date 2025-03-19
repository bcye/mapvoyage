FROM node:22

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY index.ts .

CMD ["node", "--experimental-strip-types", "index.ts"]
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN npm ci

COPY . .

RUN npm run prisma:generate -w @aegis-core/api \
  && npm run build -w @aegis-core/contracts \
  && npm run build -w @aegis-core/api

EXPOSE 4000

CMD ["sh", "-c", "npm run prisma:migrate:deploy -w @aegis-core/api && npm run start -w @aegis-core/api"]

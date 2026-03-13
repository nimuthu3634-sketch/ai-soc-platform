FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=http://localhost:4000/api
ARG VITE_APP_NAME="Aegis Core"
ARG VITE_LOGO_PATH=/branding/aegiscore-logo.png
ARG VITE_PROPOSAL_COVER_REFERENCE=docs/branding/proposal-cover.png
ARG VITE_AI_ANALYSIS_ENABLED=true

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_LOGO_PATH=$VITE_LOGO_PATH
ENV VITE_PROPOSAL_COVER_REFERENCE=$VITE_PROPOSAL_COVER_REFERENCE
ENV VITE_AI_ANALYSIS_ENABLED=$VITE_AI_ANALYSIS_ENABLED

RUN npm run build -w @aegis-core/contracts \
  && npm run build -w @aegis-core/web

FROM nginx:1.27-alpine

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

FROM node:24.22.0-alpine AS build
WORKDIR /workspace
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM caddy:2.11.7@sha256:173b26306d711395accaeba8b67afcaad2a085ccb1e6bf26010bfe8c095a5229
COPY --from=build /workspace/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80

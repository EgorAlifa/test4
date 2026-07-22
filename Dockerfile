# Dev environment for widget development.
#
# Bakes node_modules into the image at build time (once, by whoever
# rebuilds this image), so developers who pull/build it never fight
# peer-dep conflicts themselves — it's already resolved.
#
# Build:
#   docker build -t insight-widgets-dev .
# or via docker-compose.dev.yml / .devcontainer (Reopen in Container).

FROM node:20-bookworm-slim

WORKDIR /app

COPY .npmrc package.json ./
# devDependencies has a "file:" dependency on this local package, so it
# must exist before `npm install` runs.
COPY src/common/utils ./src/common/utils

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3001
ENV DEV_SERVER_PORT=3001

CMD ["npm", "run", "start"]

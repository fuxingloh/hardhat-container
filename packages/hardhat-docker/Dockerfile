FROM node:20-alpine as base
RUN addgroup --system --gid 1001 hardhat && \
    adduser --system --uid 1001 hardhat
USER hardhat
WORKDIR /app

COPY package.json .
COPY hardhat.config.cjs .
RUN npm install

EXPOSE 8545
ENTRYPOINT ["npx", "hardhat", "--config", "./hardhat.config.cjs", "container"]
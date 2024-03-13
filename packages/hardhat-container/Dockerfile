FROM node:20-alpine
WORKDIR /hardhat

COPY ../../package.json ./hardhat.config.js ./
RUN npm install

EXPOSE 8545
ENTRYPOINT ["npx", "hardhat", "node"]

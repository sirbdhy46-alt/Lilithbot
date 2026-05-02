FROM node:20-alpine

WORKDIR /app

COPY artifacts/discord-bot/package.json artifacts/discord-bot/package-lock.json* ./

RUN npm install --omit=dev --prefer-offline

COPY artifacts/discord-bot/src/ ./src/
COPY artifacts/discord-bot/data/ ./data/

RUN mkdir -p data

CMD ["node", "src/index.js"]

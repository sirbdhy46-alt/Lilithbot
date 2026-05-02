FROM node:20-alpine

WORKDIR /app

COPY artifacts/discord-bot/package.json ./

RUN npm install --omit=dev

COPY artifacts/discord-bot/src/ ./src/
COPY artifacts/discord-bot/data/ ./data/

CMD ["node", "src/index.js"]

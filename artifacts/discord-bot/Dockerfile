FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --omit=dev --prefer-offline

COPY src/ ./src/
COPY data/ ./data/

RUN mkdir -p data

CMD ["node", "src/index.js"]

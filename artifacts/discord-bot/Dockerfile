FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p data

CMD ["node", "src/index.js"]

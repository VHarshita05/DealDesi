FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY routes ./routes
COPY db ./db
COPY products.csv ./products.csv
COPY server.js ./server.js
COPY fashion-muse-render ./fashion-muse-render

EXPOSE 3000

CMD ["node", "server.js"]
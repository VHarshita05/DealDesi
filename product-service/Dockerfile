FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copy application source
COPY server.js ./server.js
COPY routes ./routes
COPY db ./db
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]


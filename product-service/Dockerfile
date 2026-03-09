FROM node:18

WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install

# Copy backend files
COPY routes ./routes
COPY db ./db
COPY products.csv ./products.csv
COPY server.js ./server.js

# Copy frontend project
COPY fashion-muse-render ./fashion-muse-render

# Build frontend (creates dist folder)
WORKDIR /app/fashion-muse-render
RUN npm install && npm run build

# Go back to backend root
WORKDIR /app

# Expose port used by Render
EXPOSE 10000

# Start server
CMD ["node", "server.js"]
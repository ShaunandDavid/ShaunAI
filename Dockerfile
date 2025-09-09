# Simple Node.js monorepo Dockerfile
FROM node:20.11.1
WORKDIR /app
COPY package*.json ./
COPY autonomy/server/package*.json ./autonomy/server/
COPY autonomy/ui/package*.json ./autonomy/ui/
RUN npm ci && npm ci --prefix autonomy/server && npm ci --prefix autonomy/ui
COPY . .
EXPOSE 5000 8787 8788 5173
# Default dev command; docker-compose overrides per service
CMD ["npm", "run", "dev"]

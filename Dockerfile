# Step 1: Build client frontend
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

# Step 2: Setup server and serve
FROM node:20-alpine
WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server ./server
COPY --from=client-builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

WORKDIR /app/server
CMD ["node", "src/index.js"]

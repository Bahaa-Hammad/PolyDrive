# Development stage
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY --from=development /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"] 
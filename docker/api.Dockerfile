FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/domain/package.json ./packages/domain/
COPY packages/database/package.json ./packages/database/
COPY packages/queue/package.json ./packages/queue/
COPY packages/repository-contracts/package.json ./packages/repository-contracts/
COPY packages/security/package.json ./packages/security/
COPY services/auth-kyb-service/package.json ./services/auth-kyb-service/
COPY services/pooling-service/package.json ./services/pooling-service/
COPY services/logistics-hub-service/package.json ./services/logistics-hub-service/
COPY services/settlement-service/package.json ./services/settlement-service/
COPY services/queue-worker/package.json ./services/queue-worker/
COPY services/ml-forecasting-service/package.json ./services/ml-forecasting-service/
RUN npm ci

FROM base AS runner
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001
CMD ["npx", "tsx", "--tsconfig", "apps/api/tsconfig.json", "apps/api/src/main.ts"]

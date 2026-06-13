FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./
COPY apps/backends/controle-financiamentos-api ./apps/backends/controle-financiamentos-api
COPY libs/shared-financing-types ./libs/shared-financing-types

RUN pnpm install --frozen-lockfile
RUN cd apps/backends/controle-financiamentos-api && DATABASE_URL="file:./prisma/dev.db" pnpm exec prisma generate
RUN pnpm exec nx build controle-financiamentos-api

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache wget

COPY --from=builder /app/apps/backends/controle-financiamentos-api/dist-prod ./dist-prod
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backends/controle-financiamentos-api/node_modules ./node_modules
COPY --from=builder /app/apps/backends/controle-financiamentos-api/prisma ./prisma
COPY --from=builder /app/apps/backends/controle-financiamentos-api/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/libs/shared-financing-types ./libs/shared-financing-types

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist-prod/main.js"]

FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./
COPY apps/frontends/controle-financiamentos-web ./apps/frontends/controle-financiamentos-web
COPY libs/shared-financing-types ./libs/shared-financing-types

RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/frontends/controle-financiamentos-web
RUN pnpm exec vite build

FROM nginx:1.27-alpine AS runner

COPY apps/frontends/controle-financiamentos-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontends/controle-financiamentos-web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

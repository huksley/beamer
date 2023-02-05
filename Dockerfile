# Install dependencies only when needed
FROM node:18-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm ci

ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_KEY
RUN npm run build
RUN npx esbuild --bundle server.js --target=node18 --platform=node --external:next > server.js

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY . .
RUN mkdir .next
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/server.js /app/server.js

USER nextjs

CMD ["npm", "run", "start"]

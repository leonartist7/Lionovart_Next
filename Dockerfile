# STAGE 1: Define the base image for all stages
FROM node:20-alpine AS base

# STAGE 2: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy package files and install
COPY package.json package-lock.json* ./
RUN npm install

# STAGE 3: Build the application
FROM base AS builder
WORKDIR /app
# Copy node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all project files
COPY . .

# --- BUILD-TIME VARIABLES ---
# Next.js evaluates server-side module code during `npm run build`
# so we must pass ALL environment variables (even secrets) as build args
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG RESEND_API_KEY
ARG GEMINI_API_KEY
ARG SANITY_API_READ_TOKEN
ARG FIREBASE_ADMIN_PRIVATE_KEY
ARG WHATSAPP_NUMBER
ARG BOOKING_URL
ARG FIREBASE_ADMIN_CLIENT_EMAIL
ARG FIREBASE_PROJECT_ID

# Set them as ENV so Next.js can read them during `npm run build`
ENV NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET
ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV SANITY_API_READ_TOKEN=$SANITY_API_READ_TOKEN
ENV FIREBASE_ADMIN_PRIVATE_KEY=$FIREBASE_ADMIN_PRIVATE_KEY
ENV WHATSAPP_NUMBER=$WHATSAPP_NUMBER
ENV BOOKING_URL=$BOOKING_URL
ENV FIREBASE_ADMIN_CLIENT_EMAIL=$FIREBASE_ADMIN_CLIENT_EMAIL
ENV FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
# Build-time optimization flags
ENV TURBOPACK=0
ENV NEXT_TURBOPACK=0
ENV NEXT_TELEMETRY_DISABLED=1

# Run the Next.js build
RUN npm run build

# STAGE 4: Final production image (The Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Don't run as root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the compiled output and necessary runtime files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Custom server files are not bundled or dependency-traced by Next.js.
COPY --from=builder /app/server.js /app/ws-auth.js /app/nova-agent-config.js ./

# Ensure permissions are correct
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

# Set up the runtime port
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]

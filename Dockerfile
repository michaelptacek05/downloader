# --- Build stage ---
FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 curl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* yarn.lock* ./
COPY cookies.txt ./

ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
RUN npm install

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python-is-python3 \
    curl \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && /usr/local/bin/yt-dlp -U

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/cookies.txt ./

EXPOSE 3000

CMD ["node", "server.js"]
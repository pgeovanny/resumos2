# Use Alpine para imagem pequena
FROM node:18-alpine

# Instala dependências do sistema para Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Define variáveis para Puppeteer usar o Chromium do Alpine
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NODE_ENV=production \
    PORT=3333

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 3333
CMD ["node", "server.js"]

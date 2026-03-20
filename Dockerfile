FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Root manifest and web app manifest
COPY package.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY prisma ./prisma

RUN npm install --workspace apps/web && npx prisma generate

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev", "-w", "apps/web"]


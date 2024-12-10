FROM node:18-alpine

# Set timezone
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ENV NODE_ENV=production
RUN npm install dotenv --global

USER node
WORKDIR /app
RUN apk add --no-cache openssl

# COPY package*.json ./
COPY node_modules/ ./node_modules/
COPY dist/ ./dist/

EXPOSE 3000
ENV PORT 3000

CMD ["npx", "dotenv", "-e", "dist/.env", "--", "node", "dist/src/main.js"]

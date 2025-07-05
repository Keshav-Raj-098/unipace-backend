FROM node:20-slim


# Install OpenSSL before anything else that may need it (like Prisma)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install


COPY . .


RUN npx prisma generate

RUN apt-get install -y openssl

CMD [ "node", "index.js" ]

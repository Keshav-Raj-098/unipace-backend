FROM node:20-slim
 
WORKDIR /app
 
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install


COPY . .
 
RUN npx prisma generate

CMD [ "node", "index.js" ]

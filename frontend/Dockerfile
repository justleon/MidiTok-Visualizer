FROM node:21-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install && npm cache clean --force

COPY . .
RUN npm run build


RUN npm install -g serve
EXPOSE 3000
ENV PORT 3000

CMD ["serve", "-s", "build", "-l", "0.0.0.0:$PORT"]
#CMD ["npm", "run", "dev"]
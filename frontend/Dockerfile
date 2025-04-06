FROM node:21-alpine

WORKDIR /app/frontend

COPY package.json package-lock.json* ./

RUN npm install && npm cache clean --force

COPY . .
RUN npm run build


RUN npm install -g serve
EXPOSE 8080
ENV PORT 8080

CMD ["sh", "-c", "serve -s build -l ${PORT:-8080}"]
#CMD ["npm", "run", "dev"]
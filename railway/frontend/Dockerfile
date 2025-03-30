FROM node:21-alpine AS build
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV REACT_APP_API_BASE_URL="https://miditok-visualizer-production-backend.up.railway.app"
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install && npm cache clean --force
COPY frontend/ .
RUN npm run build

FROM node:21-alpine AS production
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]

FROM node:21-alpine AS frontend-builder
WORKDIR /app/frontend
COPY ../../frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY ../../frontend ./
RUN npm run build

FROM python:3.11-buster
WORKDIR /app

RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


COPY ../../backend/pyproject.toml backend/poetry.lock ./
RUN touch README.md


COPY ../../backend/core ./core

RUN pip install poetry==1.6.1 && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi && \
    pip install gunicorn uvicorn fastapi


COPY --from=frontend-builder /app/frontend/build/ ./static


RUN npm install -g serve


COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
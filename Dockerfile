FROM node:21-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-buster
RUN pip install poetry==1.6.1 && pip install gunicorn uvicorn

WORKDIR /app

COPY backend/pyproject.toml backend/poetry.lock ./
RUN touch README.md
COPY backend/core ./core
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

COPY --from=frontend-builder /app/frontend/build ./static

RUN npm install -g serve

COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
FROM python:3.11-buster AS builder
RUN apt-get update && apt-get install -y libc6
RUN pip install poetry==1.6.1
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1
WORKDIR /app
COPY backend/pyproject.toml backend/poetry.lock ./
RUN touch README.md
RUN poetry install --no-root
COPY backend/core ./core
COPY backend/tests ./tests
RUN poetry run pytest

FROM python:3.11-slim-buster AS runtime
ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"
COPY --from=builder /app/.venv /app/.venv
WORKDIR /app
COPY backend/core ./core
ENTRYPOINT ["python", "-m", "core.main"]

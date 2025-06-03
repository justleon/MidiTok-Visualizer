#!/bin/bash
uvicorn core.api.api:app --host 0.0.0.0 --port $PORT
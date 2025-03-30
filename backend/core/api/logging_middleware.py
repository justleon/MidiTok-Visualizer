import logging
import time
from typing import Any, Callable, Dict, Tuple
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI, *, logger: logging.Logger) -> None:
        self._logger = logger
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id: str = str(uuid4())

        logging_dict: Dict[str, Any] = {"X-API-REQUEST-ID": request_id}

        response, response_dict = await self._log_response(call_next, request, request_id)

        request_dict = await self._log_request(request)
        logging_dict["request"] = request_dict
        logging_dict["response"] = response_dict

        self._logger.info(logging_dict)

        return response

    async def _log_request(self, request: Request) -> Dict[str, Any]:
        path = request.url.path
        if request.query_params:
            path += f"?{request.query_params}"

        request_logging = {
            "method": request.method,
            "path": path,
            "ip": request.client.host if request.client is not None else None,
        }

        return request_logging

    async def _log_response(
        self, call_next: Callable, request: Request, request_id: str
    ) -> Tuple[Response, Dict[str, Any]]:
        start_time = time.perf_counter()
        response: Response = await self._execute_request(call_next, request, request_id)
        finish_time = time.perf_counter()

        overall_status = "successful" if response.status_code < 400 else "failed"

        execution_time = finish_time - start_time

        response_logging = {
            "status": overall_status,
            "status_code": response.status_code,
            "time_taken": f"{execution_time:0.4f}s",
        }

        resp_body = [section async for section in response.__dict__["body_iterator"]]
        response.__setattr__("body_iterator", AsyncIteratorWrapper(resp_body))

        return response, response_logging

    async def _execute_request(self, call_next: Callable, request: Request, request_id: str) -> Response:
        try:
            response: Response = await call_next(request)
            response.headers["X-API-Request-ID"] = request_id
            return response

        except Exception as e:
            self._logger.exception({"path": request.url.path, "method": request.method, "reason": e})
            return Response(content="Internal Server Error", status_code=500)


class AsyncIteratorWrapper:
    def __init__(self, obj):
        self._it = iter(obj)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            value = next(self._it)
        except StopIteration:
            raise StopAsyncIteration
        return value


log_config = {
    "version": 1,
    "loggers": {
        "root": {"level": "INFO", "handlers": ["consoleHandler"]},
        "core": {"level": "DEBUG", "handlers": ["logfile"], "qualname": "core", "propagate": 0},
    },
    "handlers": {
        "consoleHandler": {
            "class": "logging.StreamHandler",
            "formatter": "normalFormatter",
            "stream": "ext://sys.stdout",
        },
        "logfile": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "logfileFormatter",
            "filename": "logfile.log",
            "mode": "a",
        },
    },
    "formatters": {
        "normalFormatter": {
            "format": "%(asctime)s loglevel=%(levelname)-6s logger=%(name)s %(funcName)s() L%(lineno)-4d %(message)s"
        },
        "logfileFormatter": {
            "format": "%(asctime)s loglevel=%(levelname)-6s logger=%(name)s %(funcName)s() L%(lineno)-4d %(message)s"
        },
    },
}

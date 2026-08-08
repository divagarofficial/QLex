from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.common.exceptions import QLexException


def register_exception_handlers(app: FastAPI):
    @app.exception_handler(QLexException)
    async def qlex_exception_handler(
        request: Request,
        exc: QLexException,
    ):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": exc.message,
                "detail": exc.message,
            },
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(
        request: Request,
        exc: ValueError,
    ):
        return JSONResponse(
            status_code=400,
            content={
                "detail": str(exc),
                "message": str(exc),
                "success": False,
            },
        )
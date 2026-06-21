from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.config.config import settings
from backend.api_v1.base.errors import (
    NotFoundError,
    AlreadyExistsError,
    RelationshipError,
    DomainError,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


def _detail(exc: DomainError) -> str:
    return getattr(exc, "resolved_message", None) or getattr(exc, "fallback", None) or str(exc)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(NotFoundError)
    async def _not_found(request: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content={"detail": _detail(exc)})

    @app.exception_handler(AlreadyExistsError)
    async def _exists(request: Request, exc: AlreadyExistsError):
        return JSONResponse(status_code=400, content={"detail": _detail(exc)})

    @app.exception_handler(RelationshipError)
    async def _rel(request: Request, exc: RelationshipError):
        return JSONResponse(status_code=400, content={"detail": _detail(exc)})

    @app.exception_handler(DomainError)
    async def _domain(request: Request, exc: DomainError):
        return JSONResponse(status_code=400, content={"detail": _detail(exc)})


def create_app() -> FastAPI:
    app = FastAPI(
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
        title="ProductPromo API",
        version="1.0.0",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors.origins,
        allow_credentials=settings.cors.credentials,
        allow_methods=settings.cors.methods,
        allow_headers=settings.cors.headers,
    )
    register_exception_handlers(app)
    return app

from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError
from backend.api_v1.msg.context import initialize_language, request_text
from backend.api_v1.msg.catalog import catalog_cache

from backend.config.config import settings
from backend.api_v1.base.errors import (
    NotFoundError,
    AlreadyExistsError,
    RelationshipError,
    DomainError,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from backend.database.init_db import init_db, seed_status_types
    await init_db()
    await seed_status_types()
    from backend.api_v1.msg.msg_seed import seed_translations
    await seed_translations()
    await catalog_cache.get(force=True)
    yield


def register_exception_handlers(app: FastAPI) -> None:
    def domain_content(request: Request, exc: DomainError):
        key = getattr(exc, "message_key", "invalidValue")
        params = getattr(exc, "template_vars", {})
        return {"detail": request_text(request, key, params, getattr(exc, "fallback", None)),
                "data": None, "message_key": key, "params": params,
                "lang_id": getattr(request.state, "lang_id", None)}

    @app.exception_handler(NotFoundError)
    async def _not_found(request: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content=domain_content(request, exc))

    @app.exception_handler(AlreadyExistsError)
    async def _exists(request: Request, exc: AlreadyExistsError):
        return JSONResponse(status_code=400, content=domain_content(request, exc))

    @app.exception_handler(RelationshipError)
    async def _rel(request: Request, exc: RelationshipError):
        return JSONResponse(status_code=400, content=domain_content(request, exc))

    @app.exception_handler(DomainError)
    async def _domain(request: Request, exc: DomainError):
        return JSONResponse(status_code=400, content=domain_content(request, exc))

    @app.exception_handler(HTTPException)
    async def _http(request: Request, exc: HTTPException):
        key = {
            "Unknown user": "unknownUser", "Invalid username or password": "invalidCredentials",
            "invalid token error": "invalidToken", "Invalid token type": "invalidTokenType",
            "Not authenticated": "notAuthenticated", "Invalid authentication credentials": "notAuthenticated",
            "Not Found": "notFound", "Method Not Allowed": "methodNotAllowed",
        }.get(str(exc.detail), "requestFailed")
        return JSONResponse(status_code=exc.status_code, headers=exc.headers,
                            content={"detail": request_text(request, key), "data": None,
                                     "message_key": key, "params": {}, "lang_id": getattr(request.state, "lang_id", None)})

    @app.exception_handler(RequestValidationError)
    async def _validation(request: Request, exc: RequestValidationError):
        keys = {"missing": "fieldRequired", "string_too_long": "stringTooLong", "string_too_short": "stringTooShort",
                "int_parsing": "invalidInteger", "int_type": "invalidInteger", "float_parsing": "invalidNumber",
                "float_type": "invalidNumber", "date_from_datetime_parsing": "invalidDate", "date_parsing": "invalidDate",
                "greater_than": "greaterThan", "greater_than_equal": "greaterThanEqual",
                "less_than": "lessThan", "less_than_equal": "lessThanEqual"}
        errors = []
        for error in exc.errors():
            key = keys.get(error["type"], "invalidValue")
            params = {k: v for k, v in error.get("ctx", {}).items() if isinstance(v, (str, int, float, bool))}
            errors.append({"loc": error["loc"], "message_key": key, "params": params,
                           "msg": request_text(request, key, params)})
        return JSONResponse(status_code=422, content={"detail": request_text(request, "validationFailed"),
                            "data": None, "message_key": "validationFailed", "params": {},
                            "lang_id": getattr(request.state, "lang_id", None), "errors": errors})

    @app.exception_handler(IntegrityError)
    async def _integrity(request: Request, exc: IntegrityError):
        return JSONResponse(status_code=409, content={"detail": request_text(request, "integrityError"),
                            "data": None, "message_key": "integrityError", "params": {},
                            "lang_id": getattr(request.state, "lang_id", None)})

    @app.exception_handler(Exception)
    async def _unexpected(request: Request, exc: Exception):
        import logging
        logging.getLogger(__name__).error("Unhandled request error", exc_info=exc)
        return JSONResponse(status_code=500, content={"detail": request_text(request, "serverError"),
                            "data": None, "message_key": "serverError", "params": {},
                            "lang_id": getattr(request.state, "lang_id", None)})


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
    @app.middleware("http")
    async def language_context(request: Request, call_next):
        await initialize_language(request)
        return await call_next(request)

    register_exception_handlers(app)
    return app

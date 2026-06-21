import logging
import uvicorn

from backend.utils.create_fastapi_app import create_app
from backend.config.config import settings
from backend.routers.main_router import router

logging.basicConfig(level=logging.INFO)

app = create_app()
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(
        app="backend.main:app",
        host=settings.run.host,
        port=settings.run.port,
        reload=settings.run.reload,
    )

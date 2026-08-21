from fastapi import FastAPI

from backend.api.routes.documents import router as documents_router
from backend.api.routes.health import router as health_router


app = FastAPI(
    title="DocuAI API",
    description="AI-powered intelligent document generation platform",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "Welcome to DocuAI API",
        "status": "running",
        "version": "0.1.0",
    }


app.include_router(health_router)
app.include_router(documents_router)
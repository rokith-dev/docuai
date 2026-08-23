from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes.documents import router as documents_router
from backend.api.routes.health import router as health_router
from backend.api.routes.templates import router as templates_router


app = FastAPI(
    title="DocuAI API",
    description="AI-powered intelligent document generation platform",
    version="0.1.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to DocuAI API",
        "status": "running",
        "version": "0.1.0",
    }


# --------------------------------------------------
# API Routes
# --------------------------------------------------

app.include_router(health_router)
app.include_router(documents_router)
app.include_router(templates_router)
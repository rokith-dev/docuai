from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes.documents import router as documents_router
from backend.api.routes.health import router as health_router
from backend.api.routes.ai import router as ai_router
from backend.api.routes.favorites import router as favorites_router
from backend.api.routes.projects import router as projects_router
from backend.api.routes.templates import router as templates_router


app = FastAPI(
    title="DocuAI API",
    description="AI-powered intelligent document generation platform",
    version="0.1.0",
)


@app.on_event("startup")
def apply_migrations() -> None:
    import logging
    import os

    logger = logging.getLogger(__name__)

    migration_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "database",
        "migrations",
        "20240101000000_add_user_id_to_documents.sql",
    )

    migration_sql = None

    try:
        with open(migration_path, "r", encoding="utf-8") as migration_file:
            migration_sql = migration_file.read()
    except FileNotFoundError:
        logger.warning("Migration file not found: %s", migration_path)
        return

    access_token = os.getenv("SUPABASE_ACCESS_TOKEN")

    if not access_token:
        logger.warning(
            "SUPABASE_ACCESS_TOKEN is not set. "
            "Apply the migration manually: %s",
            migration_path,
        )
        return

    try:
        import requests

        response = requests.post(
            "https://api.supabase.com/v1/projects/zrhauqffzjwagjghipna/database/query",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={"query": migration_sql},
            timeout=30,
        )

        if response.ok:
            logger.info("Database migration applied successfully.")
        else:
            logger.error(
                "Failed to apply migration: %s - %s",
                response.status_code,
                response.text,
            )

    except Exception as error:
        logger.error("Migration error: %s", error)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://docuai-gamma.vercel.app",
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
app.include_router(ai_router)
app.include_router(favorites_router)
app.include_router(projects_router)
app.include_router(templates_router)
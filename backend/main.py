from fastapi import FastAPI


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


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DocuAI API",
        "version": "0.1.0",
    }
from fastapi import APIRouter
from pydantic import BaseModel

from backend.ai.gemini import GeminiService


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


class DocumentGenerationRequest(BaseModel):
    title: str
    description: str


@router.get("")
def get_documents():
    return {
        "status": "success",
        "message": "Document API is working",
        "documents": [],
    }


@router.post("/generate")
def generate_document(request: DocumentGenerationRequest):
    prompt = f"""
Create professional document content.

Title: {request.title}

Description:
{request.description}

Return clear, well-structured content suitable for a professional document.
"""

    gemini = GeminiService()
    generated_content = gemini.generate(prompt)

    return {
        "status": "success",
        "title": request.title,
        "content": generated_content,
    }
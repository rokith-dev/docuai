from fastapi import APIRouter, HTTPException

from backend.ai.gemini import GeminiService
from backend.api.schemas.documents import (
    DocumentGenerationRequest,
    DocumentGenerationResponse,
)


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


@router.get("")
def get_documents():
    return {
        "status": "success",
        "message": "Document API is working",
        "documents": [],
    }


@router.post(
    "/generate",
    response_model=DocumentGenerationResponse,
)
def generate_document(request: DocumentGenerationRequest):
    prompt = f"""
Create professional document content.

Title: {request.title}

Description:
{request.description}

Return clear, well-structured content suitable for a professional document.
"""

    try:
        gemini = GeminiService()
        generated_content = gemini.generate(prompt)

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail="AI service configuration is missing.",
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily unavailable. Please try again later.",
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while generating the document.",
        ) from error

    return {
        "status": "success",
        "title": request.title,
        "content": generated_content,
    }
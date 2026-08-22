from fastapi import APIRouter, Depends, HTTPException

from backend.ai.gemini import GeminiService
from backend.api.dependencies import get_gemini_service
from backend.api.schemas.documents import (
    DocumentGenerationRequest,
    DocumentGenerationResponse,
)
from backend.database.repositories.documents import DocumentRepository


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


def get_document_repository() -> DocumentRepository:
    return DocumentRepository()


@router.get("")
def get_documents():
    repository = get_document_repository()

    documents = repository.get_all()

    return {
        "status": "success",
        "documents": documents,
    }


@router.post(
    "/generate",
    response_model=DocumentGenerationResponse,
)
def generate_document(
    request: DocumentGenerationRequest,
    gemini: GeminiService = Depends(get_gemini_service),
):
    prompt = f"""
Create professional document content.

Title: {request.title}

Description:
{request.description}

Return clear, well-structured content suitable for a professional document.
"""

    try:
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

    try:
        repository = get_document_repository()

        document = repository.create(
            title=request.title,
            description=request.description,
            content=generated_content,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Document was generated but could not be saved.",
        ) from error

    return {
        "status": "success",
        "title": document.title,
        "content": document.content,
    }
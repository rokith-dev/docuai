from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.ai.gemini import GeminiService
from backend.api.dependencies import get_gemini_service
from backend.api.dependencies import get_current_user
from backend.api.schemas.documents import (
    DocumentGenerationRequest,
    DocumentGenerationResponse,
)
from backend.database.repositories.documents import DocumentRepository
from backend.database.repositories.managed_documents import ManagedDocumentRepository
from backend.storage.local_storage import resolve_generated_file


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


def get_document_repository() -> DocumentRepository:
    return DocumentRepository()


class ManagedDocumentUpdate(BaseModel):
    project_id: int | None = None
    document_name: str | None = None


@router.get("")
def get_documents(project_id: int | None = None, user: dict = Depends(get_current_user)):
    documents = ManagedDocumentRepository().list(project_id=project_id, user_id=user["id"])

    return {
        "status": "success",
        "documents": documents,
    }


@router.post("", status_code=201)
def save_document(
    document_name: str,
    template_name: str,
    file_path: str,
    project_id: int | None = None,
    user: dict = Depends(get_current_user),
):
    try:
        resolve_generated_file(file_path)
        document = ManagedDocumentRepository().create(
            document_name, template_name, file_path, content="", project_id=project_id, user_id=user["id"]
        )
        return {"status": "success", "document": document}
    except FileNotFoundError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to save document metadata.") from error


@router.get("/{document_id}")
def get_managed_document(document_id: int, user: dict = Depends(get_current_user)):
    document = ManagedDocumentRepository().get(document_id, user_id=user["id"])
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"status": "success", "document": document}


@router.put("/{document_id}")
def update_managed_document(document_id: int, request: ManagedDocumentUpdate, user: dict = Depends(get_current_user)):
    document = ManagedDocumentRepository().update(
        document_id, request.project_id, request.document_name, user_id=user["id"]
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"status": "success", "document": document}


@router.get("/{document_id}/download")
def download_managed_document(document_id: int, user: dict = Depends(get_current_user)):
    document = ManagedDocumentRepository().get(document_id, user_id=user["id"])
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    try:
        path = resolve_generated_file(document["file_path"])
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(status_code=404, detail="Document file not found.") from error
    return FileResponse(path=path, filename=document["document_name"])


@router.delete("/{document_id}")
def delete_managed_document(document_id: int, user: dict = Depends(get_current_user)):
    document = ManagedDocumentRepository().delete(document_id, user_id=user["id"])
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    try:
        resolve_generated_file(document["file_path"]).unlink(missing_ok=True)
    except (FileNotFoundError, ValueError):
        pass
    return {"status": "success"}


@router.post("/{document_id}/favorite")
def favorite_managed_document(document_id: int, user: dict = Depends(get_current_user)):
    document = ManagedDocumentRepository().set_favorite(document_id, True, user_id=user["id"])
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"status": "success", "document": document}


@router.delete("/{document_id}/favorite")
def unfavorite_managed_document(document_id: int, user: dict = Depends(get_current_user)):
    document = ManagedDocumentRepository().set_favorite(document_id, False, user_id=user["id"])
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"status": "success", "document": document}


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
            user_id=user["id"],
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
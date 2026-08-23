from fastapi import APIRouter, HTTPException

from backend.database.repositories.managed_documents import ManagedDocumentRepository


router = APIRouter(prefix="/api/favorites", tags=["Favorites"])


@router.get("")
def list_favorites():
    try:
        return {"status": "success", "documents": ManagedDocumentRepository().list(favorites_only=True)}
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to list favorite documents.") from error
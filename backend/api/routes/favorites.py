from fastapi import APIRouter, Depends, HTTPException

from backend.database.repositories.managed_documents import ManagedDocumentRepository
from backend.api.dependencies import get_current_user


router = APIRouter(prefix="/api/favorites", tags=["Favorites"])


@router.get("")
def list_favorites(user: dict = Depends(get_current_user)):
    try:
        return {"status": "success", "documents": ManagedDocumentRepository().list(favorites_only=True, user_id=user["id"])}
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to list favorite documents.") from error
from fastapi import APIRouter


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
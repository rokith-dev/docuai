from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.database.client import get_supabase_client


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required.")
    try:
        response = get_supabase_client().auth.get_user(credentials.credentials)
        user = getattr(response, "user", None)
        if not user:
            raise ValueError("Invalid session")
        return {"id": str(user.id), "email": user.email, "user_metadata": user.user_metadata or {}}
    except Exception as error:
        raise HTTPException(status_code=401, detail="Invalid authentication session.") from error
from backend.ai.gemini import GeminiService


def get_gemini_service() -> GeminiService:
    return GeminiService()
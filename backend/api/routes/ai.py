from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.ai.content_generator import AIContentGenerator


class AIContentRequest(BaseModel):
    topic: str = Field(min_length=1)
    fields: list[dict] = Field(default_factory=list)
    user_instructions: str | None = None


router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/generate-content")
def generate_content(request: AIContentRequest):
    try:
        content = AIContentGenerator().generate(
            topic=request.topic,
            fields=request.fields,
            user_instructions=request.user_instructions,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail="AI content generation failed. Please try again later.",
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="AI service configuration is missing or unavailable.",
        ) from error

    return {"status": "success", "content": content}
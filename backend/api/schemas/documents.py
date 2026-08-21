from pydantic import BaseModel


class DocumentGenerationRequest(BaseModel):
    title: str
    description: str


class DocumentGenerationResponse(BaseModel):
    status: str
    title: str
    content: str
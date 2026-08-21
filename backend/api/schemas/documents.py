from pydantic import BaseModel, Field


class DocumentGenerationRequest(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="Title of the document",
    )

    description: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Description of the document to generate",
    )


class DocumentGenerationResponse(BaseModel):
    status: str
    title: str
    content: str
from datetime import datetime

from backend.database.models import Document


class DocumentRepository:
    """Repository for document data operations."""

    def __init__(self):
        self._documents: list[Document] = []

    def create(
        self,
        title: str,
        description: str,
        content: str,
    ) -> Document:
        document = Document(
            id=len(self._documents) + 1,
            title=title,
            description=description,
            content=content,
            status="completed",
            created_at=datetime.now(),
        )

        self._documents.append(document)

        return document

    def get_all(self) -> list[Document]:
        return self._documents

    def get_by_id(self, document_id: int) -> Document | None:
        for document in self._documents:
            if document.id == document_id:
                return document

        return None
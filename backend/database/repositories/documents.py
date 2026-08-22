from datetime import datetime

from backend.database.client import get_supabase_client
from backend.database.models import Document


class DocumentRepository:
    """Repository for document data stored in Supabase."""

    def __init__(self):
        self.client = get_supabase_client()
        self.table = "documents"

    def create(
        self,
        title: str,
        description: str,
        content: str,
    ) -> Document:
        response = (
            self.client
            .table(self.table)
            .insert(
                {
                    "title": title,
                    "description": description,
                    "content": content,
                    "status": "completed",
                }
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError("Failed to create document.")

        data = response.data[0]

        return Document(
            id=data["id"],
            title=data["title"],
            description=data["description"],
            content=data["content"],
            status=data["status"],
            created_at=datetime.fromisoformat(
                data["created_at"].replace("Z", "+00:00")
            ),
        )

    def get_all(self) -> list[Document]:
        response = (
            self.client
            .table(self.table)
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return [
            Document(
                id=data["id"],
                title=data["title"],
                description=data["description"],
                content=data["content"],
                status=data["status"],
                created_at=datetime.fromisoformat(
                    data["created_at"].replace("Z", "+00:00")
                ),
            )
            for data in response.data
        ]

    def get_by_id(self, document_id: int) -> Document | None:
        response = (
            self.client
            .table(self.table)
            .select("*")
            .eq("id", document_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        data = response.data[0]

        return Document(
            id=data["id"],
            title=data["title"],
            description=data["description"],
            content=data["content"],
            status=data["status"],
            created_at=datetime.fromisoformat(
                data["created_at"].replace("Z", "+00:00")
            ),
        )
from datetime import datetime
from typing import Any

from backend.database.client import get_supabase_client


class ManagedDocumentRepository:
    def __init__(self):
        self.client = get_supabase_client()
        self.table = "documents"

    def create(
        self,
        document_name: str,
        template_name: str,
        file_path: str,
        content: str,
        project_id: int | None = None,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        values = {
            "title": document_name,
            "description": f"Generated from template: {template_name}",
            "content": content,
            "document_name": document_name,
            "template_name": template_name,
            "file_path": file_path,
            "project_id": project_id,
            "status": "generated",
            "is_favorite": False,
            "user_id": user_id,
        }

        response = (
            self.client
            .table(self.table)
            .insert(values)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to save document metadata."
            )

        return response.data[0]

    def list(
        self,
        project_id: int | None = None,
        favorites_only: bool = False,
        user_id: str | None = None,
    ) -> list[dict[str, Any]]:
        query = (
            self.client
            .table(self.table)
            .select("*")
            .not_.is_("file_path", "null")
            .order("created_at", desc=True)
        )

        if project_id is not None:
            query = query.eq(
                "project_id",
                project_id,
            )

        if user_id is not None:
            query = query.eq(
                "user_id",
                user_id,
            )

        if favorites_only:
            query = query.eq(
                "is_favorite",
                True,
            )

        response = query.execute()

        return response.data or []

    def get(
        self,
        document_id: int,
        user_id: str | None = None,
    ) -> dict[str, Any] | None:
        query = (
            self.client
            .table(self.table)
            .select("*")
            .eq("id", document_id)
        )

        if user_id is not None:
            query = query.eq(
                "user_id",
                user_id,
            )

        response = (
            query
            .limit(1)
            .execute()
        )

        if response.data:
            return response.data[0]

        return None

    def update(
        self,
        document_id: int,
        project_id: int | None = None,
        document_name: str | None = None,
        user_id: str | None = None,
    ) -> dict[str, Any] | None:
        values: dict[str, Any] = {
            "updated_at": datetime.utcnow().isoformat()
        }

        if project_id is not None:
            values["project_id"] = project_id

        if document_name is not None:
            clean_name = document_name.strip()

            if clean_name:
                values["document_name"] = clean_name
                values["title"] = clean_name

        query = (
            self.client
            .table(self.table)
            .update(values)
            .eq("id", document_id)
        )

        if user_id is not None:
            query = query.eq(
                "user_id",
                user_id,
            )

        response = (
            query
            .select("*")
            .execute()
        )

        if response.data:
            return response.data[0]

        return None

    def set_favorite(
        self,
        document_id: int,
        value: bool,
        user_id: str | None = None,
    ) -> dict[str, Any] | None:
        values = {
            "is_favorite": value,
            "updated_at": datetime.utcnow().isoformat(),
        }

        query = (
            self.client
            .table(self.table)
            .update(values)
            .eq("id", document_id)
        )

        if user_id is not None:
            query = query.eq(
                "user_id",
                user_id,
            )

        response = (
            query
            .select("*")
            .execute()
        )

        if response.data:
            return response.data[0]

        return None

    def delete(
        self,
        document_id: int,
        user_id: str | None = None,
    ) -> dict[str, Any] | None:
        document = self.get(
            document_id,
            user_id=user_id,
        )

        if not document:
            return None

        query = (
            self.client
            .table(self.table)
            .delete()
            .eq("id", document_id)
        )

        if user_id is not None:
            query = query.eq(
                "user_id",
                user_id,
            )

        query.execute()

        return document
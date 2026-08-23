from datetime import datetime

from backend.database.client import get_supabase_client


class ManagedDocumentRepository:
    def __init__(self):
        self.client = get_supabase_client()
        self.table = "documents"

    def create(self, document_name: str, template_name: str, file_path: str,
               project_id: int | None = None) -> dict:
        response = self.client.table(self.table).insert({
            "document_name": document_name,
            "template_name": template_name,
            "file_path": file_path,
            "project_id": project_id,
            "status": "generated",
            "is_favorite": False,
        }).execute()
        if not response.data:
            raise RuntimeError("Failed to save document metadata.")
        return response.data[0]

    def list(self, project_id: int | None = None, favorites_only: bool = False) -> list[dict]:
        query = self.client.table(self.table).select(
            "*, projects(name)"
        ).not_.is_("file_path", "null").order("created_at", desc=True)
        if project_id is not None:
            query = query.eq("project_id", project_id)
        if favorites_only:
            query = query.eq("is_favorite", True)
        return query.execute().data

    def get(self, document_id: int) -> dict | None:
        response = self.client.table(self.table).select(
            "*, projects(name)"
        ).eq("id", document_id).limit(1).execute()
        return response.data[0] if response.data else None

    def update(self, document_id: int, project_id: int | None = None,
               document_name: str | None = None) -> dict | None:
        values = {"updated_at": datetime.utcnow().isoformat()}
        if project_id is not None:
            values["project_id"] = project_id
        if document_name is not None:
            values["document_name"] = document_name.strip()
        response = self.client.table(self.table).update(values).eq(
            "id", document_id
        ).select("*").execute()
        return response.data[0] if response.data else None

    def set_favorite(self, document_id: int, value: bool) -> dict | None:
        response = self.client.table(self.table).update({
            "is_favorite": value,
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("id", document_id).select("*").execute()
        return response.data[0] if response.data else None

    def delete(self, document_id: int) -> dict | None:
        document = self.get(document_id)
        if not document:
            return None
        self.client.table(self.table).delete().eq("id", document_id).execute()
        return document
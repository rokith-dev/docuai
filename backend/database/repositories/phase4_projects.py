from datetime import datetime

from backend.database.client import get_supabase_client


class ProjectRepository:
    def __init__(self):
        self.client = get_supabase_client()
        self.table = "projects"

    def create(self, name: str, description: str | None = None) -> dict:
        response = self.client.table(self.table).insert({
            "name": name.strip(),
            "description": description,
        }).execute()
        if not response.data:
            raise RuntimeError("Failed to create project.")
        return response.data[0]

    def list(self) -> list[dict]:
        response = self.client.table(self.table).select("*").order(
            "created_at", desc=True
        ).execute()
        return response.data

    def get(self, project_id: int) -> dict | None:
        response = self.client.table(self.table).select("*").eq(
            "id", project_id
        ).limit(1).execute()
        return response.data[0] if response.data else None

    def update(self, project_id: int, name: str, description: str | None) -> dict | None:
        response = self.client.table(self.table).update({
            "name": name.strip(),
            "description": description,
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("id", project_id).select("*").execute()
        return response.data[0] if response.data else None

    def delete(self, project_id: int) -> bool:
        response = self.client.table(self.table).delete().eq("id", project_id).execute()
        return bool(response.data)
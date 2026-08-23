from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.database.repositories.phase4_projects import ProjectRepository
from backend.database.repositories.managed_documents import ManagedDocumentRepository


class ProjectRequest(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None


router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.post("", status_code=201)
def create_project(request: ProjectRequest):
    try:
        return {"status": "success", "project": ProjectRepository().create(request.name, request.description)}
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to create project.") from error


@router.get("")
def list_projects():
    try:
        projects = ProjectRepository().list()
        documents = ManagedDocumentRepository().list()
        counts = {}
        for document in documents:
            project_id = document.get("project_id")
            if project_id is not None:
                counts[project_id] = counts.get(project_id, 0) + 1
        for project in projects:
            project["document_count"] = counts.get(project["id"], 0)
        return {"status": "success", "projects": projects}
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to list projects.") from error


@router.get("/{project_id}")
def get_project(project_id: int):
    project = ProjectRepository().get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    project["documents"] = ManagedDocumentRepository().list(project_id=project_id)
    project["document_count"] = len(project["documents"])
    return {"status": "success", "project": project}


@router.put("/{project_id}")
def update_project(project_id: int, request: ProjectRequest):
    project = ProjectRepository().update(project_id, request.name, request.description)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {"status": "success", "project": project}


@router.delete("/{project_id}")
def delete_project(project_id: int):
    project = ProjectRepository().get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    if ManagedDocumentRepository().list(project_id=project_id):
        raise HTTPException(status_code=409, detail="Cannot delete a project that contains documents.")
    ProjectRepository().delete(project_id)
    return {"status": "success"}
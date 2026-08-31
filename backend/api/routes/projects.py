from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.database.repositories.phase4_projects import ProjectRepository
from backend.database.repositories.managed_documents import ManagedDocumentRepository
from backend.api.dependencies import get_current_user


class ProjectRequest(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None


router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.post("", status_code=201)
def create_project(request: ProjectRequest, user: dict = Depends(get_current_user)):
    try:
        return {"status": "success", "project": ProjectRepository().create(request.name, request.description, user_id=user["id"])}
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to create project.") from error


@router.get("")
def list_projects(user: dict = Depends(get_current_user)):
    try:
        projects = ProjectRepository().list(user_id=user["id"])
        documents = ManagedDocumentRepository().list(user_id=user["id"])
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
def get_project(project_id: int, user: dict = Depends(get_current_user)):
    project = ProjectRepository().get(project_id, user_id=user["id"])
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    project["documents"] = ManagedDocumentRepository().list(project_id=project_id, user_id=user["id"])
    project["document_count"] = len(project["documents"])
    return {"status": "success", "project": project}


@router.put("/{project_id}")
def update_project(project_id: int, request: ProjectRequest, user: dict = Depends(get_current_user)):
    project = ProjectRepository().update(project_id, request.name, request.description, user_id=user["id"])
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {"status": "success", "project": project}


@router.delete("/{project_id}")
def delete_project(project_id: int, user: dict = Depends(get_current_user)):
    project = ProjectRepository().get(project_id, user_id=user["id"])
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    if ManagedDocumentRepository().list(project_id=project_id, user_id=user["id"]):
        raise HTTPException(status_code=409, detail="Cannot delete a project that contains documents.")
    ProjectRepository().delete(project_id, user_id=user["id"])
    return {"status": "success"}
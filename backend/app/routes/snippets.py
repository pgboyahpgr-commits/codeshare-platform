from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid
from ..models import SnippetCreate, SnippetRead
from .. import crud

router = APIRouter()

@router.post("/", response_model=SnippetRead)
def create_snippet(snippet: SnippetCreate):
    result = crud.create_snippet(snippet)
    if not result:
        raise HTTPException(status_code=400, detail="Error creating snippet")
    return result

@router.get("/{snippet_id}", response_model=SnippetRead)
def read_snippet(snippet_id: uuid.UUID):
    result = crud.get_snippet(str(snippet_id))
    if not result:
        raise HTTPException(status_code=404, detail="Snippet not found")
    return result

@router.get("/", response_model=List[SnippetRead])
def list_snippets():
    return crud.list_snippets()

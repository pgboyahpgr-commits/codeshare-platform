from typing import Optional
from datetime import datetime, timezone
import uuid
from sqlmodel import Field, SQLModel

def get_utc_now():
    return datetime.now(timezone.utc)

class SnippetBase(SQLModel):
    title: str
    content: str
    language: str
    is_public: bool = True

class Snippet(SnippetBase, table=True):
    __tablename__ = "snippets"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None)
    created_at: datetime = Field(default_factory=get_utc_now)
    expires_at: datetime = Field(default=None) # To be set dynamically
    view_count: int = Field(default=0)

class SnippetCreate(SnippetBase):
    pass

class SnippetRead(SnippetBase):
    id: uuid.UUID
    created_at: datetime
    expires_at: datetime
    view_count: int
    user_id: Optional[uuid.UUID]

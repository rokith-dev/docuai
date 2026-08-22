from dataclasses import dataclass
from datetime import datetime


@dataclass
class Document:
    id: int
    title: str
    description: str
    content: str
    status: str
    created_at: datetime
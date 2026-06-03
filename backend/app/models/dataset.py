"""Dataset model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, Text

from app.core.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False, unique=True)
    modality = Column(String(20), nullable=False)
    image_count = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    source = Column(String(200), nullable=True)
    file_size_mb = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "modality": self.modality,
            "image_count": self.image_count,
            "description": self.description,
            "source": self.source,
            "file_size_mb": self.file_size_mb,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

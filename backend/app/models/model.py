"""Pretrained model model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, Float, DateTime, Text

from app.core.database import Base


class PretrainedModel(Base):
    __tablename__ = "pretrained_models"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    modality = Column(String(20), nullable=False)
    version = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    fid_score = Column(Float, nullable=True)
    download_url = Column(String(500), nullable=True)
    download_size_mb = Column(Integer, default=0)
    status = Column(String(20), default="ready")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "modality": self.modality,
            "version": self.version,
            "description": self.description,
            "fid_score": self.fid_score,
            "download_url": self.download_url,
            "download_size_mb": self.download_size_mb,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

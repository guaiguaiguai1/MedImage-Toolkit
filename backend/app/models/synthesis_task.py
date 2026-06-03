"""Synthesis task model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, Float, DateTime, Text

from app.core.database import Base


class SynthesisTask(Base):
    __tablename__ = "synthesis_tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prompt = Column(Text, nullable=False)
    modality = Column(String(20), nullable=False, default="CT")
    condition_type = Column(String(20), nullable=True)
    steps = Column(Integer, default=50)
    guidance_scale = Column(Float, default=7.5)
    image_width = Column(Integer, default=512)
    image_height = Column(Integer, default=512)
    status = Column(String(20), default="pending")
    result_path = Column(String(500), nullable=True)
    fid_score = Column(Float, nullable=True)
    ssim_score = Column(Float, nullable=True)
    psnr_score = Column(Float, nullable=True)
    generation_time = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "prompt": self.prompt,
            "modality": self.modality,
            "condition_type": self.condition_type,
            "steps": self.steps,
            "guidance_scale": self.guidance_scale,
            "image_width": self.image_width,
            "image_height": self.image_height,
            "status": self.status,
            "result_path": self.result_path,
            "fid_score": self.fid_score,
            "ssim_score": self.ssim_score,
            "psnr_score": self.psnr_score,
            "generation_time": self.generation_time,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

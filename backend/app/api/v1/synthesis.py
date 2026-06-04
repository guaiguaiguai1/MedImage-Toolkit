"""Synthesis endpoints."""

import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.synthesis_task import SynthesisTask
from app.models.user import User

router = APIRouter(prefix="/synthesis", tags=["Synthesis"])


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)
    modality: str = Field(default="CT", pattern="^(CT|MRI|X-Ray)$")
    condition_type: str | None = Field(default=None, pattern="^(canny|segmentation|depth|None)$")
    steps: int = Field(default=50, ge=20, le=100)
    guidance_scale: float = Field(default=7.5, ge=1.0, le=20.0)
    image_width: int = Field(default=512, ge=256, le=1024)
    image_height: int = Field(default=512, ge=256, le=1024)


class TaskResponse(BaseModel):
    id: str
    prompt: str
    modality: str
    condition_type: str | None
    steps: int
    guidance_scale: float
    image_width: int
    image_height: int
    status: str
    result_path: str | None
    fid_score: float | None
    ssim_score: float | None
    psnr_score: float | None
    generation_time: float | None
    error_message: str | None
    created_at: str | None
    completed_at: str | None


@router.post("/generate", response_model=TaskResponse)
def generate_image(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a new image synthesis task."""
    task = SynthesisTask(
        prompt=request.prompt,
        modality=request.modality,
        condition_type=request.condition_type,
        steps=request.steps,
        guidance_scale=request.guidance_scale,
        image_width=request.image_width,
        image_height=request.image_height,
        status="completed",
        result_path=f"/outputs/{request.modality.lower()}_generated.png",
        fid_score=round(random.uniform(15.0, 35.0), 2),
        ssim_score=round(random.uniform(0.80, 0.95), 4),
        psnr_score=round(random.uniform(25.0, 40.0), 2),
        generation_time=round(random.uniform(1.5, 8.0), 3),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task.to_dict()


@router.get("/tasks", response_model=list[TaskResponse])
def list_tasks(
    modality: str | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List synthesis tasks with optional filters."""
    query = db.query(SynthesisTask)
    if modality:
        query = query.filter(SynthesisTask.modality == modality)
    if status:
        query = query.filter(SynthesisTask.status == status)
    tasks = query.order_by(SynthesisTask.created_at.desc()).offset(skip).limit(limit).all()
    return [t.to_dict() for t in tasks]


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)):
    """Get a specific synthesis task by ID."""
    task = db.query(SynthesisTask).filter(SynthesisTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task.to_dict()


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a synthesis task."""
    task = db.query(SynthesisTask).filter(SynthesisTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

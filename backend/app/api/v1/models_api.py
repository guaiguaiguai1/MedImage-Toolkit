"""Pretrained model management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.model import PretrainedModel

router = APIRouter(prefix="/models", tags=["Models"])


class ModelCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    modality: str = Field(..., pattern="^(CT|MRI|X-Ray)$")
    version: str = Field(..., min_length=1, max_length=50)
    description: str | None = None
    fid_score: float | None = None
    download_url: str | None = None
    download_size_mb: int = Field(default=0, ge=0)
    status: str = Field(default="ready", pattern="^(ready|training|downloading|error)$")


@router.get("", response_model=list[dict])
def list_models(
    modality: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    """List all pretrained models."""
    query = db.query(PretrainedModel)
    if modality:
        query = query.filter(PretrainedModel.modality == modality)
    if status:
        query = query.filter(PretrainedModel.status == status)
    models = query.order_by(PretrainedModel.created_at.desc()).all()
    return [m.to_dict() for m in models]


@router.post("", response_model=dict)
def create_model(data: ModelCreate, db: Session = Depends(get_db)):
    """Register a new pretrained model."""
    model = PretrainedModel(**data.model_dump())
    db.add(model)
    db.commit()
    db.refresh(model)
    return model.to_dict()


@router.get("/{model_id}", response_model=dict)
def get_model(model_id: str, db: Session = Depends(get_db)):
    """Get model by ID."""
    model = db.query(PretrainedModel).filter(PretrainedModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model.to_dict()


@router.put("/{model_id}", response_model=dict)
def update_model(model_id: str, data: ModelCreate, db: Session = Depends(get_db)):
    """Update a pretrained model."""
    model = db.query(PretrainedModel).filter(PretrainedModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(model, key, value)
    db.commit()
    db.refresh(model)
    return model.to_dict()


@router.delete("/{model_id}")
def delete_model(model_id: str, db: Session = Depends(get_db)):
    """Delete a pretrained model."""
    model = db.query(PretrainedModel).filter(PretrainedModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    db.delete(model)
    db.commit()
    return {"message": "Model deleted successfully"}

"""Dataset management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.dataset import Dataset

router = APIRouter(prefix="/datasets", tags=["Datasets"])


class DatasetCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    modality: str = Field(..., pattern="^(CT|MRI|X-Ray)$")
    image_count: int = Field(default=0, ge=0)
    description: str | None = None
    source: str | None = None
    file_size_mb: int = Field(default=0, ge=0)


class DatasetUpdate(BaseModel):
    name: str | None = None
    modality: str | None = None
    image_count: int | None = None
    description: str | None = None
    source: str | None = None
    file_size_mb: int | None = None


@router.get("", response_model=list[dict])
def list_datasets(
    modality: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List all datasets."""
    query = db.query(Dataset)
    if modality:
        query = query.filter(Dataset.modality == modality)
    datasets = query.order_by(Dataset.created_at.desc()).offset(skip).limit(limit).all()
    return [d.to_dict() for d in datasets]


@router.post("", response_model=dict)
def create_dataset(data: DatasetCreate, db: Session = Depends(get_db)):
    """Create a new dataset."""
    existing = db.query(Dataset).filter(Dataset.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dataset with this name already exists")
    dataset = Dataset(**data.model_dump())
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset.to_dict()


@router.get("/{dataset_id}", response_model=dict)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Get dataset by ID."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset.to_dict()


@router.put("/{dataset_id}", response_model=dict)
def update_dataset(dataset_id: str, data: DatasetUpdate, db: Session = Depends(get_db)):
    """Update a dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(dataset, key, value)
    db.commit()
    db.refresh(dataset)
    return dataset.to_dict()


@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Delete a dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    db.delete(dataset)
    db.commit()
    return {"message": "Dataset deleted successfully"}

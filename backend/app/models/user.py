"""User model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), nullable=False, unique=True)
    email = Column(String(200), nullable=False, unique=True)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

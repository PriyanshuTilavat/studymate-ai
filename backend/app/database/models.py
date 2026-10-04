from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(String(255), nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    materials = relationship(
        "Material",
        back_populates="owner",
        cascade="all, delete-orphan"
    )


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    filename = Column(
        String(255),
        nullable=False
    )

    original_filename = Column(
        String(255),
        nullable=False
    )

    file_type = Column(
        String(50),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    status = Column(
        String(50),
        default="uploaded"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    owner = relationship(
        "User",
        back_populates="materials"
    )
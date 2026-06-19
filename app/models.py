



from typing import List
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column
import datetime

class Content(Base):
    __tablename__ = "contents"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False, default=list)

class ActionLog(Base):
    __tablename__ = "action_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(nullable=True)
    content_id: Mapped[int] = mapped_column(nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(100),  nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now()
    )


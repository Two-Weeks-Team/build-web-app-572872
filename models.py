import json
import os
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", os.getenv("POSTGRES_URL", "sqlite:///./app.db"))
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")
is_local_postgres = "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL

engine_kwargs = {"future": True}
if not is_sqlite and not is_local_postgres:
    engine_kwargs["connect_args"] = {"sslmode": "require"}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


class Plan(Base):
    __tablename__ = "ff_plan"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    query_text = Column(Text, nullable=False)
    preferences_json = Column(Text, nullable=False, default="{}")
    scenario = Column(String(50), nullable=False, default="balanced")
    summary = Column(Text, nullable=False)
    items_json = Column(Text, nullable=False, default="[]")
    score = Column(Float, nullable=False, default=0.0)
    assumptions_json = Column(Text, nullable=False, default="[]")
    confidence_notes_json = Column(Text, nullable=False, default="[]")
    caveats_json = Column(Text, nullable=False, default="[]")
    timeline_json = Column(Text, nullable=False, default="[]")
    allocation_bands_json = Column(Text, nullable=False, default="[]")
    next_steps_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    snapshots = relationship("Snapshot", back_populates="plan", cascade="all, delete-orphan")


class Snapshot(Base):
    __tablename__ = "ff_snapshot"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("ff_plan.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    brief_preview = Column(Text, nullable=False)
    scenario = Column(String(50), nullable=False)
    assumptions_json = Column(Text, nullable=False, default="[]")
    timeline_json = Column(Text, nullable=False, default="[]")
    allocation_bands_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    plan = relationship("Plan", back_populates="snapshots")


def to_json_str(value, default):
    try:
        return json.dumps(value)
    except Exception:
        return json.dumps(default)

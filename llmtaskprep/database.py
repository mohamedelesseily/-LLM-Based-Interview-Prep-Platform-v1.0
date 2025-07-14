# llmtaskprep/database.py
# database.py: SQLAlchemy engine & session setup

import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# Load connection string from .env or default
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:dbpw@localhost/interview_questions"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Function to create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

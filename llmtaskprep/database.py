# llmtaskprep/database.py
import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load connection string from .env or default
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:dbpw@localhost/interview_questions"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

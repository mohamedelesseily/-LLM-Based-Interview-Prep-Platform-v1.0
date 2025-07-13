# llmtaskprep/db_models.py
from sqlalchemy import Column, Integer, String

from llmtaskprep.database import Base


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String, nullable=False)
    question_type = Column(String, nullable=False)  # 'technical' or 'behavioral'
    question_text = Column(String, nullable=False)

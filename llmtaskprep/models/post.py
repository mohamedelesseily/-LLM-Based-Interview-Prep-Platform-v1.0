# Base model in Pydantic is a class that allows us to define a model and a model is used to validate data
from typing import List, Optional

from pydantic import BaseModel


class UserPostIn(BaseModel):
    body: str


class UserPost(UserPostIn):
    id: int


# Input model for generation
class QuestionRequest(BaseModel):
    job_title: str
    num_questions: int = 2


class QuestionItem(BaseModel):
    type: str
    question: str


class QuestionSet(BaseModel):
    id: Optional[str] = None
    job_title: str
    questions: List[QuestionItem]

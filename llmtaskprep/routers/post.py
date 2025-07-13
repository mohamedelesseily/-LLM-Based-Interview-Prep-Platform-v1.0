import os
from collections import defaultdict
from typing import List

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from llmtaskprep.database import get_db
from llmtaskprep.models.db_models import (
    Question,  # noqa: F401
)
from llmtaskprep.models.post import (
    QuestionItem,
    QuestionRequest,
    QuestionSet,
    UserPost,
    UserPostIn,
)

# Base model in Pydantic is a class that allows us to define a model and a model is used to validate data

router = APIRouter()
load_dotenv()  # Load environment variables from .env file
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Gemini API
# $env:GEMINI_API_KEY = "AIzaSyAEqoOj3214AabRW4ikHv2Ye6LYzphBhWk"


@router.get("/")
async def root():
    return {"message:Hello, World !"}


post_table = {}
# In-memory storage (in production, use a database)
question_store: List[dict] = []


@router.post("/", response_model=UserPost)
async def create_post(post: UserPostIn):
    data = post.dict()
    last_record_id = len(post_table)
    new_post = {**data, "id": last_record_id}  # Create a new post with an id
    post_table[last_record_id] = new_post
    return new_post


@router.get("/post", response_model=list[UserPost])
async def get_all_posts():
    return list(post_table.values())


"""
Purpose: 
Auto-generates a new question set using an AI model (e.g., Gemini) based on a given job title.
Output:
AI-generated list of questions
"""


# @router.post("/api/questions/generate", response_model=QuestionSet)
# def generate_questions(request: QuestionRequest):
#     prompt = (
#         f"Generate {request.num_questions} interview questions for a {request.job_title}. "
#         "Each should be labeled as either 'technical' or 'behavioral' in this JSON format:\n"
#         '{ "questions": [ { "type": "technical", "question": "..." }, ... ] }'
#     )
#     try:
#         model = genai.GenerativeModel("gemini-2.5-flash")
#         response = model.generate_content(prompt)

#         # Strip markdown/code block fences like ```json if present
#         response_text = response.text.strip()
#         if response_text.startswith("```json"):
#             response_text = response_text[7:].strip()
#         if response_text.endswith("```"):
#             response_text = response_text[:-3].strip()

#         # Parse JSON string into a Python dict
#         parsed = json.loads(response_text)
#         question_items = parsed.get("questions", [])

#         new_entry = {
#             # "id": len(question_store) + 1,
#             # "id": f"{len(question_store) + 1}",
#             "id": str(uuid.uuid4()),  # Generate unique string ID
#             "job_title": request.job_title,
#             "questions": question_items,  # Now a list of dicts with "type" and "question"
#         }

#         question_store.append(new_entry)
#         return new_entry

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/questions/generate", response_model=QuestionSet)
def generate_questions(request: QuestionRequest, db: Session = Depends(get_db)):
    prompt = (
        f"Generate {request.num_questions} interview questions for a {request.job_title}. "
        "Each should be labeled as either 'technical' or 'behavioral' in this JSON format:\n"
        "{ 'questions': [ { 'type': 'technical', 'question': '...' }, ... ] }"
    )

    try:
        import json
        import re

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        # Extract JSON block
        json_block = re.search(r"\{.*\}", response.text, re.DOTALL)
        questions_data = json.loads(json_block.group())["questions"]

        saved_questions = []

        for q in questions_data:
            question_db = Question(
                job_title=request.job_title,
                question_type=q["type"],
                question_text=q["question"],
            )
            db.add(question_db)
            saved_questions.append(QuestionItem(type=q["type"], question=q["question"]))

        db.commit()

        return QuestionSet(job_title=request.job_title, questions=saved_questions)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


"""
Purpose: 
Fetch all saved question sets.
Output:
Returns all entries from your in-memory list (question_store).
"""


@router.get("/api/questions", response_model=list[QuestionSet])
def get_all_questions_grouped_by_role(db: Session = Depends(get_db)):
    db_questions = db.query(Question).all()

    grouped = defaultdict(list)
    for q in db_questions:
        grouped[q.job_title].append(
            QuestionItem(type=q.question_type, question=q.question_text)
        )

    return [
        QuestionSet(job_title=job, questions=questions)
        for job, questions in grouped.items()
    ]


"""
Purpose: 
Manually add a new question set (without using the AI).
Output:
Confirmation of saved entry.
Data Source: 
From the client (user manually provides questions).
"""


@router.post("/api/questions", response_model=QuestionSet)
async def save_question_set(data: QuestionSet, db: Session = Depends(get_db)):
    saved_questions = []

    for q in data.questions:
        question = Question(
            job_title=data.job_title, question_type=q.type, question_text=q.question
        )
        db.add(question)
        saved_questions.append(question)

    db.commit()

    return QuestionSet(
        id=None,  # You can skip this or later extend to use QuestionSet model
        job_title=data.job_title,
        questions=data.questions,
    )


# @router.post("/api/questions", response_model=QuestionSet)
# async def save_question_set(data: QuestionSet):
#     data.id = str(uuid.uuid4())  # Generate unique string ID
#     question_store.append(data.dict())
#     return data


"""
Purpose: 
Delete a question set by its id.
"""


@router.delete("/api/questions/{job_title}")
def delete_question_set(job_title: str, db: Session = Depends(get_db)):
    deleted = db.query(Question).filter(Question.job_title == job_title).delete()
    db.commit()

    if deleted == 0:
        raise HTTPException(
            status_code=404, detail="No questions found for this job title"
        )

    return {"message": f"Deleted {deleted} question(s) for job title '{job_title}'"}


@router.delete("/api/question/{id}")
def delete_question_by_id(id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(question)
    db.commit()
    return {"message": f"Question with ID {id} deleted successfully"}


"""
Purpose: 
Show statistics about the current stored data.
"""


@router.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_questions = db.query(func.count(Question.id)).scalar()

    job_title_counts = (
        db.query(Question.job_title, func.count(Question.id))
        .group_by(Question.job_title)
        .all()
    )
    by_job_title = {title: count for title, count in job_title_counts}

    type_counts = (
        db.query(Question.question_type, func.count(Question.id))
        .group_by(Question.question_type)
        .all()
    )
    by_type = {q_type: count for q_type, count in type_counts}

    return {
        "total_questions": total_questions,
        "by_job_title": by_job_title,
        "by_type": by_type,
    }

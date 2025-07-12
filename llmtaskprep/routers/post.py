import os
import uuid
from collections import Counter
from typing import List

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException

from llmtaskprep.models.post import (
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

import json  # Make sure this is imported


@router.post("/api/questions/generate", response_model=QuestionSet)
def generate_questions(request: QuestionRequest):
    prompt = (
        f"Generate {request.num_questions} interview questions for a {request.job_title}. "
        "Each should be labeled as either 'technical' or 'behavioral' in this JSON format:\n"
        '{ "questions": [ { "type": "technical", "question": "..." }, ... ] }'
    )
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        # Strip markdown/code block fences like ```json if present
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:].strip()
        if response_text.endswith("```"):
            response_text = response_text[:-3].strip()

        # Parse JSON string into a Python dict
        parsed = json.loads(response_text)
        question_items = parsed.get("questions", [])

        new_entry = {
            # "id": len(question_store) + 1,
            # "id": f"{len(question_store) + 1}",
            "id": str(uuid.uuid4()),  # Generate unique string ID
            "job_title": request.job_title,
            "questions": question_items,  # Now a list of dicts with "type" and "question"
        }

        question_store.append(new_entry)
        return new_entry

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


"""
Purpose: 
Fetch all saved question sets.
Output:
Returns all entries from your in-memory list (question_store).
"""


@router.get("/api/questions", response_model=List[QuestionSet])
def get_all_questions():
    return question_store


"""
Purpose: 
Manually add a new question set (without using the AI).
Output:
Confirmation of saved entry.
Data Source: 
From the client (user manually provides questions).
"""


@router.post("/api/questions", response_model=QuestionSet)
async def save_question_set(data: QuestionSet):
    data.id = str(uuid.uuid4())  # Generate unique string ID
    question_store.append(data.dict())
    return data


"""
Purpose: 
Delete a question set by its id.
"""


@router.delete("/api/questions/{id}")
async def delete_question_set(id: str):
    for index, item in enumerate(question_store):
        if str(item["id"]) == str(id):  # Ensure type match
            del question_store[index]
            return {"message": f"Question set {id} deleted"}
    raise HTTPException(status_code=404, detail="Question set not found")


"""
Purpose: 
Show statistics about the current stored data.
"""


@router.get("/api/stats")
async def get_stats():
    job_title_counts = Counter(qs["job_title"] for qs in question_store)
    total_sets = len(question_store)
    return {"total_sets": total_sets, "job_titles": job_title_counts}


# LLM-Based Interview Prep Platform

A full-stack application for generating, rating, and managing interview questions using Google Gemini (Generative AI).
Built with **FastAPI** (backend), **React** (frontend), **PostgreSQL** (Database) and **Docker** for easy deployment.

---

## 🚀 Project Summary

This platform helps users auto-generate technical and behavioral interview questions for any job title using Gemini AI, and manage question sets.
Features include:
- AI-powered question generation
- Manual question injection
- Stats dashboard

---

## 🏁 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) (recommended)
- Or: Python 3.10+, Node.js 18+, npm

### Clone the Repo

```bash
git clone https://github.com/mohamedelesseily/-LLM-Based-Interview-Prep-Platform-v1.0.git

```

### Environment Setup

1. **Gemini API Key:**
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - GEMINI_API_KEY is defined in docker-compose.yml
     ```
     GEMINI_API_KEY=your-gemini-api-key-here
     ```

---

## 🐳 Running with Docker

```bash
docker-compose up --build
```

- The backend will be at [http://localhost:8000](http://localhost:8000)
- The frontend will be at [http://localhost:3000](http://localhost:3000)

---

## 🖥️ Running Locally (Dev Mode)

### Backend

```bash
cd llmtaskprep
pip install -r requirements.txt
uvicorn llmtaskprep.main:app --reload
```

### Frontend

```bash
cd interview-prep-frontend
npm install
npm start
```

---

## 🔌 API Routes & Usage

| Method | Route                              | Description                                 |
|--------|------------------------------------|---------------------------------------------|
| POST   | `/api/questions/generate`          | Generate questions with Gemini AI           |
| POST   | `/api/questions`                   | Save a set of questions (manual or AI)      |
| GET    | `/api/questions`                   | Get all questions, grouped by job title     |
| DELETE | `/api/questions/{job_title}`       | Delete all questions for a job title        |
| DELETE | `/api/question/{id}`               | Delete a question by its ID                 |
| GET    | `/api/stats`                       | Get stats (counts by job title/type)        |

**Example: Generate Questions**
```bash
curl -X POST http://localhost:8000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"job_title": "Data Scientist", "num_questions": 3}'
```

---

## 🖼️ Frontend + Backend Overview

- **Frontend:**
  - React SPA (see `frontend/src/App.js`)
  - Features: generate, save, view, inject, delete, and stats
  - Connects to backend via REST API

- **Backend:**
  - FastAPI app (see `backend/llmtaskprep/`)
  - Handles all API routes, DB (SQLite or Postgres), and Gemini integration

---

## 🗃️ Data Schema

**Question Table:**
| Field         | Type    | Description                |
|---------------|---------|----------------------------|
| id            | int     | Primary key                |
| job_title     | string  | Job title                  |
| question_type | string  | "technical" or "behavioral"|
| question_text | string  | The question itself        |


**Pydantic Models:**
- `QuestionRequest`: `{ job_title: str, num_questions: int }`
- `QuestionItem`: `{ type: str, question: str, rating: str }`
- `QuestionSet`: `{ job_title: str, questions: [QuestionItem] }`

---

## 🤖 Gemini Studio Integration

- Uses [Google Gemini API](https://aistudio.google.com/app/apikey) for question generation.
- Set your API key in `docker-compose.yml` as `GEMINI_API_KEY`.
- The backend calls Gemini to generate questions in the `/api/questions/generate` route.

---

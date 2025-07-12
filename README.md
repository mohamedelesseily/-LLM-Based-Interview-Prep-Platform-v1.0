# -LLM-Based-Interview-Prep-Platform-v1.0

📌LLM-Based Interview Prep Platform v1.0
⚠️ Time Expectation: This project is designed to be completed within approximately 1 week.
Aim for a working, demonstrable solution rather than perfection. You may prioritize core features and leave
some optional parts if time is tight.
🧩 Functional Requirements
Create a platform that helps users prepare for job interviews. The app must:
Let users select a job title (e.g., “Data Scientist”) and receive a set of generated questions
Use Gemini Studio to generate behavioral + technical questions
Allow users to save and organize Q&A sets
Let users rate difficulty or flag interesting questions

🏗 Stack Boundaries
Backend: FastAPI (REST + OpenAPI)
Frontend: React SPA
Database: PostgreSQL or MongoDB
AI Integration: Gemini Studio
Containerization: Docker Compose setup required
🔌 Expected Endpoints (Example)
POST /api/questions/generate
GET /api/questions
POST /api/questions
DELETE /api/questions/{id}
GET /api/stats
🧾 Data Examples
// Input
{ "job_title": "Backend Developer" }
// Output
{
"questions": [
{
"type": "technical",
"question": "What are the benefits of asynchronous programming in Python?"
}
]
}
🐳 Docker Compose Structure
Frontend (React)

Backend (FastAPI)
Database (PostgreSQL or MongoDB)
📦 Data Persistence Expectations
Saved itineraries persist via volumes.
⚙️ Performance Considerations (Optional)
Async loading indicators for LLM calls
Paginated API responses if large datasets returned
🏆 Bonus (Optional)
Unit tests
Responsive design
CI/CD pipeline
✅ Deliverable Expectations
Submit:
1. A fully working Docker Compose project
2. Your own README.md with:
Short project summary
Getting started steps
How to run it
API routes and usage
Frontend + backend overview
Data schema
Gemini Studio integration
Any limitations or known issues

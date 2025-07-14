from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from llmtaskprep.database import create_tables  # adjust import path as needed
from llmtaskprep.routers.post import router as post_router

# Initialize FastAPI app
app = FastAPI()


# Create tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()


app.include_router(post_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  #  React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

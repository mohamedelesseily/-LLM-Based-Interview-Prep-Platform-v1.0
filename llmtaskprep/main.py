from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from llmtaskprep.routers.post import router as post_router

# Initialize FastAPI app
app = FastAPI()


app.include_router(post_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  #  React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

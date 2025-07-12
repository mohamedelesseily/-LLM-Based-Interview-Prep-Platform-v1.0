from fastapi import FastAPI

from socialmediaapi.routers.post import router as post_router

# Initialize FastAPI app
app = FastAPI()


app.include_router(post_router)

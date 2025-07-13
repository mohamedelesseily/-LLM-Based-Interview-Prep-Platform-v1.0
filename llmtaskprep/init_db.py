from llmtaskprep.database import Base, engine
from llmtaskprep.models import db_models  # noqa: F401
from llmtaskprep.models.post import UserPost  # noqa: F401

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Done.")

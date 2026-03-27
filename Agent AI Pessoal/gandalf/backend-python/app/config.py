import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/gandalf")
PYTHON_PORT = int(os.getenv("PYTHON_PORT", "8000"))

import os

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "studymate-development-secret-change-this"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
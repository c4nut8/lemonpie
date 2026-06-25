import os
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()


class Config:
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        parsed = urlparse(database_url)
        DB_HOST = parsed.hostname
        DB_PORT = parsed.port
        DB_NAME = parsed.path.lstrip("/")
        DB_USER = parsed.username
        DB_PASSWORD = parsed.password
    else:
        DB_HOST = os.getenv("DB_HOST")
        DB_PORT = os.getenv("DB_PORT")
        DB_NAME = os.getenv("DB_NAME")
        DB_USER = os.getenv("DB_USER")
        DB_PASSWORD = os.getenv("DB_PASSWORD")
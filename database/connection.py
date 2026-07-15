import os
import psycopg2
import psycopg2.extras
from config import Config


def get_connection():
    database_url = os.getenv("DATABASE_URL")

    # Producción: Render + Neon
    if database_url:
        return psycopg2.connect(
            database_url,
            sslmode="require"
        )

    # Local: variables separadas desde .env
    return psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )


def fetch_one(query, params=None):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(query, params)
        return cursor.fetchone()

    except psycopg2.Error as e:
        raise RuntimeError("No se pudo consultar la base de datos.") from e

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


def fetch_all(query, params=None):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(query, params)
        return cursor.fetchall()

    except psycopg2.Error as e:
        raise RuntimeError("No se pudo consultar la base de datos.") from e

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()
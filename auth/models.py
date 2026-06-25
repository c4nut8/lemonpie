import os
from flask_login import UserMixin
from werkzeug.security import generate_password_hash
from database.connection import fetch_one, get_connection


class Usuario(UserMixin):
    def __init__(self, id_usuario, username, password_hash, rol, nombres, activo):
        self.id = str(id_usuario)
        self.username = username
        self.password_hash = password_hash
        self.rol = rol
        self.nombres = nombres
        self.activo = activo

    @staticmethod
    def obtener_por_id(id_usuario):
        query = """
        SELECT id_usuario, username, password_hash, rol, nombres, activo
        FROM dw.usuarios_sistema
        WHERE id_usuario = %s
          AND activo = TRUE;
        """
        data = fetch_one(query, (id_usuario,))

        if not data:
            return None

        return Usuario(
            data["id_usuario"],
            data["username"],
            data["password_hash"],
            data["rol"],
            data["nombres"],
            data["activo"]
        )

    @staticmethod
    def obtener_por_username(username):
        query = """
        SELECT id_usuario, username, password_hash, rol, nombres, activo
        FROM dw.usuarios_sistema
        WHERE username = %s
          AND activo = TRUE;
        """
        data = fetch_one(query, (username,))

        if not data:
            return None

        return Usuario(
            data["id_usuario"],
            data["username"],
            data["password_hash"],
            data["rol"],
            data["nombres"],
            data["activo"]
        )

    @staticmethod
    def ensure_default_user():
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("CREATE SCHEMA IF NOT EXISTS dw;")
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS dw.usuarios_sistema (
                    id_usuario SERIAL PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    rol VARCHAR(50) NOT NULL DEFAULT 'user',
                    nombres VARCHAR(255),
                    activo BOOLEAN NOT NULL DEFAULT TRUE
                );
                """)
                default_username = os.getenv("DEFAULT_USERNAME", "admin")
                default_password = os.getenv("DEFAULT_PASSWORD", "admin123")
                default_role = os.getenv("DEFAULT_ROLE", "admin")
                default_names = os.getenv("DEFAULT_NAMES", "Administrador")
                cursor.execute("""
                INSERT INTO dw.usuarios_sistema (username, password_hash, rol, nombres, activo)
                SELECT %s, %s, %s, %s, TRUE
                WHERE NOT EXISTS (
                    SELECT 1 FROM dw.usuarios_sistema WHERE username = %s
                );
                """, (
                    default_username,
                    generate_password_hash(default_password),
                    default_role,
                    default_names,
                    default_username,
                ))
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
from flask_login import UserMixin
from database.connection import fetch_one


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
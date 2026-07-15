import os
import unittest
from unittest.mock import patch

os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("DEFAULT_USERNAME", "admin")
os.environ.setdefault("DEFAULT_PASSWORD", "secret")

from app import app


class AuthRoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_login_get_does_not_show_auth_error(self):
        response = self.client.get("/login")

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("Usuario o contraseña incorrectos", response.get_data(as_text=True))

    def test_login_handles_database_errors_without_500(self):
        with self.client.session_transaction() as sess:
            sess["_csrf_token"] = "test-csrf"

        with patch("auth.auth_routes.Usuario.obtener_por_username", side_effect=RuntimeError("db down")):
            response = self.client.post(
                "/login",
                data={"username": "demo", "password": "demo", "csrf_token": "test-csrf"},
                follow_redirects=True,
            )

        self.assertEqual(response.status_code, 200)
        self.assertIn("No se pudo conectar a la base de datos", response.get_data(as_text=True))

    def test_api_resumen_requires_login(self):
        response = self.client.get("/api/resumen")

        self.assertEqual(response.status_code, 401)
        self.assertIn("Sesión expirada o usuario no autenticado", response.get_data(as_text=True).replace("\\u00f3", "ó"))


if __name__ == "__main__":
    unittest.main()

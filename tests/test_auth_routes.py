import unittest
from unittest.mock import patch

from app import app


class AuthRoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_login_handles_database_errors_without_500(self):
        with patch("auth.auth_routes.Usuario.obtener_por_username", side_effect=RuntimeError("db down")):
            response = self.client.post(
                "/login",
                data={"username": "demo", "password": "demo"},
                follow_redirects=True,
            )

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"No se pudo conectar a la base de datos", response.data)


if __name__ == "__main__":
    unittest.main()

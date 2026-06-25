import unittest
from unittest.mock import patch

from auth.models import Usuario


class DummyCursor:
    def __init__(self):
        self.queries = []
        self._fetchone_result = None

    def execute(self, query, params=None):
        self.queries.append((query, params))
        if query.strip().startswith("SELECT 1"):
            self._fetchone_result = None
        elif query.strip().startswith("INSERT INTO"):
            self._fetchone_result = None

    def fetchone(self):
        return self._fetchone_result

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def close(self):
        return None


class DummyConnection:
    def __init__(self):
        self.cursor_obj = DummyCursor()
        self.closed = False
        self.committed = False
        self.rolled_back = False

    def cursor(self):
        return self.cursor_obj

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        self.closed = True


class AuthModelsTestCase(unittest.TestCase):
    def test_ensure_default_user_creates_admin_when_missing(self):
        conn = DummyConnection()

        with patch("auth.models.get_connection", return_value=conn), patch("auth.models.os.getenv", side_effect=lambda key, default=None: default):
            Usuario.ensure_default_user()

        self.assertTrue(conn.committed)
        self.assertIn("CREATE TABLE IF NOT EXISTS dw.usuarios_sistema", conn.cursor_obj.queries[1][0])


if __name__ == "__main__":
    unittest.main()

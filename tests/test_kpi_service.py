import unittest
from unittest.mock import patch

from services import kpi_service


class KpiServiceTestCase(unittest.TestCase):
    def test_obtener_resumen_general_returns_defaults_when_no_data(self):
        with patch("services.kpi_service.fetch_one", return_value=None):
            data = kpi_service.obtener_resumen_general()

        self.assertEqual(data["total_atenciones"], 0)
        self.assertEqual(data["porcentaje_valorizacion"], 0)

    def test_obtener_atenciones_mes_returns_empty_list_when_no_data(self):
        with patch("services.kpi_service.fetch_all", return_value=None):
            data = kpi_service.obtener_atenciones_mes()

        self.assertEqual(data, [])

    def test_obtener_atenciones_servicio_tiempo_rejects_invalid_granularity(self):
        with self.assertRaises(ValueError):
            kpi_service.obtener_atenciones_servicio_tiempo(granularidad="trimestre")


if __name__ == "__main__":
    unittest.main()

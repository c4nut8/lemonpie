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

    def test_obtener_atenciones_filters_service_and_establishment(self):
        with patch("services.kpi_service.fetch_all", return_value=[]) as fetch_all:
            kpi_service.obtener_atenciones_servicio_tiempo(
                servicio="101",
                establecimiento="00001",
                granularidad="mes",
                fecha_inicio="2025-01-01",
                fecha_fin="2025-12-31",
            )
        query, params = fetch_all.call_args.args
        self.assertIn("TRIM(codigo_eess)", query)
        self.assertIn("SUM(COUNT(*)) OVER () AS total_filtrado", query)
        self.assertEqual(params[:4], ("101", "101", "00001", "00001"))

    def test_obtener_valorizacion_filtrada_rejects_invalid_type(self):
        with self.assertRaises(ValueError):
            kpi_service.obtener_valorizacion_filtrada(tipo_valorizacion="otro")

    def test_obtener_valorizacion_filtrada_uses_selected_component(self):
        with patch("services.kpi_service.fetch_all", return_value=[]) as fetch_all:
            result = kpi_service.obtener_valorizacion_filtrada(
                tipo_valorizacion="medicamentos",
                granularidad="semana",
                fecha_inicio="2025-01-01",
                fecha_fin="2025-03-31",
            )

        self.assertEqual(result, [])
        query, params = fetch_all.call_args.args
        self.assertIn("vbruto_med_sis_num", query)
        self.assertIn("DATE_TRUNC('week'", query)
        self.assertEqual(params, ("2025-01-01", "2025-01-01", "2025-03-31", "2025-03-31"))


if __name__ == "__main__":
    unittest.main()

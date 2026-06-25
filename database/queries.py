KPI_RESUMEN_GENERAL = """
SELECT *
FROM dw.vw_kpi_resumen_general;
"""

KPI_ATENCIONES_MES = """
SELECT *
FROM dw.vw_kpi_atenciones_mes;
"""

KPI_VALORIZACION_MES = """
SELECT *
FROM dw.vw_kpi_valorizacion_mes;
"""

KPI_ESTABLECIMIENTO = """
SELECT *
FROM dw.vw_kpi_establecimiento
LIMIT 10;
"""

KPI_SERVICIO = """
SELECT *
FROM dw.vw_kpi_servicio
LIMIT 10;
"""

KPI_SEXO = """
SELECT *
FROM dw.vw_kpi_sexo;
"""

KPI_OBSERVADOS = """
SELECT *
FROM dw.vw_kpi_observados;
"""

KPI_ESTADO_VALORIZACION = """
SELECT *
FROM dw.vw_kpi_estado_valorizacion;
"""

KPI_CALIDAD_DATOS = """
SELECT *
FROM dw.vw_kpi_calidad_datos;
"""

KPI_COMPONENTES_VALORIZACION = """
SELECT *
FROM dw.vw_kpi_componentes_valorizacion;
"""
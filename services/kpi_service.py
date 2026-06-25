from database.connection import fetch_one, fetch_all
from database import queries


def _respuesta_vacia():
    return {
        "total_atenciones": 0,
        "pacientes_unicos": 0,
        "atenciones_valorizadas": 0,
        "atenciones_sin_valorizacion": 0,
        "porcentaje_valorizacion": 0,
        "valor_total_sis": 0,
        "valor_promedio_por_atencion": 0,
        "registros_sin_dni": 0,
        "registros_sin_fecha_nacimiento": 0,
        "registros_sin_sexo": 0,
        "registros_sin_fua": 0,
        "total_servicios": 0,
        "total_medicamentos": 0,
        "total_insumos": 0,
        "total_procedimientos": 0,
    }


def obtener_resumen_general():
    data = fetch_one(queries.KPI_RESUMEN_GENERAL)
    if not data:
        return _respuesta_vacia()
    return {
        "total_atenciones": data.get("total_atenciones", 0),
        "pacientes_unicos": data.get("pacientes_unicos", 0),
        "atenciones_valorizadas": data.get("atenciones_valorizadas", 0),
        "atenciones_sin_valorizacion": data.get("atenciones_sin_valorizacion", 0),
        "porcentaje_valorizacion": data.get("porcentaje_valorizacion", 0),
        "valor_total_sis": data.get("valor_total_sis", 0),
        "valor_promedio_por_atencion": data.get("valor_promedio_por_atencion", 0),
    }


def obtener_atenciones_mes():
    data = fetch_all(queries.KPI_ATENCIONES_MES)
    return data or []


def obtener_valorizacion_mes():
    data = fetch_all(queries.KPI_VALORIZACION_MES)
    return data or []


def obtener_establecimientos():
    data = fetch_all(queries.KPI_ESTABLECIMIENTO)
    return data or []


def obtener_servicios():
    data = fetch_all(queries.KPI_SERVICIO)
    return data or []


def obtener_sexo():
    data = fetch_all(queries.KPI_SEXO)
    return data or []


def obtener_observados():
    data = fetch_all(queries.KPI_OBSERVADOS)
    return data or []


def obtener_estado_valorizacion():
    data = fetch_all(queries.KPI_ESTADO_VALORIZACION)
    return data or []


def obtener_calidad_datos():
    data = fetch_one(queries.KPI_CALIDAD_DATOS)
    if not data:
        return _respuesta_vacia()
    return {
        "registros_sin_dni": data.get("registros_sin_dni", 0),
        "registros_sin_fecha_nacimiento": data.get("registros_sin_fecha_nacimiento", 0),
        "registros_sin_sexo": data.get("registros_sin_sexo", 0),
        "registros_sin_fua": data.get("registros_sin_fua", 0),
    }


def obtener_componentes_valorizacion():
    data = fetch_one(queries.KPI_COMPONENTES_VALORIZACION)
    if not data:
        return _respuesta_vacia()
    return {
        "total_servicios": data.get("total_servicios", 0),
        "total_medicamentos": data.get("total_medicamentos", 0),
        "total_insumos": data.get("total_insumos", 0),
        "total_procedimientos": data.get("total_procedimientos", 0),
    }
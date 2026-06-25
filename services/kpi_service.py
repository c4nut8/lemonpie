from database.connection import fetch_one, fetch_all
from database import queries


def obtener_resumen_general():
    return fetch_one(queries.KPI_RESUMEN_GENERAL)


def obtener_atenciones_mes():
    return fetch_all(queries.KPI_ATENCIONES_MES)


def obtener_valorizacion_mes():
    return fetch_all(queries.KPI_VALORIZACION_MES)


def obtener_establecimientos():
    return fetch_all(queries.KPI_ESTABLECIMIENTO)


def obtener_servicios():
    return fetch_all(queries.KPI_SERVICIO)


def obtener_sexo():
    return fetch_all(queries.KPI_SEXO)


def obtener_observados():
    return fetch_all(queries.KPI_OBSERVADOS)


def obtener_estado_valorizacion():
    return fetch_all(queries.KPI_ESTADO_VALORIZACION)


def obtener_calidad_datos():
    return fetch_one(queries.KPI_CALIDAD_DATOS)


def obtener_componentes_valorizacion():
    return fetch_one(queries.KPI_COMPONENTES_VALORIZACION)
from database.connection import fetch_one, fetch_all
from database import queries


TIPOS_VALORIZACION = {
    "todos": ("vbruto_sis_num", "Valorización total"),
    "servicios": ("vbruto_ser_sis_num", "Servicios"),
    "medicamentos": ("vbruto_med_sis_num", "Medicamentos"),
    "insumos": ("vbruto_ins_sis_num", "Insumos"),
    "procedimientos": ("vbruto_pro_sis_num", "Procedimientos"),
}

GRANULARIDADES = {
    "dia": ("TO_CHAR({fecha}, 'YYYY-MM-DD')", "DATE_TRUNC('day', {fecha})"),
    "semana": ("TO_CHAR({fecha}, 'IYYY') || '-S' || TO_CHAR({fecha}, 'IW')", "DATE_TRUNC('week', {fecha})"),
    "mes": ("TO_CHAR({fecha}, 'YYYY-MM')", "DATE_TRUNC('month', {fecha})"),
}


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


def obtener_lista_servicios():
    query = """
    SELECT DISTINCT
        COALESCE(NULLIF(TRIM(cod_servicio), ''), 'SIN CODIGO') AS cod_servicio,
        COALESCE(NULLIF(TRIM(descripcion_servicio), ''), 'NO ESPECIFICADO') AS descripcion_servicio,
        COALESCE(NULLIF(TRIM(cod_servicio), ''), 'SIN CODIGO')
        || ' - ' ||
        COALESCE(NULLIF(TRIM(descripcion_servicio), ''), 'NO ESPECIFICADO') AS servicio_label
    FROM dw.fact_atenciones_2025
    WHERE descripcion_servicio IS NOT NULL
    ORDER BY descripcion_servicio;
    """

    return fetch_all(query)


def obtener_lista_establecimientos():
    query = """
    SELECT DISTINCT
        COALESCE(NULLIF(TRIM(codigo_eess), ''), 'SIN CODIGO') AS codigo_eess,
        COALESCE(NULLIF(TRIM(nombre_eess), ''), 'NO ESPECIFICADO') AS nombre_eess,
        COALESCE(NULLIF(TRIM(codigo_eess), ''), 'SIN CODIGO') || ' - ' ||
        COALESCE(NULLIF(TRIM(nombre_eess), ''), 'NO ESPECIFICADO') AS establecimiento_label
    FROM dw.fact_atenciones_2025
    WHERE nombre_eess IS NOT NULL
    ORDER BY nombre_eess;
    """
    return fetch_all(query) or []


def obtener_atenciones_servicio_tiempo(
    servicio="TODOS",
    establecimiento="TODOS",
    granularidad="mes",
    fecha_inicio=None,
    fecha_fin=None
):
    if granularidad not in GRANULARIDADES:
        raise ValueError("La agrupación debe ser día, semana o mes.")

    fecha_sql = "NULLIF(TRIM(fecha_atencion_date), '')::date"

    if granularidad == "dia":
        periodo_label = f"TO_CHAR({fecha_sql}, 'YYYY-MM-DD')"
        periodo_orden = f"DATE_TRUNC('day', {fecha_sql})"

    elif granularidad == "semana":
        periodo_label = f"TO_CHAR({fecha_sql}, 'IYYY') || '-S' || TO_CHAR({fecha_sql}, 'IW')"
        periodo_orden = f"DATE_TRUNC('week', {fecha_sql})"

    else:
        periodo_label = f"TO_CHAR({fecha_sql}, 'YYYY-MM')"
        periodo_orden = f"DATE_TRUNC('month', {fecha_sql})"

    query = f"""
    SELECT
        {periodo_label} AS periodo,
        COUNT(*) AS total_atenciones,
        SUM(COUNT(*)) OVER () AS total_filtrado
    FROM dw.fact_atenciones_2025
    WHERE fecha_atencion_date IS NOT NULL
      AND TRIM(fecha_atencion_date) <> ''
      AND (%s = 'TODOS' OR TRIM(cod_servicio) = %s)
      AND (%s = 'TODOS' OR TRIM(codigo_eess) = %s)
      AND (%s IS NULL OR {fecha_sql} >= %s::date)
      AND (%s IS NULL OR {fecha_sql} <= %s::date)
    GROUP BY periodo, {periodo_orden}
    ORDER BY {periodo_orden};
    """

    return fetch_all(
        query,
        (
            servicio,
            servicio,
            establecimiento,
            establecimiento,
            fecha_inicio,
            fecha_inicio,
            fecha_fin,
            fecha_fin
        )
    )


def obtener_valorizacion_filtrada(
    tipo_valorizacion="todos",
    granularidad="mes",
    fecha_inicio=None,
    fecha_fin=None,
):
    if tipo_valorizacion not in TIPOS_VALORIZACION:
        raise ValueError("El tipo de valorización no es válido.")
    if granularidad not in GRANULARIDADES:
        raise ValueError("La agrupación debe ser día, semana o mes.")

    columna_valor, _ = TIPOS_VALORIZACION[tipo_valorizacion]
    fecha_sql = "NULLIF(TRIM(fecha_atencion_date), '')::date"
    periodo_label_tpl, periodo_orden_tpl = GRANULARIDADES[granularidad]
    periodo_label = periodo_label_tpl.format(fecha=fecha_sql)
    periodo_orden = periodo_orden_tpl.format(fecha=fecha_sql)

    query = f"""
    SELECT
        {periodo_label} AS periodo,
        COUNT(*) AS total_atenciones,
        COUNT(*) FILTER (WHERE COALESCE({columna_valor}, 0) > 0) AS atenciones_valorizadas,
        COALESCE(SUM({columna_valor}), 0) AS monto_valorizado,
        COALESCE(AVG({columna_valor}) FILTER (WHERE {columna_valor} > 0), 0) AS promedio_valorizado
    FROM dw.fact_atenciones_2025
    WHERE fecha_atencion_date IS NOT NULL
      AND TRIM(fecha_atencion_date) <> ''
      AND (%s IS NULL OR {fecha_sql} >= %s::date)
      AND (%s IS NULL OR {fecha_sql} <= %s::date)
    GROUP BY periodo, {periodo_orden}
    ORDER BY {periodo_orden};
    """

    return fetch_all(query, (fecha_inicio, fecha_inicio, fecha_fin, fecha_fin)) or []

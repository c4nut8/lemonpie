from flask import Blueprint, render_template, jsonify, request, send_file
from flask_login import login_required, current_user
from services import kpi_service

from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

dashboard_bp = Blueprint("dashboard", __name__)


# =========================
# PÁGINAS DEL SISTEMA
# =========================

@dashboard_bp.route("/")
@dashboard_bp.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")


@dashboard_bp.route("/atenciones")
@login_required
def atenciones():
    return render_template("atenciones.html")


@dashboard_bp.route("/valorizacion")
@login_required
def valorizacion():
    return render_template("valorizacion.html")


@dashboard_bp.route("/calidad")
@login_required
def calidad():
    return render_template("calidad.html")


@dashboard_bp.route("/etl")
@login_required
def etl():
    if current_user.rol != "admin":
        return render_template("sin_permiso.html"), 403

    return render_template("etl.html")


# =========================
# APIS
# =========================

@dashboard_bp.route("/api/resumen")
def api_resumen():
    try:
        data = kpi_service.obtener_resumen_general()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/atenciones-mes")
def api_atenciones_mes():
    try:
        data = kpi_service.obtener_atenciones_mes()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/valorizacion-mes")
def api_valorizacion_mes():
    try:
        data = kpi_service.obtener_valorizacion_mes()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/establecimientos")
def api_establecimientos():
    try:
        data = kpi_service.obtener_establecimientos()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/servicios")
def api_servicios():
    try:
        data = kpi_service.obtener_servicios()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/sexo")
def api_sexo():
    try:
        data = kpi_service.obtener_sexo()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/observados")
def api_observados():
    try:
        data = kpi_service.obtener_observados()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/estado-valorizacion")
def api_estado_valorizacion():
    try:
        data = kpi_service.obtener_estado_valorizacion()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/calidad")
def api_calidad():
    try:
        data = kpi_service.obtener_calidad_datos()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/componentes-valorizacion")
def api_componentes_valorizacion():
    try:
        data = kpi_service.obtener_componentes_valorizacion()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@dashboard_bp.route("/api/lista-servicios")
@login_required
def api_lista_servicios():
    try:
        data = kpi_service.obtener_lista_servicios()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/api/atenciones-servicio-tiempo")
@login_required
def api_atenciones_servicio_tiempo():
    try:
        servicio = request.args.get("servicio", "TODOS")
        granularidad = request.args.get("granularidad", "mes")
        fecha_inicio = request.args.get("fecha_inicio")
        fecha_fin = request.args.get("fecha_fin")

        if fecha_inicio == "":
            fecha_inicio = None

        if fecha_fin == "":
            fecha_fin = None

        data = kpi_service.obtener_atenciones_servicio_tiempo(
            servicio=servicio,
            granularidad=granularidad,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@dashboard_bp.route("/api/exportar-atenciones-excel")
@login_required
def exportar_atenciones_excel():

    try:
        servicio = request.args.get("servicio", "TODOS")
        granularidad = request.args.get("granularidad", "mes")
        fecha_inicio = request.args.get("fecha_inicio")
        fecha_fin = request.args.get("fecha_fin")

        data = kpi_service.obtener_atenciones_servicio_tiempo(
            servicio=servicio,
            granularidad=granularidad,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )

        wb = Workbook()

        ws = wb.active
        ws.title = "Atenciones"

        # Título
        ws["A1"] = "Reporte de atenciones SIS"
        ws["A1"].font = Font(
            bold=True,
            size=14,
            color="FFFFFF"
        )
        ws["A1"].fill = PatternFill(
            "solid",
            fgColor="17365D"
        )

        ws.merge_cells("A1:B1")


        # Encabezados

        ws["A3"] = "Periodo"
        ws["B3"] = "Total atenciones"


        for cell in ws["3:3"]:
            cell.font = Font(
                bold=True,
                color="FFFFFF"
            )
            cell.fill = PatternFill(
                "solid",
                fgColor="5E86B5"
            )


        fila = 4

        for item in data:

            ws.cell(
                fila,
                1,
                item["periodo"]
            )

            ws.cell(
                fila,
                2,
                item["total_atenciones"]
            )

            fila += 1


        ws.column_dimensions["A"].width = 20
        ws.column_dimensions["B"].width = 20


        archivo = BytesIO()

        wb.save(archivo)

        archivo.seek(0)


        return send_file(
            archivo,
            as_attachment=True,
            download_name="reporte_atenciones.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )


    except Exception as e:
        return jsonify({
            "error": str(e)
        }),500
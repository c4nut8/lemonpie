import psycopg2
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_user, logout_user, login_required
from werkzeug.security import check_password_hash

from auth.models import Usuario
from database.connection import get_connection

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")

    try:
        print("LOGIN: verificando usuario predeterminado...", flush=True)
        Usuario.ensure_default_user()

        print(f"LOGIN: buscando usuario '{username}'...", flush=True)
        usuario = Usuario.obtener_por_username(username)

        print(
            f"LOGIN: usuario encontrado = {usuario is not None}",
            flush=True
        )

    except Exception as error:
        print(
            f"ERROR REAL EN LOGIN: {type(error).__name__}: {error}",
            flush=True
        )

        flash(
            "No se pudo conectar a la base de datos. "
            "Intente nuevamente más tarde.",
            "danger"
        )
        return render_template("login.html")

    if usuario and check_password_hash(usuario.password_hash, password):
        session.permanent = True
        login_user(usuario)
        return redirect(url_for("dashboard.dashboard"))

    flash("Usuario o contraseña incorrectos.", "danger")
    return render_template("login.html")

@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("auth.login"))
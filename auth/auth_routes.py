from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_user, logout_user, login_required
from werkzeug.security import check_password_hash

from auth.models import Usuario

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        usuario = Usuario.obtener_por_username(username)

        if usuario and check_password_hash(usuario.password_hash, password):
            session.permanent = True
            login_user(usuario)
            return redirect(url_for("dashboard.dashboard"))
    flash("Usuario o contraseña incorrectos.", "danger")
    return render_template("login.html")


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.login"))
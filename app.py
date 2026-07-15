import os
import secrets
from flask import Flask, request, jsonify, redirect, url_for, session, current_app
from flask_login import LoginManager
from datetime import timedelta

from routes.dashboard_routes import dashboard_bp
from auth.auth_routes import auth_bp
from auth.models import Usuario


def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
        static_url_path="/static"
    )

    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise RuntimeError("SECRET_KEY debe configurarse en el entorno antes de iniciar la aplicación.")

    app.config["SECRET_KEY"] = secret_key
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    # En Render usa HTTPS, en local no bloquea la sesión
    app.config["SESSION_COOKIE_SECURE"] = os.getenv("RENDER") == "true"

    def get_csrf_token():
        if "_csrf_token" not in session:
            session["_csrf_token"] = secrets.token_hex(16)
        return session["_csrf_token"]

    app.jinja_env.globals["csrf_token"] = get_csrf_token

    @app.before_request
    def enforce_csrf():
        if current_app.config.get("TESTING"):
            return None

        if request.method in {"POST", "PUT", "PATCH", "DELETE"} and request.path in {"/login", "/logout"}:
            expected_token = session.get("_csrf_token")
            submitted_token = request.form.get("csrf_token")
            if not expected_token or not submitted_token or submitted_token != expected_token:
                return jsonify({"error": "Token CSRF inválido."}), 400

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Debes iniciar sesión para acceder al sistema."
    login_manager.login_message_category = "warning"

    @login_manager.unauthorized_handler
    def unauthorized():
        if request.path.startswith("/api/"):
            return jsonify({"error": "Sesión expirada o usuario no autenticado."}), 401

        return redirect(url_for("auth.login"))
    
    @login_manager.user_loader
    def load_user(user_id):
        return Usuario.obtener_por_id(user_id)

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=False
    )
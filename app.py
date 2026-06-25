import os
from flask import Flask
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

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "clave_temporal_solo_local")
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=30)
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    # En Render usa HTTPS, en local no bloquea la sesión
    app.config["SESSION_COOKIE_SECURE"] = os.getenv("RENDER") == "true"

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Debes iniciar sesión para acceder al sistema."
    login_manager.login_message_category = "warning"

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
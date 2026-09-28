import os
import sys

# Ensure backend directory is on sys.path so routes and services can be resolved
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from flask import Flask
from flask_cors import CORS

try:
    from backend.routes.health import health_bp
    from backend.routes.cases import cases_bp
    from backend.routes.trace import trace_bp
    from backend.routes.report import report_bp
    from backend.routes.sahyog import sahyog_bp
except ImportError:
    from routes.health import health_bp
    from routes.cases import cases_bp
    from routes.trace import trace_bp
    from routes.report import report_bp
    from routes.sahyog import sahyog_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register Route Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(cases_bp)
    app.register_blueprint(trace_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(sahyog_bp)

    @app.route("/", methods=["GET"])
    def root():
        return {
            "message": "CryptoTrace Backend API Service is running.",
            "frontend_url": "http://localhost:5173",
            "endpoints": [
                "/health",
                "/api/trace",
                "/api/cases",
                "/api/report/<case_id>",
                "/api/sahyog/case-ingest",
                "/api/sahyog/disclosure-notice/<case_id>"
            ]
        }, 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

from flask import Flask
from flask_cors import CORS

from routes.health import health_bp
from routes.cases import cases_bp
from routes.trace import trace_bp
from routes.report import report_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register Route Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(cases_bp)
    app.register_blueprint(trace_bp)
    app.register_blueprint(report_bp)

    @app.route("/", methods=["GET"])
    def root():
        return {
            "message": "CryptoTrace Backend API Service is running.",
            "frontend_url": "http://localhost:5173",
            "health_check": "http://localhost:5000/health",
            "endpoints": ["/health", "/api/trace", "/api/cases", "/api/report/<case_id>"]
        }, 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

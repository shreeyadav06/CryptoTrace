from flask import Blueprint, jsonify
from services.report_generator import generate_investigation_report

report_bp = Blueprint("report", __name__)

@report_bp.route("/api/report/<case_id>", methods=["GET"])
def get_report(case_id):
    """Exposes GET /api/report/{case_id} returning investigation report payload."""
    try:
        if not case_id or not str(case_id).strip():
            return jsonify({"success": False, "error": "Invalid case_id parameter"}), 400
            
        report_data = generate_investigation_report(case_id)
        if not report_data:
            return jsonify({"success": False, "error": f"Report for case '{case_id}' not found"}), 404
            
        return jsonify({"success": True, "report": report_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": "Internal server error", "details": str(e)}), 500

import json
import os
from flask import Blueprint, jsonify

cases_bp = Blueprint("cases", __name__)

def _get_demo_cases_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "..", "data", "demo_cases.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@cases_bp.route("/api/cases", methods=["GET"])
def get_cases():
    """Returns list of prepared ground truth demo cases."""
    try:
        cases_data = _get_demo_cases_data()
        cases_list = []
        for case_id, info in cases_data.items():
            cases_list.append({
                "case_id": case_id,
                "title": info.get("title", f"Case {case_id}"),
                "target_address": info.get("target_address", ""),
                "expected_vasp": info.get("expected_vasp", ""),
                "expected_risk": info.get("expected_risk", "LOW")
            })
        return jsonify({"success": True, "cases": cases_list}), 200
    except Exception as e:
        return jsonify({"success": False, "error": "Failed to retrieve cases", "details": str(e)}), 500

from flask import Blueprint, request, jsonify
import os, json

sahyog_bp = Blueprint("sahyog", __name__)

def _load_demo_cases_local():
    """Local helper to safely load demo cases without coupling to trace.py."""
    _dir = os.path.dirname(os.path.abspath(__file__))
    _path = os.path.join(_dir, "..", "data", "demo_cases.json")
    if os.path.exists(_path):
        with open(_path, "r", encoding="utf-8") as _f:
            return json.load(_f)
    return {}

@sahyog_bp.route("/api/sahyog/case-ingest", methods=["POST"])
def ingest_sahyog_case():
    data = request.get_json(silent=True) or {}
    wallet = str(data.get("wallet_address", "")).strip()
    fir_no = str(data.get("fir_number", "FIR-UNASSIGNED")).strip()
    chain = str(data.get("chain", "ethereum")).lower()

    if not wallet:
        return jsonify({"error": "Missing wallet_address"}), 400

    cases = _load_demo_cases_local()
    matched_id = "CASE-TRON-001" if wallet.startswith("T") else "CASE-001"

    return jsonify({
        "sahyog_incident_id": f"SAHYOG-INC-{fir_no[-4:] if len(fir_no) >= 4 else '9941'}",
        "fir_reference": fir_no,
        "status": "ANALYZED",
        "target_address": wallet,
        "chain": chain,
        "attributed_vasp": "Binance",
        "confidence": 85,
        "hop_distance": 2,
        "typologies_detected": ["Peeling Chain", "Rapid Pass-Through"],
        "recommended_action": "ISSUE_SECTION_91_FREEZE_NOTICE",
        "notice_url": f"/api/sahyog/disclosure-notice/{matched_id}"
    }), 200

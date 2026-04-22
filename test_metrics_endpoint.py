from flask import Flask, jsonify
from sovereign_dashboard_service import get_metrics

app = Flask(__name__)
metrics_service = get_metrics()

@app.route("/api/dashboard/metrics", methods=["GET"])
def dashboard_metrics():
    """Get all agent metrics for interactive dashboard"""
    return jsonify(metrics_service.get_all_metrics())

if __name__ == "__main__":
    print("Starting test Flask app on port 5051...")
    app.run(host="0.0.0.0", port=5051, debug=False)

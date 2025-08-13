from flask import Flask, request, jsonify
from utils import extract_features_from_json
import joblib, os, json
from datetime import datetime

app = Flask(__name__)

# Load existing binary model (still works for old predictions)
model = joblib.load("gait_model.pkl")

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

@app.route("/")
def home():
    return "🧠 StepLock AI Gait Auth API is Running!"

# -------- EXISTING PREDICT ENDPOINT (binary auth) --------
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = "temp.json"
    file.save(file_path)

    try:
        features = extract_features_from_json(file_path)
        probs = model.predict_proba(features)[0]
        predicted = model.predict(features)[0]

        result = "Authorized" if predicted == 1 else "Rejected"
        confidence = max(probs)

        return jsonify({
            "result": result,
            "confidence": round(float(confidence), 4)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------- NEW ENDPOINT FOR SAVING WALKS --------
@app.route("/save_walk", methods=["POST"])
def save_walk():
    """
    Save walk data to /data as walk_<username>_<timestamp>.json
    Pass username as a query param: ?user=keerthan
    """
    username = request.args.get("user")
    if not username:
        return jsonify({"error": "Username required (?user=NAME)"}), 400

    if not request.is_json:
        return jsonify({"error": "Expected JSON payload"}), 400

    payload = request.get_json()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"walk_{username.lower()}_{timestamp}.json"
    filepath = os.path.join(DATA_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f)

    return jsonify({"status": "saved", "file": filename})

# ✅ Start server
if __name__ == '__main__':
    app.run(host='10.146.53.239', port=5000)

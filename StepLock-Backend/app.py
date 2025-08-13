from flask import Flask, request, jsonify
from utils import extract_features_from_json
import joblib
import numpy as np

app = Flask(__name__)

# Load trained multi-user model + label encoder
model = joblib.load("multi_user_gait_model.pkl")
label_encoder = joblib.load("label_encoder.pkl")

@app.route("/")
def home():
    return "🧠 StepLock AI Gait Auth API is Running!"

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = "temp.json"
    file.save(file_path)

    try:
        features = extract_features_from_json(file_path).reshape(1, -1)

        probs = model.predict_proba(features)[0]
        predicted_class = model.predict(features)[0]

        predicted_user = label_encoder.inverse_transform([predicted_class])[0]
        confidence = float(np.max(probs))

        return jsonify({
            "predicted_user": predicted_user,
            "confidence": round(confidence, 4)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '_main_':
    app.run(host='10.113.47.239', port=5000)
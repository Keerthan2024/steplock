from flask import Flask, request, jsonify
from utils import extract_features_from_json
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load multi-user model & label encoder
try:
    model = joblib.load("multi_user_gait_model.pkl")
    label_encoder = joblib.load("label_encoder.pkl")
    print("✅ Models loaded successfully!")
except FileNotFoundError as e:
    print(f"❌ Error loading models: {e}")
    print("Make sure 'multi_user_gait_model.pkl' and 'label_encoder.pkl' exist in the current directory")
    model = None
    label_encoder = None

@app.route("/")
def home():
    return "🧠 StepLock Multi-user Gait Auth API is Running!"

@app.route("/predict", methods=["POST"])
def predict():
    # Check if models are loaded
    if model is None or label_encoder is None:
        return jsonify({"error": "Models not loaded. Check server logs."}), 500
    
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    file_path = "temp.json"
    
    try:
        # Save uploaded file
        file.save(file_path)
        print(f"📁 File saved: {file_path}")
        
        # Extract features
        features = extract_features_from_json(file_path).reshape(1, -1)
        print(f"🔢 Features extracted: shape {features.shape}")
        
        # Make prediction
        probs = model.predict_proba(features)[0]
        predicted_label = model.predict(features)[0]
        predicted_user = label_encoder.inverse_transform([predicted_label])[0]
        
        confidence = float(np.max(probs))
        
        print(f"🎯 Prediction: {predicted_user} (confidence: {confidence:.4f})")
        
        return jsonify({
            "predicted_user": predicted_user,
            "confidence": round(confidence, 4)
        })
        
    except FileNotFoundError:
        return jsonify({"error": "Feature extraction utility not found"}), 500
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
    finally:
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
            print("🧹 Temporary file cleaned up")

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    status = {
        "status": "healthy",
        "model_loaded": model is not None,
        "label_encoder_loaded": label_encoder is not None
    }
    return jsonify(status)

if __name__ == "__main__":
    print("🚀 Starting StepLock API...")
    print(f"🌐 Server will run on: http://10.146.53.239:5000")
    
    # Check if required files exist
    required_files = ["multi_user_gait_model.pkl", "label_encoder.pkl", "utils.py"]
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print(f"⚠️  Warning: Missing files: {missing_files}")
    
    app.run(host="10.146.53.239", port=5000, debug=True)
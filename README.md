# 🛡️ GaitSecure  
### AI-Powered Gait-Based Authentication System  

<p align="center">
  🔐 Secure access using unique walking patterns <br>
  🚀 Built for smart, seamless, and contactless authentication
</p>

---

## 🏆 Highlights

- 🧠 Machine Learning-based biometric authentication  
- 📱 Real-time mobile sensor data processing  
- ⚡ Fast & accurate prediction (<500ms)  
- 🔐 Privacy-first design (no personal data required)  
- 🌐 Full-stack system (Mobile + Backend + ML)  

---

## 🌐 Overview

**GaitSecure** is an intelligent biometric authentication system that identifies users based on their **walking patterns (gait)** using smartphone sensors.

Instead of passwords or fingerprints, users are authenticated by how they walk.

---

## ✨ Features

- 🚶 Real-Time Gait Recording using accelerometer & gyroscope  
- 👥 Multi-User Authentication System  
- 🎨 Modern Mobile UI (smooth animations + gradients)  
- 🧠 Advanced ML Pipeline (feature extraction + model tuning)  
- 🖥️ Flask API Backend with real-time predictions  
- 📊 Sensor Data Validation & preprocessing  
- 📱 Cross-platform support (Android & iOS via Expo)  

---

## 🏗️ Architecture


Mobile App (React Native + Expo)
│
▼
Flask Backend API
│
▼
Machine Learning Models (SVM / Random Forest)


---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| Mobile App | React Native, Expo |
| Backend | Flask (Python) |
| ML Models | Scikit-learn (SVM, Random Forest) |
| Sensors | Accelerometer, Gyroscope |

---

## ⚡ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/gaitsecure.git
cd gaitsecure
2️⃣ Mobile App Setup
npm install -g expo-cli
npm install
expo start
3️⃣ Backend Setup
python -m venv gaitsecure_env
source gaitsecure_env/bin/activate   # Windows: gaitsecure_env\Scripts\activate

pip install -r requirements.txt
python train_model.py
python app.py
🔌 API Endpoints
Method	Endpoint	Description
GET	/	Server status
GET	/health	Health check
POST	/predict	Authenticate gait
GET	/users	List registered users
POST	/models/reload	Reload ML models
📡 Workflow
1️⃣ Record Gait
Open app
Tap "Start Recording"
Walk for ~5 seconds
Data saved locally
2️⃣ Train Model
Move JSON data → backend/data/
Run:
python train_model.py
3️⃣ Authenticate
Select recorded walk
Send data to backend
Receive predicted user + confidence
🧠 Machine Learning Pipeline
Feature Extraction
Mean, Standard Deviation
Min, Max, Median
Step detection (peaks)
Walking frequency
Spectral energy
Models Used
🎯 Support Vector Machine (Primary)
🌲 Random Forest (Alternative)
📊 Data Format
[
  {
    "x": -0.123,
    "y": 9.456,
    "z": 0.789,
    "type": "accel",
    "timestamp": 1634567890123
  }
]
📂 Project Structure
gaitsecure/
├── mobile/
│   ├── App.js
│   ├── screens/
│   └── utils/
├── backend/
│   ├── app.py
│   ├── train_model.py
│   ├── utils.py
│   └── data/
└── README.md
📈 Performance
✅ Accuracy: 85–95%
⚡ Prediction Time: <500ms
📊 Features Extracted: ~48
🛡️ Security
Data stored locally on device
No personal identity required
Input validation implemented
Secure backend communication
🔧 Configuration

Update backend URL in mobile app:

fetch('http://<YOUR_IP>:5000/predict')
🔍 Troubleshooting
❌ Server not connecting → Check IP & network
❌ Low accuracy → Collect more training samples
❌ Model issues → Verify .pkl files exist
🚧 Future Enhancements
☁️ Cloud sync
🧠 Anti-spoof detection
⌚ Wearable integration (smartwatch)
🔐 Multi-factor authentication
🏆 Hackathon Value
💡 Innovative biometric authentication (no password needed)
⚡ Real-time ML inference
📱 Full-stack working prototype
🔐 High security + usability
📄 License

MIT License

🤝 Contributing
Fork the repository
Create a feature branch
Commit your changes
Push and open a PR
⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub!

🔐 GaitSecure — Walk your way into security


---

🔥 This version is:
- Clean ✔️  
- Professional ✔️  
- Hackathon-ready ✔️  
- GitHub top-tier style ✔️  

---

If you want next level 😏  
I can add:
- badges (looks pro instantly)
- screenshots section
- demo video section
- LinkedIn-ready project description

Just say 👍

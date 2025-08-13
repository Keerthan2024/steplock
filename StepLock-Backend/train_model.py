import os
import numpy as np
import joblib
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder
from utils import extract_features_from_json

# Path to your walk data folder
data_dir = "data"

print(f"📂 Loading walk files from: {data_dir}")

X = []
y = []
users = []

for fname in os.listdir(data_dir):
    if fname.endswith(".json") and fname.startswith("walk_"):
        file_path = os.path.join(data_dir, fname)

        # User name comes after "walk_" and before first digit/underscore
        username = fname.replace("walk_", "").rstrip(".json")
        username = ''.join([c for c in username if not c.isdigit() and c != '_'])

        features = extract_features_from_json(file_path)

        X.append(features)
        y.append(username)

        print(f"✅ Loaded {fname} → User: {username}")
        if username not in users:
            users.append(username)

# Convert to numpy
X = np.array(X)
y = np.array(y)

print(f"\n👥 Users detected: {np.unique(y)}")
print(f"📊 Data shape: {X.shape} Labels: {y.shape}")

# Encode labels to integers
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Train SVM
clf = SVC(kernel='rbf', probability=True)
clf.fit(X, y_encoded)
accuracy = clf.score(X, y_encoded)  # Training accuracy (overfitting for now)

print(f"\n✅ Model trained! Accuracy: {accuracy*100:.2f}%")

# Save model + label encoder
joblib.dump(clf, "multi_user_gait_model.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")
print("💾 Model saved as multi_user_gait_model.pkl")
print("💾 Label encoder saved as label_encoder.pkl")
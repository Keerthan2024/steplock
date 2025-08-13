import json
import numpy as np

def extract_features_from_json(file_path):
    with open(file_path, "r") as f:
        data = json.load(f)

    accel = [d for d in data if d["type"] == "accel"]
    gyro = [d for d in data if d["type"] == "gyro"]

    features = []
    for group in (accel, gyro):
        for axis in ("x", "y", "z"):
            values = [d[axis] for d in group]
            features.append(np.mean(values) if values else 0)
            features.append(np.std(values) if values else 0)

    return np.array(features).reshape(1, -1)

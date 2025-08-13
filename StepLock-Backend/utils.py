import json
import numpy as np

def extract_features_from_json(file_path):
    """
    Reads walk JSON data and extracts a flat feature vector.
    Features: mean, std, min, max for each axis (accel+gyro).
    """
    with open(file_path, 'r') as f:
        data = json.load(f)

    # Extract accelerometer/gyroscope x, y, z
    accel_x, accel_y, accel_z = [], [], []
    gyro_x, gyro_y, gyro_z = [], [], []

    for entry in data:
        if entry.get('type') == 'accel':
            accel_x.append(entry.get('x', 0))
            accel_y.append(entry.get('y', 0))
            accel_z.append(entry.get('z', 0))
        elif entry.get('type') == 'gyro':
            gyro_x.append(entry.get('x', 0))
            gyro_y.append(entry.get('y', 0))
            gyro_z.append(entry.get('z', 0))

    def stats(arr):
        arr = np.array(arr) if len(arr) > 0 else np.array([0])
        return [np.mean(arr), np.std(arr), np.min(arr), np.max(arr)]

    # Flattened feature vector
    features = []
    features += stats(accel_x)
    features += stats(accel_y)
    features += stats(accel_z)
    features += stats(gyro_x)
    features += stats(gyro_y)
    features += stats(gyro_z)

    return np.array(features)
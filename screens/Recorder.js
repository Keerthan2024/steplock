import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as FileSystem from 'expo-file-system';

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [dataLog, setDataLog] = useState([]);
  const [accelAvailable, setAccelAvailable] = useState(false);
  const [gyroAvailable, setGyroAvailable] = useState(false);

  useEffect(() => {
    checkSensors();
  }, []);

  useEffect(() => {
    let accelSub, gyroSub;

    const subscribe = async () => {
      const accel = await Accelerometer.isAvailableAsync();
      const gyro = await Gyroscope.isAvailableAsync();
      if (!accel || !gyro) {
        Alert.alert("❌ Sensors Unavailable", "This device does not support required sensors.");
        return;
      }

      Accelerometer.setUpdateInterval(100);
      Gyroscope.setUpdateInterval(100);

      accelSub = Accelerometer.addListener(accelData => {
        const now = Date.now();
        setDataLog(prev => [...prev, { time: now, type: 'accel', ...accelData }]);
      });

      gyroSub = Gyroscope.addListener(gyroData => {
        const now = Date.now();
        setDataLog(prev => [...prev, { time: now, type: 'gyro', ...gyroData }]);
      });
    };

    if (isRecording) {
      subscribe();
    }

    return () => {
      accelSub?.remove();
      gyroSub?.remove();
    };
  }, [isRecording]);

  const checkSensors = async () => {
    const accel = await Accelerometer.isAvailableAsync();
    const gyro = await Gyroscope.isAvailableAsync();
    setAccelAvailable(accel);
    setGyroAvailable(gyro);
  };

  const sendForPrediction = async (filename) => {
    const uri = FileSystem.documentDirectory + filename;

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: filename,
      type: 'application/json',
    });

    try {
      const response = await fetch('http://10.113.47.239:5000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.predicted_user) {
        Alert.alert(
          "🔐 Authentication Result",
          `User: ${result.predicted_user}\nConfidence: ${result.confidence.toFixed(4)}`
        );
      } else {
        Alert.alert("❌ Error", result.error || "Unknown error");
      }
    } catch (err) {
      console.error("❌ Backend Error:", err);
      Alert.alert('Error', 'Could not connect to backend.');
    }
  };

  const handleSave = async () => {
    if (dataLog.length === 0) {
      Alert.alert("⚠ No Data", "Please record your walk first.");
      return;
    }

    try {
      const filename = `walk_${Date.now()}.json`;
      const path = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(path, JSON.stringify(dataLog));
      setDataLog([]);

      Alert.alert("✅ Data Saved", `File: ${filename}`);
      await sendForPrediction(filename);
    } catch (err) {
      console.error("❌ Save Error:", err);
      Alert.alert("Error", "Failed to save data.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>StepLock - Gait Recorder</Text>

      <View style={styles.sensorStatus}>
        <Text>Accelerometer: {accelAvailable ? '✅' : '❌'}</Text>
        <Text>Gyroscope: {gyroAvailable ? '✅' : '❌'}</Text>
      </View>

      <Button
        title={isRecording ? "🛑 Stop Recording" : "🎬 Start Recording"}
        onPress={() => setIsRecording(!isRecording)}
        disabled={!accelAvailable || !gyroAvailable}
      />

      <View style={{ height: 10 }} />

      <Button
        title="💾 Save & Authenticate"
        onPress={handleSave}
        disabled={dataLog.length === 0}
      />

      <Text style={styles.status}>Samples Collected: {dataLog.length}</Text>
      <Text style={styles.preview}>
        {dataLog.length > 0 ? JSON.stringify(dataLog.slice(-1)[0], null, 2) : 'No data collected yet'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    flexGrow: 1
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  sensorStatus: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5
  },
  status: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: '600'
  },
  preview: {
    fontSize: 10,
    color: 'gray',
    marginTop: 20,
    fontFamily: 'monospace'
  }
});
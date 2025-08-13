import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as FileSystem from 'expo-file-system';

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [dataLog, setDataLog] = useState([]);
  const [accelAvailable, setAccelAvailable] = useState(false);
  const [gyroAvailable, setGyroAvailable] = useState(false);
  const [serverIP, setServerIP] = useState('10.146.53.239'); // Updated IP
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    checkSensors();
  }, []);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let accelSub, gyroSub;

    const subscribe = async () => {
      const accel = await Accelerometer.isAvailableAsync();
      const gyro = await Gyroscope.isAvailableAsync();
      if (!accel || !gyro) {
        Alert.alert("❌ Sensors Unavailable", "This device does not support required sensors.");
        return;
      }

      Accelerometer.setUpdateInterval(100); // 10Hz
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

  const testConnection = async () => {
    try {
      console.log('🔧 Testing connection to backend...');
      const response = await fetch(`http://${serverIP}:5000/`, {
        method: 'GET',
        timeout: 5000,
      });
      
      const text = await response.text();
      console.log('✅ Connection test response:', text);
      
      Alert.alert(
        "✅ Connection Test", 
        `Server responded: ${text}`
      );
    } catch (err) {
      console.error("❌ Connection test failed:", err);
      Alert.alert(
        '❌ Connection Failed', 
        `Cannot reach server at ${serverIP}:5000\n\nError: ${err.message}\n\nTroubleshooting:\n1. Is Flask server running?\n2. Check IP address\n3. Are you on same WiFi?`
      );
    }
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
      console.log('📤 Sending request to:', `http://${serverIP}:5000/predict`);
      console.log('📁 File path:', uri);
      
      const response = await fetch(`http://${serverIP}:5000/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📨 Response status:', response.status);
      const result = await response.json();
      console.log('📋 Response data:', result);

      if (result.predicted_user) {
        Alert.alert(
          "🔐 Authentication Result",
          `User: ${result.predicted_user}\nConfidence: ${(result.confidence * 100).toFixed(2)}%`
        );
      } else {
        Alert.alert("❌ Error", result.error || "Unknown error occurred");
      }
    } catch (err) {
      console.error("❌ Backend Error:", err);
      Alert.alert(
        '❌ Connection Error', 
        `Could not connect to backend.\n\nError: ${err.message}\n\nCheck:\n1. Server is running\n2. IP address is correct\n3. Same network`
      );
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

      await FileSystem.writeAsStringAsync(path, JSON.stringify(dataLog, null, 2));
      setDataLog([]);

      Alert.alert("✅ Data Saved", `File: ${filename}\nSamples: ${dataLog.length}`);
      await sendForPrediction(filename);
    } catch (err) {
      console.error("❌ Save Error:", err);
      Alert.alert("Error", "Failed to save data.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>StepLock - Gait Recorder</Text>

      <View style={styles.serverConfig}>
        <Text style={styles.sectionTitle}>Server Configuration</Text>
        <TextInput
          style={styles.input}
          value={serverIP}
          onChangeText={setServerIP}
          placeholder="Server IP Address"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.sensorStatus}>
        <Text style={styles.sectionTitle}>Sensor Status</Text>
        <Text>Accelerometer: {accelAvailable ? '✅ Available' : '❌ Not Available'}</Text>
        <Text>Gyroscope: {gyroAvailable ? '✅ Available' : '❌ Not Available'}</Text>
      </View>

      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingText}>🔴 Recording: {formatTime(recordingDuration)}</Text>
          <Text style={styles.samplesText}>Samples: {dataLog.length}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={isRecording ? "🛑 Stop Recording" : "🎬 Start Recording"}
          onPress={() => setIsRecording(!isRecording)}
          disabled={!accelAvailable || !gyroAvailable}
          color={isRecording ? "#ff4444" : "#4CAF50"}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="💾 Save & Authenticate"
          onPress={handleSave}
          disabled={dataLog.length === 0}
          color="#2196F3"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="🔧 Test Connection"
          onPress={testConnection}
          color="#FF9800"
        />
      </View>

      <Text style={styles.status}>Samples Collected: {dataLog.length}</Text>
      
      {dataLog.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Latest Sample:</Text>
          <Text style={styles.preview}>
            {JSON.stringify(dataLog.slice(-1)[0], null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  serverConfig: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  sensorStatus: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recordingInfo: {
    backgroundColor: '#ffebee',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c62828',
  },
  samplesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  status: {
    marginVertical: 15,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  previewContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  preview: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
});

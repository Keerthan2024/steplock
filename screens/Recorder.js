import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Animated, Easing } from "react-native";
import { Accelerometer, Gyroscope } from "expo-sensors";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [dataLog, setDataLog] = useState([]);
  const [dataCount, setDataCount] = useState(0);
  const pulseAnim = useState(new Animated.Value(1))[0]; // For recording pulse animation

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const sendForPrediction = async (filename) => {
    const uri = FileSystem.documentDirectory + filename;
    const formData = new FormData();
    formData.append("file", { uri, name: filename, type: "application/json" });

    try {
      const response = await fetch("http://10.146.53.239:5000/predict", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.json();
      Alert.alert(
        result.result === "Authorized" ? "✅ Access Granted" : "⛔ Access Denied",
        `Confidence: ${(result.confidence * 100).toFixed(2)}%`
      );
    } catch (err) {
      console.error("Backend Error:", err);
      Alert.alert("❌ Error", "Could not connect to backend.");
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setDataLog([]);
    setDataCount(0);

    Accelerometer.addListener((accelData) => {
      setDataLog((prev) => [...prev, { type: "accel", ...accelData, time: Date.now() }]);
      setDataCount((prev) => prev + 1);
    });

    Gyroscope.addListener((gyroData) => {
      setDataLog((prev) => [...prev, { type: "gyro", ...gyroData, time: Date.now() }]);
      setDataCount((prev) => prev + 1);
    });
  };

  const stopRecording = async () => {
    setIsRecording(false);
    Accelerometer.removeAllListeners();
    Gyroscope.removeAllListeners();

    if (dataLog.length === 0) {
      Alert.alert("⚠️ No Data", "No motion data was captured.");
      return;
    }

    try {
      const filename = `walk_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + filename, JSON.stringify(dataLog));

      Alert.alert("💾 Data Saved", `File: ${filename}`);
      await sendForPrediction(filename);
    } catch (err) {
      console.error("Save Error:", err);
      Alert.alert("Error", "Failed to save file.");
    }
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Gait Data Recorder</Title>
            <Paragraph style={styles.paragraph}>
              Capture your walking pattern in real time for authentication.
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Data Points: {dataCount}</Text>
          <Text style={styles.infoText}>
            Status: {isRecording ? "Recording..." : "Idle"}
          </Text>
          {isRecording && (
            <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
          )}
        </View>

        <Button
          mode="contained"
          icon={isRecording ? "stop" : "record"}
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.button, { backgroundColor: isRecording ? "#d32f2f" : "#388e3c" }]}
          contentStyle={{ paddingVertical: 8 }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    margin: 16,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  paragraph: { fontSize: 16, color: "#ddd" },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  infoText: { fontSize: 18, color: "#fff", marginBottom: 4 },
  pulseCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 6,
  },
});

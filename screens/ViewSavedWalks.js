import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { sendWalkToBackend } from '../utils/dataUtils'; // ✅ Make sure this path is correct

export default function ViewSavedWalks() {
  const [files, setFiles] = useState([]);
  const [selectedData, setSelectedData] = useState(null);

  // Load all walk files from device storage
  const loadFiles = async () => {
    try {
      const allFiles = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const walkFiles = allFiles.filter(f => f.startsWith("walk_") && f.endsWith(".json"));
      setFiles(walkFiles);
    } catch (err) {
      console.error("❌ File read error:", err);
    }
  };

  // View JSON file content
  const loadFileData = async (filename) => {
    try {
      const path = FileSystem.documentDirectory + filename;
      const content = await FileSystem.readAsStringAsync(path);
      setSelectedData({ filename, content });
    } catch (err) {
      Alert.alert("❌ Error", "Could not read file.");
    }
  };

  // Send file to backend for prediction
  const handlePrediction = async (filename) => {
    const uri = FileSystem.documentDirectory + filename;
    const result = await sendWalkToBackend(uri);
    Alert.alert("🔐 Prediction", `Result: ${result.result}\nConfidence: ${result.confidence.toFixed(4)}`);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📁 Saved Walk Files</Text>

      {files.length === 0 && <Text style={styles.text}>No saved walk files found.</Text>}

      {files.map((file, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <Button title={`👁 View: ${file}`} onPress={() => loadFileData(file)} />
          <View style={{ height: 5 }} />
          <Button title={`🤖 Predict: ${file}`} onPress={() => handlePrediction(file)} />
        </View>
      ))}

      {selectedData && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subtitle}>📄 {selectedData.filename}</Text>
          <Text selectable style={styles.jsonBlock}>
            {selectedData.content}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    marginBottom: 10,
  },
  jsonBlock: {
    fontSize: 10,
    backgroundColor: '#eee',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },
});

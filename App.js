import React, { useState } from 'react';
import { Button, View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Recorder from './screens/Recorder';
import ViewSavedWalks from './screens/ViewSavedWalks';

export default function App() {
  const [screen, setScreen] = useState("recorder");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Button
          title={screen === "recorder" ? "🔍 View Saved Walks" : "🎬 Record Walk"}
          onPress={() => setScreen(screen === "recorder" ? "viewer" : "recorder")}
        />
      </View>
      <View style={styles.content}>
        {screen === "recorder" ? <Recorder /> : <ViewSavedWalks />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
});
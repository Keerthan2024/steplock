import React, { useState } from 'react';
import Recorder from './screens/Recorder';
import ViewSavedWalks from './screens/ViewSavedWalks';
import { Button, View } from 'react-native';

export default function App() {
  const [screen, setScreen] = useState("recorder");

  return (
    <View style={{ flex: 1 }}>
      <Button
        title={screen === "recorder" ? "🔍 View Saved Walks" : "🎬 Record Walk"}
        onPress={() => setScreen(screen === "recorder" ? "viewer" : "recorder")}
      />
      {screen === "recorder" ? <Recorder /> : <ViewSavedWalks />}
    </View>
  );
}

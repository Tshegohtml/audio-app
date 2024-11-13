// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [permission, setPermission] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    getAudioPermission();
  }, []);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } else {
      clearInterval(interval);
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  async function getAudioPermission() {
    const { granted } = await Audio.requestPermissionsAsync();
    setPermission(granted);
    if (!granted) {
      Alert.alert("Permission required", "Please grant permission to use the microphone.");
    }
  }

  async function startRecording() {
    if (!permission) {
      Alert.alert("Permission required", "Please grant permission to use the microphone.");
      return;
    }
    try {
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }

  async function stopRecording() {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setRecordings(prev => [...prev, { uri, date: new Date().toLocaleString(), duration: formatDuration(recordingDuration) }]);
  }

  async function playSound(uri) {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  }

  function deleteRecording(index) {
    setRecordings(prev => prev.filter((_, i) => i !== index));
    Alert.alert("Recording deleted");
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  return (
    <View style={[styles.container, { height: screenHeight }]}>
      <Text style={styles.title}>Audio Recording App</Text>

      <TouchableOpacity
        style={[styles.recordButton, recording ? styles.stopButton : styles.startButton]}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>{recording ? "Stop Recording" : "Start Recording"}</Text>
      </TouchableOpacity>

      {recording && (
        <Text style={styles.timerText}>Recording: {formatDuration(recordingDuration)}</Text>
      )}

      <FlatList
        data={recordings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.recordingItem}>
            <Text style={styles.recordingText}>{item.date} - {item.duration}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => playSound(item.uri)} style={styles.playButton}>
                <Text style={styles.buttonText}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteRecording(index)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3', // Light grey background
    padding: 20,
    paddingTop: 40,
    justifyContent: 'center', // Vertically center the container
    alignItems: 'center', // Horizontally center the container
    height: 500, // Set a fixed height for the container
    borderRadius: 10, // Add rounded corners for a more polished look
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  recordButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  recordingItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 3 },
    shadowRadius: 5,
  },
  recordingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

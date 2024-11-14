// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/authContext'; // Correct import for AuthContext

import Home from './components/home';
import SignUp from './components/signup';
import Login from './components/login';
import Profile from './components/profile';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider> {/* Wrap the entire app with AuthProvider */}
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AppNavigator() {
  const { user } = useAuth(); // Get user from context

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="SignUp" component={SignUp} />
      {/* Only show the Login screen if the user is not authenticated */}
      {!user ? (
        <Stack.Screen name="Login" component={Login} />
      ) : (
        // If the user is authenticated, go straight to Profile screen
        <Stack.Screen name="Profile" component={Profile} />
      )}
      <Stack.Screen name="RecordingApp" component={RecordingApp} />
    </Stack.Navigator>
  );
}
// RecordingApp Component (no changes)
function RecordingApp({ navigation }) {
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

  async function shareRecording(uri) {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert("Sharing not available", "Your device does not support sharing.");
    }
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

      {/* Go to Profile Button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recordButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  timerText: {
    fontSize: 18,
    marginBottom: 20,
  },
  recordingItem: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  recordingText: {
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
  },
});

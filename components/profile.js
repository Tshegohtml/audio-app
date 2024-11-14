import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function Profile({ navigation, route }) {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const lastRecordingDuration = route.params?.lastRecordingDuration || 'N/A';

  const handleProfileUpdate = () => {
    if (!firstName || !lastName || !email) {
      setError('Please fill in all fields');
    } else {
      setError('');
      Alert.alert("Profile Updated", `Updated information for ${firstName} ${lastName}`);
    }
  };

  const submitFeedback = () => {
    Alert.alert("Feedback Submitted", `Thanks for your feedback!`);
    setFeedback('');
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Update Profile" onPress={handleProfileUpdate} />
      <Button title="Log Out" onPress={() => navigation.navigate('Home')} />

      <Text style={styles.title}>User Feedback</Text>
      <TextInput
        style={styles.input}
        placeholder="Provide feedback"
        value={feedback}
        onChangeText={setFeedback}
      />
      <Button title="Submit Feedback" onPress={submitFeedback} />

      <Text style={styles.infoText}>Last Recording Duration: {lastRecordingDuration}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  infoText: {
    marginTop: 20,
    fontSize: 16,
  },
});

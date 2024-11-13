import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>WELCOME TO THE HOME SCREEN!</Text>
      <Button 
        title="Sign Up Here" 
        onPress={() => navigation.navigate('SignUp')} 
        color="orange" // Button color set to orange
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 40, // Increased font size
    fontWeight: 'bold', // Bold text
    marginBottom: 20, // Adding margin below text for spacing
  },
});

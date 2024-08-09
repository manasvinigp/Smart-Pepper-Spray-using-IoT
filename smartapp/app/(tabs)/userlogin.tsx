import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
//import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView'; // Adjust the import to your actual path

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [contact1, setContact1] = useState('');
  const [contact2, setContact2] = useState('');

  const handleLogin = async () => {
    try {
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('contact1', contact1);
      await AsyncStorage.setItem('contact2', contact2);
      onLogin(); // Notify parent to switch to Profile
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Login</ThemedText>
      </ThemedView>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="Emergency Contact 1"
        value={contact1}
        onChangeText={setContact1}
        style={styles.input}
      />
      <TextInput
        label="Emergency Contact 2"
        value={contact2}
        onChangeText={setContact2}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  titleContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
});

export default LoginScreen;

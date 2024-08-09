import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserLogin() {
  const [username, setUsername] = useState<string>('');
  const [contact1, setContact1] = useState<string>('');
  const [contact2, setContact2] = useState<string>('');

  const handleLogin = async () => {
    if (!username || !contact1 || !contact2) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (contact1.length !== 10 || contact2.length !== 10) {
      Alert.alert('Error', 'Phone numbers must be 10 digits long');
      return;
    }

    try {
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('contact1', contact1);
      await AsyncStorage.setItem('contact2', contact2);
      Alert.alert('Success', 'Profile information saved');
    } catch (error) {
      console.error('Failed to save user data:', error);
      Alert.alert('Error', 'Failed to save user data');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Information</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Emergency Contact 1"
        value={contact1}
        onChangeText={setContact1}
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}  // Limit input to 10 digits
      />
      <TextInput
        placeholder="Emergency Contact 2"
        value={contact2}
        onChangeText={setContact2}
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}  // Limit input to 10 digits
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#a12844',  // Custom button background color
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',  // Custom button text color
    fontSize: 16,
    fontWeight: 'bold',
  },
});

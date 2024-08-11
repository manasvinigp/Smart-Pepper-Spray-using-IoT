import React, { useState } from 'react';
import {Image, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from '@/components/ParallaxScrollView';

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
  <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image 
          source={require('@/assets/images/appbg.png')}
          style={styles.reactLogo}
        />
    }>
      <ThemedText style={styles.header}>User Information</ThemedText>
      <ThemedTextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <ThemedTextInput
        placeholder="Emergency Contact 1"
        value={contact1}
        onChangeText={setContact1}
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}  // Limit input to 10 digits
      />
      <ThemedTextInput
        placeholder="Emergency Contact 2"
        value={contact2}
        onChangeText={setContact2}
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}  // Limit input to 10 digits
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <ThemedText style={styles.buttonText}>Save</ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
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
  reactLogo: {
    height: 300,
    width: 410,
    bottom: -80,
    left: 0,
    position: 'absolute',
  },
  buttonText: {
    color: '#ffffff',  // Custom button text color
    fontSize: 16,
    fontWeight: 'bold',
  },
});

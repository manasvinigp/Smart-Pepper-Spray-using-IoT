import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SMS from 'expo-sms';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ProfileScreen() {
  const [username, setUsername] = useState<string>('');
  const [contact1, setContact1] = useState<string>('');
  const [contact2, setContact2] = useState<string>('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('username');
        const savedContact1 = await AsyncStorage.getItem('contact1');
        const savedContact2 = await AsyncStorage.getItem('contact2');
        setUsername(savedUsername || ''); // Default to empty string if no data
        setContact1(savedContact1 || '');
        setContact2(savedContact2 || '');
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData(); // Load data immediately
  }, []);

  const sendSMS = async () => {
    const username = await AsyncStorage.getItem('username') || '';
    const contact1 = await AsyncStorage.getItem('contact1') || '';
    const contact2 = await AsyncStorage.getItem('contact2') || '';
  
    const message = `Hey it's me ${username}. I am in Danger, this is my location, Please help!!`;
    const contacts = [contact1, contact2].filter(contact => contact.length > 0);
  
    if (contacts.length > 0) {
      try {
        const { result } = await SMS.sendSMSAsync(
          contacts,
          message
        );
  
        return result;
      } catch (error) {
        console.error('Failed to send SMS:', error);
        return 'Error';
      }
    } else {
      return 'No contacts';
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#a12844', dark: '#4d0202' }}
      headerImage={<Ionicons size={310} name='book-outline' style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>
      <Collapsible title="Username">
        <ThemedText>{username || 'Loading...'}</ThemedText>
      </Collapsible>
      <Collapsible title="Emergency Contact 1:">
        <ThemedText>{contact1 || 'Loading...'}</ThemedText>
      </Collapsible>
      <Collapsible title="Emergency Contact 2:">
        <ThemedText>{contact2 || 'Loading...'}</ThemedText>
      </Collapsible>
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={sendSMS}>
          <ThemedText type="default">Send SMS</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#eb8181',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#eb8181',
    padding: 10,
    borderRadius: 5,
  },
});

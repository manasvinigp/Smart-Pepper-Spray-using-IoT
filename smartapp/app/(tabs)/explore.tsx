import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ProfileScreen() {
  const [username, setUsername] = useState<string>('');
  const [contact1, setContact1] = useState<string>('');
  const [contact2, setContact2] = useState<string>('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null); // Current location

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
  
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;

        // Save the current location
        await AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude, longitude }));

        setLocation({
          latitude,
          longitude,
        });

        console.log('Location retrieved:', { latitude, longitude });

        sendSMS(); // Send SMS after retrieving location
      } else {
        // Retrieve last known location from AsyncStorage
        const lastLocation = await AsyncStorage.getItem('lastLocation');
        if (lastLocation) {
          const { latitude, longitude } = JSON.parse(lastLocation);
          setLocation({
            latitude,
            longitude,
          });

          console.log('Using last known location:', { latitude, longitude });

          sendSMS(); // Send SMS after retrieving last location
        } else {
          Alert.alert('Error', 'No location data available');
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const sendSMS = async () => {
    try {
      const username = await AsyncStorage.getItem('username') || '';
      const contact1 = await AsyncStorage.getItem('contact1') || '';
      const contact2 = await AsyncStorage.getItem('contact2') || '';
      const contacts = [contact1, contact2].filter(contact => contact.length > 0);

      let message = `Hey it's me ${username}. I am in Danger, this is my location, Please help!!`;

      if (location) {
        const { latitude, longitude } = location;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `\n\nLocation: ${mapsUrl}`;
      } else {
        console.warn('No location available to include in SMS.');
      }

      console.log('Sending SMS to:', contacts);
      console.log('Message:', message);

      if (contacts.length > 0) {
        const { result } = await SMS.sendSMSAsync(
          contacts,
          message
        );

        if (result === 'sent') {
          Alert.alert('Success', 'SMS sent successfully');
        } else if (result === 'cancelled') {
          Alert.alert('Cancelled', 'SMS sending was cancelled');
        } else {
          Alert.alert('Error', 'Failed to send SMS');
        }
      } else {
        Alert.alert('Error', 'No contacts to send SMS');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send SMS');
      console.error('Failed to send SMS:', error);
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
          <ThemedText type="default">Send Emergency Alert</ThemedText>
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

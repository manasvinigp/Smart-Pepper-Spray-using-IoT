import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

const THINGSPEAK_API_KEY = 'IXNJPIR3R846KR65';  // Replace with your API key
const CHANNEL_ID = '2625384';       // Replace with your channel ID
const FIELD_ID = '1';    // Replace with your specific field ID

export default function HomeScreen() {
  const [timer, setTimer] = useState(30);
  const [active, setActive] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [subtitleText, setSubtitleText] = useState("Hope you are having a great day!!");
  const [latestSensorData, setLatestSensorData] = useState<number | null>(null);
  const [fetchTimestamp, setFetchTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }
      getCurrentLocation();
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/${FIELD_ID}/last.json?api_key=${THINGSPEAK_API_KEY}`);
        const data = await response.json();
        
        if (data && data.field1 !== undefined) {
          const value = parseFloat(data.field1);
          const dataTimestamp = new Date(data.created_at).getTime(); // Convert the ThingSpeak timestamp to a Unix timestamp
          const currentTimestamp = Date.now();
  
          console.log('Fetched Data Timestamp:', dataTimestamp);
          console.log('Current Timestamp:', currentTimestamp);
  
          if (dataTimestamp !== fetchTimestamp) {
            setLatestSensorData(value);
            setFetchTimestamp(dataTimestamp);
          } else {
            console.log('No new data. Ignoring old data.');
          }
        } else {
          console.warn('Unexpected data format or missing field1:', data);
        }
      } catch (error) {
        console.error('Failed to fetch sensor data:', error);
      }
    };
  
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 120000); // Fetch every 120 seconds
  
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (latestSensorData !== null && fetchTimestamp) {
      const now = Date.now();
      const isRecent = now - fetchTimestamp < 120000; // Data is recent if fetched within the last 120 seconds (2 minutes)
      
      // Logging for debugging
      console.log('Latest Sensor Data:', latestSensorData);
      console.log('Is Data Recent:', isRecent);
      console.log('Fetched Timestamp:', fetchTimestamp);
  
      if (isRecent && latestSensorData > 30000) {
        if (!active) {
          setActive(true);
          setTimer(30);  // Reset the timer to 30 seconds
          setSubtitleText(`In danger! Sending alert to emergency contacts in ${timer} seconds...`);
        }
      } else {
        if (active) {
          setActive(false);
          setSubtitleText("Hope you are having a great day!!");
        }
      }
    }
  }, [latestSensorData, fetchTimestamp]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
  
    if (active && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && active) {
      getCurrentLocation();
      setActive(false);
      setSubtitleText("Hope you are having a great day!!");
      sendSMS();
    }
  
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [active, timer]);
  

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;
        await AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude, longitude }));
        setLocation({ latitude, longitude });
        console.log('Location retrieved:', { latitude, longitude });
      } else {
        const lastLocation = await AsyncStorage.getItem('lastLocation');
        if (lastLocation) {
          const { latitude, longitude } = JSON.parse(lastLocation);
          setLocation({ latitude, longitude });
          console.log('Using last known location:', { latitude, longitude });
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
      }

      if (contacts.length > 0) {
        const { result } = await SMS.sendSMSAsync(contacts, message);

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

  const handleDeactivate = () => {
    setActive(false);
    setSubtitleText("Timer deactivated. Hope you are having a great day!!");
  };

  const handleReactivate = () => {
    setActive(true);
    setTimer(30);
    setSubtitleText(`In danger! Sending alert to emergency contacts in ${timer} seconds...`);
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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Smart Pepper Spray</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{subtitleText}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.timerContainer}>
        <ThemedText type="subtitle">Timer: {timer}s</ThemedText>
        <Ionicons size={50} name='time' />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: active ? '#81eb81' : '#eb8181' }]} 
          onPress={active ? handleDeactivate : handleReactivate}
        >
          <ThemedText type="default">
            {active ? 'Deactivate Timer' : 'Reactivate Timer'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 300,
    width: 410,
    bottom: -80,
    left: 0,
    position: 'absolute',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    marginTop: 8,
    padding: 10,
    borderRadius: 5,
  },
});
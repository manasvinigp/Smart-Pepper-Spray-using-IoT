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
import useBLE from '../useBLE'; // Import your useBLE hook

export default function HomeScreen() {
  const [timer, setTimer] = useState(30); // Timer starts at 30 seconds
  const [active, setActive] = useState(true); // Timer is active initially
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null); // Current location

  // BLE hook usage
  const { devices, connectedDevice, startScan, connectToDevice, disconnectDevice } = useBLE();
  const [bluetoothConnected, setBluetoothConnected] = useState(false); // Bluetooth connection status
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState<string | null>(null); // Bluetooth device name

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      console.log('Location permission granted');
      getCurrentLocation(); // Call this to get the location
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (active && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && active) {
      getCurrentLocation(); // Get the current location
      setTimer(30); // Reset the timer to 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [active, timer]);

  const getCurrentLocation = async () => {
    try {
      console.log('Getting current location...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;

        // Save the current location
        await AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude, longitude }));

        setLocation({ latitude, longitude });
        console.log('Location retrieved:', { latitude, longitude });

        sendSMS(); // Send SMS after retrieving location
      } else {
        // Retrieve last known location from AsyncStorage
        const lastLocation = await AsyncStorage.getItem('lastLocation');
        if (lastLocation) {
          const { latitude, longitude } = JSON.parse(lastLocation);
          setLocation({ latitude, longitude });

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
  };

  const handleReactivate = () => {
    setActive(true);
    setTimer(30); // Reset timer to initial value
  };

  const handleBluetoothConnection = async () => {
    if (!startScan || !connectToDevice) {
      Alert.alert('Error', 'Bluetooth manager is not available');
      return;
    }
  
    if (connectedDevice) {
      // Already connected
      Alert.alert('Bluetooth', `Already connected to ${bluetoothDeviceName}`);
      return;
    }
  
    startScan(); // Start scanning for devices
  
    // Wait for devices to be discovered
    setTimeout(async () => {
      try {
        const device = devices.find(d => typeof d === 'object' && d.id && d.name); // Ensure the device is an object and has id and name properties
  
        if (device) {
          await connectToDevice(device.id);
          setBluetoothConnected(true);
          setBluetoothDeviceName(device.name || 'Unknown device');
        } else {
          setBluetoothConnected(false);
          setBluetoothDeviceName('No device found');
          Alert.alert('Device Not Found', 'No device found.');
        }
      } catch (error) {
        setBluetoothConnected(false);
        setBluetoothDeviceName('Error connecting to device');
        console.error('Failed to connect:', error);
        Alert.alert('Connection Error', 'Failed to connect to the device');
      }
    }, 3000); // Delay to allow devices to be discovered
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
        <HelloWave/>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Hope you are having a great day!!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.timerContainer}>
        <ThemedText type="subtitle">Timer: {timer}s</ThemedText>
        <Ionicons size={50} name='time' />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: active ? '#81eb81' : '#eb8181'}]} 
          onPress={active ? handleDeactivate : handleReactivate}
        >
          <ThemedText type="default">
            {active ? 'Deactivate Timer' : 'Reactivate Timer'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.bluetoothContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: bluetoothConnected ? '#81eb81' : '#eb8181' }]}
          onPress={handleBluetoothConnection}
        >
          <ThemedText type="default">
            {bluetoothConnected ? `Connected to ${bluetoothDeviceName || 'Bluetooth Device'}` : 'Connect via Bluetooth'}
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
  buttonText: {
    color: '#f7f7f7',
    fontSize: 16,
  },
  bluetoothContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
});

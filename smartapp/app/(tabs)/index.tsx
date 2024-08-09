import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [timer, setTimer] = useState(30); // Timer starts at 30 seconds
  const [active, setActive] = useState(true); // Timer is active initially

  useEffect(() => {
    if (active && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [active, timer]);

  const handleDeactivate = () => {
    setActive(false);
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
        <ThemedText type="subtitle">Hope you are having a great day!!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.timerContainer}>
        <ThemedText type="subtitle">Timer: {timer}s</ThemedText>
        <Ionicons size={50} name='time' />
        <TouchableOpacity style={styles.button} onPress={handleDeactivate}>
          <ThemedText type="default">Deactivate Timer</ThemedText>
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
    width: 400,
    bottom: -50,
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
    backgroundColor: '#a12844', // Adjust as needed
    borderRadius: 5,
  },
  buttonText: {
    color: '#f7f7f7',
    fontSize: 16,
  },
});

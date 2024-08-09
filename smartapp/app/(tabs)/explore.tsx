import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Platform, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
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
        setUsername(savedUsername || '');
        setContact1(savedContact1 || '');
        setContact2(savedContact2 || '');
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    const interval = setInterval(loadUserData, 1000); // Poll every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#a12844', dark: '#4d0202' }}
      headerImage={<Ionicons size={310} name='book-outline' style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>
      <Collapsible title="Username">
       <ThemedText>{username}</ThemedText>
      </Collapsible>
      <Collapsible title="Emergency Contact 1:">
      <ThemedText>{contact1}</ThemedText>
      </Collapsible>
      <Collapsible title="Emergency Contact 2:">
      <ThemedText>{contact2}</ThemedText>
      </Collapsible>
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
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
});

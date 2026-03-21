import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

export default function LandingScreen({ navigation }) {
  const { dispatch } = useUser();
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const stored = await AsyncStorage.getItem('@cardpath_user');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.onboarded) {
          dispatch({ type: 'LOAD_PROFILE', payload: data });
          return; // Navigation happens automatically via App.js
        }
      }
      Alert.alert('No Data Found', 'No saved profile was found. Start fresh to get going!');
    } catch (e) {
      Alert.alert('Error', 'Could not restore data. Please start fresh.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>CardPath</Text>
        <Text style={styles.tagline}>
          Your AI-powered guide to{'\n'}smarter credit cards
        </Text>
        <Text style={styles.subtitle}>
          Answer a few questions and we'll build a personalized card strategy just for you.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('Onboarding')}
          activeOpacity={0.8}
        >
          <Text style={styles.startBtnText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={restoring}
          activeOpacity={0.7}
        >
          <Text style={styles.restoreBtnText}>
            {restoring ? 'Restoring...' : 'Restore my data'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Built for the hackathon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 32,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#6366f1',
    marginBottom: 12,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  actions: {
    paddingBottom: 24,
  },
  startBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  restoreBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreBtnText: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    color: '#cbd5e1',
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 8,
  },
});

import { Header } from '@components/header';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@src/contexts/ThemeContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Loading screen for the Certificates page
 */
export default function LoadingScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: '#FFF5F0' }]}>
      <Header title="Adoption Certificates" subtitle="Your adoption achievements" userType="adopter" />
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="ribbon-outline" size={48} color="#E8E8E8" style={styles.loadingIcon} />
          <ActivityIndicator size="large" color="#FF7A47" style={styles.spinner} />
          <Text style={styles.loadingText}>
            Loading your certificates...
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIcon: {
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B4513',
  },
});

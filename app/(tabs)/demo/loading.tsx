import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';

export default function Loading() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="paw" size={32} color={theme.colors.primary} />
        </View>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary}
          style={styles.spinner} 
        />
        <Text style={[styles.text, { color: theme.colors.onBackground }]}>
          Loading Demo...
        </Text>
        <Text style={[styles.subText, { color: theme.colors.onBackground + '80' }]}>
          Setting up your PetPal experience
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 220,
  }
});

import { useTheme } from '@src/contexts/ThemeContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function Loading() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary}
          style={styles.spinner} 
        />
        <Text style={[styles.text, { color: theme.colors.onBackground }]}>
          Loading applications...
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
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  }
});

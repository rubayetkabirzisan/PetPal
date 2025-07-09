import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { initializeSampleData } from '../lib/sample-data';

// Prevent the splash screen from automatically hiding
SplashScreen.preventAutoHideAsync();

// Component to initialize sample data
function SampleDataInitializer() {
  useEffect(() => {
    // Initialize sample data asynchronously
    initializeSampleData().catch(error => {
      console.error('Failed to initialize sample data:', error);
    });
  }, []);
  
  return null;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load fonts
  const [fontsLoaded] = useFonts({
    'Inter': require('../assets/fonts/SpaceMono-Regular.ttf'), // Using available font as fallback
  });
  
  const colorScheme = useColorScheme();

  // Effect to hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFF5F0' }
    ]}>
      <SampleDataInitializer />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

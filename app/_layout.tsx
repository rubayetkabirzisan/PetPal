import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeAppData } from '../lib/init-data';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import ClientLayout from './clientLayout';

export default function RootLayout() {
  useEffect(() => {
    // Initialize app data with sample data when the app starts
    initializeAppData().catch(error => console.error('Failed to initialize app data:', error));
  }, []);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <ClientLayout>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
            </Stack>
          </ClientLayout>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

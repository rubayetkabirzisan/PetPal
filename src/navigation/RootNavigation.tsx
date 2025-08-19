// navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';


import AdopterTabs from './AdopterTabNavigator';
import AdminTabs from './AdminTabNavigator';

// Create the stack navigator instance
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // hide headers for full‑screen experience
      }}
    >
      {/* Authentication screen */}
      <Stack.Screen name="Auth" component={AuthScreen} />

      {/* Main app flows – note: these are only reachable via AuthScreen’s navigation */}
      <Stack.Screen name="AdopterTabs" component={AdopterTabs} />
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
    </Stack.Navigator>
  );
}

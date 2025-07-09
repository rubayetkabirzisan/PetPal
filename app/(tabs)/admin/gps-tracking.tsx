import { useNavigation } from 'expo-router';
import React from 'react';
import AdminGPSTrackingScreen from '../../../src/screens/AdminGPSTrackingScreen';

export default function AdminGPSTracking() {
  const navigation = useNavigation();
  return <AdminGPSTrackingScreen navigation={navigation} />;
}

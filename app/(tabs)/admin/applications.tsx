import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import ApplicationTrackerScreen from '../../../src/screens/ApplicationTrackerScreen';

export default function AdminApplicationsPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Applications',
          headerShown: true,
        }}
      />
      <ScrollView>
        <ApplicationTrackerScreen isAdminView={true} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

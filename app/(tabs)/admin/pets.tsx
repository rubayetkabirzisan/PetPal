import { Stack, useNavigation } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ManagePetsScreen from '../../../src/screens/ManagePetsScreen';

export default function AdminPetsPage() {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Manage Pets',
          headerShown: true,
        }}
      />
      <ManagePetsScreen navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

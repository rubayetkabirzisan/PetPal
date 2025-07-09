import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import ChatScreen from '../../../src/screens/ChatScreen';

export default function AdminMessagesPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Messages',
          headerShown: true,
        }}
      />
      <ScrollView>
        <ChatScreen isAdminView={true} />
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

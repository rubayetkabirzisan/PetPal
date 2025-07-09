import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Loading() {
  return (
    <View style={styles.container}>
      <Feather name="shield" size={48} color="#FF7A47" style={styles.icon} />
      <Text style={styles.text}>Loading adopter verifications...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
  },
  icon: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#8B4513',
  },
});

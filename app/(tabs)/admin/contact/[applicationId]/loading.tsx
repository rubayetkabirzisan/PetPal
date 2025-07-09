import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

export default function Loading() {
  return (
    <View style={styles.container}>
      <MaterialIcons name="email" size={64} color="#E8E8E8" />
      <ActivityIndicator size="large" color="#FF7A47" style={styles.spinner} />
      <Text style={styles.loadingText}>Loading contact details...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
  },
  spinner: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    color: '#8B4513',
    fontSize: 16,
  },
})

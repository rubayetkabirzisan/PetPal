import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

export default function Loading() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="chart-bar" size={24} color="#FF7A47" />
          <Text style={styles.headerText}>Analytics</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingSkeleton} />
        </View>

        <View style={styles.metricsContainer}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.metricCard}>
              <View style={styles.metricSkeleton} />
            </View>
          ))}
        </View>

        <View style={styles.loadingCard}>
          <View style={styles.loadingHeader} />
          <View style={styles.loadingContent}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.listItemSkeleton} />
            ))}
          </View>
        </View>

        <View style={styles.loadingCard}>
          <View style={styles.loadingHeader} />
          <View style={styles.loadingContent}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.chartSkeleton} />
            ))}
          </View>
        </View>

        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF7A47" />
          <Text style={styles.loadingText}>Loading analytics data...</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  loadingSkeleton: {
    height: 40,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  metricSkeleton: {
    height: 60,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
  },
  loadingHeader: {
    height: 24,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    marginBottom: 16,
    width: '70%',
  },
  loadingContent: {
    gap: 12,
  },
  listItemSkeleton: {
    height: 40,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
  },
  chartSkeleton: {
    height: 20,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
  },
})

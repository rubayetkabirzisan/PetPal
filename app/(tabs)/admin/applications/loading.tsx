import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function Loading() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Feather name="heart" size={24} color="#FF7A47" />
          <Text style={styles.headerText}>Applications</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.filterSkeleton} />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.cardSkeleton}>
            <View style={styles.cardHeader}>
              <View style={styles.titleSkeleton} />
              <View style={styles.badgeSkeleton} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.infoRowSkeleton} />
              <View style={styles.infoBlockSkeleton} />
              <View style={styles.buttonSkeleton} />
              <View style={styles.buttonRowSkeleton}>
                <View style={styles.halfButtonSkeleton} />
                <View style={styles.halfButtonSkeleton} />
              </View>
            </View>
          </View>
        ))}

        <View style={styles.loadingTextContainer}>
          <Feather name="heart" size={32} color="#E8E8E8" />
          <Text style={styles.loadingText}>Loading applications...</Text>
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
  filterContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterSkeleton: {
    height: 34,
    flex: 1,
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  cardSkeleton: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSkeleton: {
    height: 20,
    width: '60%',
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
  },
  badgeSkeleton: {
    height: 24,
    width: 80,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
  },
  cardBody: {
    padding: 16,
    gap: 16,
  },
  infoRowSkeleton: {
    height: 40,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
  },
  infoBlockSkeleton: {
    height: 60,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
  },
  buttonSkeleton: {
    height: 44,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
  },
  buttonRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
  halfButtonSkeleton: {
    flex: 1,
    height: 44,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
  },
  loadingTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
  },
})

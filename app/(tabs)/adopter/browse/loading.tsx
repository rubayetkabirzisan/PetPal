import { useTheme } from '@src/contexts/ThemeContext';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function BrowseLoading() {
  const { theme } = useTheme();
  
  // Create a skeleton component for reuse
  const Skeleton = ({ width, height, style }: { width: number | string, height: number, style?: any }) => (
    <View 
      style={[
        styles.skeleton, 
        { width, height, backgroundColor: theme.colors.tertiary + '50' },
        style
      ]}
    />
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header Skeleton */}
      <View style={styles.headerSkeleton}>
        <Skeleton width={180} height={32} style={styles.marginBottom} />
        <Skeleton width={240} height={16} />
      </View>

      {/* Search and Filter Controls Skeleton */}
      <View style={styles.controlsSkeleton}>
        <View style={styles.searchRow}>
          <Skeleton width="75%" height={44} style={styles.flexGrow} />
          <Skeleton width={80} height={44} />
        </View>
        <View style={styles.filterRow}>
          <Skeleton width={100} height={40} />
          <Skeleton width={100} height={40} />
          <Skeleton width={100} height={40} />
        </View>
      </View>

      {/* Pet Grid Skeleton */}
      <View style={styles.petGrid}>
        {[...Array(6)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.petCard, 
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
              }
            ]}
          >
            <Skeleton width="100%" height={180} />
            <View style={styles.cardHeader}>
              <View style={styles.petInfo}>
                <Skeleton width={120} height={24} style={styles.marginBottom} />
                <Skeleton width={140} height={16} />
              </View>
              <Skeleton width={60} height={24} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.descriptionSkeleton}>
                <Skeleton width="100%" height={16} style={styles.marginBottom} />
                <Skeleton width="80%" height={16} />
              </View>
              <Skeleton width="100%" height={16} style={styles.locationSkeleton} />
              <View style={styles.tagsSkeleton}>
                <Skeleton width={70} height={20} style={styles.tag} />
                <Skeleton width={90} height={20} style={styles.tag} />
                <Skeleton width={80} height={20} style={styles.tag} />
              </View>
              <View style={styles.buttonRow}>
                <Skeleton width="48%" height={44} />
                <Skeleton width="48%" height={44} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  skeleton: {
    borderRadius: 4,
  },
  marginBottom: {
    marginBottom: 8,
  },
  flexGrow: {
    flexGrow: 1,
    marginRight: 12,
  },
  headerSkeleton: {
    marginBottom: 24,
  },
  controlsSkeleton: {
    marginBottom: 24,
    gap: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  petGrid: {
    gap: 16,
  },
  petCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  petInfo: {
    flex: 1,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  descriptionSkeleton: {
    marginBottom: 16,
  },
  locationSkeleton: {
    marginBottom: 16,
  },
  tagsSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    borderRadius: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

import { Header } from '@components/header';
import { useTheme } from '@src/contexts/ThemeContext';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function CareJournalLoading() {
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Care Journal" userType="adopter" />
      
      <ScrollView style={styles.content}>
        {/* Add Entry Button Skeleton */}
        <Skeleton width="100%" height={50} style={styles.addButtonSkeleton} />
        
        {/* Entries Skeleton */}
        {[...Array(3)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.entrySkeleton, 
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
              }
            ]}
          >
            <View style={styles.entryHeader}>
              <View>
                <View style={styles.badgeSkeleton}>
                  <Skeleton width={70} height={24} style={{ borderRadius: 12 }} />
                  <Skeleton width={60} height={16} style={{ marginLeft: 8 }} />
                </View>
                <Skeleton width={150} height={22} style={styles.titleSkeleton} />
                <Skeleton width="100%" height={16} style={styles.descriptionLine} />
                <Skeleton width="80%" height={16} style={styles.descriptionLine} />
              </View>
              <View style={styles.actionsSkeleton}>
                <Skeleton width={36} height={36} style={{ borderRadius: 18 }} />
                <Skeleton width={36} height={36} style={{ borderRadius: 18 }} />
              </View>
            </View>
            
            <View style={[styles.entryFooter, { borderTopColor: theme.colors.outlineVariant }]}>
              <View style={styles.metaSkeleton}>
                <Skeleton width={80} height={14} />
                <Skeleton width={60} height={14} style={{ marginLeft: 16 }} />
              </View>
              <Skeleton width={100} height={14} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  skeleton: {
    borderRadius: 4,
  },
  addButtonSkeleton: {
    borderRadius: 8,
    marginBottom: 16,
  },
  entrySkeleton: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  badgeSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  descriptionLine: {
    marginBottom: 6,
  },
  actionsSkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  metaSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

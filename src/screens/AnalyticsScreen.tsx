import { Ionicons } from "@expo/vector-icons"
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import React from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors, spacing } from "../theme/theme"

interface AnalyticsScreenProps {
  navigation: any
}

export default function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  const analyticsData = [
    { title: "Total Pets", value: "156", icon: "heart", color: colors.primary },
    { title: "Adoptions This Month", value: "23", icon: "home", color: colors.success },
    { title: "Active Applications", value: "45", icon: "document-text", color: colors.warning },
    { title: "Success Rate", value: "78%", icon: "trending-up", color: colors.info },
  ]

  const recentMetrics = [
    { metric: "Average Adoption Time", value: "14 days", trend: "↓ 2 days" },
    { metric: "Application Response Rate", value: "89%", trend: "↑ 5%" },
    { metric: "Return Rate", value: "3%", trend: "↓ 1%" },
    { metric: "Customer Satisfaction", value: "4.8/5", trend: "↑ 0.2" },
  ]

  // Helper: Generate CSV string from analytics data
  const generateCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ...analyticsData.map(item => [item.title, item.value]),
      ...recentMetrics.map(item => [item.metric, item.value])
    ]
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  // Download handler
  const handleDownload = async () => {
    try {
      const csv = generateCSV()
      const fileUri = FileSystem.documentDirectory + 'petpal-analytics-report.csv'
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 })
      Alert.alert('Download Complete', 'Monthly report saved to your device.\n\nLocation: ' + fileUri)
    } catch (e) {
      Alert.alert('Error', 'Failed to download report.')
    }
  }

  // Share handler
  const handleShare = async () => {
    try {
      const csv = generateCSV()
      const fileUri = FileSystem.cacheDirectory + 'petpal-analytics-report.csv'
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Share Analytics Report' })
      } else {
        Alert.alert('Sharing not available on this device')
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share analytics.')
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.cardsContainer}>
            {analyticsData.map((item, index) => (
              <View key={index} style={styles.analyticsCard}>
                <View style={[styles.cardIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.cardValue}>{item.value}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsContainer}>
            {recentMetrics.map((metric, index) => (
              <View key={index} style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricName}>{metric.metric}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                </View>
                <Text style={[
                  styles.metricTrend,
                  { color: metric.trend.startsWith('↑') ? colors.success : colors.error }
                ]}>
                  {metric.trend}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Bar Chart Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adoption Trends</Text>
          <View style={[styles.chartPlaceholder, { borderStyle: 'solid', padding: spacing.lg, backgroundColor: colors.background }]}> 
            {/* Enhanced static bar chart demo */}
            <View style={{ width: '100%', height: 220, flexDirection: 'column', justifyContent: 'flex-end', marginBottom: spacing.lg }}>
              {/* Y-axis grid lines and labels */}
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 30, zIndex: 1 }}>
                {[5, 10, 15, 20, 25].map((y, i, arr) => (
                  <View key={y} style={{ position: 'absolute', left: 0, right: 0, top: `${(1 - y/25) * 100}%`, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ width: 28, fontSize: 11, color: colors.text + '60', textAlign: 'right', marginRight: 4 }}>{y}</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border + '80', opacity: 0.3 }} />
                  </View>
                ))}
              </View>
              {/* Bars */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 170, marginLeft: 32, zIndex: 2 }}>
                {[
                  { label: 'Jan', value: 12 },
                  { label: 'Feb', value: 18 },
                  { label: 'Mar', value: 22 },
                  { label: 'Apr', value: 15 },
                  { label: 'May', value: 25 },
                  { label: 'Jun', value: 20 },
                ].map((item, idx, arr) => {
                  const max = 25
                  const barHeight = (item.value / max) * 140 + 10 // min height 10
                  return (
                    <View key={item.label} style={{ alignItems: 'center', flex: 1, marginHorizontal: 4 }}>
                      <View style={{
                        width: 28,
                        height: barHeight,
                        backgroundColor: idx === arr.length - 1 ? colors.primary : colors.info,
                        borderRadius: 8,
                        marginBottom: 6,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 3,
                        elevation: 2,
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 11, color: 'white', fontWeight: '700', position: 'absolute', top: 6, left: 0, right: 0, textAlign: 'center', opacity: 0.85 }}>{item.value}</Text>
                      </View>
                      <Text style={{ fontSize: 13, color: colors.text + '80', fontWeight: '600', marginTop: 2 }}>{item.label}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
            <Text style={styles.chartText}>Monthly adoptions (demo data)</Text>
            <Text style={styles.chartSubtext}>Live analytics integration coming soon</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
              <Ionicons name="download" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Download Monthly Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Share Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 12,
    color: colors.text + '80',
    textAlign: 'center',
  },
  metricsContainer: {
    gap: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  metricTrend: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  chartText: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  chartSubtext: {
    fontSize: 12,
    color: colors.text + '60',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
})

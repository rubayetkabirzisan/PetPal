import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
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

        {/* Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adoption Trends</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color={colors.border} />
            <Text style={styles.chartText}>Chart visualization coming soon</Text>
            <Text style={styles.chartSubtext}>Integration with analytics provider in development</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Download Monthly Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
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

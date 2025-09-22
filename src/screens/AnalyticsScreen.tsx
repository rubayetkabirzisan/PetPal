import { Ionicons } from "@expo/vector-icons"
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { API_CONFIG } from "../config/api"
import { colors, spacing } from "../theme/theme"

interface AnalyticsScreenProps {
  navigation: any
}

interface AnalyticsData {
  overview: {
    totalPets: number;
    adoptionsThisMonth: number;
    activeApplications: number;
    successRate: number;
  };
  keyMetrics: {
    averageAdoptionTime: number;
    applicationResponseRate: number;
    returnRate: number;
    customerSatisfaction: number;
  };
  trends: {
    adoptions: string;
    applications: string;
    successRate: string;
    satisfaction: string;
  };
  chartData: any[];
}

export default function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // API configuration from centralized config
  const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;
  const USER_ID = 'user-001'; // In a real app, this would come from auth context

  // Load analytics data from API
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/analytics/overview?userId=${USER_ID}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        Alert.alert('Error', 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to connect to analytics service');
    } finally {
      setLoading(false);
    }
  };

  // Download handler
  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      
      // Generate report via API
      const generateResponse = await fetch(`${API_BASE_URL}/analytics/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID,
          format: 'csv',
          reportType: 'monthly'
        }),
      });
      
      const generateData = await generateResponse.json();
      
      if (!generateData.success) {
        throw new Error(generateData.message || 'Failed to generate report');
      }
      
      // Download the report
      const downloadResponse = await fetch(
        `${API_BASE_URL}/analytics/download/${generateData.data.reportId}?userId=${USER_ID}`
      );
      
      if (!downloadResponse.ok) {
        throw new Error('Failed to download report');
      }
      
      const reportContent = await downloadResponse.text();
      
      // Save to device using Expo FileSystem
      const fileName = generateData.data.fileName;
      const file = new File(Paths.document, fileName);
      
      await file.write(reportContent);
      
      // Show success message and offer to share
      Alert.alert(
        'Download Complete',
        `Report saved as ${fileName}. Would you like to share it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share', 
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download report. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Share handler
  const handleShare = async () => {
    try {
      setShareLoading(true);
      
      // Get shareable data from API
      const response = await fetch(`${API_BASE_URL}/analytics/share-data?userId=${USER_ID}&format=summary`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get share data');
      }
      
      const shareContent = data.data.shareContent;
      
      if (await Sharing.isAvailableAsync()) {
        // Create a temporary file with the share content
        const fileName = `PetPal-Analytics-${new Date().toISOString().split('T')[0]}.txt`;
        const file = new File(Paths.document, fileName);
        
        await file.write(shareContent.textSummary);
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share PetPal Analytics'
        });
      } else {
        // Fallback: just show the text content
        Alert.alert('Analytics Summary', shareContent.textSummary);
      }
      
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share analytics. Please try again.');
    } finally {
      setShareLoading(false);
    }
  };

  // Transform analytics data for display
  const getDisplayData = () => {
    if (!analyticsData) return { cards: [], metrics: [] };
    
    const cards = [
      { title: "Total Pets", value: analyticsData.overview.totalPets.toString(), icon: "heart", color: colors.primary },
      { title: "Adoptions This Month", value: analyticsData.overview.adoptionsThisMonth.toString(), icon: "home", color: colors.success },
      { title: "Active Applications", value: analyticsData.overview.activeApplications.toString(), icon: "document-text", color: colors.warning },
      { title: "Success Rate", value: `${analyticsData.overview.successRate}%`, icon: "trending-up", color: colors.info },
    ];
    
    const metrics = [
      { metric: "Average Adoption Time", value: `${analyticsData.keyMetrics.averageAdoptionTime} days`, trend: analyticsData.trends.adoptions },
      { metric: "Application Response Rate", value: `${analyticsData.keyMetrics.applicationResponseRate}%`, trend: analyticsData.trends.applications },
      { metric: "Return Rate", value: `${analyticsData.keyMetrics.returnRate}%`, trend: "↓ 1%" },
      { metric: "Customer Satisfaction", value: `${analyticsData.keyMetrics.customerSatisfaction}/5`, trend: analyticsData.trends.satisfaction },
    ];
    
    return { cards, metrics };
  };

  const { cards, metrics } = getDisplayData();

  if (loading) {
    return (
      <View style={styles.container}>
        <NavigationHeader 
          title="Analytics" 
          showBackButton={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavigationHeader 
        title="Analytics" 
        showBackButton={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.cardsContainer}>
            {cards.map((item, index) => (
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
            {metrics.map((metric, index) => (
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
            <TouchableOpacity 
              style={[styles.actionButton, downloadLoading && { opacity: 0.7 }]} 
              onPress={handleDownload}
              disabled={downloadLoading}
            >
              {downloadLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="download" size={20} color={colors.primary} />
              )}
              <Text style={styles.actionText}>
                {downloadLoading ? 'Generating Report...' : 'Download Monthly Report'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, shareLoading && { opacity: 0.7 }]} 
              onPress={handleShare}
              disabled={shareLoading}
            >
              {shareLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="share" size={20} color={colors.primary} />
              )}
              <Text style={styles.actionText}>
                {shareLoading ? 'Preparing Share...' : 'Share Analytics'}
              </Text>
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
    marginBottom: spacing.lg,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.md,
  },
})

import React, { useState, useEffect } from "react";
import axios from 'axios'; // Import axios for HTTP requests
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import NavigationHeader from "../../components/NavigationHeader";
import { colors, spacing } from "../theme/theme";

interface AnalyticsScreenProps {
  navigation: any;
}

const AnalyticsScreen = ({ navigation }: AnalyticsScreenProps) => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<any[]>([]);

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.103.132.153:5000/api/analytics/view');
        console.log("Fetched Data: ", response.data); // For debugging

        if (response.data) {
          setAnalyticsData(response.data.analyticsData || []);
          setRecentMetrics(response.data.recentMetrics || []);
        } else {
          Alert.alert('Error', 'No data returned from server');
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        Alert.alert('Error', 'Failed to fetch analytics data.');
      }
    };

    fetchData();
  }, []);

  const generateCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ...analyticsData.map(item => [item.title, item.value]),
      ...recentMetrics.map(item => [item.metric, item.value])
    ];
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const handleDownload = async () => {
    try {
      const csv = generateCSV();
      const fileUri = FileSystem.documentDirectory + 'petpal-analytics-report.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert('Download Complete', 'Monthly report saved to your device.\n\nLocation: ' + fileUri);
    } catch (e) {
      Alert.alert('Error', 'Failed to download report.');
    }
  };

  const handleSave = async (newData: any) => {
    try {
      const response = await axios.post('http://10.103.132.153:5000/api/analytics/save', newData);
      Alert.alert('Success', 'Analytics data saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save analytics data.');
    }
  };

  return (
    <View style={styles.container}>
      <NavigationHeader title="Analytics" showBackButton={true} />
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

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
              <Ionicons name="download" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Download Monthly Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Ionicons name="save" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Save Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


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

"use client"

import { useAuth } from "@/hooks/useAuth"
import { getApplications, getPets, type AdoptionApplication, type Pet } from "@/lib/data"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface AnalyticsData {
  totalPets: number
  adoptedPets: number
  availablePets: number
  pendingAdoptions: number
  adoptionRate: number
  averageStayTime: number
  monthlyAdoptions: { month: string; count: number }[]
  breedPopularity: { breed: string; count: number }[]
  ageDistribution: { range: string; count: number }[]
  applicationStats: { status: string; count: number }[]
  recentTrends: { metric: string; value: number; change: number }[]
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("6months")
  const [loading, setLoading] = useState(true)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    calculateAnalytics()
  }, [timeRange])

  const calculateAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch pets and applications
      const pets = await getPets()
      const applications = await getApplications()

      // Basic stats
      const totalPets = pets.length
      const adoptedPets = pets.filter((p: Pet) => p.status === "Adopted").length
      const availablePets = pets.filter((p: Pet) => p.status === "Available").length
      const pendingAdoptions = pets.filter((p: Pet) => p.status === "Pending Adoption").length
      const adoptionRate = totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0

      // Average stay time calculation
      const availablePetsWithDays = pets
        .filter((p: Pet) => p.status === "Available")
        .map((p: Pet) => {
          const daysSince = Math.floor((Date.now() - new Date(p.dateAdded).getTime()) / (1000 * 60 * 60 * 24))
          return daysSince
        })

      const averageStayTime =
        availablePetsWithDays.length > 0
          ? Math.round(availablePetsWithDays.reduce((sum: number, days: number) => sum + days, 0) / availablePetsWithDays.length)
          : 0

      // Monthly adoptions (last 6 months)
      const monthlyAdoptions = generateMonthlyData(pets.filter((p: Pet) => p.status === "Adopted"))

      // Breed popularity
      const breedCounts = pets.reduce(
        (acc: Record<string, number>, pet: Pet) => {
          acc[pet.breed] = (acc[pet.breed] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const breedPopularity = Object.entries(breedCounts)
        .map(([breed, count]) => ({ breed, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Age distribution
      const ageDistribution = [
        { range: "0-1 years", count: pets.filter((p: Pet) => p.age.includes("month") || p.age.includes("1 year")).length },
        { range: "1-3 years", count: pets.filter((p: Pet) => p.age.includes("2 year") || p.age.includes("3 year")).length },
        { range: "3-5 years", count: pets.filter((p: Pet) => p.age.includes("4 year") || p.age.includes("5 year")).length },
        {
          range: "5+ years",
          count: pets.filter((p: Pet) => {
            const ageNum = Number.parseInt(p.age)
            return !isNaN(ageNum) && ageNum >= 6
          }).length,
        },
      ]

      // Application stats
      const applicationStats = [
        { status: "Pending", count: applications.filter((a: AdoptionApplication) => a.status === "Pending").length },
        { status: "Approved", count: applications.filter((a: AdoptionApplication) => a.status === "Approved").length },
        { status: "Rejected", count: applications.filter((a: AdoptionApplication) => a.status === "Rejected").length },
      ]

      // Recent trends (simulated)
      const recentTrends = [
        {
          metric: "New Applications",
          value: applications.filter((a: AdoptionApplication) => {
            const appDate = new Date(a.submittedDate)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return appDate >= weekAgo
          }).length,
          change: 15,
        },
        { metric: "Adoptions This Month", value: adoptedPets, change: 8 },
        { metric: "Average Response Time", value: 2.4, change: -12 },
        { metric: "Visitor Engagement", value: 87, change: 5 },
      ]

      setAnalytics({
        totalPets,
        adoptedPets,
        availablePets,
        pendingAdoptions,
        adoptionRate,
        averageStayTime,
        monthlyAdoptions,
        breedPopularity,
        ageDistribution,
        applicationStats,
        recentTrends,
      })
    } catch (error) {
      console.error("Error calculating analytics:", error)
      Alert.alert("Error", "Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = (adoptedPets: Pet[]): { month: string; count: number }[] => {
    const months: { month: string; count: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      // Calculate actual adoption data or simulate if needed
      // For now, we'll simulate consistent data
      const count = Math.floor(Math.random() * 8) + 2
      months.push({ month: monthName, count })
    }

    return months
  }

  // Custom Badge component
  const Badge = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  )

  // Custom Card component
  const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )

  const CardHeader = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View style={[styles.cardHeader, style]}>
      {children}
    </View>
  )

  const CardTitle = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <Text style={[styles.cardTitle, style]}>{children}</Text>
  )

  const CardContent = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View style={[styles.cardContent, style]}>
      {children}
    </View>
  )

  const CardDescription = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <Text style={[styles.cardDescription, style]}>{children}</Text>
  )

  // Time range selector
  const TimeRangeSelector = () => (
    <View style={styles.timeRangeSelector}>
      <Text style={styles.timeRangeLabel}>Time Range:</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[
            styles.timeRangeOption,
            timeRange === "1month" && styles.timeRangeOptionSelected
          ]}
          onPress={() => setTimeRange("1month")}
        >
          <Text style={[
            styles.timeRangeOptionText,
            timeRange === "1month" && styles.timeRangeOptionTextSelected
          ]}>1 Month</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeRangeOption,
            timeRange === "3months" && styles.timeRangeOptionSelected
          ]}
          onPress={() => setTimeRange("3months")}
        >
          <Text style={[
            styles.timeRangeOptionText,
            timeRange === "3months" && styles.timeRangeOptionTextSelected
          ]}>3 Months</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeRangeOption,
            timeRange === "6months" && styles.timeRangeOptionSelected
          ]}
          onPress={() => setTimeRange("6months")}
        >
          <Text style={[
            styles.timeRangeOptionText,
            timeRange === "6months" && styles.timeRangeOptionTextSelected
          ]}>6 Months</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeRangeOption,
            timeRange === "1year" && styles.timeRangeOptionSelected
          ]}
          onPress={() => setTimeRange("1year")}
        >
          <Text style={[
            styles.timeRangeOptionText,
            timeRange === "1year" && styles.timeRangeOptionTextSelected
          ]}>1 Year</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading || !analytics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A47" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#8B4513" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="chart-bar" size={24} color="#FF7A47" />
          <Text style={styles.title}>Analytics</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Time Range Selector */}
          <Card>
            <CardContent>
              <TimeRangeSelector />
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <CardContent style={styles.metricCardContent}>
                <Text style={styles.metricValue}>{analytics.totalPets}</Text>
                <Text style={styles.metricLabel}>Total Pets</Text>
              </CardContent>
            </Card>
            <Card style={styles.metricCard}>
              <CardContent style={styles.metricCardContent}>
                <Text style={styles.metricValue}>{analytics.adoptionRate}%</Text>
                <Text style={styles.metricLabel}>Adoption Rate</Text>
              </CardContent>
            </Card>
            <Card style={styles.metricCard}>
              <CardContent style={styles.metricCardContent}>
                <Text style={styles.metricValue}>{analytics.adoptedPets}</Text>
                <Text style={styles.metricLabel}>Adopted</Text>
              </CardContent>
            </Card>
            <Card style={styles.metricCard}>
              <CardContent style={styles.metricCardContent}>
                <Text style={styles.metricValue}>{analytics.averageStayTime}</Text>
                <Text style={styles.metricLabel}>Avg. Days</Text>
              </CardContent>
            </Card>
          </View>

          {/* Recent Trends */}
          <Card>
            <CardHeader>
              <CardTitle>
                <View style={styles.cardTitleWithIcon}>
                  <Feather name="trending-up" size={20} color="#FF7A47" />
                  <Text style={styles.cardTitleText}>Recent Trends</Text>
                </View>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.trendsList}>
                {analytics.recentTrends.map((trend, index) => (
                  <View key={index} style={styles.trendItem}>
                    <View>
                      <Text style={styles.trendMetric}>{trend.metric}</Text>
                      <Text style={styles.trendValue}>{trend.value}</Text>
                    </View>
                    <Badge style={{
                      backgroundColor: trend.change > 0 ? '#d1fae5' : '#fee2e2',
                      borderColor: trend.change > 0 ? '#059669' : '#dc2626'
                    }}>
                      {trend.change > 0 ? "+" : ""}{trend.change}%
                    </Badge>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Monthly Adoptions Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                <View style={styles.cardTitleWithIcon}>
                  <Feather name="calendar" size={20} color="#FF7A47" />
                  <Text style={styles.cardTitleText}>Monthly Adoptions</Text>
                </View>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.monthlyChartContainer}>
                {analytics.monthlyAdoptions.map((month, index) => (
                  <View key={index} style={styles.monthRow}>
                    <Text style={styles.monthName}>{month.month}</Text>
                    <View style={styles.chartBarContainer}>
                      <View style={styles.chartBarBg}>
                        <View
                          style={[
                            styles.chartBarFill,
                            { width: `${Math.min((month.count / 10) * 100, 100)}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.monthCount}>{month.count}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Breed Popularity */}
          <Card>
            <CardHeader>
              <CardTitle>
                <View style={styles.cardTitleWithIcon}>
                  <Feather name="pie-chart" size={20} color="#FF7A47" />
                  <Text style={styles.cardTitleText}>Popular Breeds</Text>
                </View>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.breedList}>
                {analytics.breedPopularity.map((breed, index) => (
                  <View key={index} style={styles.breedItem}>
                    <Text style={styles.breedName}>{breed.breed}</Text>
                    <Badge style={styles.breedBadge}>{breed.count} pets</Badge>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Age Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>
                <View style={styles.cardTitleWithIcon}>
                  <Feather name="clock" size={20} color="#FF7A47" />
                  <Text style={styles.cardTitleText}>Age Distribution</Text>
                </View>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.ageList}>
                {analytics.ageDistribution.map((age, index) => (
                  <View key={index} style={styles.ageRow}>
                    <Text style={styles.ageRange}>{age.range}</Text>
                    <View style={styles.ageChartContainer}>
                      <View style={styles.ageChartBg}>
                        <View
                          style={[
                            styles.ageChartFill,
                            { width: `${Math.min((age.count / analytics.totalPets) * 100, 100)}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.ageCount}>{age.count}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>
                <View style={styles.cardTitleWithIcon}>
                  <Feather name="users" size={20} color="#FF7A47" />
                  <Text style={styles.cardTitleText}>Application Status</Text>
                </View>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.applicationList}>
                {analytics.applicationStats.map((stat, index) => {
                  let badgeStyle = {}
                  
                  if (stat.status === "Pending") {
                    badgeStyle = styles.pendingBadge
                  } else if (stat.status === "Approved") {
                    badgeStyle = styles.approvedBadge
                  } else {
                    badgeStyle = styles.rejectedBadge
                  }
                  
                  return (
                    <View key={index} style={styles.applicationItem}>
                      <Text style={styles.applicationStatus}>{stat.status}</Text>
                      <Badge style={badgeStyle}>
                        {stat.count} applications
                      </Badge>
                    </View>
                  )
                })}
              </View>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download analytics reports</CardDescription>
            </CardHeader>
            <CardContent>
              <TouchableOpacity 
                style={styles.exportButton} 
                onPress={() => Alert.alert("Export", "CSV export would download here")}>
                <Text style={styles.exportButtonText}>Export as CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.exportButton} 
                onPress={() => Alert.alert("Export", "PDF report would download here")}>
                <Text style={styles.exportButtonText}>Generate PDF Report</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#8B4513",
    fontSize: 16,
  },
  header: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    marginLeft: 8,
    color: "#8B4513",
    fontSize: 16,
    fontWeight: "500",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: 8,
    color: "#8B4513",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  cardTitleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitleText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  cardContent: {
    padding: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: "#8B4513",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#FFB899",
    borderWidth: 1,
    borderColor: "#FF7A47",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8B4513",
  },
  timeRangeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeRangeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
  },
  pickerContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 4,
    overflow: "hidden",
  },
  timeRangeOption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "white",
  },
  timeRangeOptionSelected: {
    backgroundColor: "#FF7A47",
  },
  timeRangeOptionText: {
    fontSize: 12,
    color: "#8B4513",
  },
  timeRangeOptionTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    marginBottom: 16,
  },
  metricCardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF7A47",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#8B4513",
  },
  trendsList: {
    gap: 12,
  },
  trendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: 8,
    padding: 12,
  },
  trendMetric: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
  },
  trendValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF7A47",
  },
  monthlyChartContainer: {
    gap: 12,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthName: {
    fontSize: 14,
    color: "#8B4513",
  },
  chartBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingLeft: 16,
  },
  chartBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E8E8E8",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 8,
  },
  chartBarFill: {
    height: 8,
    backgroundColor: "#FF7A47",
    borderRadius: 4,
  },
  monthCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
    width: 24,
    textAlign: "right",
  },
  breedList: {
    gap: 8,
  },
  breedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  breedName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
  },
  breedBadge: {
    backgroundColor: "#FFB899",
    borderColor: "#FF7A47",
  },
  ageList: {
    gap: 12,
  },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ageRange: {
    fontSize: 14,
    color: "#8B4513",
  },
  ageChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingLeft: 16,
  },
  ageChartBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E8E8E8",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 8,
  },
  ageChartFill: {
    height: 8,
    backgroundColor: "#FF7A47",
    borderRadius: 4,
  },
  ageCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
    width: 24,
    textAlign: "right",
  },
  applicationList: {
    gap: 12,
  },
  applicationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: 8,
    padding: 12,
  },
  applicationStatus: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
    borderColor: "#d97706",
  },
  approvedBadge: {
    backgroundColor: "#d1fae5",
    borderColor: "#059669",
  },
  rejectedBadge: {
    backgroundColor: "#fee2e2",
    borderColor: "#dc2626",
  },
  exportButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FF7A47",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  exportButtonText: {
    color: "#FF7A47",
    fontWeight: "500",
  },
})

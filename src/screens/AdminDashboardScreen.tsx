import { Ionicons } from "@expo/vector-icons"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors } from "../theme/theme"

interface AdminDashboardScreenProps {
  navigation: any
}

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const stats = [
    { label: "Available Pets", value: "24", icon: "heart-outline", color: colors.primary },
    { label: "Pending Applications", value: "8", icon: "document-text-outline", color: colors.warning },
    { label: "Successful Adoptions", value: "156", icon: "checkmark-circle-outline", color: colors.success },
    { label: "Lost Pet Reports", value: "3", icon: "alert-circle-outline", color: colors.error },
  ]

  const quickActions = [
    { title: "Add New Pet", icon: "add-circle-outline", onPress: () => navigation.navigate("AddPet") },
    { title: "Review Applications", icon: "document-text-outline", onPress: () => navigation.navigate("Applications") },
    { title: "Manage Lost Pets", icon: "alert-circle-outline", onPress: () => navigation.navigate("LostPets") },
    { title: "View Analytics", icon: "bar-chart-outline", onPress: () => navigation.navigate("Analytics") },
  ]

  const recentActivity = [
    { type: "application", message: "New adoption application for Buddy", time: "2 hours ago" },
    { type: "pet", message: "Luna was successfully adopted", time: "5 hours ago" },
    { type: "lost", message: "Lost pet report: Max (German Shepherd)", time: "1 day ago" },
    { type: "application", message: "Application approved for Bella", time: "2 days ago" },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return "document-text-outline"
      case "pet":
        return "heart-outline"
      case "lost":
        return "alert-circle-outline"
      default:
        return "information-circle-outline"
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.headerTitle}>Shelter Care</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionCard} onPress={action.onPress}>
              <Ionicons name={action.icon as any} size={24} color={colors.primary} />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          {recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name={getActivityIcon(activity.type) as any} size={16} color={colors.primary} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Ionicons name="warning-outline" size={20} color={colors.warning} />
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>Pending Verifications</Text>
            <Text style={styles.alertMessage}>5 adopter profiles need verification review</Text>
          </View>
          <TouchableOpacity 
            style={styles.alertButton}
            onPress={() => navigation.navigate("Applications")}
          >
            <Text style={styles.alertButtonText}>Review</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Ionicons name="time-outline" size={20} color={colors.info} />
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>Overdue Health Checks</Text>
            <Text style={styles.alertMessage}>3 pets need scheduled health checkups</Text>
          </View>
          <TouchableOpacity 
            style={styles.alertButton}
            onPress={() => navigation.navigate("Analytics")}
          >
            <Text style={styles.alertButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: "white",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "47%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "47%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTitle: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  activityContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  alertMessage: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  alertButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  alertButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
})

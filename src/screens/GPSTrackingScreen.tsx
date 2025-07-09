"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors, spacing } from "../theme/theme"

interface TrackedPet {
  id: string
  name: string
  type: string
  lastLocation: string
  lastUpdate: string
  batteryLevel: number
  status: "Safe" | "Alert" | "Low Battery"
}

interface GPSTrackingScreenProps {
  navigation: any
}

export default function GPSTrackingScreen({ navigation }: GPSTrackingScreenProps) {
  const [trackedPets, setTrackedPets] = useState<TrackedPet[]>([])

  useEffect(() => {
    // Mock data for tracked pets
    const mockTrackedPets: TrackedPet[] = [
      {
        id: "1",
        name: "Buddy",
        type: "Dog",
        lastLocation: "Home - 123 Main St",
        lastUpdate: "2 minutes ago",
        batteryLevel: 85,
        status: "Safe",
      },
      {
        id: "2",
        name: "Luna",
        type: "Cat",
        lastLocation: "Backyard - 123 Main St",
        lastUpdate: "5 minutes ago",
        batteryLevel: 25,
        status: "Low Battery",
      },
    ]
    setTrackedPets(mockTrackedPets)
  }, [])

  const handleViewMap = (petId: string) => {
    Alert.alert("View Map", "This would open a detailed map view showing the pet's location and movement history.")
  }

  const handleSetSafeZone = (petId: string) => {
    Alert.alert("Set Safe Zone", "This would allow you to define safe zones and get alerts when your pet leaves them.")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Safe":
        return colors.success
      case "Alert":
        return colors.error
      case "Low Battery":
        return colors.warning
      default:
        return colors.textSecondary
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return colors.success
    if (level > 20) return colors.warning
    return colors.error
  }

  const renderTrackedPetCard = (pet: TrackedPet) => (
    <View key={pet.id} style={styles.petCard}>
      <View style={styles.petHeader}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petType}>{pet.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pet.status) }]}>
          <Text style={styles.statusText}>{pet.status}</Text>
        </View>
      </View>

      <View style={styles.locationInfo}>
        <Ionicons name="location-outline" size={16} color={colors.text} />
        <Text style={styles.locationText}>{pet.lastLocation}</Text>
      </View>

      <View style={styles.updateInfo}>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.updateText}>Last update: {pet.lastUpdate}</Text>
      </View>

      <View style={styles.batteryInfo}>
        <Ionicons name="battery-half-outline" size={16} color={getBatteryColor(pet.batteryLevel)} />
        <Text style={[styles.batteryText, { color: getBatteryColor(pet.batteryLevel) }]}>
          Battery: {pet.batteryLevel}%
        </Text>
      </View>

      <View style={styles.petActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewMap(pet.id)}>
          <Ionicons name="map-outline" size={16} color="white" />
          <Text style={styles.actionButtonText}>View Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryActionButton} onPress={() => handleSetSafeZone(pet.id)}>
          <Ionicons name="shield-outline" size={16} color={colors.primary} />
          <Text style={styles.secondaryActionButtonText}>Safe Zone</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GPS Tracking</Text>
        <Text style={styles.headerSubtitle}>Monitor your pets' location and safety</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.petsContainer}>{trackedPets.map(renderTrackedPetCard)}</View>

        {trackedPets.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={colors.border} />
            <Text style={styles.emptyStateTitle}>No tracked pets</Text>
            <Text style={styles.emptyStateText}>
              Add GPS trackers to your pets to monitor their location and safety
            </Text>
            <TouchableOpacity style={styles.addTrackerButton}>
              <Text style={styles.addTrackerButtonText}>Add GPS Tracker</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>GPS Tracking Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Real-time location tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Safe zone alerts</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Location history</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="battery-half" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Battery monitoring</Text>
            </View>
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
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  petsContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  petCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  petType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  updateInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  updateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  batteryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  petActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flex: 1,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryActionButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xxl,
    marginTop: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  addTrackerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  addTrackerButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  infoSection: {
    margin: spacing.md,
    backgroundColor: "white",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
  },
})

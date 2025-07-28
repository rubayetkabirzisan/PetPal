"use client"

import { Ionicons } from "@expo/vector-icons"
import { StackNavigationProp } from "@react-navigation/stack"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors } from "../theme/theme"

interface TrackedPet {
  id: string
  name: string
  ownerName: string
  status: "Safe" | "Alert" | "Lost"
  lastLocation: string
  batteryLevel: number
  lastUpdate: string
}

interface AdminGPSTrackingScreenProps {
  navigation: StackNavigationProp<any>
}

export default function AdminGPSTrackingScreen({ navigation }: AdminGPSTrackingScreenProps) {
  const [trackedPets, setTrackedPets] = useState<TrackedPet[]>([
    {
      id: "1",
      name: "Buddy",
      ownerName: "John Smith",
      status: "Safe",
      lastLocation: "Home - 123 Main St",
      batteryLevel: 85,
      lastUpdate: "2 minutes ago",
    },
    {
      id: "2",
      name: "Luna",
      ownerName: "Sarah Johnson",
      status: "Alert",
      lastLocation: "Outside safe zone - Central Park",
      batteryLevel: 45,
      lastUpdate: "5 minutes ago",
    },
    {
      id: "3",
      name: "Max",
      ownerName: "Mike Wilson",
      status: "Lost",
      lastLocation: "Unknown - Last seen Downtown",
      batteryLevel: 15,
      lastUpdate: "2 hours ago",
    },
  ])

  const handleContactOwner = (pet: TrackedPet) => {
    Alert.alert("Contact Owner", `Contact ${pet.ownerName} about ${pet.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => console.log("Call owner") },
      { text: "Message", onPress: () => console.log("Send message") },
    ])
  }

  // Handle navigation to pet map screen
  const handleViewMap = (petId: string) => {
    // Find the pet object
    const selectedPet = trackedPets.find(pet => pet.id === petId)
    
    if (!selectedPet) {
      Alert.alert("Error", "Could not find the pet's tracking information.")
      return
    }
    
    // Navigate to PetMapScreen with pet details
    navigation.navigate("PetMap", {
      petId: selectedPet.id,
      petName: selectedPet.name,
      petType: "Pet", // Type info not available in admin view
      lastLocation: selectedPet.lastLocation,
      coordinates: {
        // Mock coordinates - in a real app these would come from the pet's tracking data
        latitude: 37.7749 + (Math.random() - 0.5) * 0.01,  // Random variation around San Francisco
        longitude: -122.4194 + (Math.random() - 0.5) * 0.01
      }
    })
  }

  const handleEmergencyAlert = (pet: TrackedPet) => {
    Alert.alert("Emergency Alert", `Send emergency alert for ${pet.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send Alert",
        style: "destructive",
        onPress: () => {
          Alert.alert("Alert Sent", "Emergency alert has been sent to local authorities and volunteers.")
        },
      },
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Safe":
        return colors.success
      case "Alert":
        return colors.warning
      case "Lost":
        return colors.error
      default:
        return colors.text
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return colors.success
    if (level > 20) return colors.warning
    return colors.error
  }

  const renderPetCard = (pet: TrackedPet) => (
    <View key={pet.id} style={styles.petCard}>
      <View style={styles.petHeader}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.ownerName}>Owner: {pet.ownerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pet.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(pet.status) }]}>{pet.status}</Text>
        </View>
      </View>

      <View style={styles.locationInfo}>
        <Ionicons name="location-outline" size={16} color={colors.text} />
        <Text style={styles.locationText}>{pet.lastLocation}</Text>
      </View>

      <View style={styles.petDetails}>
        <View style={styles.batteryInfo}>
          <Ionicons name="battery-half-outline" size={16} color={getBatteryColor(pet.batteryLevel)} />
          <Text style={[styles.batteryText, { color: getBatteryColor(pet.batteryLevel) }]}>{pet.batteryLevel}%</Text>
        </View>

        <View style={styles.updateInfo}>
          <Ionicons name="time-outline" size={16} color={colors.text} />
          <Text style={styles.updateText}>{pet.lastUpdate}</Text>
        </View>
      </View>

      <View style={styles.petActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewMap(pet.id)}>
          <Ionicons name="map-outline" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>View Map</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleContactOwner(pet)}>
          <Ionicons name="call-outline" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>Contact</Text>
        </TouchableOpacity>

        {pet.status !== "Safe" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.emergencyButton]}
            onPress={() => handleEmergencyAlert(pet)}
          >
            <Ionicons name="warning-outline" size={16} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Alert</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  const safeCount = trackedPets.filter((p) => p.status === "Safe").length
  const alertCount = trackedPets.filter((p) => p.status === "Alert").length
  const lostCount = trackedPets.filter((p) => p.status === "Lost").length

  return (
    <ScrollView style={styles.container}>
      {/* Overview Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + "20" }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.success} />
          </View>
          <Text style={styles.statNumber}>{safeCount}</Text>
          <Text style={styles.statLabel}>Safe</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.warning + "20" }]}>
            <Ionicons name="warning-outline" size={24} color={colors.warning} />
          </View>
          <Text style={styles.statNumber}>{alertCount}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.error + "20" }]}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
          </View>
          <Text style={styles.statNumber}>{lostCount}</Text>
          <Text style={styles.statLabel}>Lost</Text>
        </View>
      </View>

      {/* System Status */}
      <View style={styles.systemStatus}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <Ionicons name="wifi-outline" size={20} color={colors.success} />
            <Text style={styles.systemStatusText}>GPS Network: Online</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="server-outline" size={20} color={colors.success} />
            <Text style={styles.systemStatusText}>Tracking Server: Active</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="notifications-outline" size={20} color={colors.success} />
            <Text style={styles.systemStatusText}>Alert System: Operational</Text>
          </View>
        </View>
      </View>

      {/* Tracked Pets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tracked Pets ({trackedPets.length})</Text>
        {trackedPets.map(renderPetCard)}
      </View>

      {/* Emergency Actions */}
      <View style={styles.emergencySection}>
        <Text style={styles.sectionTitle}>Emergency Actions</Text>

        <TouchableOpacity 
          style={styles.emergencyCard}
          onPress={() => {
            Alert.alert(
              "Broadcast Alert",
              "Are you sure you want to broadcast an emergency alert to all registered users in the area?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Send Alert", style: "destructive", onPress: () => Alert.alert("Alert Sent", "Broadcast alert has been sent to all users in the area.") }
              ]
            )
          }}
        >
          <View style={styles.emergencyIcon}>
            <Ionicons name="megaphone-outline" size={24} color={colors.error} />
          </View>
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Broadcast Alert</Text>
            <Text style={styles.emergencyDescription}>Send alert to all registered users in the area</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.emergencyCard}
          onPress={() => {
            Alert.alert(
              "Contact Authorities",
              "Notify local animal control and police?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Notify", style: "default", onPress: () => Alert.alert("Authorities Notified", "Local animal control and police have been notified.") }
              ]
            )
          }}
        >
          <View style={styles.emergencyIcon}>
            <Ionicons name="people-outline" size={24} color={colors.error} />
          </View>
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Contact Authorities</Text>
            <Text style={styles.emergencyDescription}>Notify local animal control and police</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.emergencyCard}
          onPress={() => {
            Alert.alert(
              "Coordinate Search",
              "Organize volunteer search teams?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Organize", style: "default", onPress: () => Alert.alert("Search Organized", "Volunteer search teams have been notified and organized.") }
              ]
            )
          }}
        >
          <View style={styles.emergencyIcon}>
            <Ionicons name="map-outline" size={24} color={colors.error} />
          </View>
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Coordinate Search</Text>
            <Text style={styles.emergencyDescription}>Organize volunteer search teams</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
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
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  systemStatus: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  systemStatusText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  section: {
    margin: 16,
  },
  petCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  ownerName: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  petDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  batteryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  updateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  updateText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginLeft: 4,
  },
  petActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  emergencyButton: {
    backgroundColor: colors.error + "20",
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  emergencySection: {
    margin: 16,
    marginBottom: 32,
  },
  emergencyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  emergencyDescription: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
})

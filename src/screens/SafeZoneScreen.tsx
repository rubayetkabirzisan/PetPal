import { Ionicons } from "@expo/vector-icons"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import React, { useState } from "react"
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { colors, spacing } from "../theme/theme"

// Define the type for the route params
type SafeZoneParams = {
  petId: string;
  petName: string;
  petType: string;
  lastLocation: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

/**
 * SafeZoneScreen allows users to set and manage safe zones for their pets
 */
export default function SafeZoneScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ "SafeZone": SafeZoneParams }, "SafeZone">>();

  // Get params safely with fallback values
  const params = route.params || {} as SafeZoneParams;
  const petId = params.petId || 'unknown';
  const petName = params.petName || 'Unknown Pet';
  const petType = params.petType || 'Pet';
  const lastLocation = params.lastLocation || 'Location unknown';
  const coordinates = params.coordinates || { latitude: 37.7749, longitude: -122.4194 };
  
  // State for safe zone settings
  const [safeZones, setSafeZones] = useState([
    { id: '1', name: 'Home', radius: 200, active: true },
    { id: '2', name: 'Park', radius: 300, active: false },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Format coordinates for display
  const formatCoordinate = (value: number): string => {
    return value.toFixed(6)
  }

  // Handle toggling a safe zone
  const toggleSafeZone = (id: string) => {
    setSafeZones(
      safeZones.map(zone => 
        zone.id === id ? { ...zone, active: !zone.active } : zone
      )
    );
  };

  // Handle adding a new safe zone
  const handleAddSafeZone = () => {
    Alert.alert(
      "Add Safe Zone", 
      "This would open a map to set a new safe zone location.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Add", 
          onPress: () => {
            // In a real app, this would open a map interface
            Alert.alert("Success", "New safe zone added for " + petName);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{petName}'s Safe Zones</Text>
      </View>

      {/* Pet Info Card */}
      <View style={styles.petInfoCard}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{petName}</Text>
          <Text style={styles.petType}>{petType}</Text>
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={styles.locationText}>Current: {lastLocation}</Text>
        </View>
        
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesLabel}>GPS Coordinates:</Text>
          <Text style={styles.coordinatesValue}>
            Latitude: {formatCoordinate(coordinates.latitude)}
          </Text>
          <Text style={styles.coordinatesValue}>
            Longitude: {formatCoordinate(coordinates.longitude)}
          </Text>
        </View>
      </View>

      {/* Safe Zones Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Safe Zones</Text>
          <View style={styles.notificationToggle}>
            <Text style={styles.notificationText}>Alerts</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>
        
        {/* Safe Zone List */}
        {safeZones.map(zone => (
          <View key={zone.id} style={styles.zoneItem}>
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneRadius}>{zone.radius}m radius</Text>
            </View>
            <Switch
              value={zone.active}
              onValueChange={() => toggleSafeZone(zone.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          </View>
        ))}
        
        {/* Add Safe Zone Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddSafeZone}>
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Safe Zone</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={coordinates}
            title={petName}
            description={lastLocation}
            pinColor={colors.primary}
          />
          
          {/* Render safe zones as circles */}
          {safeZones
            .filter(zone => zone.active)
            .map(zone => (
              <Circle
                key={zone.id}
                center={coordinates} // In a real app, each zone would have its own coordinates
                radius={zone.radius}
                fillColor="rgba(255, 122, 71, 0.2)" // Semi-transparent primary color
                strokeColor={colors.primary}
                strokeWidth={2}
              />
            ))
          }
        </MapView>
      </View>

      {/* Information Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoPanelTitle}>About Safe Zones</Text>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text} />
          <Text style={styles.infoText}>
            Safe zones are geographic boundaries where your pet can move freely.
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.text} />
          <Text style={styles.infoText}>
            You will be notified when your pet leaves a safe zone.
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={18} color={colors.text} />
          <Text style={styles.infoText}>
            Notifications are sent in real-time when boundary is crossed.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  petInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petInfo: {
    marginBottom: spacing.md,
  },
  petName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  petType: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    backgroundColor: colors.secondary,
    padding: spacing.sm,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  coordinatesContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  coordinatesValue: {
    fontSize: 14,
    color: colors.text,
    fontFamily: "monospace",
  },
  sectionContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  notificationToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    fontSize: 14,
    color: colors.text,
    marginRight: spacing.sm,
  },
  zoneItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  zoneRadius: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  mapContainer: {
    backgroundColor: colors.surface,
    height: 220,
    margin: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoPanel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoItem: {
    flexDirection: "row",
    marginVertical: spacing.xs,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

import { Ionicons } from "@expo/vector-icons"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import React from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { colors, spacing } from "../theme/theme"

// Define the type for the route params
type PetMapParams = {
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
 * PetMapScreen displays pet location information
 */
export default function PetMapScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ PetMap: PetMapParams }, 'PetMap'>>();

  // Get params safely with fallback values
  const params = route.params || {} as PetMapParams;
  const petId = params.petId || 'unknown';
  const petName = params.petName || 'Unknown Pet';
  const petType = params.petType || 'Pet';
  const lastLocation = params.lastLocation || 'Location unknown';
  const coordinates = params.coordinates || { latitude: 37.7749, longitude: -122.4194 };
  const { latitude, longitude } = coordinates;

  // Format coordinates for display
  const formatCoordinate = (value: number): string => {
    return value.toFixed(6)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{petName}'s Location</Text>
      </View>

      {/* Location Card */}
      <View style={styles.locationCard}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{petName}</Text>
          <Text style={styles.petType}>{petType}</Text>
        </View>

        <View style={styles.addressContainer}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={styles.addressText}>{lastLocation}</Text>
        </View>
        
        {/* Coordinates Display */}
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesLabel}>GPS Coordinates:</Text>
          <Text style={styles.coordinatesValue}>
            Latitude: {formatCoordinate(latitude)}
          </Text>
          <Text style={styles.coordinatesValue}>
            Longitude: {formatCoordinate(longitude)}
          </Text>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={petName}
            description={lastLocation}
            pinColor={colors.primary}
          />
        </MapView>
      </View>
      
      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoPanelTitle}>Location Information</Text>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={18} color={colors.text} />
          <Text style={styles.infoText}>Last updated: 5 minutes ago</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="navigate-outline" size={18} color={colors.text} />
          <Text style={styles.infoText}>Accuracy: High (±5 meters)</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="battery-half-outline" size={18} color={colors.success} />
          <Text style={styles.infoText}>Tracker battery: 85%</Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="navigate" size={18} color="white" />
        <Text style={styles.actionButtonText}>Get Directions</Text>
      </TouchableOpacity>
    </ScrollView>
  )
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
  locationCard: {
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
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    backgroundColor: colors.secondary, // Using secondary instead of backgroundHighlight
    padding: spacing.sm,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  coordinatesContainer: {
    backgroundColor: colors.surface, // Using surface instead of backgroundSubtle
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
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  infoPanel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

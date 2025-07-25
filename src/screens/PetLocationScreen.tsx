import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme/theme";
// Import MapView conditionally to handle potential module missing errors
let MapView: any, Marker: any;
try {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
} catch (err) {
  console.log("Error loading react-native-maps:", err);
  // MapView will be undefined, which we'll handle in the component
}

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
 * PetLocationScreen displays pet location information
 */
function PetLocationScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ PetMap: PetMapParams }, 'PetMap'>>();
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isOpeningDirections, setIsOpeningDirections] = useState(false);
  const [staticMapLoaded, setStaticMapLoaded] = useState(false);
  const [staticMapError, setStaticMapError] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  // Check if MapView is available
  const isMapAvailable = !!MapView;

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
    return value.toFixed(6);
  };
  
  // Handle map errors
  const handleMapError = (error: Error) => {
    console.error('Map loading error:', error);
    setMapError(true);
  };
  
  // Handle map load success
  const handleMapReady = () => {
    setMapLoaded(true);
  };
  
  // Generate map preview URL
  const getStaticMapUrl = () => {
    // Option 1: OpenStreetMap static map (most reliable without API key)
    const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=600x400&markers=${latitude},${longitude},red-pushpin`;
    
    // Option 2: MapQuest Open (free tier, may work without API key for development)
    const mapQuestUrl = `https://open.mapquestapi.com/staticmap/v5/map?key=KEY&center=${latitude},${longitude}&zoom=15&size=600,400&type=map&pois=marker,${latitude},${longitude},red`;
    
    // Use the most reliable option first
    return osmUrl;
  };
  
  // Open directions to pet location in maps app
  const openDirections = () => {
    setIsOpeningDirections(true);
    
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:'
    });
    
    const latLng = `${latitude},${longitude}`;
    const label = encodeURIComponent(`${petName}'s location`);
    
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}&dirflg=d`,
      android: `${scheme}0,0?q=${latLng}(${label})&dirflg=d`
    });
    
    if (url) {
      Linking.openURL(url)
        .then(() => {
          console.log('Maps application opened successfully');
        })
        .catch((err) => {
          console.error('Error opening directions:', err);
          Alert.alert(
            "Cannot Open Maps", 
            "Unable to open maps application. Please make sure you have a maps app installed.",
            [{ text: "OK" }]
          );
        })
        .finally(() => {
          setIsOpeningDirections(false);
        });
    } else {
      setIsOpeningDirections(false);
      Alert.alert(
        "Cannot Open Maps",
        "Maps application is not available on this device.",
        [{ text: "OK" }]
      );
    }
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

      {/* Map View or Fallback */}
      <View style={styles.mapContainer}>
        {isMapAvailable && !mapError ? (
          <>
            <MapView 
              style={styles.map}
              initialRegion={{
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onMapReady={handleMapReady}
              onError={handleMapError}
            >
              <Marker
                coordinate={{ latitude: latitude, longitude: longitude }}
                title={petName}
                description={`${petType} - ${lastLocation}`}
                pinColor={colors.primary}
              >
                <View style={styles.customMarker}>
                  <Ionicons name="paw" size={20} color="white" />
                </View>
              </Marker>
            </MapView>
            {mapLoaded && (
              <View style={styles.mapOverlay}>
                <Text style={styles.mapOverlayText}>
                  Pet's location: {lastLocation}
                </Text>
              </View>
            )}
          </>
        ) : (
          // Google Maps Static Image as fallback
          <View style={styles.mapPlaceholder}>
            {/* Static map from Google Maps API */}
            <View style={styles.staticMapContainer}>
              {staticMapError ? (
                // Custom map visualization as fallback when all map services fail
                <View style={styles.customMapFallback}>
                  {/* Simple map visualization with grid */}
                  <View style={styles.mapGrid}>
                    <View style={styles.mapGridHorizontal} />
                    <View style={styles.mapGridVertical} />
                    <View style={[styles.mapGridHorizontal, {top: '75%'}]} />
                    <View style={[styles.mapGridVertical, {left: '75%'}]} />
                    
                    {/* Central marker */}
                    <View style={styles.mapFallbackMarker}>
                      <Ionicons name="paw" size={20} color="white" />
                    </View>
                    
                    {/* Compass rose */}
                    <View style={styles.compassRose}>
                      <Text style={styles.compassText}>N</Text>
                    </View>
                    
                    {/* Street-like patterns */}
                    <View style={[styles.mapStreet, {top: '30%', left: '10%', width: '40%'}]} />
                    <View style={[styles.mapStreet, {top: '60%', left: '25%', width: '70%'}]} />
                    <View style={[styles.mapStreet, {top: '20%', left: '60%', height: '40%', width: 3}]} />
                  </View>
                  
                  <Text style={styles.mapFallbackText}>
                    Pet Location: {lastLocation}
                  </Text>
                  <Text style={styles.mapFallbackCoordinates}>
                    ({formatCoordinate(latitude)}, {formatCoordinate(longitude)})
                  </Text>
                </View>
              ) : (
                <>
                  {!staticMapLoaded && (
                    <ActivityIndicator 
                      style={styles.mapLoading} 
                      size="large" 
                      color={colors.primary} 
                    />
                  )}
                  <Image
                    source={{ uri: getStaticMapUrl() }}
                    style={styles.staticMap}
                    onLoad={() => setStaticMapLoaded(true)}
                    onError={() => setStaticMapError(true)}
                    resizeMode="cover"
                  />
                </>
              )}

              {/* Map attribution - using OpenStreetMap now */}
              {/* <View style={styles.mapAttribution}>
                <Text style={styles.mapAttributionText}>Map data © OpenStreetMap contributors</Text>
              </View> */}
              
              {/* Location information overlay - only show if map is loaded */}
              {staticMapLoaded && !staticMapError && (
                <View style={styles.mapInfoOverlay}>
                  <Text style={styles.placeholderSubtext}>
                    Pet's location: {lastLocation}
                  </Text>
                  <Text style={styles.coordinatesDisplay}>
                    ({formatCoordinate(latitude)}, {formatCoordinate(longitude)})
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
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
      <TouchableOpacity 
        style={[
          styles.actionButton, 
          isOpeningDirections && styles.actionButtonDisabled
        ]}
        onPress={openDirections}
        activeOpacity={0.7}
        disabled={isOpeningDirections}
      >
        <Ionicons 
          name={isOpeningDirections ? "timer-outline" : "navigate"} 
          size={18} 
          color="white" 
        />
        <Text style={styles.actionButtonText}>
          {isOpeningDirections ? "Opening Maps..." : "Get Directions"}
        </Text>
      </TouchableOpacity>
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
    backgroundColor: colors.secondary,
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
  mapContainer: {
    height: 300,
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
  customMarker: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.sm,
    borderRadius: 6,
  },
  mapOverlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mapPlaceholder: {
    backgroundColor: colors.surface,
    height: '100%',
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  staticMapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staticMap: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  mapLoading: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1,
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    width: '100%',
    height: '100%',
  },
  mapErrorText: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  customMapFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e8eef1', // Light blue-grey for map background
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapGrid: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  mapGridHorizontal: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  mapGridVertical: {
    position: 'absolute',
    left: '50%',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  mapStreet: {
    position: 'absolute',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 1,
  },
  mapFallbackMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  compassRose: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compassText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  mapFallbackText: {
    position: 'absolute',
    bottom: 50,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: spacing.sm,
    borderRadius: 4,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  mapFallbackCoordinates: {
    position: 'absolute',
    bottom: 20,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: spacing.xs,
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.primary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  mapAttribution: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    zIndex: 10, // Ensure attribution appears on top
  },
  mapAttributionText: {
    fontSize: 8,
    color: '#444',
  },
  mapInfoOverlay: {
    position: 'absolute',
    bottom: spacing.lg, // Increased bottom margin to avoid overlap
    left: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  coordinatesDisplay: {
    fontSize: 14,
    fontFamily: "monospace",
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: "bold",
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
  actionButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.8,
  },
});

// Export the component
export default PetLocationScreen;

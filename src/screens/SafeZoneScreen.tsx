import { Ionicons } from "@expo/vector-icons"
import Slider from '@react-native-community/slider'
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import React, { useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
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
    { id: '1', name: 'Home', radius: 200, active: true, type: 'home' },
    { id: '2', name: 'Park', radius: 300, active: false, type: 'park' },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({
    name: '',
    radius: 200,
    type: 'home',
  });
  
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
    setIsAddingZone(true);
  };

  // Handle saving a new safe zone
  const handleSaveZone = () => {
    if (!newZone.name.trim()) {
      Alert.alert("Error", "Please enter a name for the safe zone");
      return;
    }

    if (editingZone) {
      // Update existing zone
      setSafeZones(
        safeZones.map(zone =>
          zone.id === editingZone
            ? { ...zone, name: newZone.name, radius: newZone.radius, type: newZone.type }
            : zone
        )
      );
      Alert.alert("Success", `Safe zone "${newZone.name}" updated successfully`);
    } else {
      // Add new zone
      const newZoneItem = {
        id: Date.now().toString(),
        name: newZone.name,
        radius: newZone.radius,
        active: true,
        type: newZone.type
      };

      setSafeZones([...safeZones, newZoneItem]);
      Alert.alert("Success", `New safe zone "${newZone.name}" added for ${petName}`);
    }

    setNewZone({ name: '', radius: 200, type: 'home' });
    setIsAddingZone(false);
    setEditingZone(null);
  };

  // Handle canceling zone creation
  const handleCancelZone = () => {
    setNewZone({ name: '', radius: 200, type: 'home' });
    setIsAddingZone(false);
    setEditingZone(null);
  };

  // Handle editing an existing zone
  const handleEditZone = (zone: any) => {
    setNewZone({
      name: zone.name,
      radius: zone.radius,
      type: zone.type
    });
    setEditingZone(zone.id);
    setIsAddingZone(true);
  };

  // Handle deleting a zone
  const handleDeleteZone = (zoneId: string, zoneName: string) => {
    Alert.alert(
      "Delete Safe Zone",
      `Are you sure you want to delete "${zoneName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setSafeZones(safeZones.filter(zone => zone.id !== zoneId));
            Alert.alert("Deleted", `Safe zone "${zoneName}" has been deleted`);
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
              <Text style={styles.zoneRadius}>{zone.radius}m radius • {zone.type}</Text>
            </View>
            <View style={styles.zoneActions}>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => handleEditZone(zone)}
              >
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteZone(zone.id, zone.name)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              </TouchableOpacity>
              <Switch
                value={zone.active}
                onValueChange={() => toggleSafeZone(zone.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
        ))}
        
        {!isAddingZone ? (
          /* Add Safe Zone Button */
          <TouchableOpacity style={styles.addButton} onPress={handleAddSafeZone}>
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Safe Zone</Text>
          </TouchableOpacity>
        ) : (
          /* Add Safe Zone Form */
          <View style={styles.addZoneForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Zone Name:</Text>
              <TextInput
                style={styles.textInput}
                value={newZone.name}
                onChangeText={(text) => setNewZone({...newZone, name: text})}
                placeholder="Enter zone name (e.g. Home, Park)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Zone Type:</Text>
              <View style={styles.typeSelector}>
                {['home', 'work', 'park', 'vet', 'other'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      newZone.type === type && styles.typeOptionSelected
                    ]}
                    onPress={() => setNewZone({...newZone, type})}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      newZone.type === type && styles.typeOptionTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Radius (meters):</Text>
              <View style={styles.radiusContainer}>
                <Text style={styles.radiusValue}>{newZone.radius}m</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={50}
                  maximumValue={1000}
                  step={10}
                  value={newZone.radius}
                  onValueChange={(value) => setNewZone({...newZone, radius: value})}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
              </View>
            </View>
            
            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelZone}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveZone}>
                <Text style={styles.saveButtonText}>
                  {editingZone ? 'Update Zone' : 'Save Zone'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  zoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editButton: {
    padding: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
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
  addZoneForm: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  typeOption: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: 'white',
  },
  radiusContainer: {
    marginTop: spacing.xs,
  },
  radiusValue: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    flex: 1,
    marginRight: spacing.xs,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.sm,
    flex: 1,
    marginLeft: spacing.xs,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
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

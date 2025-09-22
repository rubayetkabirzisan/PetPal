import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavigationHeader from "../../components/NavigationHeader";
import { catBreeds, dogBreeds, getPetById, petTypes, type Pet } from "../lib/data";
import { borderRadius, colors, spacing } from "../theme/theme";

// Types
interface FormData extends Omit<Pet, 'id'> {
  [key: string]: any;
}

interface ValidationErrors {
  [key: string]: string | null;
}

interface HealthRecord {
  date: string;
  type: string;
  description: string;
}

// Constants
const { width } = Dimensions.get('window');
const STATUS_OPTIONS = ["Available", "Pending", "Adopted", "Medical Hold"];
const GENDER_OPTIONS = ["Male", "Female"];
const SIZE_OPTIONS = ["Small", "Medium", "Large"];
const ENERGY_LEVELS = ["Low", "Medium", "High"];
const HEALTH_RECORD_TYPES = ["Vaccination", "Health Check", "Surgery", "Medication", "Treatment"];
const PERSONALITY_TRAITS = ["Friendly", "Playful", "Calm", "Energetic", "Loyal", "Intelligent", "Affectionate", "Independent", "Social", "Protective"];

export default function EditPetScreen({ route, navigation }: any) {
  const { petId } = route.params || {};
  
  // State
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>({} as FormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [editingHealthRecord, setEditingHealthRecord] = useState<HealthRecord | null>(null);

  // Custom hooks and validation
  const validateForm = useCallback((formData: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.type) errors.type = "Type is required";
    if (!formData.breed?.trim()) errors.breed = "Breed is required";
    if (!formData.age?.trim()) errors.age = "Age is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.size) errors.size = "Size is required";
    if (!formData.status) errors.status = "Status is required";
    if (!formData.location?.trim()) errors.location = "Location is required";
    if (!formData.description?.trim()) errors.description = "Description is required";
    if (!formData.shelter?.name?.trim()) errors.shelterName = "Shelter name is required";
    
    return errors;
  }, []);

  // Memoized values
  const breedOptions = useMemo(() => {
    const type = form.type?.toLowerCase();
    if (type === "dog") return dogBreeds;
    if (type === "cat") return catBreeds;
    return [];
  }, [form.type]);

  useEffect(() => {
    const loadPet = async () => {
      try {
        if (petId) {
          const found = getPetById(petId);
          if (found) {
            setPet(found);
            setForm({ ...found });
            setSelectedImages(found.images || []);
          } else {
            // Create default pet if not found
            const defaultPet: Pet = {
              id: petId || 'new',
              name: '',
              type: '',
              species: '',
              breed: '',
              age: '',
              gender: '',
              size: '',
              color: '',
              location: '',
              distance: '',
              description: '',
              personality: [],
              images: [],
              imageUrl: '',
              vaccinated: false,
              neutered: false,
              microchipped: false,
              goodWithKids: false,
              goodWithPets: false,
              energyLevel: 'Medium',
              activityLevel: 'Medium',
              hypoallergenic: false,
              adoptionFee: 0,
              status: 'Available',
              dateAdded: new Date().toISOString(),
              shelter: {
                name: '',
                contact: '',
                email: '',
                address: ''
              },
              healthRecords: []
            };
            setPet(defaultPet);
            setForm({ ...defaultPet });
          }
        }
      } catch (error) {
        console.error("Error loading pet:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [petId]);

  // Handlers
  const handleChange = useCallback((key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  }, [errors]);

  const handleSave = async () => {
    const validationErrors = validateForm(form);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert(
        "Missing Information", 
        "Please fill all required fields to continue.",
        [{ text: "Got it", style: "default" }]
      );
      return;
    }

    setSaving(true);
    try {
      // Update form with selected images
      const updatedForm = { ...form, images: selectedImages };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        "Success! 🎉", 
        `${form.name}'s profile has been updated successfully.`,
        [{ text: "Continue", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Image handling
  const handleImagePicker = useCallback(() => {
    Alert.alert(
      "Change Photo",
      "Choose an option",
      [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  }, []);

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera permission is required to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages(prev => [result.assets[0].uri, ...prev.slice(1)]);
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Gallery permission is required to select photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...newImages, ...prev].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Health record management
  const addHealthRecord = () => {
    setEditingHealthRecord(null);
    setShowHealthModal(true);
  };

  const editHealthRecord = (record: HealthRecord) => {
    setEditingHealthRecord(record);
    setShowHealthModal(true);
  };

  const handleHealthRecordSave = (record: HealthRecord) => {
    if (editingHealthRecord) {
      // Update existing record
      const updatedRecords = form.healthRecords?.map(r => 
        r.date === editingHealthRecord.date && r.type === editingHealthRecord.type ? record : r
      ) || [];
      handleChange("healthRecords", updatedRecords);
    } else {
      // Add new record
      const existingRecords = form.healthRecords || [];
      handleChange("healthRecords", [...existingRecords, record]);
    }
    setShowHealthModal(false);
  };

  const removeHealthRecord = (record: HealthRecord) => {
    const updatedRecords = form.healthRecords?.filter(r => 
      !(r.date === record.date && r.type === record.type)
    ) || [];
    handleChange("healthRecords", updatedRecords);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <NavigationHeader title="Edit Pet" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationHeader 
        title={pet?.name ? `Edit ${pet.name}` : "Add Pet"} 
        showBackButton 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <TouchableOpacity style={styles.imageWrapper} onPress={handleImagePicker}>
            <Image
              source={{
                uri: selectedImages[0] || pet?.images?.[0] || 
                "https://via.placeholder.com/140x140/FF7A47/FFFFFF?text=🐾"
              }}
              style={styles.petImage}
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageHint}>Tap to change photo</Text>
          
          {/* Additional Images Preview */}
          {selectedImages.length > 1 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.additionalImages}
              contentContainerStyle={styles.additionalImagesContent}
            >
              {selectedImages.slice(1, 5).map((image, index) => (
                <View key={index} style={styles.additionalImageWrapper}>
                  <Image source={{ uri: image }} style={styles.additionalImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index + 1)}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length < 5 && (
                <TouchableOpacity 
                  style={styles.addImageButton} 
                  onPress={handleImagePicker}
                >
                  <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="paw" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Pet Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Pet Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={form.name || ""}
                onChangeText={(value) => handleChange("name", value)}
                placeholder="Enter pet name"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.name && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorMessage}>{errors.name}</Text>
                </View>
              )}
            </View>

            {/* Pet Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Pet Type <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeSelector}>
                {petTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      form.type === type.name && styles.typeChipActive
                    ]}
                    onPress={() => handleChange("type", type.name)}
                  >
                    <Ionicons 
                      name="paw" 
                      size={20} 
                      color={form.type === type.name ? "white" : colors.primary} 
                    />
                    <Text style={[
                      styles.typeChipText,
                      form.type === type.name && styles.typeChipTextActive
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.type && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorMessage}>{errors.type}</Text>
                </View>
              )}
            </View>

            {/* Breed Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Breed <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.breed && styles.inputError]}
                value={form.breed || ""}
                onChangeText={(value) => handleChange("breed", value)}
                placeholder="Enter or select breed"
                placeholderTextColor={colors.textSecondary}
              />
              {form.type && breedOptions.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.breedSelector}
                >
                  {breedOptions.slice(0, 10).map(breed => (
                    <TouchableOpacity
                      key={breed}
                      style={[
                        styles.breedChip,
                        form.breed === breed && styles.breedChipActive
                      ]}
                      onPress={() => handleChange("breed", breed)}
                    >
                      <Text style={[
                        styles.breedChipText,
                        form.breed === breed && styles.breedChipTextActive
                      ]}>
                        {breed}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {errors.breed && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorMessage}>{errors.breed}</Text>
                </View>
              )}
            </View>

            {/* Age and Gender Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Age <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.age && styles.inputError]}
                  value={form.age || ""}
                  onChangeText={(value) => handleChange("age", value)}
                  placeholder="e.g. 2 years"
                  placeholderTextColor={colors.textSecondary}
                />
                {errors.age && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={styles.errorMessage}>{errors.age}</Text>
                  </View>
                )}
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.genderSelector}>
                  {GENDER_OPTIONS.map(gender => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderChip,
                        form.gender === gender && styles.genderChipActive
                      ]}
                      onPress={() => handleChange("gender", gender)}
                    >
                      <Ionicons
                        name={gender === 'Male' ? 'male' : 'female'}
                        size={18}
                        color={form.gender === gender ? "white" : colors.primary}
                      />
                      <Text style={[
                        styles.genderChipText,
                        form.gender === gender && styles.genderChipTextActive
                      ]}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.gender && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={styles.errorMessage}>{errors.gender}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Size and Color Row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Size <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.sizeSelector}>
                  {SIZE_OPTIONS.map(size => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeChip,
                        form.size === size && styles.sizeChipActive
                      ]}
                      onPress={() => handleChange("size", size)}
                    >
                      <Text style={[
                        styles.sizeChipText,
                        form.size === size && styles.sizeChipTextActive
                      ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.size && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={styles.errorMessage}>{errors.size}</Text>
                  </View>
                )}
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.input}
                  value={form.color || ""}
                  onChangeText={(value) => handleChange("color", value)}
                  placeholder="e.g. Brown, White"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Location Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.locationInputContainer}>
                <Ionicons name="location" size={20} color={colors.primary} style={styles.locationIcon} />
                <TextInput
                  style={[
                    styles.locationInput,
                    errors.location && styles.inputError
                  ]}
                  placeholder="Enter location or tap map"
                  value={form.location || ""}
                  onChangeText={(v) => handleChange("location", v)}
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => setShowMap(true)}
                >
                  <Ionicons name="map" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {errors.location && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorMessage}>{errors.location}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                value={form.description || ""}
                onChangeText={(value) => handleChange("description", value)}
                placeholder="Tell us about this pet's personality, needs, and special characteristics..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.description && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorMessage}>{errors.description}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Map Picker Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <MapPickerModal
          onLocationSelect={(location) => {
            handleChange("location", location.address);
            handleChange("coordinates", { 
              latitude: location.latitude, 
              longitude: location.longitude 
            });
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
        />
      </Modal>
    </View>
  );
}

// MapPicker Component
interface MapPickerModalProps {
  onLocationSelect: (location: { 
    latitude: number; 
    longitude: number; 
    address: string;
  }) => void;
  onClose: () => void;
}

function MapPickerModal({ onLocationSelect, onClose }: MapPickerModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to use the map.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Default to a central location if permission denied
      setSelectedLocation({
        latitude: 37.7749,
        longitude: -122.4194,
      });
    }
  };

  const handleMapPress = async (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setSelectedLocation(coordinate);
    
    setLoading(true);
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      
      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        const formattedAddress = [
          location.name,
          location.street,
          location.city,
          location.region,
          location.country
        ].filter(Boolean).join(', ');
        
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress(`${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({
        ...selectedLocation,
        address: address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`,
      });
    }
  };

  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapHeader}>
        <TouchableOpacity onPress={onClose} style={styles.mapCloseButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.mapTitle}>Select Location</Text>
        <TouchableOpacity 
          onPress={handleConfirm} 
          style={styles.mapConfirmButton}
          disabled={!selectedLocation}
        >
          <Text style={[
            styles.mapConfirmText,
            !selectedLocation && styles.mapConfirmTextDisabled
          ]}>
            Confirm
          </Text>
        </TouchableOpacity>
      </View>

      {selectedLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={selectedLocation}
            title="Selected Location"
            description={address || "Tap to select location"}
          />
        </MapView>
      )}

      <View style={styles.mapFooter}>
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={styles.addressText}>
            {loading ? "Getting address..." : (address || "Tap on map to select location")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: spacing.xxl,
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.md,
  },
  errorSubText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  // Hero Image Section
  heroSection: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
  },
  imageWrapper: {
    position: "relative",
    marginBottom: spacing.sm,
  },
  petImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.sm,
  },
  cameraButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  
  // Additional Images
  additionalImages: {
    marginTop: spacing.lg,
    maxHeight: 80,
  },
  additionalImagesContent: {
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  additionalImageWrapper: {
    position: "relative",
    marginRight: spacing.sm,
  },
  additionalImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 10,
  },
  addImageButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },

  // Form Container
  formContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    marginBottom: spacing.md,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginLeft: spacing.sm,
  },

  // Input Fields
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    elevation: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },

  // Error Messages
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  errorMessage: {
    fontSize: 12,
    color: colors.error,
    marginLeft: spacing.xs,
  },

  // Type Selector
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 0,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  typeChipTextActive: {
    color: "white",
  },

  // Breed Selector
  breedSelector: {
    marginTop: spacing.sm,
  },
  breedChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  breedChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  breedChipText: {
    fontSize: 14,
    color: colors.text,
  },
  breedChipTextActive: {
    color: "white",
  },

  // Row Layout
  rowContainer: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },

  // Gender Selector
  genderSelector: {
    flexDirection: "row",
    gap: spacing.md,
  },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    elevation: 1,
  },
  genderChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginLeft: spacing.xs,
  },
  genderChipTextActive: {
    color: "white",
  },

  // Size Selector
  sizeSelector: {
    flexDirection: "row",
    gap: spacing.md,
  },
  sizeChip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    elevation: 1,
  },
  sizeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  sizeChipTextActive: {
    color: "white",
  },

  // Location Input
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  locationIcon: {
    marginLeft: spacing.md,
  },
  locationInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  mapButton: {
    padding: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },

  // Action Section
  actionSection: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.primary + "80",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: spacing.xs,
  },

  // Health Toggles
  healthToggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  healthToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  healthToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginLeft: spacing.xs,
  },
  healthToggleTextActive: {
    color: "white",
  },

  // Add Button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: spacing.xs,
  },

  // Health Records
  healthRecord: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  healthRecordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  healthRecordType: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginLeft: spacing.xs,
    flex: 1,
  },
  healthRecordDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  healthRecordDescription: {
    fontSize: 14,
    color: colors.text,
    marginTop: spacing.xs,
  },
  healthRecordVet: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },

  // Trait Chips
  traitChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  traitChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  traitChipText: {
    fontSize: 14,
    color: colors.text,
  },
  traitChipTextActive: {
    color: "white",
  },

  // Toggle Row
  toggleRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text,
    marginLeft: spacing.xs,
  },
  toggleButtonTextActive: {
    color: "white",
  },

  // Map Styles
  mapContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mapCloseButton: {
    padding: spacing.sm,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  mapConfirmButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  mapConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  mapConfirmTextDisabled: {
    color: colors.textSecondary,
  },
  map: {
    flex: 1,
  },
  mapFooter: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

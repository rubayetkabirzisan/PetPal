import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavigationHeader from "../../components/NavigationHeader";
import { catBreeds, dogBreeds, getPetById, petTypes, type Pet } from "../lib/data";
import { borderRadius, colors, spacing } from "../theme/theme";

// Types
type EditPetScreenRouteProp = RouteProp<{ params: { petId: string } }, "params">;

interface FormData extends Omit<Pet, 'id'> {
  [key: string]: any;
}

interface ValidationErrors {
  [key: string]: string | null;
}

// Constants
const { width } = Dimensions.get('window');
const STATUS_OPTIONS = ["Available", "Pending", "Adopted", "Medical Hold"];
const GENDER_OPTIONS = ["Male", "Female"];
const SIZE_OPTIONS = ["Small", "Medium", "Large"];

// Custom Hooks
const useFormValidation = () => {
  const validate = useCallback((form: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    if (!form.name?.trim()) errors.name = "Name is required";
    if (!form.type) errors.type = "Type is required";
    if (!form.breed?.trim()) errors.breed = "Breed is required";
    if (!form.age?.trim()) errors.age = "Age is required";
    if (!form.gender) errors.gender = "Gender is required";
    if (!form.size) errors.size = "Size is required";
    if (!form.status) errors.status = "Status is required";
    if (!form.location?.trim()) errors.location = "Location is required";
    if (!form.description?.trim()) errors.description = "Description is required";
    
    return errors;
  }, []);

  return { validate };
};

const useAnimations = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return { fadeAnim, slideAnim, startAnimations };
};

// Components
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingText}>Loading pet details...</Text>
  </View>
);

const ErrorScreen = () => (
  <View style={styles.loadingContainer}>
    <Ionicons name="sad-outline" size={64} color={colors.text + "60"} />
    <Text style={styles.errorText}>Pet not found</Text>
    <Text style={styles.errorSubText}>The pet you're looking for doesn't exist.</Text>
  </View>
);

const FormSection: React.FC<{
  icon: string;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <View style={styles.formSection}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string | null;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
}> = ({ label, value, onChangeText, placeholder, error, multiline, numberOfLines, required }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    <TextInput
      style={[
        styles.input,
        multiline && styles.textArea,
        error && styles.inputError
      ]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.text + "60"}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? "top" : "center"}
    />
    {error && (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={16} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

const ChipSelector: React.FC<{
  options: Array<{ id: string; name: string; icon?: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
  horizontal?: boolean;
}> = ({ options, selectedValue, onSelect, horizontal = true }) => (
  <ScrollView 
    horizontal={horizontal} 
    showsHorizontalScrollIndicator={false} 
    style={horizontal ? styles.chipScrollView : undefined}
    contentContainerStyle={!horizontal ? styles.chipGrid : undefined}
  >
    {options.map((option) => (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.chip,
          selectedValue === option.name && styles.chipActive
        ]}
        onPress={() => onSelect(option.name)}
      >
        {option.icon && (
          <Ionicons 
            name={option.icon as any} 
            size={16} 
            color={selectedValue === option.name ? "white" : colors.primary} 
          />
        )}
        <Text style={[
          styles.chipText,
          selectedValue === option.name && styles.chipTextActive
        ]}>
          {option.name}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const ToggleCard: React.FC<{
  icon: string;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}> = ({ icon, label, value, onToggle }) => (
  <View style={styles.toggleCard}>
    <View style={styles.toggleHeader}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.toggleLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ true: colors.primary, false: colors.border }}
      thumbColor={value ? "white" : "#f4f3f4"}
    />
  </View>
);

const MapPicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (location: string) => void;
  initialLocation?: string;
}> = ({ visible, onClose, onSave, initialLocation }) => {
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion] = useState({
    latitude: 30.2672,
    longitude: -97.7431,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const handleMapPress = useCallback((e: any) => {
    setMarker(e.nativeEvent.coordinate);
  }, []);

  const handleSave = useCallback(() => {
    if (marker) {
      onSave(`${marker.latitude.toFixed(5)}, ${marker.longitude.toFixed(5)}`);
      onClose();
    } else {
      Alert.alert("Select a location", "Tap on the map to pick a location.");
    }
  }, [marker, onSave, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.mapModalOverlay}>
        <View style={styles.mapModalContent}>
          <Text style={styles.mapModalTitle}>Pick Location on Map</Text>
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            onPress={handleMapPress}
          >
            {marker && <Marker coordinate={marker} />}
          </MapView>
          <View style={styles.mapModalActions}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
export default function EditPetScreen(props: any) {
  const { route, navigation } = props;
  const { petId } = route.params || {};

  // State
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>({} as FormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showMap, setShowMap] = useState(false);
  const [saving, setSaving] = useState(false);

  // Custom hooks
  const { validate } = useFormValidation();
  const { fadeAnim, slideAnim, startAnimations } = useAnimations();

  // Memoized values
  const breedOptions = useMemo(() => {
    const type = form.type?.toLowerCase();
    if (type === "dog") return dogBreeds.map(breed => ({ id: breed, name: breed }));
    if (type === "cat") return catBreeds.map(breed => ({ id: breed, name: breed }));
    return [];
  }, [form.type]);

  const petTypeOptions = useMemo(() => 
    petTypes.map(type => ({
      id: type.id,
      name: type.name,
      icon: type.id === 'dog' ? 'paw' : type.id === 'cat' ? 'paw' : 'heart'
    })), []
  );

  const genderOptions = useMemo(() => 
    GENDER_OPTIONS.map(gender => ({
      id: gender.toLowerCase(),
      name: gender,
      icon: gender === 'Male' ? 'male' : 'female'
    })), []
  );

  const sizeOptions = useMemo(() => 
    SIZE_OPTIONS.map(size => ({ id: size.toLowerCase(), name: size })), []
  );

  // Effects
  useEffect(() => {
    const loadPet = async () => {
      try {
        const found = getPetById(petId);
        if (found) {
          setPet(found);
          setForm({ ...found });
        }
      } catch (error) {
        console.error('Error loading pet:', error);
      } finally {
        setLoading(false);
        startAnimations();
      }
    };

    loadPet();
  }, [petId, startAnimations]);

  // Handlers
  const handleChange = useCallback((key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  }, [errors]);

  const handleSave = useCallback(async () => {
    const validationErrors = validate(form);
    
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
      // Simulate API call
      await new Promise(resolve => setTimeout(() => resolve(undefined), 1500));
      
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
  }, [form, validate, navigation]);

  const handleImagePicker = useCallback(() => {
    Alert.alert(
      "Change Photo",
      "Choose an option",
      [
        { text: "Camera", onPress: () => console.log("Camera selected") },
        { text: "Gallery", onPress: () => console.log("Gallery selected") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  }, []);

  // Render methods
  if (loading) return <LoadingScreen />;
  if (!pet) return <ErrorScreen />;

  return (
    <View style={{ flex: 1 }}>
      <NavigationHeader title={`Edit ${pet.name}`} showBackButton={true} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[
          styles.container, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContent}>
              {/* Image Section */}
              <View style={styles.imageSection}>
                <TouchableOpacity 
                  style={styles.imageContainer}
                  onPress={handleImagePicker}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ 
                      uri: form.images?.[0] || pet.images?.[0] || 
                      "https://via.placeholder.com/150x150" 
                    }}
                    style={styles.image}
                  />
                  <View style={styles.imageOverlay}>
                    <View style={styles.imageEditButton}>
                      <Ionicons name="camera" size={20} color="white" />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={styles.imageHint}>Tap to change photo</Text>
              </View>

          {/* Basic Information */}
          <FormSection icon="information-circle" title="Basic Information">
            <InputField
              label="Pet Name"
              value={form.name || ""}
              onChangeText={(v) => handleChange("name", v)}
              placeholder="Enter pet's name"
              error={errors.name}
              required
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Pet Type <Text style={styles.required}>*</Text>
              </Text>
              <ChipSelector
                options={petTypeOptions}
                selectedValue={form.type || ""}
                onSelect={(v) => handleChange("type", v)}
              />
              {errors.type && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errors.type}</Text>
                </View>
              )}
            </View>

            <InputField
              label="Breed"
              value={form.breed || ""}
              onChangeText={(v) => handleChange("breed", v)}
              placeholder="Enter or select breed"
              error={errors.breed}
              required
            />

            {breedOptions.length > 0 && (
              <ChipSelector
                options={breedOptions.slice(0, 10)}
                selectedValue={form.breed || ""}
                onSelect={(v) => handleChange("breed", v)}
              />
            )}

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <InputField
                  label="Age"
                  value={form.age || ""}
                  onChangeText={(v) => handleChange("age", v)}
                  placeholder="e.g. 3 years"
                  error={errors.age}
                  required
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.genderContainer}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.genderChip,
                        form.gender === option.name && styles.chipActive
                      ]}
                      onPress={() => handleChange("gender", option.name)}
                    >
                      <Ionicons 
                        name={option.icon as any} 
                        size={16} 
                        color={form.gender === option.name ? "white" : colors.primary} 
                      />
                      <Text style={[
                        styles.chipText,
                        form.gender === option.name && styles.chipTextActive
                      ]}>
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.gender && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={styles.errorText}>{errors.gender}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>
                  Size <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.sizeContainer}>
                  {sizeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sizeChip,
                        form.size === option.name && styles.chipActive
                      ]}
                      onPress={() => handleChange("size", option.name)}
                    >
                      <Text style={[
                        styles.chipText,
                        form.size === option.name && styles.chipTextActive
                      ]}>
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.size && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={styles.errorText}>{errors.size}</Text>
                  </View>
                )}
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Color"
                  value={form.color || ""}
                  onChangeText={(v) => handleChange("color", v)}
                  placeholder="e.g. Brown, White"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.locationInputContainer}>
                <Ionicons name="location" size={20} color={colors.primary} style={styles.locationIcon} />
                <TextInput
                  style={[
                    styles.input,
                    styles.locationInput,
                    errors.location && styles.inputError
                  ]}
                  placeholder="City, State or Lat, Lng"
                  value={form.location || ""}
                  onChangeText={(v) => handleChange("location", v)}
                  placeholderTextColor={colors.text + "60"}
                />
                <TouchableOpacity 
                  style={styles.mapButton} 
                  onPress={() => setShowMap(true)}
                >
                  <Ionicons name="map" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {errors.location && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errors.location}</Text>
                </View>
              )}
            </View>
          </FormSection>

          {/* Status Section */}
          <FormSection icon="checkmark-circle" title="Availability Status">
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusChip,
                    form.status === status && styles.statusChipActive
                  ]}
                  onPress={() => handleChange("status", status)}
                >
                  <View style={[
                    styles.statusIndicator,
                    form.status === status && styles.statusIndicatorActive
                  ]} />
                  <Text style={[
                    styles.statusText,
                    form.status === status && styles.statusTextActive
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.status && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.status}</Text>
              </View>
            )}
          </FormSection>

          {/* Description Section */}
          <FormSection icon="document-text" title="About This Pet">
            <InputField
              label="Description"
              value={form.description || ""}
              onChangeText={(v) => handleChange("description", v)}
              placeholder="Tell us about this pet's personality, habits, and what makes them special..."
              error={errors.description}
              multiline
              numberOfLines={4}
              required
            />

            <InputField
              label="Personality Traits"
              value={form.personality?.join(", ") || ""}
              onChangeText={(v) => handleChange("personality", 
                v.split(",").map((s: string) => s.trim()).filter(Boolean)
              )}
              placeholder="Friendly, Playful, Calm, Energetic..."
            />
            <Text style={styles.inputHint}>Separate traits with commas</Text>
          </FormSection>

          {/* Health & Care Section */}
          <FormSection icon="medical" title="Health & Care">
            <View style={styles.toggleGrid}>
              <ToggleCard
                icon="shield-checkmark"
                label="Vaccinated"
                value={!!form.vaccinated}
                onToggle={(v) => handleChange("vaccinated", v)}
              />
              <ToggleCard
                icon="cut"
                label="Neutered"
                value={!!form.neutered}
                onToggle={(v) => handleChange("neutered", v)}
              />
              <ToggleCard
                icon="radio"
                label="Microchipped"
                value={!!form.microchipped}
                onToggle={(v) => handleChange("microchipped", v)}
              />
              <ToggleCard
                icon="people"
                label="Good w/ Kids"
                value={!!form.goodWithKids}
                onToggle={(v) => handleChange("goodWithKids", v)}
              />
              <ToggleCard
                icon="paw"
                label="Good w/ Pets"
                value={!!form.goodWithPets}
                onToggle={(v) => handleChange("goodWithPets", v)}
              />
            </View>
          </FormSection>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Ionicons name="close" size={20} color={colors.text} />
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

          {/* Map Picker Modal */}
          <MapPicker
            visible={showMap}
            onClose={() => setShowMap(false)}
            onSave={(location) => handleChange("location", location)}
            initialLocation={form.location}
          />
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingBottom: spacing.xxl,
  },
  formContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text + "80",
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
    color: colors.text + "60",
    textAlign: "center",
    marginTop: spacing.xs,
  },
  
  // Header - Modern gradient header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + "10",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  
  // Image Section - Enhanced with shadow and border
  imageSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  imageContainer: {
    position: "relative",
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.primary + "20",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 4,
  },
  imageEditButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 6,
  },
  imageHint: {
    fontSize: 14,
    color: colors.text + "60",
    textAlign: "center",
    fontWeight: "500",
  },
  
  // Form Sections - Modern cards with better spacing
  formSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "20",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginLeft: spacing.sm,
  },
  
  // Input Groups - Improved styling
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border + "80",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.error + "08",
  },
  inputHint: {
    fontSize: 12,
    color: colors.text + "60",
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  
  // Location Input - Refined styling
  locationInputContainer: {
    position: "relative",
  },
  locationInput: {
    paddingLeft: 45,
    paddingRight: 50,
  },
  locationIcon: {
    position: "absolute",
    left: 15,
    top: 14,
    zIndex: 1,
  },
  mapButton: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 6,
    zIndex: 2,
  },
  
  // Row Layouts
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  
  // Chips - Modern rounded style
  chipScrollView: {
    marginBottom: spacing.xs,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border + "80",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    gap: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "white",
  },
  
  // Gender Chips
  genderContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border + "80",
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  
  // Size Chips
  sizeContainer: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  sizeChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border + "80",
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  
  // Status Grid - Improved card design
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border + "80",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: (width - spacing.lg * 4) / 2,
    minHeight: 44,
  },
  statusChipActive: {
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  statusIndicatorActive: {
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  statusTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  
  // Toggle Grid - Modern cards
  toggleGrid: {
    gap: spacing.md,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border + "40",
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    marginLeft: spacing.sm,
  },
  
  // Action Section - Improved button styling
  actionSection: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Error Styles
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  // errorText style already defined above; removed duplicate.
  
  // Map Modal - Enhanced styling
  mapModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapModalContent: {
    width: "90%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mapModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    marginBottom: 20,
  },
  mapModalActions: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  modalSaveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
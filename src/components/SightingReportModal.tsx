import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from "expo-image-picker";
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Keyboard,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDateTimePicker } from "../hooks/useDateTimePicker";
import { reportSighting, type LostPet } from "../lib/lost-pets";
import { validateSightingForm } from "../utils/formValidation";
import {
    ImageInfo,
    enforceMaxPhotos,
    getImageCountString,
    prepareImagesForSubmission,
    processImagePickerResult
} from "../utils/imageUtils";
import { colors, spacing } from "../theme/theme";

interface SightingReportModalProps {
  visible: boolean;
  onClose: () => void;
  pet: LostPet | null;
}

interface SightingFormData {
  petId: string;
  location: string;
  description: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  photos: ImageInfo[];
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function SightingReportModal({ visible, onClose, pet }: SightingReportModalProps) {
  const [sightingForm, setSightingForm] = useState<SightingFormData>({
    petId: '',
    location: '',
    description: '',
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    photos: [],
    coordinates: null
  });
  
  const dateTimePicker = useDateTimePicker(new Date());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImagePickerLoading, setIsImagePickerLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 30.2672,
    longitude: -97.7431,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapRef = useRef<any>(null);
  const MAX_PHOTOS = 4;

  useEffect(() => {
    if (visible && pet) {
      setSightingForm({
        petId: pet.id,
        location: '',
        description: '',
        reporterName: '',
        reporterPhone: '',
        reporterEmail: '',
        photos: [],
        coordinates: null
      });
      setFormErrors({});
      dateTimePicker.setDate(new Date());
      setShowMap(false);
    }
  }, [visible, pet]);

  useEffect(() => {
    if (showMap && mapRef.current) {
      setTimeout(() => {
        setSightingForm(prev => ({ ...prev, coordinates: null }));
        setTimeout(() => {
          getCurrentLocation();
        }, 500);
      }, 300);
    }
  }, [showMap]);

  const handlePickImages = async () => {
    try {
      setIsImagePickerLoading(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission required", "You need to grant permission to access your photos");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_PHOTOS - sightingForm.photos.length,
      });

      if (!result.canceled && result.assets) {
        const processedImages = processImagePickerResult(result, sightingForm.photos);
        const limitedImages = enforceMaxPhotos(processedImages, MAX_PHOTOS);
        setSightingForm(prev => ({ ...prev, photos: limitedImages }));
        if (processedImages.length > MAX_PHOTOS) {
          Alert.alert("Maximum photo limit", `Only ${MAX_PHOTOS} photos can be attached.`);
        }
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images. Please try again.");
    } finally {
      setIsImagePickerLoading(false);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setSightingForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };
  
  const handleFormChange = (field: keyof SightingFormData, value: string) => {
    setSightingForm(prevForm => ({ ...prevForm, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = {...prev};
        delete updated[field];
        return updated;
      });
    }
  };
  
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }, 300);
    }
    setMapRegion(prev => ({ ...prev, latitude: coordinate.latitude, longitude: coordinate.longitude }));
    setSightingForm(prev => ({ ...prev, coordinates: { latitude: coordinate.latitude, longitude: coordinate.longitude } }));
    
    (async () => {
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude
        });
        if (addressResponse && addressResponse.length > 0) {
          const address = addressResponse[0];
          const locationString = [address.street, address.city, address.region, address.postalCode].filter(Boolean).join(', ');
          if (locationString) {
            handleFormChange('location', locationString);
          } else {
            handleFormChange('location', `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`);
          }
        } else {
          handleFormChange('location', `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`);
        }
      } catch (error) {
        handleFormChange('location', `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`);
      }
    })();
  };
  
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is needed to show your current location on the map.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const newRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
      setMapRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1500);
      }
      setSightingForm(prev => ({ ...prev, coordinates: { latitude, longitude } }));
      
      try {
        const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addressResponse && addressResponse.length > 0) {
          const address = addressResponse[0];
          const locationString = [address.street, address.city, address.region, address.postalCode].filter(Boolean).join(', ');
          if (locationString) {
            handleFormChange('location', locationString);
          } else {
            handleFormChange('location', `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } else {
          handleFormChange('location', `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      } catch (geocodeError) {
        handleFormChange('location', `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      Alert.alert("Location Error", "Unable to get your current location.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const toggleMapView = () => {
    const newState = !showMap;
    setShowMap(newState);
    if (newState) {
      setMapRegion({
        latitude: 30.2672,
        longitude: -97.7431,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      });
      setSightingForm(prev => ({ ...prev, coordinates: null }));
      setTimeout(() => {
        getCurrentLocation();
      }, 800);
    }
  };
  
  const isFormValid = React.useMemo(() => {
    return !!sightingForm.location && !!sightingForm.reporterName;
  }, [sightingForm.location, sightingForm.reporterName]);
  
  const handleSubmitSighting = async () => {
    if (!isFormValid || !pet) return;
    setIsSubmitting(true);
    
    try {
      const photoUris = prepareImagesForSubmission(sightingForm.photos);
      const locationText = sightingForm.coordinates 
        ? `${sightingForm.location} (${sightingForm.coordinates.latitude.toFixed(6)}, ${sightingForm.coordinates.longitude.toFixed(6)})`
        : sightingForm.location;
        
      await reportSighting({
        petId: pet.id,
        location: locationText,
        date: dateTimePicker.getDateTimeString(),
        time: dateTimePicker.getFormattedTime(),
        description: sightingForm.description,
        reporterName: sightingForm.reporterName,
        reporterPhone: sightingForm.reporterPhone,
        reporterEmail: sightingForm.reporterEmail,
        photos: photoUris
      });
      
      Alert.alert(
        "Sighting Reported",
        `Thank you for reporting a sighting of ${pet.name} at ${locationText}. The owner has been notified.`,
        [{ text: "OK", onPress: onClose }]
      );
    } catch (error) {
      Alert.alert("Error", "There was a problem submitting your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => { if (!isSubmitting) onClose(); }}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalContainer}>
          <View style={styles.sightingModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report Sighting</Text>
                <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {pet && (
                <View style={styles.petSummary}>
                  <Text style={styles.formSubTitle}>Help reunite {pet.name} with their family</Text>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Location Seen *</Text>
                    <View style={styles.locationInputContainer}>
                      <TextInput
                        style={[
                          styles.formInput,
                          styles.formLocationInput,
                          formErrors.location ? styles.inputError : null
                        ]}
                        placeholder="Address or area"
                        placeholderTextColor={colors.textSecondary}
                        value={sightingForm.location}
                        onChangeText={(text) => handleFormChange('location', text)}
                      />
                      <TouchableOpacity style={styles.mapButton} onPress={toggleMapView}>
                        <MaterialIcons name="map" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    {formErrors.location && (
                      <Text style={styles.errorMessage}>{formErrors.location}</Text>
                    )}
                    
                    {showMap && (
                      <View style={styles.mapContainer}>
                        <MapView
                          ref={mapRef}
                          style={styles.map}
                          provider={PROVIDER_GOOGLE}
                          initialRegion={{ ...mapRegion, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                          onRegionChangeComplete={(region: any) => setMapRegion(region)}
                          onPress={handleMapPress}
                          showsUserLocation={true}
                        >
                          {sightingForm.coordinates && (
                            <Marker
                              coordinate={{
                                latitude: sightingForm.coordinates.latitude,
                                longitude: sightingForm.coordinates.longitude
                              }}
                              pinColor={colors.primary}
                            />
                          )}
                        </MapView>
                        <View style={styles.mapOverlay}>
                          <Text style={styles.mapInstructions}>Tap on the map to mark the exact location where you saw the pet</Text>
                          <View style={styles.mapButtonRow}>
                            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation} disabled={isLoadingLocation}>
                              <Ionicons name="locate" size={18} color={colors.primary} />
                              <Text style={styles.locationButtonText}>Use My Location</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmLocationButton} onPress={toggleMapView}>
                              <Text style={styles.confirmLocationText}>{sightingForm.coordinates ? "Confirm Location" : "Cancel"}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: spacing.sm }]}>
                      <Text style={styles.formLabel}>Date *</Text>
                      <TouchableOpacity
                        style={[styles.dateInput, formErrors.date ? styles.inputError : null]}
                        onPress={dateTimePicker.toggleDatePicker}
                      >
                        <Text style={styles.dateInputText}>{dateTimePicker.getFormattedDate()}</Text>
                        <Ionicons name="calendar-outline" size={18} color={colors.text} />
                      </TouchableOpacity>
                      {dateTimePicker.showDatePicker && (
                        <DateTimePicker
                          value={dateTimePicker.date}
                          mode="date"
                          display="default"
                          onChange={dateTimePicker.onChangeDatePicker}
                          maximumDate={new Date()}
                        />
                      )}
                    </View>
                    
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Time</Text>
                      <TouchableOpacity style={styles.dateInput} onPress={dateTimePicker.toggleTimePicker}>
                        <Text style={styles.dateInputText}>{dateTimePicker.getFormattedTime()}</Text>
                        <Ionicons name="time-outline" size={18} color={colors.text} />
                      </TouchableOpacity>
                      {dateTimePicker.showTimePicker && (
                        <DateTimePicker
                          value={dateTimePicker.date}
                          mode="time"
                          display="default"
                          onChange={dateTimePicker.onChangeTimePicker}
                        />
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      placeholder="What did you see? Pet's condition, behavior, etc."
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={4}
                      value={sightingForm.description}
                      onChangeText={(text) => handleFormChange('description', text)}
                    />
                  </View>
                  
                  <Text style={styles.formSectionTitle}>Your Contact Information</Text>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Your Name *</Text>
                    <TextInput
                      style={[styles.formInput, formErrors.reporterName ? styles.inputError : null]}
                      placeholder="Demo User"
                      placeholderTextColor={colors.textSecondary}
                      value={sightingForm.reporterName}
                      onChangeText={(text) => handleFormChange('reporterName', text)}
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Phone</Text>
                    <TextInput
                      style={[styles.formInput, formErrors.reporterPhone ? styles.inputError : null]}
                      placeholder="Phone number"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="phone-pad"
                      value={sightingForm.reporterPhone}
                      onChangeText={(text) => handleFormChange('reporterPhone', text)}
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Email</Text>
                    <TextInput
                      style={[styles.formInput, formErrors.reporterEmail ? styles.inputError : null]}
                      placeholder="demo@petpal.com"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={sightingForm.reporterEmail}
                      onChangeText={(text) => handleFormChange('reporterEmail', text)}
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <View style={styles.formSectionHeader}>
                      <Text style={styles.formLabel}>Photos (if available)</Text>
                      <Text style={styles.photoCounter}>{getImageCountString(sightingForm.photos.length, MAX_PHOTOS)}</Text>
                    </View>
                    <Text style={styles.formHelperText}>Add photos if you have them</Text>
                    
                    <View style={styles.photoPreviewContainer}>
                      {sightingForm.photos.length > 0 ? (
                        <FlatList
                          horizontal
                          data={sightingForm.photos}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item, index }) => (
                            <View style={styles.photoPreviewItem}>
                              <Image source={{ uri: item.uri }} style={styles.photoThumbnail} resizeMode="cover" />
                              <TouchableOpacity style={styles.removePhotoButton} onPress={() => handleRemoveImage(index)} disabled={isSubmitting}>
                                <Ionicons name="close-circle" size={24} color={colors.error} />
                              </TouchableOpacity>
                            </View>
                          )}
                          style={styles.photoList}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: spacing.sm }}
                        />
                      ) : (
                        <View style={styles.noPhotosPlaceholder}>
                          <Text style={styles.placeholderText}>No photos selected</Text>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={styles.addPhotoButton}
                      onPress={handlePickImages}
                      disabled={isSubmitting || isImagePickerLoading || sightingForm.photos.length >= MAX_PHOTOS}
                    >
                      <Ionicons name={isImagePickerLoading ? "hourglass-outline" : "camera-outline"} size={20} color={colors.primary} />
                      <Text style={styles.addPhotoText}>{isImagePickerLoading ? "Loading..." : "Add Photos"}</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.formButtonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSubmitting}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.submitButton, !isFormValid && styles.disabledButton]} 
                      onPress={handleSubmitSighting}
                      disabled={!isFormValid || isSubmitting}
                    >
                      <Ionicons name="checkmark" size={18} color="white" />
                      <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Report Sighting"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sightingModalContent: { backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.md, paddingBottom: 34, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
  petSummary: { paddingBottom: spacing.md },
  formSubTitle: { fontSize: 16, fontWeight: "500", color: colors.text, marginBottom: spacing.md },
  formSectionTitle: { fontSize: 18, fontWeight: "600", color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  formGroup: { marginBottom: spacing.md },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  formLabel: { fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
  formHelperText: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  formInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.text, minHeight: 44 },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
  dateInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 44, justifyContent: 'center' },
  dateInputText: { fontSize: 14, color: colors.text },
  inputError: { borderColor: colors.error, borderWidth: 1, backgroundColor: `${colors.error}10` },
  errorMessage: { color: colors.error, fontSize: 12, marginTop: 4 },
  locationInputContainer: { flexDirection: 'row', alignItems: 'center' },
  formLocationInput: { flex: 1, marginRight: spacing.xs },
  mapButton: { backgroundColor: `${colors.primary}10`, padding: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.primary },
  mapContainer: { height: 400, marginTop: spacing.sm, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: colors.primary, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  map: { width: '100%', height: '100%', backgroundColor: '#f9f9f9' },
  mapOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, paddingBottom: spacing.lg, backgroundColor: 'rgba(255,255,255,0.85)' },
  mapInstructions: { fontSize: 14, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  mapButtonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  locationButton: { flexDirection: 'row', backgroundColor: colors.background, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary, flex: 0.45 },
  locationButtonText: { color: colors.primary, fontSize: 14, fontWeight: '500', marginLeft: spacing.xs },
  confirmLocationButton: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flex: 0.45 },
  confirmLocationText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  photoPreviewContainer: { minHeight: 100, marginTop: spacing.sm, marginBottom: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', overflow: 'hidden' },
  photoPreviewItem: { position: 'relative', marginRight: spacing.xs, borderRadius: 8, overflow: 'hidden' },
  photoThumbnail: { width: 80, height: 80, borderRadius: 8 },
  removePhotoButton: { position: 'absolute', top: 4, right: 4 },
  photoList: { padding: spacing.xs },
  noPhotosPlaceholder: { height: 100, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: colors.textSecondary, fontStyle: 'italic' },
  photoCounter: { fontSize: 12, color: colors.textSecondary },
  formSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addPhotoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
  addPhotoText: { color: colors.primary, fontWeight: '500', marginLeft: spacing.xs },
  formButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, gap: spacing.sm },
  cancelButton: { flex: 1, padding: spacing.md, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelButtonText: { color: colors.text, fontWeight: '500', fontSize: 16 },
  submitButton: { flex: 1, flexDirection: 'row', padding: spacing.md, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { color: 'white', fontWeight: '500', fontSize: 16, marginLeft: spacing.xs },
  disabledButton: { opacity: 0.5 }
});

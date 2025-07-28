"use client"

import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from "expo-image-picker"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native"
import { useDateTimePicker } from "../../hooks/useDateTimePicker"
import { getLostPets, initializeLostPetsData, reportSighting, type LostPet } from "../../lib/lost-pets"
import { validateSightingForm } from "../../utils/formValidation"
import {
  ImageInfo,
  enforceMaxPhotos,
  getImageCountString,
  prepareImagesForSubmission,
  processImagePickerResult
} from "../../utils/imageUtils"
import { colors, spacing } from "../theme/theme"

interface LostPetsScreenProps {
  navigation: any
}

interface FilterOptions {
  petType: string | null;
  dateRange: 'week' | 'month' | 'all';
  location: string | null;
}

interface SightingFormData {
  petId: string;
  location: string;
  description: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  photos: ImageInfo[];
}

export default function LostPetsScreen({ navigation }: LostPetsScreenProps) {
  const [lostPets, setLostPets] = useState<LostPet[]>([])
  const [selectedTab, setSelectedTab] = useState<"lost" | "found">("lost")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterModalVisible, setFilterModalVisible] = useState(false)
  const [showResources, setShowResources] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    petType: null,
    dateRange: 'all',
    location: null
  })
  
  // Sighting report states
  const [isSightingModalVisible, setSightingModalVisible] = useState(false)
  const [selectedPet, setSelectedPet] = useState<LostPet | null>(null)
  const [sightingForm, setSightingForm] = useState<SightingFormData>({
    petId: '',
    location: '',
    description: '',
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    photos: []
  })
  const dateTimePicker = useDateTimePicker(new Date())
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImagePickerLoading, setIsImagePickerLoading] = useState(false)
  const MAX_PHOTOS = 4

  useEffect(() => {
    async function loadData() {
      try {
        // Initialize the data first to ensure we have the latest mock data
        await initializeLostPetsData()
        // Then fetch the pets
        const pets = await getLostPets()
        console.log('Fetched pets:', pets.length, 'lost:', pets.filter(p => p.status === "lost").length, 'found:', pets.filter(p => p.status === "found").length)
        setLostPets(pets)
      } catch (error) {
        console.error('Error fetching pets:', error)
      }
    }
    loadData()
  }, [])

  const applyFilters = (pets: LostPet[]): LostPet[] => {
    return pets.filter(pet => {
      // Status filter
      const statusMatch = selectedTab === "lost" ? pet.status === "lost" : pet.status === "found";
      if (!statusMatch) return false;
      
      // Search query filter
      const searchTerms = searchQuery.toLowerCase().split(" ");
      const searchMatches = searchQuery === "" || searchTerms.some(term => 
        pet.name.toLowerCase().includes(term) ||
        pet.breed.toLowerCase().includes(term) ||
        pet.description.toLowerCase().includes(term) ||
        pet.lastSeenLocation.toLowerCase().includes(term)
      );
      if (!searchMatches) return false;
      
      // Pet type filter
      const typeMatch = !filters.petType || pet.species.toLowerCase() === filters.petType.toLowerCase();
      if (!typeMatch) return false;
      
      // Location filter
      const locationMatch = !filters.location || 
        pet.lastSeenLocation.toLowerCase().includes(filters.location.toLowerCase());
      if (!locationMatch) return false;
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const petDate = new Date(pet.lastSeenDate);
        const now = new Date();
        const timeDiff = now.getTime() - petDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (filters.dateRange === 'week' && daysDiff > 7) return false;
        if (filters.dateRange === 'month' && daysDiff > 30) return false;
      }
      
      return true;
    });
  };

  const filteredPets = applyFilters(lostPets);
  
  const clearFilters = () => {
    setFilters({
      petType: null,
      dateRange: 'all',
      location: null
    });
    setSearchQuery("");
  }

  const handleReportLostPet = () => {
    // Navigate to the ReportLostPet screen in the root navigator
    navigation.getParent()?.navigate("ReportLostPet")
  }

  const handleReportSighting = (petId: string) => {
    // Find the pet with the given ID
    const pet = lostPets.find(p => p.id === petId);
    
    if (!pet) {
      Alert.alert("Error", "Pet not found");
      return;
    }
    
    // Set the selected pet and initialize the form with the pet's ID
    setSelectedPet(pet);
    dateTimePicker.setDate(new Date()); // Reset date picker
    
    // Reset form with pet ID
    setSightingForm({
      petId: pet.id,
      location: '',
      description: '',
      reporterName: '',
      reporterPhone: '',
      reporterEmail: '',
      photos: []
    });
    
    // Clear any previous errors
    setFormErrors({});
    
    // Show the sighting report modal
    setSightingModalVisible(true);
  }
  
  // Handle picking images from the gallery
  const handlePickImages = async () => {
    try {
      setIsImagePickerLoading(true);
      // Request permission first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission required", 
          "You need to grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        // Limit to MAX_PHOTOS photos total including already selected ones
        selectionLimit: MAX_PHOTOS - sightingForm.photos.length,
      });

      if (!result.canceled && result.assets) {
        // Process and validate the images
        const processedImages = processImagePickerResult(result, sightingForm.photos);
        
        // Enforce maximum photo limit
        const limitedImages = enforceMaxPhotos(processedImages, MAX_PHOTOS);
        
        // Update the form with the new images
        setSightingForm(prev => ({
          ...prev,
          photos: limitedImages
        }));
        
        // Show alert if some images were excluded due to the limit
        if (processedImages.length > MAX_PHOTOS) {
          Alert.alert(
            "Maximum photo limit",
            `Only ${MAX_PHOTOS} photos can be attached. Some selected photos were not included.`
          );
        }
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images. Please try again.");
    } finally {
      setIsImagePickerLoading(false);
    }
  };
  
  // Function to remove a photo from the selection
  const handleRemoveImage = (index: number) => {
    if (index < 0 || index >= sightingForm.photos.length) {
      return; // Invalid index
    }
    
    setSightingForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form input changes
  const handleFormChange = (field: keyof SightingFormData, value: string) => {
    setSightingForm(prevForm => ({
      ...prevForm,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = {...prev};
        delete updated[field];
        return updated;
      });
    }
  };
  
  // Check if form is valid
  const validateForm = () => {
    const { valid, errors } = validateSightingForm({
      location: sightingForm.location,
      reporterName: sightingForm.reporterName,
      reporterEmail: sightingForm.reporterEmail,
      reporterPhone: sightingForm.reporterPhone,
      date: dateTimePicker.date
    });
    
    setFormErrors(errors);
    return valid;
  };
  
  // Helper function for checking if form data is filled properly (without updating state)
  const isFormValid = React.useMemo(() => {
    return !!sightingForm.location && !!sightingForm.reporterName;
  }, [sightingForm.location, sightingForm.reporterName]);
  
  // Submit the sighting report
  const handleSubmitSighting = async () => {
    // Run validation
    if (!isFormValid || !selectedPet) {
      // Show validation errors
      return;
    }
    
    setIsSubmitting(true);
    const currentPet = selectedPet;
    
    try {
      if (!currentPet) {
        throw new Error("Pet information is missing");
      }
      
      // Prepare photos for submission
      const photoUris = prepareImagesForSubmission(sightingForm.photos);
      
      // Submit the report
      await reportSighting({
        petId: currentPet.id,
        location: sightingForm.location,
        date: dateTimePicker.getDateTimeString(),
        time: dateTimePicker.getFormattedTime(),
        description: sightingForm.description,
        reporterName: sightingForm.reporterName,
        reporterPhone: sightingForm.reporterPhone,
        reporterEmail: sightingForm.reporterEmail,
        photos: photoUris
      });
      // Show success message
      Alert.alert(
        "Sighting Reported",
        `Thank you for reporting a sighting of ${currentPet.name} at ${sightingForm.location}. The owner has been notified.`,
        [{ text: "OK", onPress: () => {
          setSightingModalVisible(false);
          // Reset form
          setSightingForm({
            petId: '',
            location: '',
            description: '',
            reporterName: '',
            reporterPhone: '',
            reporterEmail: '',
            photos: []
          });
          setFormErrors({});
        }}]
      );
    } catch (error) {
      console.error("Error submitting sighting report:", error);
      Alert.alert(
        "Error",
        "There was a problem submitting your report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleContactOwner = (pet: LostPet) => {
    // Check if we have contact info available
    if (pet.contactName && (pet.contactPhone || pet.contactEmail)) {
      Alert.alert(
        "Contact Options",
        `Contact ${pet.contactName} via:`,
        [
          {
            text: "Call",
            onPress: () => {
              const phoneNumber = pet.contactPhone;
              if (phoneNumber) {
                Linking.openURL(`tel:${phoneNumber}`);
              } else {
                Alert.alert("Error", "Phone number not available");
              }
            },
          },
          {
            text: "Email",
            onPress: () => {
              const email = pet.contactEmail;
              if (email) {
                Linking.openURL(`mailto:${email}?subject=About your lost pet: ${pet.name}`);
              } else {
                Alert.alert("Error", "Email not available");
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } else {
      Alert.alert("Contact Information", "Contact information not available for this pet.");
    }
  };

  const renderLostPetCard = (pet: LostPet) => {
    const imageUri = pet.photos && pet.photos.length > 0 
      ? pet.photos[0] 
      : "https://via.placeholder.com/120x120";
    
    return (
      <View key={pet.id} style={styles.petCard}>
        <Image 
          source={{ uri: imageUri }} 
          style={styles.petImage} 
          onError={(e) => console.log('Image error:', e.nativeEvent.error)}
        />
        <View style={styles.petInfo}>
          <View style={styles.petHeader}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={[
              styles.statusBadge, 
              pet.status === "lost" ? styles.statusLost : 
              pet.status === "found" ? styles.statusFound : 
              pet.status === "sighted" ? styles.statusFound :
              styles.statusLost
            ]}>
              <Text style={styles.statusText}>{pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}</Text>
            </View>
          </View>

          <Text style={styles.petBreed}>
            {pet.breed} • {pet.species}
          </Text>

          <View style={styles.petLocation}>
            <Ionicons name="location-outline" size={14} color={colors.text} />
            <Text style={styles.petLocationText}>Last seen: {pet.lastSeenLocation}</Text>
          </View>

          <Text style={styles.lastSeenDate}>Date: {new Date(pet.lastSeenDate).toLocaleDateString()}</Text>

          <Text style={styles.description} numberOfLines={2}>
            {pet.description}
          </Text>

          {pet.reward && (
            <View style={styles.rewardContainer}>
              <Ionicons name="gift-outline" size={16} color={colors.warning} />
              <Text style={styles.rewardText}>${pet.reward} reward</Text>
            </View>
          )}

          <View style={styles.petActions}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => handleContactOwner(pet)}
            >
              <Ionicons name="call-outline" size={16} color="white" />
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sightingButton} 
              onPress={() => handleReportSighting(pet.id)}
              accessibilityLabel={`Report sighting of ${pet.name}`}
              disabled={pet.status === "reunited"}
            >
              <Ionicons name="eye-outline" size={16} color={colors.primary} />
              <Text style={styles.sightingButtonText}>Report Sighting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Render the sighting report modal
  const renderSightingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isSightingModalVisible}
      onRequestClose={() => {
        if (!isSubmitting) setSightingModalVisible(false);
      }}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalContainer}>
          <View style={styles.sightingModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report Sighting</Text>
                <TouchableOpacity 
                  onPress={() => setSightingModalVisible(false)}
                  disabled={isSubmitting}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {selectedPet && (
                <View style={styles.petSummary}>
                  <Text style={styles.formSubTitle}>
                    Help reunite {selectedPet.name} with their family
                  </Text>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Location Seen *</Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        formErrors.location ? styles.inputError : null
                      ]}
                      placeholder="Address or area"
                      placeholderTextColor={colors.textSecondary}
                      value={sightingForm.location}
                      onChangeText={(text) => handleFormChange('location', text)}
                    />
                    {formErrors.location && (
                      <Text style={styles.errorMessage}>{formErrors.location}</Text>
                    )}
                  </View>
                  
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: spacing.sm }]}>
                      <Text style={styles.formLabel}>Date *</Text>
                      <TouchableOpacity
                        style={[
                          styles.dateInput, 
                          formErrors.date ? styles.inputError : null
                        ]}
                        onPress={dateTimePicker.toggleDatePicker}
                      >
                        <Text style={styles.dateInputText}>
                          {dateTimePicker.getFormattedDate()}
                        </Text>
                        <Ionicons name="calendar-outline" size={18} color={colors.text} />
                      </TouchableOpacity>
                      {formErrors.date && (
                        <Text style={styles.errorMessage}>{formErrors.date}</Text>
                      )}
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
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={dateTimePicker.toggleTimePicker}
                      >
                        <Text style={styles.dateInputText}>
                          {dateTimePicker.getFormattedTime()}
                        </Text>
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
                      style={[
                        styles.formInput,
                        formErrors.reporterName ? styles.inputError : null
                      ]}
                      placeholder="Demo User"
                      placeholderTextColor={colors.textSecondary}
                      value={sightingForm.reporterName}
                      onChangeText={(text) => handleFormChange('reporterName', text)}
                    />
                    {formErrors.reporterName && (
                      <Text style={styles.errorMessage}>{formErrors.reporterName}</Text>
                    )}
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Phone</Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        formErrors.reporterPhone ? styles.inputError : null
                      ]}
                      placeholder="Phone number"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="phone-pad"
                      value={sightingForm.reporterPhone}
                      onChangeText={(text) => handleFormChange('reporterPhone', text)}
                    />
                    {formErrors.reporterPhone && (
                      <Text style={styles.errorMessage}>{formErrors.reporterPhone}</Text>
                    )}
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Email</Text>
                    <TextInput
                      style={[
                        styles.formInput,
                        formErrors.reporterEmail ? styles.inputError : null
                      ]}
                      placeholder="demo@petpal.com"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={sightingForm.reporterEmail}
                      onChangeText={(text) => handleFormChange('reporterEmail', text)}
                    />
                    {formErrors.reporterEmail && (
                      <Text style={styles.errorMessage}>{formErrors.reporterEmail}</Text>
                    )}
                  </View>
                  
                  <View style={styles.formGroup}>
                    <View style={styles.formSectionHeader}>
                      <Text style={styles.formLabel}>Photos (if available)</Text>
                      <Text style={styles.photoCounter}>
                        {getImageCountString(sightingForm.photos.length, MAX_PHOTOS)}
                      </Text>
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
                              <Image
                                source={{ uri: item.uri }}
                                style={styles.photoThumbnail}
                                resizeMode="cover"
                              />
                              <TouchableOpacity
                                style={styles.removePhotoButton}
                                onPress={() => handleRemoveImage(index)}
                                disabled={isSubmitting}
                              >
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
                          <Text style={styles.placeholderText}>
                            No photos selected
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={styles.addPhotoButton}
                      onPress={handlePickImages}
                      disabled={isSubmitting || isImagePickerLoading || sightingForm.photos.length >= MAX_PHOTOS}
                    >
                      <Ionicons 
                        name={isImagePickerLoading ? "hourglass-outline" : "camera-outline"} 
                        size={20} 
                        color={colors.primary} 
                      />
                      <Text style={styles.addPhotoText}>
                        {isImagePickerLoading ? "Loading..." : "Add Photos"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.formButtonContainer}>
                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={() => setSightingModalVisible(false)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.submitButton, 
                        !isFormValid && styles.disabledButton
                      ]} 
                      onPress={handleSubmitSighting}
                      disabled={!isFormValid || isSubmitting}
                    >
                      <Ionicons name="checkmark" size={18} color="white" />
                      <Text style={styles.submitButtonText}>
                        {isSubmitting ? "Submitting..." : "Report Sighting"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isSubmitting && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFilterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Pet Type</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.petType === 'dog' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, petType: prev.petType === 'dog' ? null : 'dog'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.petType === 'dog' && styles.activeFilterOptionText
                ]}>Dogs</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.petType === 'cat' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, petType: prev.petType === 'cat' ? null : 'cat'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.petType === 'cat' && styles.activeFilterOptionText
                ]}>Cats</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.petType !== 'dog' && filters.petType !== 'cat' && filters.petType !== null && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, petType: prev.petType !== 'other' ? 'other' : null}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.petType !== 'dog' && filters.petType !== 'cat' && filters.petType !== null && styles.activeFilterOptionText
                ]}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Date Range</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.dateRange === 'week' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, dateRange: 'week'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.dateRange === 'week' && styles.activeFilterOptionText
                ]}>Last 7 days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.dateRange === 'month' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, dateRange: 'month'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.dateRange === 'month' && styles.activeFilterOptionText
                ]}>Last 30 days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.dateRange === 'all' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, dateRange: 'all'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.dateRange === 'all' && styles.activeFilterOptionText
                ]}>All time</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Location</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter a city or area"
              placeholderTextColor={colors.textSecondary}
              value={filters.location || ""}
              onChangeText={(text) => setFilters(prev => ({...prev, location: text || null}))}
              clearButtonMode="while-editing"
            />
          </View>
          
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderResourcesSection = () => (
    <View style={styles.resourcesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Helpful Resources</Text>
        <TouchableOpacity onPress={() => setShowResources(!showResources)}>
          <Ionicons name={showResources ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {showResources && (
        <>
          <View style={styles.resourceCard}>
            <View style={styles.resourceCardHeader}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.resourceCardTitle}>Tips for Finding Lost Pets</Text>
            </View>
            <View style={styles.tipList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>Search during early morning or late evening when pets are more active</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>Place familiar items outdoors like their bed, toys, or your clothing</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>Post on social media and contact local shelters</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.resourceCard}>
            <View style={styles.resourceCardHeader}>
              <Ionicons name="call" size={24} color={colors.primary} />
              <Text style={styles.resourceCardTitle}>Local Rescue Organizations</Text>
            </View>
            <TouchableOpacity style={styles.orgItem}>
              <Text style={styles.orgName}>Austin Animal Center</Text>
              <Text style={styles.orgContact}>(512) 555-1234</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orgItem}>
              <Text style={styles.orgName}>Austin Humane Society</Text>
              <Text style={styles.orgContact}>(512) 555-5678</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orgItem}>
              <Text style={styles.orgName}>Austin Lost Pets</Text>
              <Text style={styles.orgContact}>(512) 555-9012</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "lost" && styles.activeTab]}
            onPress={() => setSelectedTab("lost")}
          >
            <Text style={[styles.tabText, selectedTab === "lost" && styles.activeTabText]}>Lost Pets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "found" && styles.activeTab]}
            onPress={() => setSelectedTab("found")}
          >
            <Text style={[styles.tabText, selectedTab === "found" && styles.activeTabText]}>Found Pets</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, breed, location..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="options" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.reportButton} onPress={handleReportLostPet}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.reportButtonText}>Report Lost Pet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(filters.petType || filters.location || filters.dateRange !== 'all' || searchQuery) && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersTitle}>Active filters:</Text>
            <View style={styles.activeFiltersList}>
              {filters.petType && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>Type: {filters.petType}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({...prev, petType: null}))}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              {filters.dateRange !== 'all' && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    Date: {filters.dateRange === 'week' ? 'Last 7 days' : 'Last 30 days'}
                  </Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({...prev, dateRange: 'all'}))}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              {filters.location && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>Location: {filters.location}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({...prev, location: null}))}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              {searchQuery && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>Search: {searchQuery}</Text>
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Resources Section */}
        {renderResourcesSection()}
        
        <View style={styles.petsContainer}>
          {filteredPets.map(renderLostPetCard)}
        </View>

        {filteredPets.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.border} />
            <Text style={styles.emptyStateTitle}>No {selectedTab} pets found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filters.petType || filters.location || filters.dateRange !== 'all'
                ? "Try adjusting your search filters"
                : selectedTab === "lost"
                ? "No lost pets reported in your area"
                : "No found pets reported in your area"}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {renderFilterModal()}
      {renderSightingModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  // Form error styles
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
    backgroundColor: `${colors.error}10`,
  },
  errorMessage: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  photoPreviewContainer: {
    minHeight: 100,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoPreviewItem: {
    position: 'relative',
    marginRight: spacing.xs,
    borderRadius: 8,
    overflow: 'hidden',
  },
  noPhotosPlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  photoCounter: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  formSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Form styles for sighting report
  sightingModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.md,
    paddingBottom: 34, // Additional padding for bottom safe area
    maxHeight: "90%",
  },
  petSummary: {
    paddingBottom: spacing.md,
  },
  formSubTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.md,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formHelperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    minHeight: 44,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  dateInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 14,
    color: colors.text,
  },
  photoSection: {
    marginTop: spacing.xs,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  photoList: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  photoContainer: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  formButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  activeTabText: {
    color: "white",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 0, // Reduced vertical padding to give more space to the text input
    marginBottom: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    height: 42, // Set explicit height for the container
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: 36,
    padding: 0, // Remove any default padding that might interfere
  },
  filterButton: {
    padding: spacing.xs,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    gap: spacing.xs,
  },
  reportButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  activeFiltersContainer: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  activeFiltersTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  activeFiltersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  activeFilterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterText: {
    fontSize: 12,
    color: colors.text,
  },
  clearFiltersButton: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  clearFiltersText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
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
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  petImage: {
    width: 120,
    height: 140,
    resizeMode: 'cover',
    backgroundColor: colors.border,
  },
  petInfo: {
    flex: 1,
    padding: spacing.sm,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusLost: {
    backgroundColor: colors.error,
  },
  statusFound: {
    backgroundColor: colors.success,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  petBreed: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  petLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  petLocationText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: spacing.xs,
    flex: 1,
  },
  lastSeenDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 12,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  petActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    flex: 1,
    justifyContent: "center",
  },
  contactButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  sightingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sightingButtonText: {
    color: colors.primary,
    fontSize: 12,
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
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.md,
    paddingBottom: 30, // Additional padding for bottom safe area
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  activeFilterOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  activeFilterOptionText: {
    color: "white",
  },
  locationInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    height: 40,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  clearButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  // Resources section styles
  resourcesSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resourceCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  resourceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resourceCardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  tipList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  orgItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orgName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  orgContact: {
    fontSize: 14,
    color: colors.primary,
  },
})

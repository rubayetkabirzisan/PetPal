import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getLostPets, reportLostPet, reportSighting, type LostPet } from "@/lib/lost-pets";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function AdopterLostPetsPage() {
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [filteredPets, setFilteredPets] = useState<LostPet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showSightingDialog, setShowSightingDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState<LostPet | null>(null);
  // For React Native image picker result type
  type ImagePickerAsset = { uri: string; [key: string]: any };
  const [reportPhotos, setReportPhotos] = useState<ImagePickerAsset[]>([]);
  const [sightingPhotos, setSightingPhotos] = useState<ImagePickerAsset[]>([]);
  const [showStatusFilterModal, setShowStatusFilterModal] = useState(false);
  const [showSpeciesFilterModal, setShowSpeciesFilterModal] = useState(false);

  // Form states for report lost pet
  const [reportForm, setReportForm] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    color: "",
    size: "",
    description: "",
    lastSeenLocation: "",
    lastSeenDate: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    reward: "",
    microchipped: "",
    specialNeeds: "",
  });

  // Form states for report sighting
  const [sightingForm, setSightingForm] = useState({
    location: "",
    date: "",
    time: "",
    description: "",
    reporterName: "",
    reporterPhone: "",
    reporterEmail: "",
  });

  const { user } = useAuth();

  useEffect(() => {
    const loadLostPets = async () => {
      try {
        const pets = await getLostPets();
        setLostPets(pets);
        setFilteredPets(pets);
      } catch (error) {
        console.error("Error loading lost pets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLostPets();
  }, []);

  useEffect(() => {
    if (user) {
      setReportForm(prev => ({
        ...prev,
        contactName: user.name || "",
        contactEmail: user.email || ""
      }));
      
      setSightingForm(prev => ({
        ...prev,
        reporterName: user.name || "",
        reporterEmail: user.email || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    let filtered = lostPets;

    if (searchTerm) {
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((pet) => pet.status === statusFilter);
    }

    if (speciesFilter !== "all") {
      filtered = filtered.filter((pet) => pet.species === speciesFilter);
    }

    setFilteredPets(filtered);
  }, [lostPets, searchTerm, statusFilter, speciesFilter]);

  const handleReportLostPet = async () => {
    try {
      // Convert ImagePickerAsset objects to string URIs for the API
      const photoUris = reportPhotos.map(photo => photo.uri);
      
      const petData = {
        name: reportForm.name,
        species: reportForm.species,
        breed: reportForm.breed,
        age: reportForm.age,
        color: reportForm.color,
        size: reportForm.size,
        description: reportForm.description,
        lastSeenLocation: reportForm.lastSeenLocation,
        lastSeenDate: reportForm.lastSeenDate,
        contactName: reportForm.contactName,
        contactPhone: reportForm.contactPhone,
        contactEmail: reportForm.contactEmail,
        reward: reportForm.reward,
        microchipped: reportForm.microchipped === "yes",
        specialNeeds: reportForm.specialNeeds,
        photos: photoUris,
      };

      const newPet = await reportLostPet(petData);
      setLostPets([newPet, ...lostPets]);
      setShowReportDialog(false);
      setReportPhotos([]);
      // Reset form
      setReportForm({
        name: "",
        species: "",
        breed: "",
        age: "",
        color: "",
        size: "",
        description: "",
        lastSeenLocation: "",
        lastSeenDate: "",
        contactName: user?.name || "",
        contactPhone: "",
        contactEmail: user?.email || "",
        reward: "",
        microchipped: "",
        specialNeeds: "",
      });
    } catch (error) {
      console.error("Error reporting lost pet:", error);
    }
  };

  const handleReportSighting = async () => {
    if (!selectedPet) return;

    try {
      // Convert ImagePickerAsset objects to string URIs for the API
      const photoUris = sightingPhotos.map(photo => photo.uri);
      
      const sightingData = {
        petId: selectedPet.id,
        location: sightingForm.location,
        date: sightingForm.date,
        time: sightingForm.time,
        description: sightingForm.description,
        reporterName: sightingForm.reporterName,
        reporterPhone: sightingForm.reporterPhone,
        reporterEmail: sightingForm.reporterEmail,
        photos: photoUris,
      };

      const newSighting = await reportSighting(sightingData);

      // Update the pet's status and sightings
      const updatedPets = lostPets.map((pet) =>
        pet.id === selectedPet.id
          ? {
              ...pet,
              status: "sighted" as const,
              sightings: [...pet.sightings, newSighting],
            }
          : pet
      );

      setLostPets(updatedPets);
      setShowSightingDialog(false);
      setSightingPhotos([]);
      setSelectedPet(null);
      // Reset form
      setSightingForm({
        location: "",
        date: "",
        time: "",
        description: "",
        reporterName: user?.name || "",
        reporterPhone: "",
        reporterEmail: user?.email || "",
      });
    } catch (error) {
      console.error("Error reporting sighting:", error);
    }
  };

  const handlePhotoUpload = async (type: "report" | "sighting") => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        // Use Alert from react-native instead of browser alert
        Platform.OS !== 'web' && Alert.alert(
          "Permission Required", 
          "You need to grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const selectedImages = result.assets.slice(0, 4); // Max 4 photos
        
        if (type === "report") {
          // Ensure we don't exceed 4 photos total
          setReportPhotos((prev) => [...prev, ...selectedImages].slice(0, 4));
        } else {
          // Ensure we don't exceed 4 photos total
          setSightingPhotos((prev) => [...prev, ...selectedImages].slice(0, 4));
        }
      }
    } catch (error) {
      console.error("Error picking images:", error);
    }
  };

  const removePhoto = (index: number, type: "report" | "sighting") => {
    if (type === "report") {
      setReportPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSightingPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "lost":
        return { bg: "#FEE2E2", text: "#DC2626" };
      case "sighted":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "found":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "reunited":
        return { bg: "#DBEAFE", text: "#2563EB" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Lost Pets" userType="adopter" showNotifications={true} />
        <View style={styles.loadingContainer}>
          <Feather name="search" size={48} color="#FF7A47" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Loading lost pets...</Text>
        </View>
        <Navigation userType="adopter" />
      </View>
    );
  }

  const renderLostPetReportForm = () => (
    <Modal
      visible={showReportDialog}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setShowReportDialog(false)}
    >
      <ScrollView style={styles.modalScrollView}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Lost Pet</Text>
            <Text style={styles.modalSubtitle}>Help us help you find your beloved pet</Text>
          </View>

          {/* Pet Information */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Pet Information</Text>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Pet Name *</Text>
                <TextInput
                  style={styles.input}
                  value={reportForm.name}
                  onChangeText={(text) => setReportForm({...reportForm, name: text})}
                  placeholder="Name"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Species *</Text>
                <TouchableOpacity 
                  style={styles.select}
                  onPress={() => {
                    // Show species picker (simplified here)
                    const species = ["dog", "cat", "bird", "rabbit", "other"];
                    const selected = species.indexOf(reportForm.species) >= 0 ? 
                      reportForm.species : species[0];
                    
                    // In a real app, use a proper picker
                    setReportForm({...reportForm, species: selected});
                  }}
                >
                  <Text style={reportForm.species ? styles.selectText : styles.selectPlaceholder}>
                    {reportForm.species || "Select"}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#8B4513" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Breed</Text>
                <TextInput
                  style={styles.input}
                  value={reportForm.breed}
                  onChangeText={(text) => setReportForm({...reportForm, breed: text})}
                  placeholder="Breed"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={reportForm.age}
                  onChangeText={(text) => setReportForm({...reportForm, age: text})}
                  placeholder="e.g., 2 years"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Color/Markings</Text>
                <TextInput
                  style={styles.input}
                  value={reportForm.color}
                  onChangeText={(text) => setReportForm({...reportForm, color: text})}
                  placeholder="Color/Markings"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Size</Text>
                <TouchableOpacity 
                  style={styles.select}
                  onPress={() => {
                    // Show size picker (simplified here)
                    const sizes = ["small", "medium", "large", "extra-large"];
                    const selected = sizes.indexOf(reportForm.size) >= 0 ? 
                      reportForm.size : sizes[0];
                    
                    // In a real app, use a proper picker
                    setReportForm({...reportForm, size: selected});
                  }}
                >
                  <Text style={reportForm.size ? styles.selectText : styles.selectPlaceholder}>
                    {reportForm.size || "Select"}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#8B4513" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reportForm.description}
              onChangeText={(text) => setReportForm({...reportForm, description: text})}
              placeholder="Distinctive features, personality, etc."
              placeholderTextColor="#A0A0A0"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Last Seen Information */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Last Seen</Text>

            <Text style={styles.inputLabel}>Location *</Text>
            <TextInput
              style={styles.input}
              value={reportForm.lastSeenLocation}
              onChangeText={(text) => setReportForm({...reportForm, lastSeenLocation: text})}
              placeholder="Address or area"
              placeholderTextColor="#A0A0A0"
            />

            <Text style={styles.inputLabel}>Date & Time *</Text>
            <TextInput
              style={styles.input}
              value={reportForm.lastSeenDate}
              onChangeText={(text) => setReportForm({...reportForm, lastSeenDate: text})}
              placeholder="YYYY-MM-DD HH:MM"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          {/* Contact Information */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Contact Information</Text>

            <Text style={styles.inputLabel}>Your Name *</Text>
            <TextInput
              style={styles.input}
              value={reportForm.contactName}
              onChangeText={(text) => setReportForm({...reportForm, contactName: text})}
              placeholder="Your name"
              placeholderTextColor="#A0A0A0"
            />

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <TextInput
                  style={styles.input}
                  value={reportForm.contactPhone}
                  onChangeText={(text) => setReportForm({...reportForm, contactPhone: text})}
                  placeholder="Phone number"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={reportForm.contactEmail}
                  onChangeText={(text) => setReportForm({...reportForm, contactEmail: text})}
                  placeholder="Email"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Additional Information</Text>

            <Text style={styles.inputLabel}>Reward Amount</Text>
            <TextInput
              style={styles.input}
              value={reportForm.reward}
              onChangeText={(text) => setReportForm({...reportForm, reward: text})}
              placeholder="Optional"
              placeholderTextColor="#A0A0A0"
            />

            <Text style={styles.inputLabel}>Microchipped?</Text>
            <TouchableOpacity 
              style={styles.select}
              onPress={() => {
                // Show microchipped picker (simplified here)
                const options = ["yes", "no", "unknown"];
                const selected = options.indexOf(reportForm.microchipped) >= 0 ? 
                  reportForm.microchipped : options[0];
                
                // In a real app, use a proper picker
                setReportForm({...reportForm, microchipped: selected});
              }}
            >
              <Text style={reportForm.microchipped ? styles.selectText : styles.selectPlaceholder}>
                {reportForm.microchipped || "Select"}
              </Text>
              <Feather name="chevron-down" size={16} color="#8B4513" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Special Needs/Medical</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reportForm.specialNeeds}
              onChangeText={(text) => setReportForm({...reportForm, specialNeeds: text})}
              placeholder="Any medical conditions or special needs"
              placeholderTextColor="#A0A0A0"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Photo Upload */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Photos (up to 4)</Text>
            
            <TouchableOpacity 
              style={styles.photoUploadContainer}
              onPress={() => handlePhotoUpload("report")}
            >
              <Feather name="upload" size={32} color="#8B4513" style={styles.uploadIcon} />
              <Text style={styles.uploadText}>Tap to upload photos</Text>
            </TouchableOpacity>

            {reportPhotos.length > 0 && (
              <View style={styles.photoGrid}>
                {reportPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.photoThumbnail}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index, "report")}
                    >
                      <Feather name="x" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleReportLostPet}
            >
              <Text style={styles.primaryButtonText}>Report Lost Pet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setShowReportDialog(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );

  const renderSightingReportForm = () => (
    <Modal
      visible={showSightingDialog}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        setShowSightingDialog(false);
        setSelectedPet(null);
      }}
    >
      <ScrollView style={styles.modalScrollView}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Sighting</Text>
            <Text style={styles.modalSubtitle}>
              Help reunite {selectedPet?.name} with their family
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Location Seen *</Text>
            <TextInput
              style={styles.input}
              value={sightingForm.location}
              onChangeText={(text) => setSightingForm({...sightingForm, location: text})}
              placeholder="Address or area"
              placeholderTextColor="#A0A0A0"
            />

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TextInput
                  style={styles.input}
                  value={sightingForm.date}
                  onChangeText={(text) => setSightingForm({...sightingForm, date: text})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  value={sightingForm.time}
                  onChangeText={(text) => setSightingForm({...sightingForm, time: text})}
                  placeholder="HH:MM"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={sightingForm.description}
              onChangeText={(text) => setSightingForm({...sightingForm, description: text})}
              placeholder="What did you see? Pet's condition, behavior, etc."
              placeholderTextColor="#A0A0A0"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Your Contact Information</Text>

            <Text style={styles.inputLabel}>Your Name *</Text>
            <TextInput
              style={styles.input}
              value={sightingForm.reporterName}
              onChangeText={(text) => setSightingForm({...sightingForm, reporterName: text})}
              placeholder="Your name"
              placeholderTextColor="#A0A0A0"
            />

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={sightingForm.reporterPhone}
                  onChangeText={(text) => setSightingForm({...sightingForm, reporterPhone: text})}
                  placeholder="Phone number"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={sightingForm.reporterEmail}
                  onChangeText={(text) => setSightingForm({...sightingForm, reporterEmail: text})}
                  placeholder="Email"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>

          {/* Photo Upload */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Photos (if available)</Text>
            
            <TouchableOpacity 
              style={styles.photoUploadContainer}
              onPress={() => handlePhotoUpload("sighting")}
            >
              <Feather name="camera" size={32} color="#8B4513" style={styles.uploadIcon} />
              <Text style={styles.uploadText}>Add photos if you have them</Text>
            </TouchableOpacity>

            {sightingPhotos.length > 0 && (
              <View style={styles.photoGrid}>
                {sightingPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.photoThumbnail}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index, "sighting")}
                    >
                      <Feather name="x" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleReportSighting}
            >
              <Text style={styles.primaryButtonText}>Report Sighting</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {
                setShowSightingDialog(false);
                setSelectedPet(null);
                setSightingPhotos([]);
              }}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Lost Pets"
        subtitle="Help reunite pets with their families"
        userType="adopter"
        showNotifications={true}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setShowReportDialog(true)}
          >
            <Feather name="alert-triangle" size={16} color="white" style={styles.buttonIcon} />
            <Text style={styles.reportButtonText}>Report Lost Pet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.browseButton}
          >
            <Feather name="eye" size={16} color="#FF7A47" style={styles.buttonIcon} />
            <Text style={styles.browseButtonText}>Browse All</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={16} color="#8B4513" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, breed, or location..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#8B4513"
            />
          </View>

          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowStatusFilterModal(true)}
            >
              <Text style={styles.filterButtonText}>
                {statusFilter === "all" ? "All Status" : statusFilter}
              </Text>
              <Feather name="chevron-down" size={16} color="#8B4513" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowSpeciesFilterModal(true)}
            >
              <Text style={styles.filterButtonText}>
                {speciesFilter === "all" ? "All Species" : speciesFilter}
              </Text>
              <Feather name="chevron-down" size={16} color="#8B4513" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Summary */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredPets.length} pet{filteredPets.length !== 1 ? "s" : ""} found
          </Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
              <Text style={styles.legendText}>Lost</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#D97706" }]} />
              <Text style={styles.legendText}>Sighted</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#16A34A" }]} />
              <Text style={styles.legendText}>Found</Text>
            </View>
          </View>
        </View>

        {/* Lost Pets List */}
        <View style={styles.petsList}>
          {filteredPets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color="#8B4513" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No pets found</Text>
              <Text style={styles.emptyMessage}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            filteredPets.map((pet) => (
              <View key={pet.id} style={styles.petCard}>
                <View style={styles.petCardHeader}>
                  <View style={styles.petImageContainer}>
                    {pet.photos && pet.photos.length > 0 ? (
                      <Image
                        source={{ uri: pet.photos[0] }}
                        style={styles.petImage}
                      />
                    ) : (
                      <View style={styles.petImagePlaceholder}>
                        <Feather name="heart" size={32} color="#FF7A47" />
                      </View>
                    )}
                  </View>
                  <View style={styles.petInfo}>
                    <View style={styles.petTitleContainer}>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusBadgeStyle(pet.status).bg }
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: getStatusBadgeStyle(pet.status).text }
                          ]}
                        >
                          {pet.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.petDescription}>
                      {pet.breed} • {pet.color} • {pet.size}
                    </Text>
                    <View style={styles.locationContainer}>
                      <View style={styles.petDetailItem}>
                        <Feather name="map-pin" size={12} color="#8B4513" style={styles.petDetailIcon} />
                        <Text style={styles.petDetailText}>{pet.lastSeenLocation}</Text>
                      </View>
                      <View style={styles.petDetailItem}>
                        <Feather name="clock" size={12} color="#8B4513" style={styles.petDetailIcon} />
                        <Text style={styles.petDetailText}>{formatDate(pet.lastSeenDate)}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.petCardContent}>
                  {pet.description && (
                    <Text style={styles.petFullDescription}>{pet.description}</Text>
                  )}

                  {pet.reward && (
                    <View style={styles.rewardContainer}>
                      <Feather name="dollar-sign" size={16} color="#16A34A" style={styles.rewardIcon} />
                      <Text style={styles.rewardText}>Reward: {pet.reward}</Text>
                    </View>
                  )}

                  {pet.sightings.length > 0 && (
                    <View style={styles.sightingsContainer}>
                      <Text style={styles.sightingsTitle}>
                        Recent Sightings ({pet.sightings.length})
                      </Text>
                      <View style={styles.sightingsList}>
                        {pet.sightings.slice(0, 2).map((sighting) => (
                          <View key={sighting.id} style={styles.sightingItem}>
                            <View style={styles.sightingHeader}>
                              <Text style={styles.sightingLocation}>{sighting.location}</Text>
                              <Text style={styles.sightingDate}>{formatDate(sighting.date)}</Text>
                            </View>
                            {sighting.description && (
                              <Text style={styles.sightingDescription}>{sighting.description}</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.petCardActions}>
                    <TouchableOpacity
                      style={styles.sightingButton}
                      onPress={() => {
                        setSelectedPet(pet);
                        setShowSightingDialog(true);
                      }}
                    >
                      <Feather name="eye" size={16} color="white" style={styles.buttonIcon} />
                      <Text style={styles.sightingButtonText}>Report Sighting</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={() => {
                        if (pet.contactPhone) {
                          // In a real app, use Linking API to call
                          console.log(`Calling ${pet.contactPhone}`);
                        }
                      }}
                    >
                      <Feather name="phone" size={16} color="#FF7A47" style={styles.buttonIcon} />
                      <Text style={styles.contactButtonText}>Contact</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Filter Modals */}
      <Modal
        visible={showStatusFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusFilterModal(false)}
        >
          <View style={styles.filterModal}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                statusFilter === "all" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setStatusFilter("all");
                setShowStatusFilterModal(false);
              }}
            >
              <Text style={statusFilter === "all" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                All Status
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                statusFilter === "lost" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setStatusFilter("lost");
                setShowStatusFilterModal(false);
              }}
            >
              <Text style={statusFilter === "lost" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Lost
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                statusFilter === "sighted" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setStatusFilter("sighted");
                setShowStatusFilterModal(false);
              }}
            >
              <Text style={statusFilter === "sighted" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Sighted
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                statusFilter === "found" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setStatusFilter("found");
                setShowStatusFilterModal(false);
              }}
            >
              <Text style={statusFilter === "found" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Found
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                statusFilter === "reunited" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setStatusFilter("reunited");
                setShowStatusFilterModal(false);
              }}
            >
              <Text style={statusFilter === "reunited" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Reunited
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showSpeciesFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSpeciesFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeciesFilterModal(false)}
        >
          <View style={styles.filterModal}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                speciesFilter === "all" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setSpeciesFilter("all");
                setShowSpeciesFilterModal(false);
              }}
            >
              <Text style={speciesFilter === "all" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                All Species
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                speciesFilter === "dog" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setSpeciesFilter("dog");
                setShowSpeciesFilterModal(false);
              }}
            >
              <Text style={speciesFilter === "dog" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Dogs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                speciesFilter === "cat" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setSpeciesFilter("cat");
                setShowSpeciesFilterModal(false);
              }}
            >
              <Text style={speciesFilter === "cat" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Cats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                speciesFilter === "bird" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setSpeciesFilter("bird");
                setShowSpeciesFilterModal(false);
              }}
            >
              <Text style={speciesFilter === "bird" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Birds
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                speciesFilter === "rabbit" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setSpeciesFilter("rabbit");
                setShowSpeciesFilterModal(false);
              }}
            >
              <Text style={speciesFilter === "rabbit" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Rabbits
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                speciesFilter === "other" ? styles.filterOptionSelected : null
              ]}
              onPress={() => {
                setSpeciesFilter("other");
                setShowSpeciesFilterModal(false);
              }}
            >
              <Text style={speciesFilter === "other" ? styles.filterOptionTextSelected : styles.filterOptionText}>
                Other
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {renderLostPetReportForm()}
      {renderSightingReportForm()}

      <Navigation userType="adopter" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Space for navigation
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#8B4513",
  },
  quickActionsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  reportButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  reportButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  browseButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#FF7A47",
  },
  browseButtonText: {
    color: "#FF7A47",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#8B4513",
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  filterButtonText: {
    color: "#8B4513",
    fontSize: 14,
  },
  resultsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#8B4513",
  },
  legendContainer: {
    flexDirection: "row",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#8B4513",
  },
  petsList: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#8B4513",
    textAlign: "center",
  },
  petCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  petCardHeader: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  petImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  petImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFB899",
    alignItems: "center",
    justifyContent: "center",
  },
  petInfo: {
    flex: 1,
  },
  petTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  petDescription: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 8,
  },
  locationContainer: {
    marginTop: 8,
  },
  petDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  petDetailIcon: {
    marginRight: 4,
  },
  petDetailText: {
    fontSize: 12,
    color: "#8B4513",
  },
  petCardContent: {
    padding: 16,
  },
  petFullDescription: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 12,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  rewardIcon: {
    marginRight: 8,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#16A34A",
  },
  sightingsContainer: {
    marginBottom: 12,
  },
  sightingsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 8,
  },
  sightingsList: {
    gap: 4,
  },
  sightingItem: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 8,
  },
  sightingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sightingLocation: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8B4513",
  },
  sightingDate: {
    fontSize: 12,
    color: "#8B4513",
  },
  sightingDescription: {
    fontSize: 12,
    color: "#8B4513",
    marginTop: 4,
  },
  petCardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sightingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7A47",
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 8,
  },
  sightingButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#FF7A47",
  },
  contactButtonText: {
    color: "#FF7A47",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  filterModal: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "80%",
    padding: 16,
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  filterOptionSelected: {
    backgroundColor: "#FFEDD5",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#8B4513",
  },
  filterOptionTextSelected: {
    fontSize: 16,
    color: "#FF7A47",
    fontWeight: "600",
  },
  modalScrollView: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  modalContent: {
    padding: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#8B4513",
  },
  formSection: {
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#8B4513",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  select: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: 14,
    color: "#8B4513",
  },
  selectPlaceholder: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  photoUploadContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E8E8E8",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: "#8B4513",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  photoContainer: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#DC2626",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#FF7A47",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  secondaryButtonText: {
    color: "#8B4513",
    fontSize: 16,
    fontWeight: "600",
  },
});

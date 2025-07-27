import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"
import { addPet } from "../../lib/data"
import { useAuth } from "../contexts/AuthContext"
import { colors, spacing } from "../theme/theme"

interface AddPetScreenProps {
  navigation?: any
}

export default function AddPetScreen({ navigation: navProp }: AddPetScreenProps) {
  const navigation = useNavigation()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "Dog" | "Cat" | "",
    breed: "",
    age: "",
    gender: "" as "Male" | "Female" | "",
    size: "" as "Small" | "Medium" | "Large" | "",
    weight: "",
    color: "",
    description: "",
    personality: [] as string[],
    vaccinated: false,
    neutered: false,
    microchipped: false,
    houseTrained: false,
    goodWithKids: false,
    goodWithPets: false,
    energyLevel: "" as "Low" | "Medium" | "High" | "",
    medicalHistory: "",
    specialNeeds: "",
  })
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleToggleChange = (name: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(t => t !== trait)
        : [...prev.personality, trait]
    }))
  }

  const pickImage = async () => {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Please allow camera roll permissions to add photos"
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    })

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri)
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 5)) // Limit to 5 images
    }
  }

  const takePhoto = async () => {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Please allow camera permissions to take photos"
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [4, 3],
    })

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImages(prev => [...prev, result.assets[0].uri].slice(0, 5))
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const showImageOptions = () => {
    Alert.alert(
      "Add Photo",
      "Choose how you'd like to add a photo",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" }
      ]
    )
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.type || !formData.breed || !formData.age || !formData.gender || !formData.size) {
      Alert.alert("Missing Information", "Please fill in all required fields.")
      return
    }

    if (selectedImages.length === 0) {
      Alert.alert("Missing Photos", "Please add at least one photo of the pet.")
      return
    }

    setIsLoading(true)
    
    try {
      // Create pet object
      const newPet = {
        name: formData.name,
        type: formData.type,
        breed: formData.breed,
        age: formData.age,
        gender: formData.gender,
        size: formData.size,
        color: formData.color,
        description: formData.description,
        personality: formData.personality,
        vaccinated: formData.vaccinated,
        neutered: formData.neutered,
        microchipped: formData.microchipped,
        houseTrained: formData.houseTrained,
        goodWithKids: formData.goodWithKids,
        goodWithPets: formData.goodWithPets,
        energyLevel: formData.energyLevel || "Medium",
        medicalHistory: formData.medicalHistory,
        specialNeeds: formData.specialNeeds,
        images: selectedImages.length > 0 ? selectedImages : ["https://via.placeholder.com/400x300"],
        location: "Austin, TX",
        distance: "2 miles away",
        adoptionFee: 150,
        status: "Available" as const,
        shelterId: "shelter-1",
        shelterName: user?.shelterName || "Local Animal Shelter",
        shelterPhone: "(555) 123-4567",
        shelterEmail: "info@shelter.com",
        dateAdded: new Date().toISOString(),
        shelter: {
          name: user?.shelterName || "Local Animal Shelter",
          contact: "(555) 123-4567",
          email: "info@shelter.com",
          address: "123 Pet Street, Austin, TX 78701"
        },
        healthRecords: []
      }

      // Add pet to the system
      await addPet(newPet)

      Alert.alert(
        "Success", 
        `${formData.name} has been added successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back or to pets list
              navigation.goBack()
            }
          }
        ]
      )
    } catch (error) {
      console.error("Error adding pet:", error)
      Alert.alert("Error", "Failed to add pet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const personalityTraits = [
    "Friendly",
    "Energetic", 
    "Calm",
    "Playful",
    "Loyal",
    "Independent",
    "Gentle",
    "Protective",
    "Social",
    "Quiet",
    "Active",
    "Affectionate",
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Pet</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pet Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Enter pet's name"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Type *</Text>
            <View style={styles.buttonGroup}>
              {["Dog", "Cat"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    formData.type === type && styles.optionButtonActive
                  ]}
                  onPress={() => handleInputChange("type", type)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    formData.type === type && styles.optionButtonTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Breed *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.breed}
              onChangeText={(value) => handleInputChange("breed", value)}
              placeholder="Enter breed"
              placeholderTextColor={colors.text + "60"}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.age}
                onChangeText={(value) => handleInputChange("age", value)}
                placeholder="e.g., 2 years"
                placeholderTextColor={colors.text + "60"}
              />
            </View>

            <View style={styles.formHalf}>
              <Text style={styles.label}>Weight</Text>
              <TextInput
                style={styles.textInput}
                value={formData.weight}
                onChangeText={(value) => handleInputChange("weight", value)}
                placeholder="e.g., 25 lbs"
                placeholderTextColor={colors.text + "60"}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.buttonGroup}>
              {["Male", "Female"].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.optionButton,
                    formData.gender === gender && styles.optionButtonActive
                  ]}
                  onPress={() => handleInputChange("gender", gender)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    formData.gender === gender && styles.optionButtonTextActive
                  ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Size *</Text>
            <View style={styles.buttonGroup}>
              {["Small", "Medium", "Large"].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    formData.size === size && styles.optionButtonActive
                  ]}
                  onPress={() => handleInputChange("size", size)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    formData.size === size && styles.optionButtonTextActive
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.textInput}
              value={formData.color}
              onChangeText={(value) => handleInputChange("color", value)}
              placeholder="Enter color/markings"
              placeholderTextColor={colors.text + "60"}
            />
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          
          <View style={styles.photosContainer}>
            {/* Selected Images */}
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Add Photo Button */}
            {selectedImages.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={showImageOptions}
                disabled={isUploadingImages}
              >
                {isUploadingImages ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="camera" size={24} color={colors.primary} />
                    <Text style={styles.addPhotoText}>
                      {selectedImages.length === 0 ? "Add Photos" : "Add More"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.photoHint}>
            Add up to 5 photos. First photo will be the main image.
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>About This Pet</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              placeholder="Tell potential adopters about this pet's story, behavior, and special needs..."
              placeholderTextColor={colors.text + "60"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Personality Traits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality Traits</Text>
          
          <View style={styles.traitsContainer}>
            {personalityTraits.map((trait) => (
              <TouchableOpacity
                key={trait}
                style={[
                  styles.traitButton,
                  formData.personality.includes(trait) && styles.traitButtonActive
                ]}
                onPress={() => handlePersonalityToggle(trait)}
              >
                <Text style={[
                  styles.traitButtonText,
                  formData.personality.includes(trait) && styles.traitButtonTextActive
                ]}>
                  {trait}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          
          <View style={styles.switchGroup}>
            <View style={styles.switchItem}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Vaccinated</Text>
                <Text style={styles.switchDescription}>Up to date on vaccinations</Text>
              </View>
              <Switch
                value={formData.vaccinated}
                onValueChange={(value) => handleToggleChange("vaccinated", value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={formData.vaccinated ? colors.primary : colors.text}
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Spayed/Neutered</Text>
                <Text style={styles.switchDescription}>Has been sterilized</Text>
              </View>
              <Switch
                value={formData.neutered}
                onValueChange={(value) => handleToggleChange("neutered", value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={formData.neutered ? colors.primary : colors.text}
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Microchipped</Text>
                <Text style={styles.switchDescription}>Has identifying microchip</Text>
              </View>
              <Switch
                value={formData.microchipped}
                onValueChange={(value) => handleToggleChange("microchipped", value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={formData.microchipped ? colors.primary : colors.text}
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>House Trained</Text>
                <Text style={styles.switchDescription}>Knows basic house rules</Text>
              </View>
              <Switch
                value={formData.houseTrained}
                onValueChange={(value) => handleToggleChange("houseTrained", value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={formData.houseTrained ? colors.primary : colors.text}
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Good with Kids</Text>
                <Text style={styles.switchDescription}>Safe and friendly with children</Text>
              </View>
              <Switch
                value={formData.goodWithKids}
                onValueChange={(value) => handleToggleChange("goodWithKids", value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={formData.goodWithKids ? colors.primary : colors.text}
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Good with Other Pets</Text>
                <Text style={styles.switchDescription}>Gets along with other animals</Text>
              </View>
              <Switch
                value={formData.goodWithPets}
                onValueChange={(value) => handleToggleChange("goodWithPets", value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={formData.goodWithPets ? colors.primary : colors.text}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Energy Level</Text>
            <View style={styles.buttonGroup}>
              {["Low", "Medium", "High"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    formData.energyLevel === level && styles.optionButtonActive
                  ]}
                  onPress={() => handleInputChange("energyLevel", level)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    formData.energyLevel === level && styles.optionButtonTextActive
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Medical History</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.medicalHistory}
              onChangeText={(value) => handleInputChange("medicalHistory", value)}
              placeholder="Enter any relevant medical history..."
              placeholderTextColor={colors.text + "60"}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Special Needs</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.specialNeeds}
              onChangeText={(value) => handleInputChange("specialNeeds", value)}
              placeholder="Enter any special care requirements..."
              placeholderTextColor={colors.text + "60"}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="heart" size={16} color="white" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>Add Pet to Adoption</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  formHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  optionButtonTextActive: {
    color: 'white',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  traitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  traitButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  traitButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  traitButtonTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  switchGroup: {
    gap: spacing.lg,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContent: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  switchDescription: {
    fontSize: 14,
    color: colors.text + '80',
    marginTop: 2,
  },
  submitSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitIcon: {
    marginRight: spacing.sm,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Photo styles
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  photoHint: {
    fontSize: 12,
    color: colors.text + '80',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
})

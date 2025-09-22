
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker'
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { reportLostPet } from "../../lib/lost-pets"
import { colors, spacing } from "../theme/theme"

interface ReportLostPetScreenProps {
  navigation: any
}

export default function ReportLostPetScreen({ navigation }: ReportLostPetScreenProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    species: "", // Dog, Cat, Other
    breed: "",
    age: "",
    color: "",
    size: "", // Small, Medium, Large
    description: "",
    lastSeenLocation: "",
    lastSeenDate: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    reward: "",
    microchipped: false
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, result.assets[0].uri])
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = [
      'name', 'species', 'description', 'lastSeenLocation', 
      'lastSeenDate', 'contactName', 'contactPhone'
    ]
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Information", 
        `Please fill in the following fields: ${missingFields.join(", ")}`
      )
      return
    }

    setIsLoading(true)

    try {
      await reportLostPet({
        ...formData,
        photos: images
      })
      
      setIsLoading(false)
      Alert.alert(
        "Success", 
        "Lost pet reported successfully. We'll notify our community to help find your pet.", 
        [{ text: "OK", onPress: () => navigation.goBack() }]
      )
    } catch (error) {
      setIsLoading(false)
      Alert.alert("Error", "Failed to report lost pet. Please try again.")
    }
  }

  const renderSpeciesSelector = () => (
    <View style={styles.selectorContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Pet Type</Text>
        <Text style={styles.requiredIndicator}>*</Text>
      </View>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.option, formData.species === "Dog" && styles.selectedOption]}
          onPress={() => handleInputChange("species", "Dog")}
        >
          <Ionicons
            name="paw"
            size={24}
            color={formData.species === "Dog" ? "white" : colors.text}
          />
          <Text style={[styles.optionText, formData.species === "Dog" && styles.selectedOptionText]}>
            Dog
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, formData.species === "Cat" && styles.selectedOption]}
          onPress={() => handleInputChange("species", "Cat")}
        >
          <Ionicons
            name="paw"
            size={24}
            color={formData.species === "Cat" ? "white" : colors.text}
          />
          <Text style={[styles.optionText, formData.species === "Cat" && styles.selectedOptionText]}>
            Cat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, formData.species === "Other" && styles.selectedOption]}
          onPress={() => handleInputChange("species", "Other")}
        >
          <Ionicons
            name="paw"
            size={24}
            color={formData.species === "Other" ? "white" : colors.text}
          />
          <Text style={[styles.optionText, formData.species === "Other" && styles.selectedOptionText]}>
            Other
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderSizeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Size</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.option, formData.size === "Small" && styles.selectedOption]}
          onPress={() => handleInputChange("size", "Small")}
        >
          <Text style={[styles.optionText, formData.size === "Small" && styles.selectedOptionText]}>
            Small
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, formData.size === "Medium" && styles.selectedOption]}
          onPress={() => handleInputChange("size", "Medium")}
        >
          <Text style={[styles.optionText, formData.size === "Medium" && styles.selectedOptionText]}>
            Medium
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, formData.size === "Large" && styles.selectedOption]}
          onPress={() => handleInputChange("size", "Large")}
        >
          <Text style={[styles.optionText, formData.size === "Large" && styles.selectedOptionText]}>
            Large
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderImagePicker = () => (
    <View style={styles.imageSection}>
      <Text style={styles.label}>Photos (Optional)</Text>
      <Text style={styles.sublabel}>Upload photos to help people identify your pet</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImages(images.filter((_, i) => i !== index))}
            >
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <Ionicons name="add" size={24} color={colors.primary} />
          <Text style={styles.addImageText}>Add Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <NavigationHeader title="Report Lost Pet" showBackButton={true} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Ionicons name="heart-broken" size={32} color={colors.primary} />
            <Text style={styles.title}>Report a Lost Pet</Text>
            <Text style={styles.subtitle}>
              Please provide as much information as possible to help us find your pet
            </Text>
          </View>

          {/* Pet Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pet Information</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Pet's Name</Text>
                <Text style={styles.requiredIndicator}>*</Text>
              </View>
              <TextInput
                style={[styles.input, formData.name && styles.inputFilled]}
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholder="Enter pet's name"
                placeholderTextColor={colors.textSecondary + "80"}
              />
            </View>

            {renderSpeciesSelector()}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Breed</Text>
              <TextInput
                style={[styles.input, formData.breed && styles.inputFilled]}
                value={formData.breed}
                onChangeText={(text) => handleInputChange("breed", text)}
                placeholder="Enter breed (if known)"
                placeholderTextColor={colors.textSecondary + "80"}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[styles.input, formData.age && styles.inputFilled]}
                value={formData.age}
                onChangeText={(text) => handleInputChange("age", text)}
                placeholder="Enter approximate age"
                placeholderTextColor={colors.textSecondary + "80"}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Color/Markings</Text>
                <Text style={styles.requiredIndicator}>*</Text>
              </View>
              <TextInput
                style={[styles.input, formData.color && styles.inputFilled]}
                value={formData.color}
                onChangeText={(text) => handleInputChange("color", text)}
                placeholder="Enter color and distinctive markings"
                placeholderTextColor={colors.textSecondary + "80"}
              />
            </View>

            {renderSizeSelector()}
          </View>

          {/* Lost Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lost Information</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Last Seen Location</Text>
                <Text style={styles.requiredIndicator}>*</Text>
              </View>
              <TextInput
                style={[styles.input, formData.lastSeenLocation && styles.inputFilled]}
                value={formData.lastSeenLocation}
                onChangeText={(text) => handleInputChange("lastSeenLocation", text)}
                placeholder="Enter address or location description"
                placeholderTextColor={colors.textSecondary + "80"}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Last Seen Date</Text>
                <Text style={styles.requiredIndicator}>*</Text>
              </View>
              <TextInput
                style={[styles.input, formData.lastSeenDate && styles.inputFilled]}
                value={formData.lastSeenDate}
                onChangeText={(text) => handleInputChange("lastSeenDate", text)}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.textSecondary + "80"}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.requiredIndicator}>*</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea, formData.description && styles.inputFilled]}
                value={formData.description}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholder="Describe your pet and the circumstances in which it was lost"
                placeholderTextColor={colors.textSecondary + "80"}
                multiline
                numberOfLines={4}
              />
            </View>

            {renderImagePicker()}
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Your Name</Text>
                <Text style={styles.requiredIndicator}>*</Text>
              </View>
              <TextInput
                style={[styles.input, formData.contactName && styles.inputFilled]}
                value={formData.contactName}
                onChangeText={(text) => handleInputChange("contactName", text)}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary + "80"}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.requiredIndicator}>*</Text>
              </View>
              <TextInput
                style={[styles.input, formData.contactPhone && styles.inputFilled]}
                value={formData.contactPhone}
                onChangeText={(text) => handleInputChange("contactPhone", text)}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary + "80"}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, formData.contactEmail && styles.inputFilled]}
                value={formData.contactEmail}
                onChangeText={(text) => handleInputChange("contactEmail", text)}
                placeholder="Enter your email address"
                placeholderTextColor={colors.textSecondary + "80"}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Reward (Optional)</Text>
              <TextInput
                style={[styles.input, formData.reward && styles.inputFilled]}
                value={formData.reward}
                onChangeText={(text) => handleInputChange("reward", text)}
                placeholder="Enter reward amount if offered"
                placeholderTextColor={colors.textSecondary + "80"}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="paw" size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
    backgroundColor: colors.tertiary + "15",
    borderRadius: 16,
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.tertiary,
    paddingBottom: spacing.xs,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  requiredIndicator: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.error,
    marginLeft: 4,
  },
  sublabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    fontStyle: "italic",
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFilled: {
    borderColor: colors.secondary,
    backgroundColor: colors.tertiary + "10", // 10% opacity
    shadowOpacity: 0.1,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectorContainer: {
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.surface,
    fontWeight: "700",
  },
  imageSection: {
    marginTop: spacing.md,
    backgroundColor: colors.tertiary + "20", // 20% opacity
    borderRadius: 12,
    padding: spacing.md,
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  imageContainer: {
    marginRight: spacing.sm,
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.tertiary,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: 12,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    shadowColor: colors.secondary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addImageText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  }
})

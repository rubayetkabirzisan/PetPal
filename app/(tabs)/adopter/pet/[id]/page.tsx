import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Checkbox, Divider, ProgressBar } from 'react-native-paper';
import { useAuth } from '../../../../../hooks/useAuth';
import { addToHistory } from '../../../../../lib/adoption-history';
import { addApplication, getPetById } from '../../../../../lib/data';

interface ApplicationForm {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;

  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Housing Information
  housingType: string;
  ownRent: string;
  landlordPermission: string;
  yardType: string;

  // Experience Information
  previousPets: string;
  currentPets: string;
  veterinarian: string;
  vetPhone: string;

  // Lifestyle Information
  hoursAlone: string;
  activityLevel: string;
  children: string;
  childrenAges: string;

  // References
  reference1Name: string;
  reference1Phone: string;
  reference1Relationship: string;
  reference2Name: string;
  reference2Phone: string;
  reference2Relationship: string;

  // Additional Information
  whyAdopt: string;
  expectations: string;
  agreement: boolean;
}

const initialForm: ApplicationForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  housingType: "",
  ownRent: "",
  landlordPermission: "",
  yardType: "",
  previousPets: "",
  currentPets: "",
  veterinarian: "",
  vetPhone: "",
  hoursAlone: "",
  activityLevel: "",
  children: "",
  childrenAges: "",
  reference1Name: "",
  reference1Phone: "",
  reference1Relationship: "",
  reference2Name: "",
  reference2Phone: "",
  reference2Relationship: "",
  whyAdopt: "",
  expectations: "",
  agreement: false,
};

export default function AdoptionApplicationPage() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const totalSteps = 6;
  const petId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const fetchPet = async () => {
      if (petId) {
        const petData = getPetById(petId);
        if (petData) {
          setPet(petData);
          // Pre-fill user information if available
          if (user) {
            setForm((prev) => ({
              ...prev,
              firstName: user.name?.split(" ")[0] || "",
              lastName: user.name?.split(" ")[1] || "",
              email: user.email || "",
            }));
          }
        }
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId, user]);

  const updateForm = (field: keyof ApplicationForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Personal Information
        if (!form.firstName.trim()) newErrors.firstName = "First name is required";
        if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        if (!form.phone.trim()) newErrors.phone = "Phone number is required";
        if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        break;

      case 2: // Address Information
        if (!form.address.trim()) newErrors.address = "Address is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.state.trim()) newErrors.state = "State is required";
        if (!form.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
        break;

      case 3: // Housing Information
        if (!form.housingType) newErrors.housingType = "Housing type is required";
        if (!form.ownRent) newErrors.ownRent = "Please specify if you own or rent";
        if (form.ownRent === "rent" && !form.landlordPermission) {
          newErrors.landlordPermission = "Landlord permission status is required";
        }
        break;

      case 4: // Experience Information
        if (!form.previousPets) newErrors.previousPets = "Please specify your pet experience";
        if (!form.hoursAlone) newErrors.hoursAlone = "Please specify hours pet will be alone";
        break;

      case 5: // References
        if (!form.reference1Name.trim()) newErrors.reference1Name = "First reference name is required";
        if (!form.reference1Phone.trim()) newErrors.reference1Phone = "First reference phone is required";
        if (!form.reference1Relationship.trim()) newErrors.reference1Relationship = "Relationship is required";
        break;

      case 6: // Final Information
        if (!form.whyAdopt.trim()) newErrors.whyAdopt = "Please explain why you want to adopt";
        if (!form.agreement) newErrors.agreement = "You must agree to the terms";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submitApplication = async () => {
    if (!validateStep(currentStep) || !pet) return;

    setIsSubmitting(true);
    try {
      // Create application
      const application = await addApplication({
        petId: pet.id,
        adopterId: user?.id || "demo-user",
        adopterName: `${form.firstName} ${form.lastName}`,
        adopterEmail: form.email,
        status: "Pending",
        submittedDate: new Date().toISOString().split("T")[0],
        notes: `Application for ${pet.name} - ${pet.breed}`,
        timeline: [
          {
            id: "1",
            status: "Application Submitted",
            date: new Date().toISOString().split("T")[0],
            description: "Your application has been received and is being reviewed.",
            completed: true,
          },
          {
            id: "2",
            status: "Under Review",
            date: "",
            description: "Our team is reviewing your application and references.",
            completed: false,
          },
          {
            id: "3",
            status: "Meet & Greet Scheduled",
            date: "",
            description: "Schedule a meeting with your potential new pet.",
            completed: false,
          },
          {
            id: "4",
            status: "Home Visit",
            date: "",
            description: "A volunteer will visit your home to ensure it's pet-ready.",
            completed: false,
          },
          {
            id: "5",
            status: "Adoption Decision",
            date: "",
            description: "Final decision on your adoption application.",
            completed: false,
          },
        ],
        progress: 20,
        currentStep: "Application submitted - under initial review",
        daysAgo: 0,
      });

      // Add to adoption history
      await addToHistory({
        petId: pet.id,
        petName: pet.name,
        petBreed: pet.breed,
        petImage: pet.images[0] || "",
        userId: user?.id || "demo-user",
        applicationDate: new Date().toISOString().split("T")[0],
        status: "pending",
        shelterName: pet.shelterName,
        shelterContact: pet.shelterPhone,
        applicationId: application.id,
      });

      Alert.alert(
        "Application Submitted",
        "Your adoption application has been successfully submitted.",
        [
          {
            text: "Track Application",
            onPress: () => {
              // In React Native, we'd normally use navigation here
              // This is now handled by our root navigator in App.tsx
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error submitting application:", error);
      Alert.alert("Error", "There was an error submitting your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="heart" size={48} color="#FF7A47" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Loading application form...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff4444" style={styles.errorIcon} />
          <Text style={styles.errorTitle}>Pet Not Found</Text>
          <Text style={styles.errorMessage}>The pet you're trying to adopt doesn't exist.</Text>
          <TouchableOpacity style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Browse Pets</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="person" size={32} color="#FF7A47" />
              <Text style={styles.stepTitle}>Personal Information</Text>
              <Text style={styles.stepSubtitle}>Tell us about yourself</Text>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={[styles.input, errors.firstName ? styles.inputError : null]}
                  value={form.firstName}
                  onChangeText={(value) => updateForm("firstName", value)}
                  placeholder="Enter first name"
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={[styles.input, errors.lastName ? styles.inputError : null]}
                  value={form.lastName}
                  onChangeText={(value) => updateForm("lastName", value)}
                  placeholder="Enter last name"
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={form.email}
                onChangeText={(value) => updateForm("email", value)}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                value={form.phone}
                onChangeText={(value) => updateForm("phone", value)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TextInput
                style={[styles.input, errors.dateOfBirth ? styles.inputError : null]}
                value={form.dateOfBirth}
                onChangeText={(value) => updateForm("dateOfBirth", value)}
                placeholder="MM/DD/YYYY"
              />
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="location" size={32} color="#FF7A47" />
              <Text style={styles.stepTitle}>Address Information</Text>
              <Text style={styles.stepSubtitle}>Where will the pet live?</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={[styles.input, errors.address ? styles.inputError : null]}
                value={form.address}
                onChangeText={(value) => updateForm("address", value)}
                placeholder="Enter street address"
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={[styles.input, errors.city ? styles.inputError : null]}
                  value={form.city}
                  onChangeText={(value) => updateForm("city", value)}
                  placeholder="Enter city"
                />
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={[styles.input, errors.state ? styles.inputError : null]}
                  value={form.state}
                  onChangeText={(value) => updateForm("state", value)}
                  placeholder="Enter state"
                />
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={[styles.input, errors.zipCode ? styles.inputError : null]}
                value={form.zipCode}
                onChangeText={(value) => updateForm("zipCode", value)}
                placeholder="Enter ZIP code"
                keyboardType="number-pad"
              />
              {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="home" size={32} color="#FF7A47" />
              <Text style={styles.stepTitle}>Housing Information</Text>
              <Text style={styles.stepSubtitle}>Tell us about your living situation</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Housing Type *</Text>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={[
                    styles.pickerOption,
                    form.housingType === "house" && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateForm("housingType", "house")}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    form.housingType === "house" && styles.pickerOptionTextSelected
                  ]}>House</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pickerOption,
                    form.housingType === "apartment" && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateForm("housingType", "apartment")}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    form.housingType === "apartment" && styles.pickerOptionTextSelected
                  ]}>Apartment</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pickerOption,
                    form.housingType === "condo" && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateForm("housingType", "condo")}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    form.housingType === "condo" && styles.pickerOptionTextSelected
                  ]}>Condo</Text>
                </Pressable>
              </View>
              {errors.housingType && <Text style={styles.errorText}>{errors.housingType}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Do you own or rent? *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm("ownRent", "own")}
                >
                  <View style={[styles.radio, form.ownRent === "own" && styles.radioSelected]}>
                    {form.ownRent === "own" && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioLabel}>Own</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm("ownRent", "rent")}
                >
                  <View style={[styles.radio, form.ownRent === "rent" && styles.radioSelected]}>
                    {form.ownRent === "rent" && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioLabel}>Rent</Text>
                </TouchableOpacity>
              </View>
              {errors.ownRent && <Text style={styles.errorText}>{errors.ownRent}</Text>}
            </View>

            {form.ownRent === "rent" && (
              <View style={styles.field}>
                <Text style={styles.label}>Do you have landlord permission for pets? *</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => updateForm("landlordPermission", "yes")}
                  >
                    <View style={[styles.radio, form.landlordPermission === "yes" && styles.radioSelected]}>
                      {form.landlordPermission === "yes" && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Yes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => updateForm("landlordPermission", "no")}
                  >
                    <View style={[styles.radio, form.landlordPermission === "no" && styles.radioSelected]}>
                      {form.landlordPermission === "no" && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>No</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => updateForm("landlordPermission", "pending")}
                  >
                    <View style={[styles.radio, form.landlordPermission === "pending" && styles.radioSelected]}>
                      {form.landlordPermission === "pending" && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Pending approval</Text>
                  </TouchableOpacity>
                </View>
                {errors.landlordPermission && <Text style={styles.errorText}>{errors.landlordPermission}</Text>}
              </View>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="heart" size={32} color="#FF7A47" />
              <Text style={styles.stepTitle}>Pet Experience</Text>
              <Text style={styles.stepSubtitle}>Tell us about your experience with pets</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Have you owned pets before? *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm("previousPets", "yes")}
                >
                  <View style={[styles.radio, form.previousPets === "yes" && styles.radioSelected]}>
                    {form.previousPets === "yes" && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm("previousPets", "no")}
                >
                  <View style={[styles.radio, form.previousPets === "no" && styles.radioSelected]}>
                    {form.previousPets === "no" && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>
              {errors.previousPets && <Text style={styles.errorText}>{errors.previousPets}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Do you currently have pets? Please describe:</Text>
              <TextInput
                style={styles.textarea}
                value={form.currentPets}
                onChangeText={(value) => updateForm("currentPets", value)}
                placeholder="List any current pets, their ages, and how long you've had them"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Current Veterinarian (if applicable)</Text>
              <TextInput
                style={styles.input}
                value={form.veterinarian}
                onChangeText={(value) => updateForm("veterinarian", value)}
                placeholder="Veterinarian name and clinic"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>How many hours per day will the pet be alone? *</Text>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={[
                    styles.pickerOption,
                    form.hoursAlone === "0-2" && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateForm("hoursAlone", "0-2")}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    form.hoursAlone === "0-2" && styles.pickerOptionTextSelected
                  ]}>0-2 hours</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pickerOption,
                    form.hoursAlone === "3-4" && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateForm("hoursAlone", "3-4")}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    form.hoursAlone === "3-4" && styles.pickerOptionTextSelected
                  ]}>3-4 hours</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pickerOption,
                    form.hoursAlone === "5-6" && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateForm("hoursAlone", "5-6")}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    form.hoursAlone === "5-6" && styles.pickerOptionTextSelected
                  ]}>5-6 hours</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.pickerOption,
                    form.hoursAlone === "7+" && styles.pickerOptionSelected
                  ]}
                  onPress={() => updateForm("hoursAlone", "7+")}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    form.hoursAlone === "7+" && styles.pickerOptionTextSelected
                  ]}>7+ hours</Text>
                </Pressable>
              </View>
              {errors.hoursAlone && <Text style={styles.errorText}>{errors.hoursAlone}</Text>}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="people" size={32} color="#FF7A47" />
              <Text style={styles.stepTitle}>References & Family</Text>
              <Text style={styles.stepSubtitle}>We need references to complete your application</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Do you have children?</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm("children", "yes")}
                >
                  <View style={[styles.radio, form.children === "yes" && styles.radioSelected]}>
                    {form.children === "yes" && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm("children", "no")}
                >
                  <View style={[styles.radio, form.children === "no" && styles.radioSelected]}>
                    {form.children === "no" && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {form.children === "yes" && (
              <View style={styles.field}>
                <Text style={styles.label}>Ages of children</Text>
                <TextInput
                  style={styles.input}
                  value={form.childrenAges}
                  onChangeText={(value) => updateForm("childrenAges", value)}
                  placeholder="e.g., 5, 8, 12"
                />
              </View>
            )}

            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Reference 1 *</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.reference1Name ? styles.inputError : null]}
                value={form.reference1Name}
                onChangeText={(value) => updateForm("reference1Name", value)}
                placeholder="Reference full name"
              />
              {errors.reference1Name && <Text style={styles.errorText}>{errors.reference1Name}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.reference1Phone ? styles.inputError : null]}
                value={form.reference1Phone}
                onChangeText={(value) => updateForm("reference1Phone", value)}
                placeholder="Reference phone number"
                keyboardType="phone-pad"
              />
              {errors.reference1Phone && <Text style={styles.errorText}>{errors.reference1Phone}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Relationship *</Text>
              <TextInput
                style={[styles.input, errors.reference1Relationship ? styles.inputError : null]}
                value={form.reference1Relationship}
                onChangeText={(value) => updateForm("reference1Relationship", value)}
                placeholder="e.g., Friend, Family member, Coworker"
              />
              {errors.reference1Relationship && <Text style={styles.errorText}>{errors.reference1Relationship}</Text>}
            </View>

            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Reference 2 (Optional)</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={form.reference2Name}
                onChangeText={(value) => updateForm("reference2Name", value)}
                placeholder="Reference full name"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={form.reference2Phone}
                onChangeText={(value) => updateForm("reference2Phone", value)}
                placeholder="Reference phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                value={form.reference2Relationship}
                onChangeText={(value) => updateForm("reference2Relationship", value)}
                placeholder="e.g., Friend, Family member, Coworker"
              />
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="document-text" size={32} color="#FF7A47" />
              <Text style={styles.stepTitle}>Final Information</Text>
              <Text style={styles.stepSubtitle}>Just a few more questions</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Why do you want to adopt this pet? *</Text>
              <TextInput
                style={[styles.textarea, errors.whyAdopt ? styles.inputError : null]}
                value={form.whyAdopt}
                onChangeText={(value) => updateForm("whyAdopt", value)}
                placeholder="Tell us why you're interested in adopting this specific pet"
                multiline
                numberOfLines={4}
              />
              {errors.whyAdopt && <Text style={styles.errorText}>{errors.whyAdopt}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>What are your expectations for this pet?</Text>
              <TextInput
                style={styles.textarea}
                value={form.expectations}
                onChangeText={(value) => updateForm("expectations", value)}
                placeholder="Describe what you hope for in your relationship with this pet"
                multiline
                numberOfLines={4}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={form.agreement ? 'checked' : 'unchecked'}
                onPress={() => updateForm("agreement", !form.agreement)}
                color="#FF7A47"
              />
              <Text style={[styles.checkboxLabel, errors.agreement ? styles.errorText : null]}>
                I understand that this application does not guarantee adoption and that all information provided is
                true and accurate. I agree to a home visit and reference checks as part of the adoption process.
              </Text>
            </View>
            {errors.agreement && <Text style={styles.errorText}>{errors.agreement}</Text>}

            <View style={styles.alert}>
              <Ionicons name="alert-circle" size={20} color="#8B4513" style={styles.alertIcon} />
              <Text style={styles.alertText}>
                By submitting this application, you agree to our adoption policies and procedures. The shelter reserves
                the right to deny any application.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Pet Info Header */}
        <View style={styles.petCard}>
          <View style={styles.petInfo}>
            <View style={styles.petImageContainer}>
              {pet.images && pet.images.length > 0 ? (
                <Image source={{ uri: pet.images[0] }} style={styles.petImage} />
              ) : (
                <View style={styles.petImagePlaceholder}>
                  <Ionicons name="paw" size={24} color="#FFF" />
                </View>
              )}
            </View>
            <View style={styles.petDetails}>
              <Text style={styles.petName}>Adopting {pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed} • {pet.age}</Text>
              <Text style={styles.petShelter}>{pet.shelterName}</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressStep}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.progressPercentage}>{Math.round((currentStep / totalSteps) * 100)}%</Text>
          </View>
          <ProgressBar
            progress={currentStep / totalSteps}
            color="#FF7A47"
            style={styles.progressBar}
          />
        </View>

        {/* Form Content */}
        <View style={styles.formCard}>
          {renderStep()}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline, currentStep === 1 && styles.buttonDisabled]}
            onPress={prevStep}
            disabled={currentStep === 1}
          >
            <Ionicons name="arrow-back" size={18} color="#8B4513" style={styles.buttonIcon} />
            <Text style={styles.buttonOutlineText}>Previous</Text>
          </TouchableOpacity>

          {currentStep < totalSteps ? (
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={nextStep}
            >
              <Text style={styles.buttonPrimaryText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={submitApplication}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonPrimaryText}>Submitting...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonPrimaryText}>Submit Application</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIcon: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#FF7A47',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  petCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFB899',
    overflow: 'hidden',
    marginRight: 16,
  },
  petImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  petImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFB899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 2,
  },
  petShelter: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.8,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStep: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#8B4513',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8E8E8',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepContainer: {
    paddingVertical: 8,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 8,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
  },
  field: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fieldHalf: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#8B4513',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
  },
  textarea: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#8B4513',
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  pickerOption: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    borderColor: '#FF7A47',
    backgroundColor: '#FFF0EB',
  },
  pickerOptionText: {
    color: '#8B4513',
  },
  pickerOptionTextSelected: {
    color: '#FF7A47',
    fontWeight: '600',
  },
  radioGroup: {
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: '#FF7A47',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7A47',
  },
  radioLabel: {
    fontSize: 14,
    color: '#8B4513',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E8E8E8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 8,
  },
  alert: {
    flexDirection: 'row',
    backgroundColor: '#FFF0EB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  alertIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: '#8B4513',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginRight: 8,
  },
  buttonPrimary: {
    backgroundColor: '#FF7A47',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginHorizontal: 4,
  },
  buttonOutlineText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

import { useAuth } from '@/hooks/useAuth';
import { addToHistory } from '@/lib/adoption-history';
import { addApplication, getPetById, type Pet } from '@/lib/data';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Define interface for form data
interface ApplicationForm {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string

  // Address Information
  address: string
  city: string
  state: string
  zipCode: string

  // Housing Information
  housingType: string
  ownRent: string
  landlordPermission: string
  yardType: string

  // Experience Information
  previousPets: string
  currentPets: string
  veterinarian: string
  vetPhone: string

  // Lifestyle Information
  hoursAlone: string
  activityLevel: string
  children: string
  childrenAges: string

  // References
  reference1Name: string
  reference1Phone: string
  reference1Relationship: string
  reference2Name: string
  reference2Phone: string
  reference2Relationship: string

  // Additional Information
  whyAdopt: string
  expectations: string
  agreement: boolean
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
}

export default function AdoptionApplicationPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  // No need for showDatePicker state anymore
  
  const { user } = useAuth();
  const totalSteps = 6;

  useEffect(() => {
    async function loadPet() {
      if (!id) return;
      
      try {
        const petData = await getPetById(id);
        
        if (petData) {
          setPet(petData);
          
          // Pre-fill user information if available
          if (user) {
            setForm(prev => ({
              ...prev,
              firstName: user.name?.split(" ")[0] || "",
              lastName: user.name?.split(" ")[1] || "",
              email: user.email || "",
            }));
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading pet data:", error);
        setLoading(false);
      }
    }

    loadPet();
  }, [id, user]);

  const updateForm = (field: keyof ApplicationForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
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
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Simple date format validator (YYYY-MM-DD)
  const validateDateFormat = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const submitApplication = async () => {
    if (!validateStep(currentStep) || !pet || !id) return;

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

      // Redirect to application tracker
      router.push(`/(tabs)/adopter/applications/${application.id}?success=true` as any);
    } catch (error) {
      console.error("Error submitting application:", error);
      Alert.alert(
        "Submission Error",
        "There was an error submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Feather name="heart" size={48} color="#FF7A47" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Loading application form...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF0000" />
          <Text style={styles.errorTitle}>Pet Not Found</Text>
          <Text style={styles.errorText}>The pet you're trying to adopt doesn't exist.</Text>
          <TouchableOpacity 
            style={styles.browsePetsButton}
            onPress={() => router.push("/(tabs)/adopter/dashboard" as any)}
          >
            <Text style={styles.browsePetsButtonText}>Browse Pets</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Feather name="user" size={48} color="#FF7A47" />
              <Text style={styles.stepTitle}>Personal Information</Text>
              <Text style={styles.stepSubtitle}>Tell us about yourself</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.formHalfItem}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={[styles.input, errors.firstName ? styles.inputError : null]}
                  value={form.firstName}
                  onChangeText={(value) => updateForm('firstName', value)}
                  placeholder="First name"
                />
                {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
              </View>
              
              <View style={styles.formHalfItem}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={[styles.input, errors.lastName ? styles.inputError : null]}
                  value={form.lastName}
                  onChangeText={(value) => updateForm('lastName', value)}
                  placeholder="Last name"
                />
                {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
              </View>
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={form.email}
                onChangeText={(value) => updateForm('email', value)}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                value={form.phone}
                onChangeText={(value) => updateForm('phone', value)}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Date of Birth * (YYYY-MM-DD)</Text>
              <View style={[styles.input, styles.dateInput, errors.dateOfBirth ? styles.inputError : null]}>
                <TextInput
                  style={styles.dateTextInput}
                  value={form.dateOfBirth}
                  onChangeText={(value) => updateForm('dateOfBirth', value)}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                />
                <Feather name="calendar" size={20} color="#8B4513" />
              </View>
              {errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Feather name="map-pin" size={48} color="#FF7A47" />
              <Text style={styles.stepTitle}>Address Information</Text>
              <Text style={styles.stepSubtitle}>Where will the pet live?</Text>
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={[styles.input, errors.address ? styles.inputError : null]}
                value={form.address}
                onChangeText={(value) => updateForm('address', value)}
                placeholder="Street address"
              />
              {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
            </View>

            <View style={styles.formGrid}>
              <View style={styles.formHalfItem}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={[styles.input, errors.city ? styles.inputError : null]}
                  value={form.city}
                  onChangeText={(value) => updateForm('city', value)}
                  placeholder="City"
                />
                {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
              </View>
              
              <View style={styles.formHalfItem}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={[styles.input, errors.state ? styles.inputError : null]}
                  value={form.state}
                  onChangeText={(value) => updateForm('state', value)}
                  placeholder="State"
                />
                {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
              </View>
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={[styles.input, errors.zipCode ? styles.inputError : null]}
                value={form.zipCode}
                onChangeText={(value) => updateForm('zipCode', value)}
                placeholder="ZIP code"
                keyboardType="numeric"
              />
              {errors.zipCode ? <Text style={styles.errorText}>{errors.zipCode}</Text> : null}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Feather name="home" size={48} color="#FF7A47" />
              <Text style={styles.stepTitle}>Housing Information</Text>
              <Text style={styles.stepSubtitle}>Tell us about your living situation</Text>
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Housing Type *</Text>
              <View style={styles.selectContainer}>
                {['house', 'apartment', 'condo', 'townhouse', 'mobile-home'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.selectOption,
                      form.housingType === type ? styles.selectedOption : null
                    ]}
                    onPress={() => updateForm('housingType', type)}
                  >
                    <Text 
                      style={[
                        styles.selectOptionText,
                        form.housingType === type ? styles.selectedOptionText : null
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.housingType ? <Text style={styles.errorText}>{errors.housingType}</Text> : null}
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Do you own or rent? *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm('ownRent', 'own')}
                >
                  <View style={[
                    styles.radioButton,
                    form.ownRent === 'own' ? styles.radioButtonSelected : null
                  ]}>
                    {form.ownRent === 'own' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Own</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm('ownRent', 'rent')}
                >
                  <View style={[
                    styles.radioButton,
                    form.ownRent === 'rent' ? styles.radioButtonSelected : null
                  ]}>
                    {form.ownRent === 'rent' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Rent</Text>
                </TouchableOpacity>
              </View>
              {errors.ownRent ? <Text style={styles.errorText}>{errors.ownRent}</Text> : null}
            </View>

            {form.ownRent === 'rent' && (
              <View style={styles.formItem}>
                <Text style={styles.label}>Do you have landlord permission for pets? *</Text>
                <View style={styles.radioGroup}>
                  {['yes', 'no', 'pending'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.radioOption}
                      onPress={() => updateForm('landlordPermission', option)}
                    >
                      <View style={[
                        styles.radioButton,
                        form.landlordPermission === option ? styles.radioButtonSelected : null
                      ]}>
                        {form.landlordPermission === option && <View style={styles.radioButtonInner} />}
                      </View>
                      <Text style={styles.radioLabel}>
                        {option === 'pending' ? 'Pending approval' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.landlordPermission ? <Text style={styles.errorText}>{errors.landlordPermission}</Text> : null}
              </View>
            )}

            <View style={styles.formItem}>
              <Text style={styles.label}>Yard/Outdoor Space</Text>
              <View style={styles.selectContainer}>
                {[
                  { value: 'large-fenced', label: 'Large Fenced Yard' },
                  { value: 'small-fenced', label: 'Small Fenced Yard' },
                  { value: 'large-unfenced', label: 'Large Unfenced Yard' },
                  { value: 'small-unfenced', label: 'Small Unfenced Yard' },
                  { value: 'balcony', label: 'Balcony/Patio' },
                  { value: 'none', label: 'No Outdoor Space' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.selectOption,
                      form.yardType === option.value ? styles.selectedOption : null
                    ]}
                    onPress={() => updateForm('yardType', option.value)}
                  >
                    <Text 
                      style={[
                        styles.selectOptionText,
                        form.yardType === option.value ? styles.selectedOptionText : null
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Feather name="heart" size={48} color="#FF7A47" />
              <Text style={styles.stepTitle}>Pet Experience</Text>
              <Text style={styles.stepSubtitle}>Tell us about your experience with pets</Text>
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Have you owned pets before? *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm('previousPets', 'yes')}
                >
                  <View style={[
                    styles.radioButton,
                    form.previousPets === 'yes' ? styles.radioButtonSelected : null
                  ]}>
                    {form.previousPets === 'yes' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm('previousPets', 'no')}
                >
                  <View style={[
                    styles.radioButton,
                    form.previousPets === 'no' ? styles.radioButtonSelected : null
                  ]}>
                    {form.previousPets === 'no' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>
              {errors.previousPets ? <Text style={styles.errorText}>{errors.previousPets}</Text> : null}
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Do you currently have pets? Please describe:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.currentPets}
                onChangeText={(value) => updateForm('currentPets', value)}
                placeholder="List any current pets, their ages, and how long you've had them"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Current Veterinarian (if applicable)</Text>
              <TextInput
                style={styles.input}
                value={form.veterinarian}
                onChangeText={(value) => updateForm('veterinarian', value)}
                placeholder="Veterinarian name and clinic"
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Veterinarian Phone Number</Text>
              <TextInput
                style={styles.input}
                value={form.vetPhone}
                onChangeText={(value) => updateForm('vetPhone', value)}
                placeholder="Vet phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>How many hours per day will the pet be alone? *</Text>
              <View style={styles.selectContainer}>
                {['0-2', '3-4', '5-6', '7-8', '9+'].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.selectOption,
                      form.hoursAlone === hours ? styles.selectedOption : null
                    ]}
                    onPress={() => updateForm('hoursAlone', hours)}
                  >
                    <Text 
                      style={[
                        styles.selectOptionText,
                        form.hoursAlone === hours ? styles.selectedOptionText : null
                      ]}
                    >
                      {hours} hours
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.hoursAlone ? <Text style={styles.errorText}>{errors.hoursAlone}</Text> : null}
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Your activity level</Text>
              <View style={styles.selectContainer}>
                {[
                  { value: 'low', label: 'Low - Prefer quiet activities' },
                  { value: 'moderate', label: 'Moderate - Some outdoor activities' },
                  { value: 'high', label: 'High - Very active lifestyle' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.selectOption,
                      form.activityLevel === option.value ? styles.selectedOption : null
                    ]}
                    onPress={() => updateForm('activityLevel', option.value)}
                  >
                    <Text 
                      style={[
                        styles.selectOptionText,
                        form.activityLevel === option.value ? styles.selectedOptionText : null
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Feather name="users" size={48} color="#FF7A47" />
              <Text style={styles.stepTitle}>References & Family</Text>
              <Text style={styles.stepSubtitle}>We need references to complete your application</Text>
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Do you have children?</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm('children', 'yes')}
                >
                  <View style={[
                    styles.radioButton,
                    form.children === 'yes' ? styles.radioButtonSelected : null
                  ]}>
                    {form.children === 'yes' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateForm('children', 'no')}
                >
                  <View style={[
                    styles.radioButton,
                    form.children === 'no' ? styles.radioButtonSelected : null
                  ]}>
                    {form.children === 'no' && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {form.children === 'yes' && (
              <View style={styles.formItem}>
                <Text style={styles.label}>Ages of children</Text>
                <TextInput
                  style={styles.input}
                  value={form.childrenAges}
                  onChangeText={(value) => updateForm('childrenAges', value)}
                  placeholder="e.g., 5, 8, 12"
                />
              </View>
            )}

            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Reference 1 *</Text>

            <View style={styles.formItem}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.reference1Name ? styles.inputError : null]}
                value={form.reference1Name}
                onChangeText={(value) => updateForm('reference1Name', value)}
                placeholder="Reference name"
              />
              {errors.reference1Name ? <Text style={styles.errorText}>{errors.reference1Name}</Text> : null}
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.reference1Phone ? styles.inputError : null]}
                value={form.reference1Phone}
                onChangeText={(value) => updateForm('reference1Phone', value)}
                placeholder="Reference phone number"
                keyboardType="phone-pad"
              />
              {errors.reference1Phone ? <Text style={styles.errorText}>{errors.reference1Phone}</Text> : null}
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Relationship *</Text>
              <TextInput
                style={[styles.input, errors.reference1Relationship ? styles.inputError : null]}
                value={form.reference1Relationship}
                onChangeText={(value) => updateForm('reference1Relationship', value)}
                placeholder="e.g., Friend, Family member, Coworker"
              />
              {errors.reference1Relationship ? <Text style={styles.errorText}>{errors.reference1Relationship}</Text> : null}
            </View>

            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Reference 2 (Optional)</Text>

            <View style={styles.formItem}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={form.reference2Name}
                onChangeText={(value) => updateForm('reference2Name', value)}
                placeholder="Reference name"
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={form.reference2Phone}
                onChangeText={(value) => updateForm('reference2Phone', value)}
                placeholder="Reference phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                value={form.reference2Relationship}
                onChangeText={(value) => updateForm('reference2Relationship', value)}
                placeholder="e.g., Friend, Family member, Coworker"
              />
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Feather name="file-text" size={48} color="#FF7A47" />
              <Text style={styles.stepTitle}>Final Information</Text>
              <Text style={styles.stepSubtitle}>Just a few more questions</Text>
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>Why do you want to adopt this pet? *</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.whyAdopt ? styles.inputError : null]}
                value={form.whyAdopt}
                onChangeText={(value) => updateForm('whyAdopt', value)}
                placeholder="Tell us why you're interested in adopting this specific pet"
                multiline={true}
                numberOfLines={4}
              />
              {errors.whyAdopt ? <Text style={styles.errorText}>{errors.whyAdopt}</Text> : null}
            </View>

            <View style={styles.formItem}>
              <Text style={styles.label}>What are your expectations for this pet?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.expectations}
                onChangeText={(value) => updateForm('expectations', value)}
                placeholder="Describe what you hope for in your relationship with this pet"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={styles.sectionDivider} />

            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => updateForm('agreement', !form.agreement)}
            >
              <View style={[
                styles.checkbox,
                form.agreement ? styles.checkboxChecked : null,
                errors.agreement ? styles.inputError : null
              ]}>
                {form.agreement && <Feather name="check" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I understand that this application does not guarantee adoption and that all information 
                provided is true and accurate. I agree to a home visit and reference checks as part of 
                the adoption process. *
              </Text>
            </TouchableOpacity>
            {errors.agreement ? <Text style={styles.errorText}>{errors.agreement}</Text> : null}

            <View style={styles.alertContainer}>
              <View style={styles.alertContent}>
                <Feather name="alert-circle" size={16} color="#8B4513" style={styles.alertIcon} />
                <Text style={styles.alertText}>
                  By submitting this application, you agree to our adoption policies and procedures. 
                  The shelter reserves the right to deny any application.
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
      >
        <ScrollView style={styles.scrollView}>
          {/* Pet Info Header */}
          <View style={styles.petCard}>
            <View style={styles.petInfoContainer}>
              <View style={styles.petImageContainer}>
                <Image 
                  source={{uri: pet.images[0] || "https://via.placeholder.com/64"}} 
                  style={styles.petImage} 
                  resizeMode="cover"
                />
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>Adopting {pet.name}</Text>
                <Text style={styles.petBreed}>{pet.breed} • {pet.age}</Text>
                <Text style={styles.shelterName}>{pet.shelterName}</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
              <Text style={styles.progressPercentage}>
                {Math.round((currentStep / totalSteps) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${(currentStep / totalSteps) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Form Content */}
          <View style={styles.formCard}>
            {renderStepContent()}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={[
                styles.navButton, 
                styles.prevButton,
                currentStep === 1 ? styles.disabledButton : null
              ]}
              onPress={prevStep}
              disabled={currentStep === 1}
            >
              <Feather name="arrow-left" size={20} color="#8B4513" style={styles.buttonIcon} />
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableOpacity>

            {currentStep < totalSteps ? (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={nextStep}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Feather name="arrow-right" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={submitApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.nextButtonText}>Submit Application</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIcon: {
    marginBottom: 16,
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
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  browsePetsButton: {
    backgroundColor: '#FF7A47',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  browsePetsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFB899',
    overflow: 'hidden',
    marginRight: 12,
  },
  petImage: {
    width: 64,
    height: 64,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 2,
  },
  shelterName: {
    fontSize: 12,
    color: '#8B4513',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#8B4513',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF7A47',
    borderRadius: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepContent: {
    paddingVertical: 8,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B4513',
    marginTop: 8,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#8B4513',
  },
  formItem: {
    marginBottom: 16,
  },
  formGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formHalfItem: {
    width: '48%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#8B4513',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
  },
  inputText: {
    fontSize: 16,
    color: '#8B4513',
  },
  placeholderText: {
    fontSize: 16,
    color: '#A9A9A9',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#FF7A47',
    borderColor: '#FF7A47',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#8B4513',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  radioGroup: {
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#FF7A47',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7A47',
  },
  radioLabel: {
    fontSize: 16,
    color: '#8B4513',
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#8B4513',
    marginRight: 10,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF7A47',
    borderColor: '#FF7A47',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#8B4513',
  },
  alertContainer: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  alertContent: {
    flexDirection: 'row',
  },
  alertIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#8B4513',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  prevButton: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    marginLeft: 8,
    backgroundColor: '#FF7A47',
  },
  disabledButton: {
    opacity: 0.5,
  },
  prevButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginHorizontal: 6,
  },
});

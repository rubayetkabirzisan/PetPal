"use client"

import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native"
import data from "../lib/data"
import { colors } from "../theme/theme"

interface ApplicationFormScreenProps {
  navigation: any
  route: any
}

type HousingType = "house" | "apartment" | "condo" | "other"
type OwnRentType = "own" | "rent" | "other"
type ExerciseCommitment = "low" | "medium" | "high"

export default function ApplicationFormScreen({ navigation, route }: ApplicationFormScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",

    // Address Information
    address: "",
    city: "",
    state: "",
    zipCode: "",
    housingType: "" as HousingType | "",
    ownRent: "" as OwnRentType | "",
    hasYard: false,
    yardFenced: false,
    landlordsName: "",
    landlordsPhone: "",

    // Pet Experience
    previousPets: "",
    currentPets: "",
    veterinarian: "",
    vetPhone: "",
    petExperience: "",

    // Lifestyle
    workSchedule: "",
    hoursAlone: "",
    exerciseCommitment: "" as ExerciseCommitment | "",
    travelFrequency: "",
    familyMembers: "",
    allergies: false,

    // References
    reference1Name: "",
    reference1Phone: "",
    reference1Relation: "",
    reference2Name: "",
    reference2Phone: "",
    reference2Relation: "",

    // Additional Information
    whyAdopt: "",
    expectations: "",
    trainingPlan: "",
    healthCareCommitment: "",
    financialPreparation: "",
    additionalComments: "",
  })

  const petId = route.params?.petId
  const petInfo = petId ? data.mockPets.find((pet: any) => pet.id === petId) : null

  const steps = ["Personal Info", "Address", "Pet Experience", "Lifestyle", "References", "Additional", "Review"]

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitApplication = () => {
    Alert.alert("Submit Application", "Are you sure you want to submit your adoption application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: () => {
          // Here you would typically send the form data to your backend API
          Alert.alert(
            "Application Submitted!",
            "Your adoption application has been submitted successfully. You will receive updates via email and in-app notifications.",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("adopter", { 
                  screen: "applications",
                  params: { applicationId: "new-app-" + Date.now() }
                }),
              },
            ],
          )
        },
      },
    ])
  }

  const renderStepIndicator = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepIndicatorScroll}>
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
                index < currentStep && styles.stepCircleCompleted,
              ]}
            >
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text style={[styles.stepNumber, index <= currentStep && styles.stepNumberActive]}>{index + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, index <= currentStep && styles.stepLabelActive]}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )

  const renderPersonalInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>Tell us about yourself</Text>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>First Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.firstName}
            onChangeText={(text) => updateFormData("firstName", text)}
            placeholder="Enter first name"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Last Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.lastName}
            onChangeText={(text) => updateFormData("lastName", text)}
            placeholder="Enter last name"
            placeholderTextColor={colors.text + "80"}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.email}
          onChangeText={(text) => updateFormData("email", text)}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.phone}
          onChangeText={(text) => updateFormData("phone", text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Birth *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.dateOfBirth}
          onChangeText={(text) => updateFormData("dateOfBirth", text)}
          placeholder="MM/DD/YYYY"
          placeholderTextColor={colors.text + "80"}
        />
      </View>
    </View>
  )

  const renderAddressInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Address Information</Text>
      <Text style={styles.stepDescription}>Tell us about your living situation</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Street Address *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.address}
          onChangeText={(text) => updateFormData("address", text)}
          placeholder="Enter your street address"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.city}
            onChangeText={(text) => updateFormData("city", text)}
            placeholder="Enter city"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputQuarter}>
          <Text style={styles.inputLabel}>State *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.state}
            onChangeText={(text) => updateFormData("state", text)}
            placeholder="State"
            maxLength={2}
            autoCapitalize="characters"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputQuarter}>
          <Text style={styles.inputLabel}>ZIP *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.zipCode}
            onChangeText={(text) => updateFormData("zipCode", text)}
            placeholder="ZIP"
            keyboardType="number-pad"
            maxLength={5}
            placeholderTextColor={colors.text + "80"}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Housing Type *</Text>
        <View style={styles.optionGrid}>
          {[
            { value: "house", label: "House" },
            { value: "apartment", label: "Apartment" },
            { value: "condo", label: "Condo" },
            { value: "other", label: "Other" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.housingType === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => updateFormData("housingType", option.value)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  formData.housingType === option.value && styles.optionButtonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Do you rent or own? *</Text>
        <View style={styles.optionGrid}>
          {[
            { value: "rent", label: "Rent" },
            { value: "own", label: "Own" },
            { value: "other", label: "Other" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.ownRent === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => updateFormData("ownRent", option.value)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  formData.ownRent === option.value && styles.optionButtonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {formData.ownRent === "rent" && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Landlord's Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.landlordsName}
              onChangeText={(text) => updateFormData("landlordsName", text)}
              placeholder="Enter landlord's name"
              placeholderTextColor={colors.text + "80"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Landlord's Phone *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.landlordsPhone}
              onChangeText={(text) => updateFormData("landlordsPhone", text)}
              placeholder="Enter landlord's phone"
              keyboardType="phone-pad"
              placeholderTextColor={colors.text + "80"}
            />
          </View>
        </>
      )}

      <View style={styles.switchRow}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.inputLabel}>Do you have a yard?</Text>
        </View>
        <Switch
          value={formData.hasYard}
          onValueChange={(value) => updateFormData("hasYard", value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={"white"}
        />
      </View>

      {formData.hasYard && (
        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.inputLabel}>Is your yard fenced?</Text>
          </View>
          <Switch
            value={formData.yardFenced}
            onValueChange={(value) => updateFormData("yardFenced", value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={"white"}
          />
        </View>
      )}
    </View>
  )

  const renderPetExperience = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Pet Experience</Text>
      <Text style={styles.stepDescription}>Tell us about your experience with pets</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Previous Pets</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.previousPets}
          onChangeText={(text) => updateFormData("previousPets", text)}
          placeholder="Describe any pets you've had in the past"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Pets</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.currentPets}
          onChangeText={(text) => updateFormData("currentPets", text)}
          placeholder="Describe any pets you currently have"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Veterinarian Name</Text>
        <TextInput
          style={styles.textInput}
          value={formData.veterinarian}
          onChangeText={(text) => updateFormData("veterinarian", text)}
          placeholder="Enter veterinarian's name"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Veterinarian Phone</Text>
        <TextInput
          style={styles.textInput}
          value={formData.vetPhone}
          onChangeText={(text) => updateFormData("vetPhone", text)}
          placeholder="Enter veterinarian's phone"
          placeholderTextColor={colors.text + "80"}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pet Experience *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.petExperience}
          onChangeText={(text) => updateFormData("petExperience", text)}
          placeholder="Describe your experience with pets, including training, care, and any specific breeds"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  )

  const renderLifestyle = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Lifestyle Information</Text>
      <Text style={styles.stepDescription}>Tell us about your day-to-day life</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Work Schedule *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.workSchedule}
          onChangeText={(text) => updateFormData("workSchedule", text)}
          placeholder="Describe your typical work schedule"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Hours pet will be alone per day *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.hoursAlone}
          onChangeText={(text) => updateFormData("hoursAlone", text)}
          placeholder="Enter number of hours"
          keyboardType="number-pad"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Exercise Commitment *</Text>
        <View style={styles.optionGrid}>
          {[
            { value: "low", label: "Low (0-30 min/day)" },
            { value: "medium", label: "Medium (30-60 min/day)" },
            { value: "high", label: "High (60+ min/day)" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.exerciseCommitment === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => updateFormData("exerciseCommitment", option.value)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  formData.exerciseCommitment === option.value && styles.optionButtonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Travel Frequency *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.travelFrequency}
          onChangeText={(text) => updateFormData("travelFrequency", text)}
          placeholder="How often do you travel?"
          placeholderTextColor={colors.text + "80"}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Family Members *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.familyMembers}
          onChangeText={(text) => updateFormData("familyMembers", text)}
          placeholder="Describe the people who live in your household, including children and their ages"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.inputLabel}>Does anyone in your home have allergies to pets?</Text>
        </View>
        <Switch
          value={formData.allergies}
          onValueChange={(value) => updateFormData("allergies", value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={"white"}
        />
      </View>
    </View>
  )

  const renderReferences = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>References</Text>
      <Text style={styles.stepDescription}>Provide two personal references who can vouch for your ability to care for a pet</Text>

      <View style={styles.referenceContainer}>
        <Text style={styles.referenceTitle}>Reference #1</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.reference1Name}
            onChangeText={(text) => updateFormData("reference1Name", text)}
            placeholder="Enter reference's full name"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.reference1Phone}
            onChangeText={(text) => updateFormData("reference1Phone", text)}
            placeholder="Enter reference's phone number"
            keyboardType="phone-pad"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Relationship to you *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.reference1Relation}
            onChangeText={(text) => updateFormData("reference1Relation", text)}
            placeholder="Friend, family member, colleague, etc."
            placeholderTextColor={colors.text + "80"}
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.referenceContainer}>
        <Text style={styles.referenceTitle}>Reference #2</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.reference2Name}
            onChangeText={(text) => updateFormData("reference2Name", text)}
            placeholder="Enter reference's full name"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.reference2Phone}
            onChangeText={(text) => updateFormData("reference2Phone", text)}
            placeholder="Enter reference's phone number"
            keyboardType="phone-pad"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Relationship to you *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.reference2Relation}
            onChangeText={(text) => updateFormData("reference2Relation", text)}
            placeholder="Friend, family member, colleague, etc."
            placeholderTextColor={colors.text + "80"}
          />
        </View>
      </View>
    </View>
  )

  const renderAdditionalInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Additional Information</Text>
      <Text style={styles.stepDescription}>Help us understand why you would make a great pet parent</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Why do you want to adopt this pet? *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.whyAdopt}
          onChangeText={(text) => updateFormData("whyAdopt", text)}
          placeholder="Tell us why you're interested in adopting this particular pet"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What are your expectations for this pet? *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.expectations}
          onChangeText={(text) => updateFormData("expectations", text)}
          placeholder="Describe your expectations regarding the pet's behavior, activity level, etc."
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Training plans *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.trainingPlan}
          onChangeText={(text) => updateFormData("trainingPlan", text)}
          placeholder="Describe your plans for training and socializing the pet"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Healthcare commitment *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.healthCareCommitment}
          onChangeText={(text) => updateFormData("healthCareCommitment", text)}
          placeholder="Describe your commitment to the pet's healthcare needs"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Financial preparation *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.financialPreparation}
          onChangeText={(text) => updateFormData("financialPreparation", text)}
          placeholder="Describe how you're financially prepared for pet ownership"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Additional Comments</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.additionalComments}
          onChangeText={(text) => updateFormData("additionalComments", text)}
          placeholder="Any other information you'd like to share"
          placeholderTextColor={colors.text + "80"}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  )

  const renderReview = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review Application</Text>
      <Text style={styles.stepDescription}>Please review all information before submitting</Text>

      {petInfo && (
        <View style={styles.petInfoContainer}>
          <Text style={styles.petInfoTitle}>Application for: {petInfo.name}</Text>
          <Text style={styles.petInfoSubtitle}>{petInfo.breed} • {petInfo.age} • {petInfo.location}</Text>
        </View>
      )}

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Personal Information</Text>
        <Text style={styles.reviewText}>Name: {formData.firstName} {formData.lastName}</Text>
        <Text style={styles.reviewText}>Email: {formData.email}</Text>
        <Text style={styles.reviewText}>Phone: {formData.phone}</Text>
        <Text style={styles.reviewText}>Date of Birth: {formData.dateOfBirth}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Address</Text>
        <Text style={styles.reviewText}>{formData.address}</Text>
        <Text style={styles.reviewText}>{formData.city}, {formData.state} {formData.zipCode}</Text>
        <Text style={styles.reviewText}>Housing: {formData.housingType || "Not specified"}</Text>
        <Text style={styles.reviewText}>Ownership: {formData.ownRent || "Not specified"}</Text>
        <Text style={styles.reviewText}>Yard: {formData.hasYard ? "Yes" : "No"}{formData.hasYard && formData.yardFenced ? ", Fenced" : ""}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Pet Experience</Text>
        <Text style={styles.reviewText}>Previous Pets: {formData.previousPets || "None"}</Text>
        <Text style={styles.reviewText}>Current Pets: {formData.currentPets || "None"}</Text>
        <Text style={styles.reviewText}>Veterinarian: {formData.veterinarian || "Not specified"}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Lifestyle</Text>
        <Text style={styles.reviewText}>Work Schedule: {formData.workSchedule}</Text>
        <Text style={styles.reviewText}>Hours Pet Will Be Alone: {formData.hoursAlone}</Text>
        <Text style={styles.reviewText}>Exercise Commitment: {formData.exerciseCommitment || "Not specified"}</Text>
        <Text style={styles.reviewText}>Family Members: {formData.familyMembers}</Text>
      </View>

      <View style={styles.disclaimer}>
        <MaterialIcons name="info" size={24} color={colors.primary} />
        <Text style={styles.disclaimerText}>
          By submitting this application, I certify that all information provided is accurate and complete. I understand that submitting false information may result in the denial of my application. I consent to a home check if required by the adoption organization.
        </Text>
      </View>
    </View>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfo()
      case 1:
        return renderAddressInfo()
      case 2:
        return renderPetExperience()
      case 3:
        return renderLifestyle()
      case 4:
        return renderReferences()
      case 5:
        return renderAdditionalInfo()
      case 6:
        return renderReview()
      default:
        return renderPersonalInfo()
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={currentStep === steps.length - 1 ? submitApplication : nextStep}
        >
          <Text style={styles.nextButtonText}>{currentStep === steps.length - 1 ? "Submit Application" : "Next"}</Text>
          {currentStep < steps.length - 1 && <Ionicons name="chevron-forward" size={20} color="white" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepIndicatorScroll: {
    maxHeight: 100,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepIndicator: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    minWidth: "100%",
  },
  stepItem: {
    alignItems: "center",
    width: 80,
    marginRight: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  stepNumberActive: {
    color: "white",
  },
  stepLabel: {
    fontSize: 10,
    color: colors.text,
    opacity: 0.6,
    textAlign: "center",
  },
  stepLabelActive: {
    opacity: 1,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  inputHalf: {
    flex: 1,
  },
  inputQuarter: {
    flex: 0.5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectText: {
    fontSize: 16,
    color: colors.text,
  },
  selectTextPlaceholder: {
    fontSize: 16,
    color: colors.text + "80",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "white",
    minWidth: "48%",
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  optionButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  optionButtonTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  switchTextContainer: {
    flex: 1,
  },
  referenceContainer: {
    marginBottom: 20,
  },
  referenceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  reviewSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  petInfoContainer: {
    padding: 16,
    backgroundColor: colors.primary + "20",
    borderRadius: 8,
    marginBottom: 24,
  },
  petInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  petInfoSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primary + "10",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

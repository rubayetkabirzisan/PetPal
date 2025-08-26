"use client"

import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { getPets, type Pet } from "../lib/data"
import { colors, spacing } from "../theme/theme"

const { width } = Dimensions.get("window")

interface AiPetScreenProps {
  navigation: any
}

interface UserPreferences {
  petType: "dog" | "cat" | "other" | ""
  size: "small" | "medium" | "large" | ""
  age: "young" | "adult" | "senior" | ""
  activityLevel: "low" | "medium" | "high" | ""
  livingSpace: "apartment" | "house" | "farm" | ""
  experience: "beginner" | "intermediate" | "experienced" | ""
  children: boolean
  otherPets: boolean
  allergies: boolean
  timeAvailable: "low" | "medium" | "high" | ""
}

interface MatchScore {
  pet: Pet
  score: number
  reasons: string[]
}

export default function AiPetScreen({ navigation }: AiPetScreenProps) {
  const [pets, setPets] = useState<Pet[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    petType: "",
    size: "",
    age: "",
    activityLevel: "",
    livingSpace: "",
    experience: "",
    children: false,
    otherPets: false,
    allergies: false,
    timeAvailable: "",
  })
  const [matches, setMatches] = useState<MatchScore[]>([])
  const [showPreferences, setShowPreferences] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  useEffect(() => {
    loadPets()
  }, [])

  // Handle hardware back button and navigation gestures
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showPreferences) {
          if (currentStep > 1) {
            prevStep()
            return true // Prevent default back action
          } else {
            // On first step or analyzing, go back to previous screen
            navigation.goBack()
            return true
          }
        } else if (isAnalyzing) {
          // During analysis, allow going back but show confirmation
          Alert.alert(
            "Cancel Analysis",
            "Are you sure you want to cancel the AI matching process?",
            [
              { text: "Continue", style: "cancel" },
              { 
                text: "Cancel", 
                style: "destructive",
                onPress: () => navigation.goBack()
              }
            ]
          )
          return true
        } else {
          // On results screen, go back normally
          navigation.goBack()
          return true
        }
      }

      // Add event listener for Android hardware back button
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
      
      return () => subscription.remove()
    }, [showPreferences, currentStep, isAnalyzing, navigation])
  )

  const loadPets = async () => {
    try {
      const allPets = await getPets()
      setPets(allPets.filter(pet => pet.status === "available"))
    } catch (error) {
      console.error("Error loading pets:", error)
    }
  }

  const calculateCompatibilityScore = (pet: Pet): MatchScore => {
    let score = 0
    const reasons: string[] = []
    const maxScore = 100

    // Pet type matching (20 points)
    if (preferences.petType && pet.species.toLowerCase() === preferences.petType.toLowerCase()) {
      score += 20
      reasons.push(`Perfect ${pet.species} match for your preference`)
    }

    // Size matching (15 points)
    if (preferences.size && pet.size?.toLowerCase() === preferences.size.toLowerCase()) {
      score += 15
      reasons.push(`${pet.size} size matches your living situation`)
    }

    // Age matching (15 points)
    const petAge = calculatePetAgeCategory(pet.age)
    if (preferences.age && petAge === preferences.age) {
      score += 15
      reasons.push(`${petAge} age is perfect for your experience level`)
    }

    // Activity level matching (15 points)
    if (preferences.activityLevel && pet.activityLevel?.toLowerCase() === preferences.activityLevel.toLowerCase()) {
      score += 15
      reasons.push(`${pet.activityLevel} activity level matches your lifestyle`)
    }

    // Living space compatibility (10 points)
    if (preferences.livingSpace) {
      if (preferences.livingSpace === "apartment" && pet.size !== "large") {
        score += 10
        reasons.push("Suitable for apartment living")
      } else if (preferences.livingSpace === "house") {
        score += 10
        reasons.push("Perfect for house environment")
      } else if (preferences.livingSpace === "farm") {
        score += 10
        reasons.push("Great for farm/rural environment")
      }
    }

    // Special considerations (25 points total)
    if (preferences.children && pet.goodWithKids) {
      score += 10
      reasons.push("Excellent with children")
    }

    if (preferences.otherPets && pet.goodWithPets) {
      score += 10
      reasons.push("Gets along well with other pets")
    }

    if (preferences.allergies && pet.hypoallergenic) {
      score += 5
      reasons.push("Hypoallergenic - great for allergies")
    }

    // Ensure we don't exceed max score
    score = Math.min(score, maxScore)

    return { pet, score, reasons }
  }

  const calculatePetAgeCategory = (age: string): "young" | "adult" | "senior" => {
    const ageNum = parseInt(age)
    if (ageNum <= 2) return "young"
    if (ageNum <= 7) return "adult"
    return "senior"
  }

  const analyzeMatches = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    const scores = pets.map(calculateCompatibilityScore)
    const sortedMatches = scores
      .filter(match => match.score > 20) // Only show matches with decent compatibility
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 matches

    setMatches(sortedMatches)
    setIsAnalyzing(false)
    setShowPreferences(false)
  }

  const resetPreferences = () => {
    setPreferences({
      petType: "",
      size: "",
      age: "",
      activityLevel: "",
      livingSpace: "",
      experience: "",
      children: false,
      otherPets: false,
      allergies: false,
      timeAvailable: "",
    })
    setCurrentStep(1)
    setMatches([])
    setShowPreferences(true)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBackPress = () => {
    if (showPreferences) {
      if (currentStep > 1) {
        prevStep()
      } else {
        navigation.goBack()
      }
    } else if (isAnalyzing) {
      Alert.alert(
        "Cancel Analysis",
        "Are you sure you want to cancel the AI matching process?",
        [
          { text: "Continue", style: "cancel" },
          { 
            text: "Cancel", 
            style: "destructive",
            onPress: () => navigation.goBack()
          }
        ]
      )
    } else {
      navigation.goBack()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return preferences.petType !== ""
      case 2:
        return preferences.size !== "" && preferences.livingSpace !== ""
      case 3:
        return preferences.age !== "" && preferences.experience !== ""
      case 4:
        return preferences.activityLevel !== "" && preferences.timeAvailable !== ""
      default:
        return false
    }
  }

  const renderPreferenceStep = () => {
    switch (currentStep) {
      case 1:
        return renderPetTypeStep()
      case 2:
        return renderSizeAndLivingStep()
      case 3:
        return renderAgeAndExperienceStep()
      case 4:
        return renderActivityAndTimeStep()
      default:
        return null
    }
  }

  const renderPetTypeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What type of pet are you looking for?</Text>
      <View style={styles.optionsContainer}>
        {["dog", "cat", "other"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.optionButton,
              preferences.petType === type && styles.selectedOption
            ]}
            onPress={() => setPreferences({...preferences, petType: type as any})}
          >
            <Ionicons 
              name={type === "dog" ? "paw" : type === "cat" ? "paw" : "heart"} 
              size={24} 
              color={preferences.petType === type ? "white" : colors.primary} 
            />
            <Text style={[
              styles.optionText,
              preferences.petType === type && styles.selectedOptionText
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderSizeAndLivingStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Size preference and living situation</Text>
      
      <Text style={styles.subStepTitle}>Pet Size:</Text>
      <View style={styles.optionsContainer}>
        {["small", "medium", "large"].map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.optionButton,
              preferences.size === size && styles.selectedOption
            ]}
            onPress={() => setPreferences({...preferences, size: size as any})}
          >
            <Text style={[
              styles.optionText,
              preferences.size === size && styles.selectedOptionText
            ]}>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subStepTitle}>Living Space:</Text>
      <View style={styles.optionsContainer}>
        {["apartment", "house", "farm"].map((space) => (
          <TouchableOpacity
            key={space}
            style={[
              styles.optionButton,
              preferences.livingSpace === space && styles.selectedOption
            ]}
            onPress={() => setPreferences({...preferences, livingSpace: space as any})}
          >
            <Text style={[
              styles.optionText,
              preferences.livingSpace === space && styles.selectedOptionText
            ]}>
              {space.charAt(0).toUpperCase() + space.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderAgeAndExperienceStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Age preference and your experience</Text>
      
      <Text style={styles.subStepTitle}>Pet Age:</Text>
      <View style={styles.optionsContainer}>
        {[
          { key: "young", label: "Young (0-2 years)" },
          { key: "adult", label: "Adult (3-7 years)" },
          { key: "senior", label: "Senior (8+ years)" }
        ].map((age) => (
          <TouchableOpacity
            key={age.key}
            style={[
              styles.optionButton,
              preferences.age === age.key && styles.selectedOption
            ]}
            onPress={() => setPreferences({...preferences, age: age.key as any})}
          >
            <Text style={[
              styles.optionText,
              preferences.age === age.key && styles.selectedOptionText
            ]}>
              {age.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subStepTitle}>Your Experience:</Text>
      <View style={styles.optionsContainer}>
        {["beginner", "intermediate", "experienced"].map((exp) => (
          <TouchableOpacity
            key={exp}
            style={[
              styles.optionButton,
              preferences.experience === exp && styles.selectedOption
            ]}
            onPress={() => setPreferences({...preferences, experience: exp as any})}
          >
            <Text style={[
              styles.optionText,
              preferences.experience === exp && styles.selectedOptionText
            ]}>
              {exp.charAt(0).toUpperCase() + exp.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderActivityAndTimeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Activity level and time commitment</Text>
      
      <Text style={styles.subStepTitle}>Activity Level:</Text>
      <View style={styles.optionsContainer}>
        {[
          { key: "low", label: "Low - Calm, relaxed" },
          { key: "medium", label: "Medium - Moderate exercise" },
          { key: "high", label: "High - Very active" }
        ].map((activity) => (
          <TouchableOpacity
            key={activity.key}
            style={[
              styles.optionButton,
              preferences.activityLevel === activity.key && styles.selectedOption
            ]}
            onPress={() => setPreferences({...preferences, activityLevel: activity.key as any})}
          >
            <Text style={[
              styles.optionText,
              preferences.activityLevel === activity.key && styles.selectedOptionText
            ]}>
              {activity.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subStepTitle}>Time Available:</Text>
      <View style={styles.optionsContainer}>
        {[
          { key: "low", label: "Low - Basic care" },
          { key: "medium", label: "Medium - Regular interaction" },
          { key: "high", label: "High - Lots of attention" }
        ].map((time) => (
          <TouchableOpacity
            key={time.key}
            style={[
              styles.optionButton,
              preferences.timeAvailable === time.key && styles.selectedOption
            ]}
            onPress={() => setPreferences({...preferences, timeAvailable: time.key as any})}
          >
            <Text style={[
              styles.optionText,
              preferences.timeAvailable === time.key && styles.selectedOptionText
            ]}>
              {time.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subStepTitle}>Special Considerations:</Text>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setPreferences({...preferences, children: !preferences.children})}
        >
          <Ionicons 
            name={preferences.children ? "checkbox" : "square-outline"} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.checkboxText}>Good with children</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setPreferences({...preferences, otherPets: !preferences.otherPets})}
        >
          <Ionicons 
            name={preferences.otherPets ? "checkbox" : "square-outline"} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.checkboxText}>Good with other pets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setPreferences({...preferences, allergies: !preferences.allergies})}
        >
          <Ionicons 
            name={preferences.allergies ? "checkbox" : "square-outline"} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.checkboxText}>Hypoallergenic (for allergies)</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
    </View>
  )

  const renderPreferencesModal = () => (
    <Modal
      visible={showPreferences}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleBackPress}
    >
      <View style={styles.modalContainer}>
        <NavigationHeader 
          title="AI Pet Matching" 
          showBackButton={true}
          backButtonAction={handleBackPress}
        />

        {renderProgressBar()}

        <ScrollView style={styles.modalContent}>
          {renderPreferenceStep()}
        </ScrollView>

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flex: 1 }} />
          
          {currentStep < totalSteps ? (
            <TouchableOpacity 
              style={[styles.nextButton, !canProceed() && styles.disabledButton]} 
              onPress={nextStep}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.analyzeButton, !canProceed() && styles.disabledButton]} 
              onPress={analyzeMatches}
              disabled={!canProceed()}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.analyzeButtonText}>Find Matches</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  )

  const renderMatchCard = (match: MatchScore) => (
    <View key={match.pet.id} style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Image source={{ uri: match.pet.imageUrl }} style={styles.matchImage} />
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{match.pet.name}</Text>
          <Text style={styles.matchBreed}>{match.pet.breed}</Text>
          <Text style={styles.matchAge}>{match.pet.age} • {match.pet.size}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{match.score}%</Text>
          <Text style={styles.matchLabel}>Match</Text>
        </View>
      </View>
      
      <View style={styles.reasonsContainer}>
        <Text style={styles.reasonsTitle}>Why this is a great match:</Text>
        {match.reasons.slice(0, 3).map((reason, index) => (
          <View key={index} style={styles.reasonItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.viewPetButton}
        onPress={() => navigation.navigate("PetProfile", { petId: match.pet.id })}
      >
        <Text style={styles.viewPetButtonText}>View Profile</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )

  const renderAnalyzingScreen = () => (
    <View style={styles.analyzingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.analyzingTitle}>Analyzing Your Preferences</Text>
      <Text style={styles.analyzingSubtitle}>
        Our AI is finding the perfect pet matches for you...
      </Text>
      <View style={styles.analyzingSteps}>
        <Text style={styles.analyzingStep}>✓ Processing pet database</Text>
        <Text style={styles.analyzingStep}>✓ Calculating compatibility scores</Text>
        <Text style={styles.analyzingStep}>⏳ Ranking best matches</Text>
      </View>
    </View>
  )

  if (showPreferences) {
    return renderPreferencesModal()
  }

  if (isAnalyzing) {
    return (
      <View style={styles.container}>
        <NavigationHeader 
          title="Analyzing..." 
          showBackButton={true}
          backButtonAction={handleBackPress}
        />
        {renderAnalyzingScreen()}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <NavigationHeader 
        title="AI Pet Matches" 
        showBackButton={true}
        backButtonAction={handleBackPress}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Your Perfect Matches</Text>
        <Text style={styles.subtitle}>
          Found {matches.length} compatible pets based on your preferences
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={resetPreferences}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={styles.retryButtonText}>Update Preferences</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your preferences to find more compatible pets
            </Text>
            <TouchableOpacity style={styles.adjustButton} onPress={resetPreferences}>
              <Text style={styles.adjustButtonText}>Adjust Preferences</Text>
            </TouchableOpacity>
          </View>
        ) : (
          matches.map(renderMatchCard)
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  progressContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepContainer: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  subStepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    minWidth: 120,
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.xs,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'white',
  },
  checkboxContainer: {
    marginTop: spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkboxText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    marginRight: spacing.xs,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  analyzeButtonText: {
    fontSize: 16,
    color: 'white',
    marginLeft: spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  analyzingSteps: {
    alignItems: 'flex-start',
  },
  analyzingStep: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  matchImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  matchBreed: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  matchAge: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  matchLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reasonsContainer: {
    marginBottom: spacing.md,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.xs,
    flex: 1,
  },
  viewPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  viewPetButtonText: {
    fontSize: 16,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  adjustButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  adjustButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

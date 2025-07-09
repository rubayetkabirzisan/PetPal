import type { Pet } from "./data"
import type { UserPreferences } from "./preferences"

export interface PetMatch {
  pet: Pet
  matchScore: number
  reasons: string[]
}

/**
 * Calculates a match score between a pet and user preferences
 */
export function calculatePetMatch(pet: Pet, preferences: UserPreferences): PetMatch {
  let score = 0
  const reasons: string[] = []
  const maxScore = 100

  // Pet type preference (25 points)
  if (preferences.petTypes.includes(pet.type)) {
    score += 25
    reasons.push(`${pet.type} lover`)
  }

  // Size preference (20 points)
  if (preferences.preferredSizes.includes(pet.size)) {
    score += 20
    reasons.push(`Perfect size (${pet.size})`)
  }

  // Age preference (15 points)
  const petAgeNum = Number.parseInt(pet.age.split(" ")[0]) || 0
  if (petAgeNum <= preferences.maxAge) {
    score += 15
    if (petAgeNum <= 2) {
      reasons.push("Young and energetic")
    } else if (petAgeNum >= 7) {
      reasons.push("Calm and mature")
    } else {
      reasons.push("Perfect age")
    }
  }

  // Lifestyle match (15 points)
  if (preferences.lifestyle === "active" && pet.energyLevel === "High") {
    score += 15
    reasons.push("High energy match")
  } else if (preferences.lifestyle === "calm" && pet.energyLevel === "Low") {
    score += 15
    reasons.push("Calm companion")
  } else if (preferences.lifestyle === "mixed" && pet.energyLevel === "Medium") {
    score += 15
    reasons.push("Balanced energy")
  } else if (preferences.lifestyle === "mixed") {
    score += 10
    reasons.push("Adaptable energy")
  }

  // Housing compatibility (10 points)
  if (preferences.housingType === "house_with_yard" && pet.size === "Large") {
    score += 10
    reasons.push("Space for large pet")
  } else if (preferences.housingType === "apartment" && pet.size === "Small") {
    score += 10
    reasons.push("Apartment friendly")
  } else if (preferences.housingType === "house_no_yard") {
    score += 8
    reasons.push("House suitable")
  }

  // Experience level (10 points)
  if (preferences.experienceLevel === "experienced") {
    score += 10
    reasons.push("Great for experienced owner")
  } else if (preferences.experienceLevel === "beginner" && pet.description.toLowerCase().includes("friendly")) {
    score += 10
    reasons.push("Beginner friendly")
  } else if (preferences.experienceLevel === "intermediate") {
    score += 8
    reasons.push("Good for your experience")
  }

  // Health considerations (5 points)
  if (preferences.hasAllergies && pet.description.toLowerCase().includes("hypoallergenic")) {
    score += 5
    reasons.push("Hypoallergenic")
  } else if (!preferences.hasAllergies) {
    score += 3
  }

  // Bonus points for special traits
  if (pet.goodWithKids && reasons.length < 4) {
    reasons.push("Great with kids")
  }
  if (pet.goodWithPets && reasons.length < 4) {
    reasons.push("Good with other pets")
  }
  if (pet.vaccinated && pet.neutered) {
    reasons.push("Fully vaccinated & neutered")
  }

  // Ensure score doesn't exceed 100
  score = Math.min(score, maxScore)

  return {
    pet,
    matchScore: score,
    reasons: reasons.slice(0, 4), // Limit to 4 reasons
  }
}

/**
 * Get top pet matches based on user preferences
 */
export function getTopMatches(pets: Pet[], preferences: UserPreferences, limit = 10): PetMatch[] {
  return pets
    .map((pet) => calculatePetMatch(pet, preferences))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}

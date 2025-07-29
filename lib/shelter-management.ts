import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ShelterPet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
  breed: string;
  age: number;
  ageUnit: 'months' | 'years';
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  weight: number;
  color: string;
  microchipId?: string;
  arrivalDate: string;
  status: 'available' | 'adopted' | 'foster' | 'medical-hold' | 'behavioral-hold' | 'reserved' | 'transferred';
  location: CageLocation;
  medicalInfo: PetMedicalInfo;
  behaviorInfo: PetBehaviorInfo;
  adoptionInfo: AdoptionRequirements;
  photos: PetPhoto[];
  documents: PetDocument[];
  notes: string;
  isSpecialNeeds: boolean;
  specialNeedsDescription?: string;
  intake: IntakeInfo;
  adoptionFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface CageLocation {
  building: string;
  room: string;
  cageNumber: string;
  cageType: 'individual' | 'group' | 'isolation' | 'medical' | 'foster';
  capacity: number;
  currentOccupants: number;
  lastCleaned?: string;
  nextCleaningDue?: string;
}

export interface PetMedicalInfo {
  isSpayedNeutered: boolean;
  spayNeuterDate?: string;
  isVaccinated: boolean;
  lastVaccinationDate?: string;
  nextVaccinationDue?: string;
  healthConditions: string[];
  medications: string[];
  allergies: string[];
  lastVetVisit?: string;
  nextVetVisit?: string;
  microchipDate?: string;
  weightHistory: WeightRecord[];
}

export interface WeightRecord {
  date: string;
  weight: number;
  notes?: string;
}

export interface PetBehaviorInfo {
  temperament: string[];
  energyLevel: 'low' | 'medium' | 'high';
  socialization: {
    goodWithKids: boolean;
    goodWithDogs: boolean;
    goodWithCats: boolean;
    goodWithOtherAnimals: boolean;
  };
  trainingLevel: 'untrained' | 'basic' | 'intermediate' | 'advanced';
  knownCommands: string[];
  behaviorIssues: string[];
  behaviorNotes: string;
  lastBehaviorAssessment?: string;
  nextBehaviorAssessment?: string;
}

export interface AdoptionRequirements {
  minimumAge: number;
  requiresExperience: boolean;
  housingRequirements: string[];
  lifestyleRequirements: string[];
  restrictedStates?: string[];
  adoptionProcess: string[];
  estimatedAdoptionTime: string;
  preApprovalRequired: boolean;
}

export interface PetPhoto {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  uploadDate: string;
  photographer?: string;
}

export interface PetDocument {
  id: string;
  type: 'medical-record' | 'vaccination-record' | 'intake-form' | 'behavior-assessment' | 'adoption-contract' | 'other';
  name: string;
  url: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface IntakeInfo {
  source: 'stray' | 'surrender' | 'transfer' | 'born-in-shelter' | 'return' | 'confiscation';
  intakeDate: string;
  reason: string;
  previousOwner?: {
    name: string;
    contact: string;
    reason: string;
  };
  surrenderFee?: number;
  intakeCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  quarantineRequired: boolean;
  quarantineEndDate?: string;
  intakeWeight: number;
  intakeNotes: string;
}

export interface AdoptionHistory {
  id: string;
  petId: string;
  adopterId: string;
  adopterName: string;
  adopterContact: string;
  adoptionDate: string;
  returnDate?: string;
  returnReason?: string;
  followUpDates: string[];
  adoptionFee: number;
  notes: string;
  status: 'successful' | 'returned' | 'follow-up-needed';
}

export interface FosterPlacement {
  id: string;
  petId: string;
  fosterId: string;
  fosterName: string;
  fosterContact: string;
  placementDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  reason: 'medical-recovery' | 'socialization' | 'behavior-modification' | 'space' | 'emergency' | 'long-term';
  dailyRate?: number;
  supplies: string[];
  notes: string;
  status: 'active' | 'completed' | 'emergency-return';
}

const SHELTER_PETS_KEY = 'petpal_shelter_pets';
const ADOPTION_HISTORY_KEY = 'petpal_adoption_history';
const FOSTER_PLACEMENTS_KEY = 'petpal_foster_placements';

// Mock shelter pets data
const mockShelterPets: ShelterPet[] = [
  {
    id: 'shelter-pet-1',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever Mix',
    age: 3,
    ageUnit: 'years',
    gender: 'male',
    size: 'large',
    weight: 65.5,
    color: 'Golden',
    microchipId: 'MC123456789',
    arrivalDate: '2024-01-10T00:00:00Z',
    status: 'available',
    location: {
      building: 'Main Kennel',
      room: 'Dog Wing A',
      cageNumber: 'A-12',
      cageType: 'individual',
      capacity: 1,
      currentOccupants: 1,
      lastCleaned: '2024-01-22T08:00:00Z',
      nextCleaningDue: '2024-01-22T20:00:00Z',
    },
    medicalInfo: {
      isSpayedNeutered: true,
      spayNeuterDate: '2024-01-12T00:00:00Z',
      isVaccinated: true,
      lastVaccinationDate: '2024-01-11T00:00:00Z',
      nextVaccinationDue: '2025-01-11T00:00:00Z',
      healthConditions: [],
      medications: ['Heartworm Prevention'],
      allergies: [],
      lastVetVisit: '2024-01-15T00:00:00Z',
      microchipDate: '2024-01-12T00:00:00Z',
      weightHistory: [
        { date: '2024-01-10T00:00:00Z', weight: 63.2, notes: 'Intake weight - slightly underweight' },
        { date: '2024-01-17T00:00:00Z', weight: 65.5, notes: 'Good weight gain with proper nutrition' },
      ],
    },
    behaviorInfo: {
      temperament: ['friendly', 'gentle', 'playful', 'loyal'],
      energyLevel: 'high',
      socialization: {
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: false,
        goodWithOtherAnimals: true,
      },
      trainingLevel: 'basic',
      knownCommands: ['sit', 'stay', 'come', 'down'],
      behaviorIssues: ['separation anxiety'],
      behaviorNotes: 'Max is a wonderful dog who loves people and other dogs. He gets anxious when left alone for long periods.',
      lastBehaviorAssessment: '2024-01-13T00:00:00Z',
      nextBehaviorAssessment: '2024-02-13T00:00:00Z',
    },
    adoptionInfo: {
      minimumAge: 21,
      requiresExperience: false,
      housingRequirements: ['fenced yard preferred', 'no apartments'],
      lifestyleRequirements: ['active lifestyle', 'time for exercise', 'companionship'],
      adoptionProcess: ['application', 'meet-and-greet', 'home-visit', 'trial-period'],
      estimatedAdoptionTime: '2-4 weeks',
      preApprovalRequired: false,
    },
    photos: [
      {
        id: 'photo-1',
        url: '/images/pets/max-1.jpg',
        caption: 'Max loves playing fetch!',
        isPrimary: true,
        uploadDate: '2024-01-11T00:00:00Z',
        photographer: 'Sarah Johnson',
      },
      {
        id: 'photo-2',
        url: '/images/pets/max-2.jpg',
        caption: 'Such a good boy during his bath',
        isPrimary: false,
        uploadDate: '2024-01-14T00:00:00Z',
      },
    ],
    documents: [
      {
        id: 'doc-1',
        type: 'intake-form',
        name: 'Max Intake Form',
        url: '/documents/max-intake.pdf',
        uploadDate: '2024-01-10T00:00:00Z',
        uploadedBy: 'Jane Smith',
      },
      {
        id: 'doc-2',
        type: 'medical-record',
        name: 'Veterinary Examination',
        url: '/documents/max-vet-exam.pdf',
        uploadDate: '2024-01-11T00:00:00Z',
        uploadedBy: 'Dr. Wilson',
      },
    ],
    notes: 'Max is an absolute sweetheart who would make a great family pet. He needs an active family who can provide him with plenty of exercise and companionship.',
    isSpecialNeeds: false,
    intake: {
      source: 'surrender',
      intakeDate: '2024-01-10T00:00:00Z',
      reason: 'Owner moving to apartment that does not allow pets',
      previousOwner: {
        name: 'John Davis',
        contact: '+1-555-123-4567',
        reason: 'Apartment restrictions',
      },
      surrenderFee: 50,
      intakeCondition: 'good',
      quarantineRequired: false,
      intakeWeight: 63.2,
      intakeNotes: 'Well-socialized dog with basic training. Shows some separation anxiety.',
    },
    adoptionFee: 250,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-17T00:00:00Z',
  },
  {
    id: 'shelter-pet-2',
    name: 'Luna',
    species: 'cat',
    breed: 'Domestic Shorthair',
    age: 2,
    ageUnit: 'years',
    gender: 'female',
    size: 'medium',
    weight: 9.2,
    color: 'Black and White',
    microchipId: 'MC987654321',
    arrivalDate: '2024-01-05T00:00:00Z',
    status: 'available',
    location: {
      building: 'Cat House',
      room: 'Quiet Room',
      cageNumber: 'C-05',
      cageType: 'individual',
      capacity: 1,
      currentOccupants: 1,
      lastCleaned: '2024-01-22T09:00:00Z',
      nextCleaningDue: '2024-01-22T21:00:00Z',
    },
    medicalInfo: {
      isSpayedNeutered: true,
      spayNeuterDate: '2024-01-08T00:00:00Z',
      isVaccinated: true,
      lastVaccinationDate: '2024-01-07T00:00:00Z',
      nextVaccinationDue: '2025-01-07T00:00:00Z',
      healthConditions: [],
      medications: [],
      allergies: [],
      lastVetVisit: '2024-01-15T00:00:00Z',
      microchipDate: '2024-01-08T00:00:00Z',
      weightHistory: [
        { date: '2024-01-05T00:00:00Z', weight: 8.8, notes: 'Intake weight - healthy range' },
        { date: '2024-01-15T00:00:00Z', weight: 9.2, notes: 'Slight weight gain, still healthy' },
      ],
    },
    behaviorInfo: {
      temperament: ['shy', 'gentle', 'affectionate', 'quiet'],
      energyLevel: 'low',
      socialization: {
        goodWithKids: true,
        goodWithDogs: false,
        goodWithCats: true,
        goodWithOtherAnimals: false,
      },
      trainingLevel: 'basic',
      knownCommands: ['come'],
      behaviorIssues: ['shyness with strangers'],
      behaviorNotes: 'Luna is very shy but incredibly sweet once she warms up. She loves quiet environments and gentle attention.',
      lastBehaviorAssessment: '2024-01-10T00:00:00Z',
      nextBehaviorAssessment: '2024-02-10T00:00:00Z',
    },
    adoptionInfo: {
      minimumAge: 18,
      requiresExperience: false,
      housingRequirements: ['indoor only', 'quiet environment'],
      lifestyleRequirements: ['patient adopter', 'calm household'],
      adoptionProcess: ['application', 'meet-and-greet', 'trial-period'],
      estimatedAdoptionTime: '3-6 weeks',
      preApprovalRequired: false,
    },
    photos: [
      {
        id: 'photo-3',
        url: '/images/pets/luna-1.jpg',
        caption: 'Luna in her favorite hiding spot',
        isPrimary: true,
        uploadDate: '2024-01-12T00:00:00Z',
      },
    ],
    documents: [
      {
        id: 'doc-3',
        type: 'intake-form',
        name: 'Luna Intake Form',
        url: '/documents/luna-intake.pdf',
        uploadDate: '2024-01-05T00:00:00Z',
        uploadedBy: 'Mike Johnson',
      },
    ],
    notes: 'Luna would do best in a quiet home with patient adopters who understand shy cats. She has so much love to give once she feels safe.',
    isSpecialNeeds: false,
    intake: {
      source: 'stray',
      intakeDate: '2024-01-05T00:00:00Z',
      reason: 'Found as stray by good Samaritan',
      intakeCondition: 'fair',
      quarantineRequired: true,
      quarantineEndDate: '2024-01-15T00:00:00Z',
      intakeWeight: 8.8,
      intakeNotes: 'Very shy but responsive to gentle handling. No obvious health issues.',
    },
    adoptionFee: 150,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

// Mock adoption history data
const mockAdoptionHistory: AdoptionHistory[] = [
  {
    id: 'adoption-1',
    petId: 'shelter-pet-100',
    adopterId: 'adopter-1',
    adopterName: 'Sarah Johnson',
    adopterContact: 'sarah.johnson@email.com',
    adoptionDate: '2024-01-01T00:00:00Z',
    followUpDates: ['2024-01-08T00:00:00Z', '2024-01-15T00:00:00Z'],
    adoptionFee: 200,
    notes: 'Perfect match! Bella has settled in wonderfully with her new family.',
    status: 'successful',
  },
];

// Mock foster placements data
const mockFosterPlacements: FosterPlacement[] = [
  {
    id: 'foster-1',
    petId: 'shelter-pet-101',
    fosterId: 'foster-1',
    fosterName: 'Emily Davis',
    fosterContact: 'emily.davis@email.com',
    placementDate: '2024-01-15T00:00:00Z',
    expectedReturnDate: '2024-02-15T00:00:00Z',
    reason: 'medical-recovery',
    supplies: ['medications', 'special food', 'crate', 'bedding'],
    notes: 'Charlie is recovering from surgery and needs quiet environment for healing.',
    status: 'active',
  },
];

/**
 * Initialize shelter pets data
 */
export async function initializeShelterPetsData(): Promise<void> {
  try {
    const existingPets = await AsyncStorage.getItem(SHELTER_PETS_KEY);
    const existingAdoptions = await AsyncStorage.getItem(ADOPTION_HISTORY_KEY);
    const existingFosters = await AsyncStorage.getItem(FOSTER_PLACEMENTS_KEY);
    
    if (!existingPets) {
      await AsyncStorage.setItem(SHELTER_PETS_KEY, JSON.stringify(mockShelterPets));
    }
    
    if (!existingAdoptions) {
      await AsyncStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(mockAdoptionHistory));
    }
    
    if (!existingFosters) {
      await AsyncStorage.setItem(FOSTER_PLACEMENTS_KEY, JSON.stringify(mockFosterPlacements));
    }
    
    console.log('Shelter pets data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize shelter pets data:', error);
  }
}

/**
 * Get all shelter pets
 */
export async function getShelterPets(): Promise<ShelterPet[]> {
  try {
    const stored = await AsyncStorage.getItem(SHELTER_PETS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading shelter pets:', error);
  }
  return mockShelterPets;
}

/**
 * Get pet by ID
 */
export async function getShelterPetById(petId: string): Promise<ShelterPet | undefined> {
  try {
    const pets = await getShelterPets();
    return pets.find(pet => pet.id === petId);
  } catch (error) {
    console.error('Error finding shelter pet:', error);
    return undefined;
  }
}

/**
 * Add new shelter pet
 */
export async function addShelterPet(pet: Omit<ShelterPet, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShelterPet> {
  const newPet: ShelterPet = {
    ...pet,
    id: `shelter-pet-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const pets = await getShelterPets();
    const updatedPets = [newPet, ...pets];
    await AsyncStorage.setItem(SHELTER_PETS_KEY, JSON.stringify(updatedPets));
  } catch (error) {
    console.error('Error adding shelter pet:', error);
  }

  return newPet;
}

/**
 * Update shelter pet
 */
export async function updateShelterPet(petId: string, updates: Partial<ShelterPet>): Promise<ShelterPet | null> {
  try {
    const pets = await getShelterPets();
    const petIndex = pets.findIndex(pet => pet.id === petId);

    if (petIndex === -1) return null;

    const updatedPet = {
      ...pets[petIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedPets = pets.map((pet, index) =>
      index === petIndex ? updatedPet : pet
    );

    await AsyncStorage.setItem(SHELTER_PETS_KEY, JSON.stringify(updatedPets));
    return updatedPet;
  } catch (error) {
    console.error('Error updating shelter pet:', error);
    return null;
  }
}

/**
 * Get available pets for adoption
 */
export async function getAvailablePetsForAdoption(): Promise<ShelterPet[]> {
  try {
    const pets = await getShelterPets();
    return pets.filter(pet => pet.status === 'available');
  } catch (error) {
    console.error('Error loading available pets:', error);
    return [];
  }
}

/**
 * Get pets by status
 */
export async function getPetsByStatus(status: ShelterPet['status']): Promise<ShelterPet[]> {
  try {
    const pets = await getShelterPets();
    return pets.filter(pet => pet.status === status);
  } catch (error) {
    console.error('Error loading pets by status:', error);
    return [];
  }
}

/**
 * Search shelter pets
 */
export async function searchShelterPets(criteria: {
  species?: ShelterPet['species'];
  breed?: string;
  ageRange?: { min: number; max: number };
  size?: ShelterPet['size'];
  gender?: ShelterPet['gender'];
  status?: ShelterPet['status'];
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  energyLevel?: 'low' | 'medium' | 'high';
  query?: string;
}): Promise<ShelterPet[]> {
  try {
    const pets = await getShelterPets();
    
    return pets.filter(pet => {
      if (criteria.species && pet.species !== criteria.species) return false;
      if (criteria.size && pet.size !== criteria.size) return false;
      if (criteria.gender && pet.gender !== criteria.gender) return false;
      if (criteria.status && pet.status !== criteria.status) return false;
      
      if (criteria.breed && !pet.breed.toLowerCase().includes(criteria.breed.toLowerCase())) return false;
      
      if (criteria.ageRange) {
        const ageInYears = pet.ageUnit === 'months' ? pet.age / 12 : pet.age;
        if (ageInYears < criteria.ageRange.min || ageInYears > criteria.ageRange.max) return false;
      }
      
      if (criteria.goodWithKids !== undefined && pet.behaviorInfo.socialization.goodWithKids !== criteria.goodWithKids) return false;
      if (criteria.goodWithDogs !== undefined && pet.behaviorInfo.socialization.goodWithDogs !== criteria.goodWithDogs) return false;
      if (criteria.goodWithCats !== undefined && pet.behaviorInfo.socialization.goodWithCats !== criteria.goodWithCats) return false;
      if (criteria.energyLevel && pet.behaviorInfo.energyLevel !== criteria.energyLevel) return false;
      
      if (criteria.query) {
        const searchTerm = criteria.query.toLowerCase();
        const searchableText = [
          pet.name,
          pet.breed,
          pet.color,
          pet.notes,
          pet.behaviorInfo.behaviorNotes,
          ...pet.behaviorInfo.temperament,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching shelter pets:', error);
    return [];
  }
}

/**
 * Get pets requiring medical attention
 */
export async function getPetsRequiringMedicalAttention(): Promise<ShelterPet[]> {
  try {
    const pets = await getShelterPets();
    const today = new Date();
    
    return pets.filter(pet => {
      // Check for upcoming vet visits
      if (pet.medicalInfo.nextVetVisit) {
        const nextVisit = new Date(pet.medicalInfo.nextVetVisit);
        const daysUntilVisit = Math.ceil((nextVisit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilVisit <= 7) return true;
      }
      
      // Check for overdue vaccinations
      if (pet.medicalInfo.nextVaccinationDue) {
        const vaccinationDue = new Date(pet.medicalInfo.nextVaccinationDue);
        if (vaccinationDue <= today) return true;
      }
      
      // Check for medical hold status
      if (pet.status === 'medical-hold') return true;
      
      // Check for active medications
      if (pet.medicalInfo.medications.length > 0) return true;
      
      return false;
    });
  } catch (error) {
    console.error('Error finding pets requiring medical attention:', error);
    return [];
  }
}

/**
 * Get shelter statistics
 */
export async function getShelterStats() {
  try {
    const pets = await getShelterPets();
    const adoptions = await getAdoptionHistory();
    const fosters = await getFosterPlacements();
    
    const totalPets = pets.length;
    const availablePets = pets.filter(pet => pet.status === 'available').length;
    const adoptedPets = pets.filter(pet => pet.status === 'adopted').length;
    const fosterPets = pets.filter(pet => pet.status === 'foster').length;
    
    const petsBySpecies = pets.reduce((acc, pet) => {
      acc[pet.species] = (acc[pet.species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const petsBySize = pets.reduce((acc, pet) => {
      acc[pet.size] = (acc[pet.size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalAdoptions = adoptions.length;
    const successfulAdoptions = adoptions.filter(adoption => adoption.status === 'successful').length;
    const returnedPets = adoptions.filter(adoption => adoption.status === 'returned').length;
    const adoptionSuccessRate = totalAdoptions > 0 ? Math.round((successfulAdoptions / totalAdoptions) * 100) : 0;
    
    const activeFosters = fosters.filter(foster => foster.status === 'active').length;
    const totalFosters = fosters.length;
    
    const specialNeedsPets = pets.filter(pet => pet.isSpecialNeeds).length;
    const medicalHoldPets = pets.filter(pet => pet.status === 'medical-hold').length;
    const behavioralHoldPets = pets.filter(pet => pet.status === 'behavioral-hold').length;
    
    // Calculate average length of stay
    const currentPets = pets.filter(pet => pet.status !== 'adopted');
    const avgLengthOfStay = currentPets.length > 0 ?
      Math.round(currentPets.reduce((sum, pet) => {
        const stayDays = Math.ceil((new Date().getTime() - new Date(pet.arrivalDate).getTime()) / (1000 * 60 * 60 * 24));
        return sum + stayDays;
      }, 0) / currentPets.length) : 0;
    
    return {
      totalPets,
      availablePets,
      adoptedPets,
      fosterPets,
      petsBySpecies,
      petsBySize,
      totalAdoptions,
      adoptionSuccessRate,
      activeFosters,
      totalFosters,
      specialNeedsPets,
      medicalHoldPets,
      behavioralHoldPets,
      avgLengthOfStay,
    };
  } catch (error) {
    console.error('Error calculating shelter statistics:', error);
    return {
      totalPets: 0,
      availablePets: 0,
      adoptedPets: 0,
      fosterPets: 0,
      petsBySpecies: {},
      petsBySize: {},
      totalAdoptions: 0,
      adoptionSuccessRate: 0,
      activeFosters: 0,
      totalFosters: 0,
      specialNeedsPets: 0,
      medicalHoldPets: 0,
      behavioralHoldPets: 0,
      avgLengthOfStay: 0,
    };
  }
}

/**
 * Get adoption history
 */
export async function getAdoptionHistory(): Promise<AdoptionHistory[]> {
  try {
    const stored = await AsyncStorage.getItem(ADOPTION_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading adoption history:', error);
  }
  return mockAdoptionHistory;
}

/**
 * Get foster placements
 */
export async function getFosterPlacements(): Promise<FosterPlacement[]> {
  try {
    const stored = await AsyncStorage.getItem(FOSTER_PLACEMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading foster placements:', error);
  }
  return mockFosterPlacements;
}

/**
 * Add adoption record
 */
export async function addAdoptionRecord(adoption: Omit<AdoptionHistory, 'id'>): Promise<AdoptionHistory> {
  const newAdoption: AdoptionHistory = {
    ...adoption,
    id: `adoption-${Date.now()}`,
  };

  try {
    const adoptions = await getAdoptionHistory();
    const updatedAdoptions = [newAdoption, ...adoptions];
    await AsyncStorage.setItem(ADOPTION_HISTORY_KEY, JSON.stringify(updatedAdoptions));
    
    // Update pet status to adopted
    await updateShelterPet(adoption.petId, { status: 'adopted' });
  } catch (error) {
    console.error('Error adding adoption record:', error);
  }

  return newAdoption;
}

/**
 * Add foster placement
 */
export async function addFosterPlacement(foster: Omit<FosterPlacement, 'id'>): Promise<FosterPlacement> {
  const newFoster: FosterPlacement = {
    ...foster,
    id: `foster-${Date.now()}`,
  };

  try {
    const fosters = await getFosterPlacements();
    const updatedFosters = [newFoster, ...fosters];
    await AsyncStorage.setItem(FOSTER_PLACEMENTS_KEY, JSON.stringify(updatedFosters));
    
    // Update pet status to foster
    await updateShelterPet(foster.petId, { status: 'foster' });
  } catch (error) {
    console.error('Error adding foster placement:', error);
  }

  return newFoster;
}

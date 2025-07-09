import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Pet {
  id: string
  name: string
  type: string
  breed: string
  age: string
  gender: string
  size: string
  color: string
  description: string
  images: string[]
  location: string
  distance: string
  vaccinated: boolean
  neutered: boolean
  microchipped: boolean
  houseTrained: boolean
  goodWithKids: boolean
  goodWithPets: boolean
  energyLevel: string
  shelterId: string
  shelterName: string
  shelterPhone: string
  shelterEmail: string
  status: string
  medicalHistory: string
  specialNeeds: string
  adoptionFee: number
  dateAdded: string
  shelter: {
    name: string
    contact: string
    email: string
    address: string
  }
  healthRecords: Array<{
    date: string
    type: string
    description: string
  }>
  personality: string[]
}

export interface AdoptionApplication {
  id: string
  petId: string
  adopterId: string
  adopterName: string
  adopterEmail: string
  status: "Pending" | "Under Review" | "Approved" | "Rejected"
  submittedDate: string
  notes?: string
  timeline: ApplicationTimelineEvent[]
  progress?: number
  currentStep?: string
  daysAgo?: number
}

export interface ApplicationTimelineEvent {
  id: string
  status: string
  date: string
  description: string
  completed: boolean
}

export interface Message {
  id: string
  petId: string
  senderId: string
  senderName: string
  senderType: "adopter" | "admin"
  message: string
  timestamp: string
  read: boolean
}

// AsyncStorage keys
const PETS_STORAGE_KEY = "petpal_pets";
const APPLICATIONS_STORAGE_KEY = "petpal_applications";
const MESSAGES_STORAGE_KEY = "petpal_messages";

// Default pets data
const defaultPets: Pet[] = [
  {
    id: "1",
    name: "Buddy",
    type: "Dog",
    breed: "Golden Retriever",
    age: "3 years",
    gender: "Male",
    size: "Large",
    color: "Golden",
    description:
      "Buddy is a friendly and energetic Golden Retriever who loves playing fetch and swimming. He's great with kids and other dogs, making him the perfect family companion. Buddy knows basic commands and is house-trained.",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
    ],
    location: "Happy Paws Shelter, Austin",
    distance: "2.3 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "High",
    shelterId: "shelter1",
    shelterName: "Happy Paws Shelter",
    shelterPhone: "(555) 123-4567",
    shelterEmail: "contact@happypaws.org",
    status: "Available",
    medicalHistory: "Up to date on all vaccinations, recent dental cleaning",
    specialNeeds: "None",
    adoptionFee: 250,
    dateAdded: "2024-01-15",
    shelter: {
      name: "Happy Paws Shelter",
      contact: "+1 (555) 123-4567",
      email: "contact@happypaws.org",
      address: "123 Shelter Street, Austin, TX 78701",
    },
    healthRecords: [
      {
        date: "2024-01-15",
        type: "Vaccination",
        description: "Annual vaccinations completed - DHPP, Rabies",
      },
      {
        date: "2024-01-10",
        type: "Health Check",
        description: "Complete physical exam - excellent health",
      },
    ],
    personality: ["Friendly", "Energetic", "Playful", "Loyal", "Social"],
  },
  {
    id: "2",
    name: "Luna",
    type: "Cat",
    breed: "Siamese Mix",
    age: "2 years",
    gender: "Female",
    size: "Medium",
    color: "Cream and Brown",
    description:
      "Luna is a beautiful and intelligent Siamese mix who loves to chat and follow her humans around. She's affectionate and would do best as the only cat in the home.",
    images: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop",
    ],
    location: "Feline Friends Rescue, Austin",
    distance: "1.8 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: false,
    energyLevel: "Medium",
    shelterId: "shelter2",
    shelterName: "Feline Friends Rescue",
    shelterPhone: "(555) 987-6543",
    shelterEmail: "info@felinefriends.org",
    status: "Available",
    medicalHistory: "Healthy, all vaccinations current",
    specialNeeds: "Prefers to be the only cat",
    adoptionFee: 150,
    dateAdded: "2024-02-20",
    shelter: {
      name: "Feline Friends Rescue",
      contact: "+1 (555) 987-6543",
      email: "info@felinefriends.org",
      address: "456 Catnip Lane, Austin, TX 78702",
    },
    healthRecords: [
      {
        date: "2024-02-20",
        type: "Vaccination",
        description: "Annual vaccinations completed - FVRCP, Rabies",
      },
      {
        date: "2024-02-15",
        type: "Health Check",
        description: "Complete physical exam - excellent health",
      },
    ],
    personality: ["Affectionate", "Intelligent", "Playful", "Quiet"],
  },
  {
    id: "3",
    name: "Max",
    type: "Dog",
    breed: "German Shepherd",
    age: "5 years",
    gender: "Male",
    size: "Large",
    color: "Black and Tan",
    description:
      "Max is a loyal and intelligent German Shepherd looking for an experienced dog owner. He's well-trained and would make an excellent guard dog and companion.",
    images: [
      "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=400&fit=crop",
    ],
    location: "Austin Animal Center, Austin",
    distance: "3.1 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "Medium",
    shelterId: "shelter3",
    shelterName: "Austin Animal Center",
    shelterPhone: "(555) 456-7890",
    shelterEmail: "adopt@austinanimals.org",
    status: "Available",
    medicalHistory: "Healthy, minor hip dysplasia managed with supplements",
    specialNeeds: "Needs experienced owner",
    adoptionFee: 200,
    dateAdded: "2024-03-10",
    shelter: {
      name: "Austin Animal Center",
      contact: "+1 (555) 456-7890",
      email: "adopt@austinanimals.org",
      address: "789 Pawsitive Path, Austin, TX 78703",
    },
    healthRecords: [
      {
        date: "2024-03-10",
        type: "Vaccination",
        description: "Annual vaccinations completed - DHPP, Rabies",
      },
      {
        date: "2024-03-05",
        type: "Health Check",
        description: "Complete physical exam - minor hip dysplasia noted",
      },
    ],
    personality: ["Loyal", "Intelligent", "Protective", "Trainable"],
  },
  {
    id: "4",
    name: "Bella",
    type: "Cat",
    breed: "Persian",
    age: "4 years",
    gender: "Female",
    size: "Medium",
    color: "White",
    description:
      "Bella is a gentle and calm Persian cat who loves to be pampered. She enjoys quiet environments and would be perfect for someone looking for a low-maintenance companion.",
    images: [
      "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1573824267776-6a1d1c2139d5?w=400&h=400&fit=crop",
    ],
    location: "Precious Paws Rescue, Austin",
    distance: "4.2 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "Low",
    shelterId: "shelter4",
    shelterName: "Precious Paws Rescue",
    shelterPhone: "(555) 321-0987",
    shelterEmail: "hello@preciouspaws.org",
    status: "Available",
    medicalHistory: "Regular grooming required, otherwise healthy",
    specialNeeds: "Daily brushing needed",
    adoptionFee: 175,
    dateAdded: "2024-04-01",
    shelter: {
      name: "Precious Paws Rescue",
      contact: "+1 (555) 321-0987",
      email: "hello@preciouspaws.org",
      address: "101 Fluffy Tail Road, Austin, TX 78704",
    },
    healthRecords: [
      {
        date: "2024-04-01",
        type: "Vaccination",
        description: "Annual vaccinations completed - FVRCP, Rabies",
      },
      {
        date: "2024-03-25",
        type: "Health Check",
        description: "Complete physical exam - excellent health, requires regular grooming",
      },
    ],
    personality: ["Gentle", "Calm", "Affectionate", "Low-Maintenance"],
  },
  {
    id: "5",
    name: "Charlie",
    type: "Dog",
    breed: "Labrador Mix",
    age: "1 year",
    gender: "Male",
    size: "Medium",
    color: "Chocolate Brown",
    description:
      "Charlie is a playful puppy who's still learning the ropes! He's energetic, loves treats, and is eager to please. Perfect for an active family who can help with his training.",
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
    ],
    location: "Happy Paws Shelter, Austin",
    distance: "2.3 miles",
    vaccinated: true,
    neutered: false,
    microchipped: true,
    houseTrained: false,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "High",
    shelterId: "shelter1",
    shelterName: "Happy Paws Shelter",
    shelterPhone: "(555) 123-4567",
    shelterEmail: "contact@happypaws.org",
    status: "Available",
    medicalHistory: "Puppy vaccinations in progress",
    specialNeeds: "Needs training and socialization",
    adoptionFee: 300,
    dateAdded: "2024-04-15",
    shelter: {
      name: "Happy Paws Shelter",
      contact: "+1 (555) 123-4567",
      email: "contact@happypaws.org",
      address: "123 Shelter Street, Austin, TX 78701",
    },
    healthRecords: [
      {
        date: "2024-04-15",
        type: "Vaccination",
        description: "Puppy vaccinations in progress - DHPP",
      },
      {
        date: "2024-04-10",
        type: "Health Check",
        description: "Complete physical exam - healthy puppy, needs training",
      },
    ],
    personality: ["Playful", "Energetic", "Eager to Please", "Trainable"],
  },
  {
    id: "6",
    name: "Daisy",
    type: "Dog",
    breed: "Beagle",
    age: "2 years",
    gender: "Female",
    size: "Small",
    color: "Tricolor",
    description:
      "Daisy is a curious and friendly Beagle who loves to explore and sniff around. She's great with kids and other dogs, making her the perfect family companion.",
    images: [
      "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
    ],
    location: "Austin Animal Center, Austin",
    distance: "3.1 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "Medium",
    shelterId: "shelter3",
    shelterName: "Austin Animal Center",
    shelterPhone: "(555) 456-7890",
    shelterEmail: "adopt@austinanimals.org",
    status: "Available",
    medicalHistory: "Up to date on all vaccinations, recent dental cleaning",
    specialNeeds: "None",
    adoptionFee: 200,
    dateAdded: "2024-05-01",
    shelter: {
      name: "Austin Animal Center",
      contact: "+1 (555) 456-7890",
      email: "adopt@austinanimals.org",
      address: "789 Pawsitive Path, Austin, TX 78703",
    },
    healthRecords: [
      {
        date: "2024-05-01",
        type: "Vaccination",
        description: "Annual vaccinations completed - DHPP, Rabies",
      },
      {
        date: "2024-04-25",
        type: "Health Check",
        description: "Complete physical exam - excellent health",
      },
    ],
    personality: ["Curious", "Friendly", "Social", "Loyal"],
  },
  {
    id: "7",
    name: "Oliver",
    type: "Cat",
    breed: "Domestic Shorthair",
    age: "1 year",
    gender: "Male",
    size: "Medium",
    color: "Black",
    description:
      "Oliver is a playful and affectionate Domestic Shorthair who loves to cuddle and play with toys. He's great with kids and other cats, making him the perfect family companion.",
    images: [
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    ],
    location: "Feline Friends Rescue, Austin",
    distance: "1.8 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "Medium",
    shelterId: "shelter2",
    shelterName: "Feline Friends Rescue",
    shelterPhone: "(555) 987-6543",
    shelterEmail: "info@felinefriends.org",
    status: "Available",
    medicalHistory: "Healthy, all vaccinations current",
    specialNeeds: "None",
    adoptionFee: 150,
    dateAdded: "2024-05-15",
    shelter: {
      name: "Feline Friends Rescue",
      contact: "+1 (555) 987-6543",
      email: "info@felinefriends.org",
      address: "456 Catnip Lane, Austin, TX 78702",
    },
    healthRecords: [
      {
        date: "2024-05-15",
        type: "Vaccination",
        description: "Annual vaccinations completed - FVRCP, Rabies",
      },
      {
        date: "2024-05-10",
        type: "Health Check",
        description: "Complete physical exam - excellent health",
      },
    ],
    personality: ["Playful", "Affectionate", "Social", "Curious"],
  },
  {
    id: "8",
    name: "Penny",
    type: "Dog",
    breed: "Dachshund",
    age: "4 years",
    gender: "Female",
    size: "Small",
    color: "Brown",
    description:
      "Penny is a sweet and gentle Dachshund who loves to cuddle and go for walks. She's great with kids and other dogs, making her the perfect family companion.",
    images: [
      "https://images.unsplash.com/photo-1534361960057-19889db962e8?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
    ],
    location: "Happy Paws Shelter, Austin",
    distance: "2.3 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "Medium",
    shelterId: "shelter1",
    shelterName: "Happy Paws Shelter",
    shelterPhone: "(555) 123-4567",
    shelterEmail: "contact@happypaws.org",
    status: "Available",
    medicalHistory: "Up to date on all vaccinations, recent dental cleaning",
    specialNeeds: "None",
    adoptionFee: 250,
    dateAdded: "2024-06-01",
    shelter: {
      name: "Happy Paws Shelter",
      contact: "+1 (555) 123-4567",
      email: "contact@happypaws.org",
      address: "123 Shelter Street, Austin, TX 78701",
    },
    healthRecords: [
      {
        date: "2024-06-01",
        type: "Vaccination",
        description: "Annual vaccinations completed - DHPP, Rabies",
      },
      {
        date: "2024-05-25",
        type: "Health Check",
        description: "Complete physical exam - excellent health",
      },
    ],
    personality: ["Sweet", "Gentle", "Affectionate", "Loyal"],
  },
  {
    id: "9",
    name: "Simba",
    type: "Cat",
    breed: "Maine Coon",
    age: "3 years",
    gender: "Male",
    size: "Large",
    color: "Brown Tabby",
    description:
      "Simba is a gentle giant who loves to cuddle and play. He's great with kids and other cats, making him the perfect family companion.",
    images: [
      "https://images.unsplash.com/photo-1514888286974-603b42ca5858?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    ],
    location: "Precious Paws Rescue, Austin",
    distance: "4.2 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "Medium",
    shelterId: "shelter4",
    shelterName: "Precious Paws Rescue",
    shelterPhone: "(555) 321-0987",
    shelterEmail: "hello@preciouspaws.org",
    status: "Available",
    medicalHistory: "Regular grooming required, otherwise healthy",
    specialNeeds: "None",
    adoptionFee: 175,
    dateAdded: "2024-06-15",
    shelter: {
      name: "Precious Paws Rescue",
      contact: "+1 (555) 321-0987",
      email: "hello@preciouspaws.org",
      address: "101 Fluffy Tail Road, Austin, TX 78704",
    },
    healthRecords: [
      {
        date: "2024-06-15",
        type: "Vaccination",
        description: "Annual vaccinations completed - FVRCP, Rabies",
      },
      {
        date: "2024-06-10",
        type: "Health Check",
        description: "Complete physical exam - excellent health, requires regular grooming",
      },
    ],
    personality: ["Gentle", "Affectionate", "Social", "Playful"],
  },
  {
    id: "10",
    name: "Rocky",
    type: "Dog",
    breed: "Boxer",
    age: "2 years",
    gender: "Male",
    size: "Large",
    color: "Brindle",
    description:
      "Rocky is a playful and energetic Boxer who loves to run and play. He's great with kids and other dogs, making him the perfect family companion.",
    images: [
      "https://images.unsplash.com/photo-1543466835-00a7907ca9be?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
    ],
    location: "Austin Animal Center, Austin",
    distance: "3.1 miles",
    vaccinated: true,
    neutered: true,
    microchipped: true,
    houseTrained: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "High",
    shelterId: "shelter3",
    shelterName: "Austin Animal Center",
    shelterPhone: "(555) 456-7890",
    shelterEmail: "adopt@austinanimals.org",
    status: "Available",
    medicalHistory: "Up to date on all vaccinations, recent dental cleaning",
    specialNeeds: "None",
    adoptionFee: 200,
    dateAdded: "2024-07-01",
    shelter: {
      name: "Austin Animal Center",
      contact: "+1 (555) 456-7890",
      email: "adopt@austinanimals.org",
      address: "789 Pawsitive Path, Austin, TX 78703",
    },
    healthRecords: [
      {
        date: "2024-07-01",
        type: "Vaccination",
        description: "Annual vaccinations completed - DHPP, Rabies",
      },
      {
        date: "2024-06-25",
        type: "Health Check",
        description: "Complete physical exam - excellent health",
      },
    ],
    personality: ["Playful", "Energetic", "Social", "Loyal"],
  },
];

// Default applications data
const defaultApplications: AdoptionApplication[] = [
  {
    id: "app-1",
    petId: "1",
    adopterId: "demo-user",
    adopterName: "Demo User",
    adopterEmail: "demo@example.com",
    status: "Approved",
    submittedDate: "2024-01-15",
    notes: "Application approved - pet adopted successfully",
    timeline: [
      {
        id: "1",
        status: "Application Submitted",
        date: "2024-01-15",
        description: "Your application has been received and is being reviewed.",
        completed: true,
      },
      {
        id: "2",
        status: "Under Review",
        date: "2024-01-16",
        description: "Our team is reviewing your application and references.",
        completed: true,
      },
      {
        id: "3",
        status: "Meet & Greet Scheduled",
        date: "2024-01-20",
        description: "Schedule a meeting with your potential new pet.",
        completed: true,
      },
      {
        id: "4",
        status: "Home Visit",
        date: "2024-01-25",
        description: "A volunteer will visit your home to ensure it's pet-ready.",
        completed: true,
      },
      {
        id: "5",
        status: "Adoption Approved",
        date: "2024-02-01",
        description: "Congratulations! Your adoption has been approved.",
        completed: true,
      },
    ],
    progress: 100,
    currentStep: "Adoption completed - Buddy is now part of your family!",
    daysAgo: 45,
  },
  {
    id: "app-2",
    petId: "2",
    adopterId: "demo-user",
    adopterName: "Demo User",
    adopterEmail: "demo@example.com",
    status: "Approved",
    submittedDate: "2024-02-20",
    notes: "Application approved - ready for pickup",
    timeline: [
      {
        id: "1",
        status: "Application Submitted",
        date: "2024-02-20",
        description: "Your application has been received and is being reviewed.",
        completed: true,
      },
      {
        id: "2",
        status: "Under Review",
        date: "2024-02-21",
        description: "Our team is reviewing your application and references.",
        completed: true,
      },
      {
        id: "3",
        status: "Meet & Greet Scheduled",
        date: "2024-02-25",
        description: "Schedule a meeting with your potential new pet.",
        completed: true,
      },
      {
        id: "4",
        status: "Home Visit",
        date: "2024-03-01",
        description: "A volunteer will visit your home to ensure it's pet-ready.",
        completed: true,
      },
      {
        id: "5",
        status: "Adoption Approved",
        date: "2024-03-05",
        description: "Congratulations! Your adoption has been approved.",
        completed: true,
      },
    ],
    progress: 100,
    currentStep: "Ready for pickup - Contact shelter to arrange",
    daysAgo: 15,
  },
  {
    id: "app-3",
    petId: "3",
    adopterId: "demo-user",
    adopterName: "Demo User",
    adopterEmail: "demo@example.com",
    status: "Under Review",
    submittedDate: "2024-03-10",
    notes: "Background check in progress",
    timeline: [
      {
        id: "1",
        status: "Application Submitted",
        date: "2024-03-10",
        description: "Your application has been received and is being reviewed.",
        completed: true,
      },
      {
        id: "2",
        status: "Under Review",
        date: "2024-03-11",
        description: "Our team is reviewing your application and references.",
        completed: true,
      },
      {
        id: "3",
        status: "Meet & Greet Scheduled",
        date: "",
        description: "Schedule a meeting with your potential new pet.",
        completed: false,
      },
    ],
    progress: 40,
    currentStep: "Background check and reference verification in progress",
    daysAgo: 5,
  },
];

/**
 * Initialize all data in AsyncStorage
 */
export async function initializeData(): Promise<void> {
  try {
    // Initialize pets data
    const petsData = await AsyncStorage.getItem(PETS_STORAGE_KEY);
    if (!petsData) {
      await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(defaultPets));
      console.log("Pets data initialized successfully");
    }

    // Initialize applications data
    const applicationsData = await AsyncStorage.getItem(APPLICATIONS_STORAGE_KEY);
    if (!applicationsData) {
      await AsyncStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(defaultApplications));
      console.log("Applications data initialized successfully");
    }

    // Initialize messages data
    const messagesData = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!messagesData) {
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([]));
      console.log("Messages data initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize data:", error);
  }
}

/**
 * Get all pets
 */
export async function getPets(): Promise<Pet[]> {
  try {
    const stored = await AsyncStorage.getItem(PETS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Initialize with default data
      await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(defaultPets));
      return defaultPets;
    }
  } catch (error) {
    console.error("Error loading pets:", error);
    return defaultPets;
  }
}

/**
 * Save pets to AsyncStorage
 */
export async function savePets(petsData: Pet[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(petsData));
  } catch (error) {
    console.error("Error saving pets:", error);
  }
}

/**
 * Get a pet by ID
 */
export async function getPetById(id: string): Promise<Pet | undefined> {
  try {
    const allPets = await getPets();
    return allPets.find((pet) => pet.id === id);
  } catch (error) {
    console.error(`Error finding pet ${id}:`, error);
    return undefined;
  }
}

/**
 * Add a new pet
 */
export async function addPet(pet: Omit<Pet, "id">): Promise<Pet> {
  try {
    const allPets = await getPets();
    const newPet: Pet = {
      ...pet,
      id: `pet-${Date.now()}`,
    };
    
    const updatedPets = [...allPets, newPet];
    await savePets(updatedPets);
    return newPet;
  } catch (error) {
    console.error("Error adding pet:", error);
    throw error;
  }
}

/**
 * Update an existing pet
 */
export async function updatePet(id: string, updates: Partial<Pet>): Promise<Pet | null> {
  try {
    const allPets = await getPets();
    const index = allPets.findIndex((pet) => pet.id === id);
    
    if (index !== -1) {
      const updatedPet = { ...allPets[index], ...updates };
      allPets[index] = updatedPet;
      await savePets(allPets);
      return updatedPet;
    }
    return null;
  } catch (error) {
    console.error(`Error updating pet ${id}:`, error);
    return null;
  }
}

/**
 * Delete a pet
 */
export async function deletePet(id: string): Promise<boolean> {
  try {
    const allPets = await getPets();
    const index = allPets.findIndex((pet) => pet.id === id);
    
    if (index !== -1) {
      allPets.splice(index, 1);
      await savePets(allPets);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting pet ${id}:`, error);
    return false;
  }
}

/**
 * Get all applications
 */
export async function getApplications(): Promise<AdoptionApplication[]> {
  try {
    const stored = await AsyncStorage.getItem(APPLICATIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Initialize with default data
      await AsyncStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(defaultApplications));
      return defaultApplications;
    }
  } catch (error) {
    console.error("Error loading applications:", error);
    return defaultApplications;
  }
}

/**
 * Save applications to AsyncStorage
 */
export async function saveApplications(applicationsData: AdoptionApplication[]): Promise<void> {
  try {
    await AsyncStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applicationsData));
  } catch (error) {
    console.error("Error saving applications:", error);
  }
}

/**
 * Get applications by user ID
 */
export async function getApplicationsByUser(userId: string): Promise<AdoptionApplication[]> {
  try {
    const applications = await getApplications();
    return applications.filter((app) => app.adopterId === userId);
  } catch (error) {
    console.error(`Error finding applications for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get pet name for application
 */
export async function getPetNameForApplication(petId: string): Promise<string> {
  try {
    const pet = await getPetById(petId);
    return pet ? pet.name : "Unknown Pet";
  } catch (error) {
    console.error(`Error finding pet name for application with pet ID ${petId}:`, error);
    return "Unknown Pet";
  }
}

/**
 * Get an application by ID
 */
export async function getApplicationById(id: string): Promise<AdoptionApplication | undefined> {
  try {
    const allApplications = await getApplications();
    return allApplications.find((application) => application.id === id);
  } catch (error) {
    console.error(`Error finding application ${id}:`, error);
    return undefined;
  }
}

/**
 * Add a new application
 */
export async function addApplication(application: Omit<AdoptionApplication, "id">): Promise<AdoptionApplication> {
  try {
    const allApplications = await getApplications();
    const newApplication: AdoptionApplication = {
      ...application,
      id: `app-${Date.now()}`,
    };
    
    const updatedApplications = [...allApplications, newApplication];
    await saveApplications(updatedApplications);
    return newApplication;
  } catch (error) {
    console.error("Error adding application:", error);
    throw error;
  }
}

/**
 * Update an existing application
 */
export async function updateApplication(id: string, updates: Partial<AdoptionApplication>): Promise<AdoptionApplication | null> {
  try {
    const allApplications = await getApplications();
    const index = allApplications.findIndex((application) => application.id === id);
    
    if (index !== -1) {
      const updatedApplication = { ...allApplications[index], ...updates };
      allApplications[index] = updatedApplication;
      await saveApplications(allApplications);
      return updatedApplication;
    }
    return null;
  } catch (error) {
    console.error(`Error updating application ${id}:`, error);
    return null;
  }
}

/**
 * Delete an application
 */
export async function deleteApplication(id: string): Promise<boolean> {
  try {
    const allApplications = await getApplications();
    const index = allApplications.findIndex((application) => application.id === id);
    
    if (index !== -1) {
      allApplications.splice(index, 1);
      await saveApplications(allApplications);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting application ${id}:`, error);
    return false;
  }
}

/**
 * Get all messages or messages for a specific pet
 */
export async function getMessages(petId?: string): Promise<Message[]> {
  try {
    const stored = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
    if (stored) {
      const messages = JSON.parse(stored);
      return petId ? messages.filter((msg: Message) => msg.petId === petId) : messages;
    }
    return [];
  } catch (error) {
    console.error("Error loading messages:", error);
    return [];
  }
}

/**
 * Add a new message
 */
export async function addMessage(message: Omit<Message, "id" | "timestamp" | "read">): Promise<Message> {
  try {
    const messages = await getMessages();
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    
    const updatedMessages = [...messages, newMessage];
    await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
    return newMessage;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    const messages = await getMessages();
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    
    if (messageIndex !== -1) {
      messages[messageIndex].read = true;
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error marking message ${messageId} as read:`, error);
    return false;
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const messages = await getMessages();
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    
    if (messageIndex !== -1) {
      messages.splice(messageIndex, 1);
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting message ${messageId}:`, error);
    return false;
  }
}

/**
 * Search for pets based on criteria
 */
export async function searchPets(criteria: {
  type?: string;
  gender?: string;
  age?: string;
  size?: string;
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  searchText?: string;
}): Promise<Pet[]> {
  try {
    const pets = await getPets();
    
    return pets.filter(pet => {
      // Match type if provided
      if (criteria.type && pet.type.toLowerCase() !== criteria.type.toLowerCase()) return false;
      
      // Match gender if provided
      if (criteria.gender && pet.gender.toLowerCase() !== criteria.gender.toLowerCase()) return false;
      
      // Match age if provided
      if (criteria.age && !pet.age.toLowerCase().includes(criteria.age.toLowerCase())) return false;
      
      // Match size if provided
      if (criteria.size && pet.size.toLowerCase() !== criteria.size.toLowerCase()) return false;
      
      // Match good with kids if provided
      if (criteria.goodWithKids !== undefined && pet.goodWithKids !== criteria.goodWithKids) return false;
      
      // Match good with pets if provided
      if (criteria.goodWithPets !== undefined && pet.goodWithPets !== criteria.goodWithPets) return false;
      
      // Match search text if provided
      if (criteria.searchText) {
        const searchText = criteria.searchText.toLowerCase();
        const searchFields = [
          pet.name,
          pet.breed,
          pet.description,
          pet.location,
          ...pet.personality
        ].map(field => field.toLowerCase());
        
        if (!searchFields.some(field => field.includes(searchText))) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error("Error searching pets:", error);
    return [];
  }
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(PETS_STORAGE_KEY);
    await AsyncStorage.removeItem(APPLICATIONS_STORAGE_KEY);
    await AsyncStorage.removeItem(MESSAGES_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear all data:", error);
    return false;
  }
}

/**
 * Get all pets in the system
 * @returns Array of all pets
 */
export async function getAllPets(): Promise<Pet[]> {
  try {
    const petsData = await AsyncStorage.getItem(PETS_STORAGE_KEY);
    if (petsData) {
      return JSON.parse(petsData);
    }
    
    // If no pets in storage yet, initialize with default pets
    await AsyncStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(defaultPets));
    return defaultPets;
  } catch (error) {
    console.error("Error getting all pets:", error);
    return [];
  }
}

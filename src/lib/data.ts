// Sample data for development and testing
import {
    initializeSampleData,
    sampleApplications as libraryApplications,
    samplePets as libraryPets,
    sampleMessages,
    sampleNotifications
} from '../../lib/sample-data';

// Pet Types and Breeds
export const petTypes = [
  { id: 'dog', name: 'Dog' },
  { id: 'cat', name: 'Cat' },
  { id: 'bird', name: 'Bird' },
  { id: 'rabbit', name: 'Rabbit' },
  { id: 'small-mammal', name: 'Small Mammal' },
  { id: 'reptile', name: 'Reptile' },
  { id: 'farm', name: 'Farm Animal' },
];

// Common dog breeds
export const dogBreeds = [
  'Labrador Retriever',
  'German Shepherd',
  'Golden Retriever',
  'French Bulldog',
  'Beagle',
  'Poodle',
  'Siberian Husky',
  'Dachshund',
  'Boxer',
  'Chihuahua',
  'Mixed Breed',
];

// Common cat breeds
export const catBreeds = [
  'Domestic Shorthair',
  'Maine Coon',
  'Persian',
  'Siamese',
  'Ragdoll',
  'British Shorthair',
  'Bengal',
  'Sphynx',
  'Scottish Fold',
  'Abyssinian',
  'Mixed Breed',
];

// Sample pets
export const samplePets = [
  {
    id: '1',
    name: 'Buddy',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Male',
    size: 'Large',
    color: 'Golden',
    description: 'Buddy is a friendly and playful Golden Retriever who loves going on walks and playing fetch.',
    status: 'Available',
    location: 'Main Shelter',
    medicalInfo: 'Vaccinated, neutered, microchipped',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1562'
  },
  {
    id: '2',
    name: 'Luna',
    type: 'cat',
    breed: 'Domestic Shorthair',
    age: 2,
    gender: 'Female',
    size: 'Medium',
    color: 'Black and White',
    description: 'Luna is a gentle and curious cat who loves to explore and curl up in sunny spots.',
    status: 'Available',
    location: 'Main Shelter',
    medicalInfo: 'Vaccinated, spayed, microchipped',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1458'
  },
  {
    id: '3',
    name: 'Max',
    type: 'dog',
    breed: 'Beagle',
    age: 1,
    gender: 'Male',
    size: 'Medium',
    color: 'Tricolor',
    description: 'Max is an energetic young Beagle who loves to play and go on adventures.',
    status: 'Available',
    location: 'Foster Home',
    medicalInfo: 'Vaccinated, neutered, microchipped',
    imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?q=80&w=1374'
  }
];

// Sample shelters
export const shelters = [
  {
    id: '1',
    name: 'Happy Paws Shelter',
    address: '123 Main St, Anytown, USA',
    phone: '(555) 123-4567',
    email: 'info@happypaws.org',
    website: 'www.happypaws.org',
    description: 'Happy Paws is dedicated to finding forever homes for animals in need.',
  },
  {
    id: '2',
    name: 'Second Chance Animal Rescue',
    address: '456 Oak Ave, Somewhere, USA',
    phone: '(555) 987-6543',
    email: 'contact@secondchancerescue.org',
    website: 'www.secondchancerescue.org',
    description: 'We believe every animal deserves a second chance at a loving home.',
  },
];

// Sample application statuses
export const applicationStatuses = [
  'submitted',
  'under-review',
  'home-check',
  'approved',
  'denied',
  'withdrawn',
];

// Sample applications
export const applications = [
  {
    id: '1',
    petId: '1',
    userId: 'demo-user-123',
    status: 'under-review',
    applicationDate: '2023-06-15T10:30:00.000Z',
    lastUpdated: '2023-06-16T14:45:00.000Z',
  },
  {
    id: '2',
    petId: '3',
    userId: 'demo-user-123',
    status: 'approved',
    applicationDate: '2023-05-20T09:15:00.000Z',
    lastUpdated: '2023-05-28T11:20:00.000Z',
  },
];

// Sample adoption applications
export const sampleApplications = [
  {
    id: '1',
    petId: '1',
    petName: 'Buddy',
    petImageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1562',
    adopterId: '101',
    adopterName: 'John Doe',
    status: 'Pending',
    date: '2025-06-20',
    homeType: 'House',
    hasYard: true,
    otherPets: 'None',
    experience: 'Had dogs growing up',
    workSchedule: 'Work from home',
    reason: 'Looking for a companion for daily walks and outdoor activities.'
  },
  {
    id: '2',
    petId: '2',
    petName: 'Luna',
    petImageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1458',
    adopterId: '102',
    adopterName: 'Jane Smith',
    status: 'Approved',
    date: '2025-06-15',
    homeType: 'Apartment',
    hasYard: false,
    otherPets: '1 cat',
    experience: 'Current cat owner',
    workSchedule: 'Part-time office',
    reason: 'Looking for a friend for my current cat and myself.'
  },
  {
    id: '3',
    petId: '3',
    petName: 'Max',
    petImageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?q=80&w=1374',
    adopterId: '103',
    adopterName: 'Alex Johnson',
    status: 'Rejected',
    date: '2025-06-10',
    homeType: 'Apartment',
    hasYard: false,
    otherPets: '2 dogs',
    experience: 'Lifelong dog owner',
    workSchedule: 'Full-time office',
    reason: 'Would like to add another dog to our family pack.'
  }
];

export interface Pet {
  id: string
  name: string
  type: string
  breed: string
  age: string
  gender: string
  size: string
  color: string
  location: string
  distance: string
  description: string
  personality: string[]
  images: string[]
  vaccinated: boolean
  neutered: boolean
  microchipped: boolean
  goodWithKids: boolean
  goodWithPets: boolean
  energyLevel: string
  adoptionFee: number
  status: string
  dateAdded: string
  shelter: {
    name: string
    contact: string
    email: string
    address: string
  }
  healthRecords: {
    type: string
    date: string
    description: string
  }[]
}

export interface LostPet {
  id: string
  name: string
  breed: string
  type: string
  color: string
  size: string
  lastSeenLocation: string
  lastSeenDate: string
  description: string
  images: string[]
  contactInfo: {
    name: string
    phone: string
    email: string
  }
  status: "Lost" | "Found" | "Reunited"
  reward?: number
}

export interface AdoptionApplication {
  id: string
  petId: string
  adopterId: string
  status: string
  submittedDate: string
  currentStep?: string
  progress?: number
  notes?: string
  timeline: {
    id: string
    status: string
    description: string
    date?: string
    completed: boolean
  }[]
}

const mockPets: Pet[] = [
  {
    id: "mock-1",
    name: "Buddy",
    type: "Dog",
    breed: "Golden Retriever",
    age: "3 years",
    gender: "Male",
    size: "Large",
    color: "Golden",
    location: "Austin, TX",
    distance: "2.5 miles away",
    description:
      "Buddy is a friendly and energetic Golden Retriever who loves playing fetch and swimming. He's great with kids and other dogs, making him the perfect family companion.",
    personality: ["Friendly", "Energetic", "Loyal", "Playful"],
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    ],
    vaccinated: true,
    neutered: true,
    microchipped: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "High",
    adoptionFee: 250,
    status: "Available",
    dateAdded: "2024-01-15",
    shelter: {
      name: "Happy Paws Shelter",
      contact: "(555) 123-4567",
      email: "info@happypaws.org",
      address: "123 Pet Street, Austin, TX 78701",
    },
    healthRecords: [
      {
        type: "Annual Checkup",
        date: "2024-01-10",
        description: "Healthy, all vaccinations up to date",
      },
      {
        type: "Dental Cleaning",
        date: "2023-12-15",
        description: "Teeth cleaned, no issues found",
      },
    ],
  },
  {
    id: "mock-2",
    name: "Luna",
    type: "Cat",
    breed: "Persian",
    age: "2 years",
    gender: "Female",
    size: "Medium",
    color: "White",
    location: "Austin, TX",
    distance: "1.8 miles away",
    description:
      "Luna is a beautiful Persian cat with a calm and gentle personality. She loves to be pampered and enjoys quiet environments.",
    personality: ["Calm", "Gentle", "Independent", "Affectionate"],
    images: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop",
    ],
    vaccinated: true,
    neutered: true,
    microchipped: false,
    goodWithKids: true,
    goodWithPets: false,
    energyLevel: "Low",
    adoptionFee: 150,
    status: "Available",
    dateAdded: "2024-01-12",
    shelter: {
      name: "Feline Friends Rescue",
      contact: "(555) 987-6543",
      email: "contact@felinefriends.org",
      address: "456 Cat Lane, Austin, TX 78702",
    },
    healthRecords: [
      {
        type: "Spay Surgery",
        date: "2023-11-20",
        description: "Surgery completed successfully, full recovery",
      },
    ],
  },
  {
    id: "mock-3",
    name: "Max",
    type: "Dog",
    breed: "German Shepherd",
    age: "5 years",
    gender: "Male",
    size: "Large",
    color: "Black and Tan",
    location: "Austin, TX",
    distance: "3.2 miles away",
    description:
      "Max is a loyal and intelligent German Shepherd. He's well-trained and would make an excellent guard dog and family companion.",
    personality: ["Loyal", "Intelligent", "Protective", "Trainable"],
    images: ["https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop"],
    vaccinated: true,
    neutered: true,
    microchipped: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: "Medium",
    adoptionFee: 300,
    status: "Available",
    dateAdded: "2024-01-08",
    shelter: {
      name: "Austin Animal Center",
      contact: "(555) 456-7890",
      email: "adopt@austinanimals.org",
      address: "789 Animal Way, Austin, TX 78703",
    },
    healthRecords: [
      {
        type: "Hip X-Ray",
        date: "2024-01-05",
        description: "Hip dysplasia screening - results normal",
      },
    ],
  },
]

const mockLostPets: LostPet[] = [
  {
    id: "lost-1",
    name: "Charlie",
    breed: "Labrador Mix",
    type: "Dog",
    color: "Brown and White",
    size: "Large",
    lastSeenLocation: "Central Park, NYC",
    lastSeenDate: "2024-01-25",
    description:
      "Charlie is a friendly brown and white Labrador mix. He was wearing a red collar when he went missing.",
    images: ["https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop"],
    contactInfo: {
      name: "Sarah Johnson",
      phone: "(555) 111-2222",
      email: "sarah.j@email.com",
    },
    status: "Lost",
    reward: 500,
  },
  {
    id: "lost-2",
    name: "Whiskers",
    breed: "Persian",
    type: "Cat",
    color: "Gray",
    size: "Medium",
    lastSeenLocation: "Downtown LA",
    lastSeenDate: "2024-01-28",
    description: "Whiskers is a gray Persian cat with long fur. Very shy and may be hiding.",
    images: ["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop"],
    contactInfo: {
      name: "Mike Chen",
      phone: "(555) 333-4444",
      email: "mike.chen@email.com",
    },
    status: "Lost",
    reward: 200,
  },
  {
    id: "lost-3",
    name: "Bella",
    breed: "Beagle",
    type: "Dog",
    color: "Tri-color",
    size: "Medium",
    lastSeenLocation: "Green Valley Park, Austin",
    lastSeenDate: "2024-02-02",
    description: "Bella is a friendly beagle who ran away during a thunderstorm. She has a blue collar with ID tags.",
    images: ["https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=300&fit=crop"],
    contactInfo: {
      name: "Thomas Wilson",
      phone: "(555) 222-3333",
      email: "thomas.w@email.com",
    },
    status: "Lost",
    reward: 300,
  },
  {
    id: "4",
    name: "Unknown",
    breed: "Tabby Mix",
    type: "Cat",
    color: "Orange and White",
    size: "Medium",
    lastSeenLocation: "Hamilton Heights, NYC",
    lastSeenDate: "2024-01-30",
    description: "Found this friendly orange tabby cat wandering around. No collar but appears well-cared for.",
    images: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"],
    contactInfo: {
      name: "Emily Rodriguez",
      phone: "(555) 444-5555",
      email: "emilyrod@email.com",
    },
    status: "Found",
  },
  {
    id: "5",
    name: "Max",
    breed: "Husky",
    type: "Dog",
    color: "Gray and White",
    size: "Large",
    lastSeenLocation: "Lincoln Park, Chicago",
    lastSeenDate: "2024-02-05",
    description: "Max is a 3-year-old Husky with distinctive blue eyes. Very friendly but may be skittish around strangers.",
    images: ["https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop"],
    contactInfo: {
      name: "James Peterson",
      phone: "(555) 666-7777",
      email: "james.p@email.com",
    },
    status: "Lost",
    reward: 400,
  },
  {
    id: "6",
    name: "Unknown",
    breed: "Border Collie",
    type: "Dog",
    color: "Black and White",
    size: "Medium",
    lastSeenLocation: "Memorial Park, Houston",
    lastSeenDate: "2024-02-01",
    description: "Found this Border Collie mix with no collar. Very well-behaved and knows commands. Must belong to someone.",
    images: ["https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop"],
    contactInfo: {
      name: "Sophia Martinez",
      phone: "(555) 888-9999",
      email: "sophia.m@email.com",
    },
    status: "Found",
  },
]

const mockApplications: AdoptionApplication[] = [
  {
    id: "1",
    petId: "1",
    adopterId: "demo-user",
    status: "Under Review",
    submittedDate: "2024-01-16",
    currentStep: "Background Check",
    progress: 60,
    timeline: [
      {
        id: "1",
        status: "Application Submitted",
        description: "Your application has been received",
        date: "2024-01-16",
        completed: true,
      },
      {
        id: "2",
        status: "Initial Review",
        description: "Application is being reviewed by our team",
        date: "2024-01-17",
        completed: true,
      },
      {
        id: "3",
        status: "Background Check",
        description: "Conducting background and reference checks",
        completed: false,
      },
      {
        id: "4",
        status: "Meet & Greet",
        description: "Schedule a meeting with the pet",
        completed: false,
      },
      {
        id: "5",
        status: "Final Approval",
        description: "Final decision and adoption paperwork",
        completed: false,
      },
    ],
  },
]

export const getPets = (filters?: any): Pet[] => {
  // Combine mock pets with library pets
  const allPets = [...mockPets, ...libraryPets];
  
  // If no filters, return all pets
  if (!filters) return allPets;
  
  // Apply filters if provided
  return allPets.filter((pet) => {
    if (filters.type && pet.type !== filters.type) return false;
    if (filters.status && pet.status !== filters.status) return false;
    if (filters.gender && pet.gender !== filters.gender) return false;
    if (filters.breed && pet.breed !== filters.breed) return false;
    
    // Text search in name or description
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = pet.name.toLowerCase().includes(searchLower);
      const matchesDescription = pet.description.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesDescription) return false;
    }
    
    return true;
  });
}

export const getPetById = (id: string): Pet | undefined => {
  // First check in mockPets (in-memory)
  const mockPet = mockPets.find((pet) => pet.id === id);
  if (mockPet) return mockPet;
  
  // Then check in library pets (from sample-data)
  const libraryPet = libraryPets.find((pet) => pet.id === id);
  return libraryPet;
}

export const getLostPets = (): LostPet[] => {
  return mockLostPets
}

export const getLostPetById = (id: string): LostPet | undefined => {
  return mockLostPets.find((pet) => pet.id === id)
}

export const getApplicationsByUser = (userId: string): AdoptionApplication[] => {
  return mockApplications.filter((app) => app.adopterId === userId)
}

export const getApplicationById = (id: string): AdoptionApplication | undefined => {
  return mockApplications.find((app) => app.id === id)
}

// Initialize sample data from the library
export const initializeData = async () => {
  try {
    await initializeSampleData();
    console.log('Data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
};

// Export all sample data
export default {
  petTypes,
  dogBreeds,
  catBreeds,
  samplePets,
  sampleApplications,
  mockPets,
  mockLostPets,
  mockApplications,
  libraryPets,
  libraryApplications,
  sampleMessages,
  sampleNotifications,
  getPets,
  getPetById,
  getLostPets,
  getLostPetById,
  getApplicationsByUser,
  getApplicationById,
  initializeData
};

// Get pets adopted by a specific user
export const getAdoptedPets = async (userId: string) => {
  return [
    {
      id: "pet-1",
      name: "Max",
      species: "Dog",
      image: "https://example.com/max.jpg"
    },
    {
      id: "pet-2",
      name: "Bella",
      species: "Cat",
      image: "https://example.com/bella.jpg"
    }
  ];
}

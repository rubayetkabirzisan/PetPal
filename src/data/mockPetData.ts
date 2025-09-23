// Mock pet data for the PetPal application
export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: string;
  gender: string;
  description: string;
  images: string[];
  status: string;
  adoptionFee: number;
  location: string;
  distance?: string;
  color?: string;
  energyLevel?: string;
  personality?: string[];
  vaccinated?: boolean;
  neutered?: boolean;
  microchipped?: boolean;
  shelter: {
    id: string;
    name: string;
    address: string;
    phone: string;
    contact?: string;
    email?: string;
  };
  healthRecords: any[];
  isFavorited: boolean;
  applicationCount: number;
  viewCount: number;
}

export const mockPets: { [key: string]: Pet } = {
  // Pet IDs commonly used in the app (1, 2, 3, pet-001, pet-002, pet-003)
  "1": {
    id: "1",
    name: "Buddy",
    breed: "Golden Retriever",  
    age: 3,
    size: "Large",
    gender: "Male",
    description: "Buddy is a friendly and energetic Golden Retriever who loves to play fetch and go on long walks. He's great with kids and other pets, making him the perfect family companion. Buddy is house-trained and knows basic commands.",
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400"
    ],
    status: "Available",
    adoptionFee: 250,
    location: "San Francisco, CA",
    distance: "2.5 mi away",
    color: "Golden",
    energyLevel: "High",
    personality: ["Friendly", "Playful", "Energetic", "Loyal"],
    vaccinated: true,
    neutered: true,
    microchipped: true,
    shelter: {
      id: "shelter-001",
      name: "Happy Paws Animal Shelter",
      address: "123 Main Street, San Francisco, CA 94102",
      phone: "(415) 555-0123",
      contact: "(415) 555-0123",
      email: "info@happypaws.org"
    },
    healthRecords: [
      {
        type: "Vaccination",
        date: "2024-08-15",
        description: "Annual vaccinations completed - DHPP, Rabies"
      },
      {
        type: "Checkup",
        date: "2024-07-20", 
        description: "Routine health examination - all clear"
      }
    ],
    isFavorited: false,
    applicationCount: 3,
    viewCount: 127
  },
  "2": {
    id: "2",
    name: "Luna",
    breed: "Labrador Mix",
    age: 2,
    size: "Medium",
    gender: "Female",
    description: "Luna is a sweet and gentle Labrador mix who loves belly rubs and playing with toys. She's perfect for families looking for a calm and loving companion. Luna is well-behaved and gets along great with children.",
    images: [
      "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400",
      "https://images.unsplash.com/photo-1544568100-847a948585b9?w=400"
    ],
    status: "Available",
    adoptionFee: 200,
    location: "San Francisco, CA",
    distance: "1.2 mi away",
    color: "Black & White",
    energyLevel: "Medium",
    personality: ["Gentle", "Calm", "Affectionate", "Good with kids"],
    vaccinated: true,
    neutered: true,
    microchipped: true,
    shelter: {
      id: "shelter-001",
      name: "Happy Paws Animal Shelter", 
      address: "123 Main Street, San Francisco, CA 94102",
      phone: "(415) 555-0123",
      contact: "(415) 555-0123",
      email: "info@happypaws.org"
    },
    healthRecords: [
      {
        type: "Vaccination",
        date: "2024-09-01",
        description: "Updated vaccinations - all current"
      }
    ],
    isFavorited: true,
    applicationCount: 1,
    viewCount: 89
  },
  "3": {
    id: "3",
    name: "Max",
    breed: "German Shepherd",
    age: 4,
    size: "Large",
    gender: "Male",
    description: "Max is a loyal and intelligent German Shepherd looking for an active family. He's well-trained, protective, and would make an excellent companion for someone who enjoys outdoor activities and has experience with large dogs.",
    images: [
      "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400",
      "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400"
    ],
    status: "Available",
    adoptionFee: 300,
    location: "San Francisco, CA",
    distance: "3.8 mi away",
    color: "Brown & Black",
    energyLevel: "High",
    personality: ["Intelligent", "Loyal", "Protective", "Active"],
    vaccinated: true,
    neutered: true,
    microchipped: true,
    shelter: {
      id: "shelter-002", 
      name: "Bay Area Pet Rescue",
      address: "456 Oak Avenue, San Francisco, CA 94103",
      phone: "(415) 555-0456",
      contact: "(415) 555-0456",
      email: "contact@bayareapetrescue.org"
    },
    healthRecords: [
      {
        type: "Vaccination",
        date: "2024-08-30",
        description: "Complete vaccination series updated"
      },
      {
        type: "Dental Cleaning",
        date: "2024-07-15",
        description: "Professional dental cleaning completed"
      }
    ],
    isFavorited: false,
    applicationCount: 5,
    viewCount: 203
  },
  "4": {
    id: "4",
    name: "Bella",
    breed: "Border Collie",
    age: 1,
    size: "Medium",
    gender: "Female",
    description: "Bella is a young and intelligent Border Collie puppy who loves to learn new tricks. She's highly energetic and would thrive in an active household with plenty of mental stimulation and exercise.",
    images: [
      "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400",
      "https://images.unsplash.com/photo-1544568100-847a948585b9?w=400"
    ],
    status: "Available",
    adoptionFee: 180,
    location: "San Francisco, CA",
    distance: "0.8 mi away",
    color: "Black & White",
    energyLevel: "Very High",
    personality: ["Intelligent", "Energetic", "Trainable", "Alert"],
    vaccinated: true,
    neutered: false,
    microchipped: true,
    shelter: {
      id: "shelter-003",
      name: "Paws & Love Rescue",
      address: "789 Elm Street, San Francisco, CA 94104",
      phone: "(415) 555-0789",
      contact: "(415) 555-0789",
      email: "info@pawsandlove.org"
    },
    healthRecords: [
      {
        type: "Vaccination",
        date: "2024-09-10",
        description: "Puppy vaccination series - 1st round"
      }
    ],
    isFavorited: false,
    applicationCount: 8,
    viewCount: 156
  },
  "5": {
    id: "5",
    name: "Charlie",
    breed: "Beagle",
    age: 5,
    size: "Medium",
    gender: "Male",
    description: "Charlie is a calm and friendly Beagle who enjoys leisurely walks and cuddle sessions. He's great with children and other pets, making him an ideal family companion. Charlie is fully house-trained and well-behaved.",
    images: [
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400"
    ],
    status: "Available",
    adoptionFee: 220,
    location: "San Francisco, CA",
    distance: "4.1 mi away",
    color: "Brown & White",
    energyLevel: "Medium",
    personality: ["Calm", "Friendly", "Good with kids", "Gentle"],
    vaccinated: true,
    neutered: true,
    microchipped: true,
    shelter: {
      id: "shelter-001",
      name: "Happy Paws Animal Shelter",
      address: "123 Main Street, San Francisco, CA 94102",
      phone: "(415) 555-0123",
      contact: "(415) 555-0123",
      email: "info@happypaws.org"
    },
    healthRecords: [
      {
        type: "Vaccination",
        date: "2024-08-20",
        description: "Annual vaccinations completed"
      },
      {
        type: "Health Check",
        date: "2024-07-30",
        description: "General health examination - excellent condition"
      }
    ],
    isFavorited: false,
    applicationCount: 2,
    viewCount: 98
  }
};

// Also create aliases for pet-001, pet-002, pet-003 format
mockPets["pet-001"] = mockPets["1"];
mockPets["pet-002"] = mockPets["2"]; 
mockPets["pet-003"] = mockPets["3"];

/**
 * Get a pet by ID
 */
export const getPetById = (id: string): Pet | null => {
  return mockPets[id] || null;
};

/**
 * Get all pets as an array
 */
export const getAllPets = (): Pet[] => {
  // Return only the main pets (1-5), not the aliases
  return Object.values(mockPets).filter(pet => pet.id.match(/^\d+$/));
};

/**
 * Get random pets for demo purposes
 */
export const getRandomPets = (count: number = 3): Pet[] => {
  const allPets = getAllPets();
  const shuffled = allPets.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
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

export const pets: Pet[] = [
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
]

export function getPets(): Pet[] {
  if (typeof window === "undefined") return pets

  try {
    const stored = localStorage.getItem("petpal_pets")
    if (stored) {
      return JSON.parse(stored)
    } else {
      // Initialize with default data
      localStorage.setItem("petpal_pets", JSON.stringify(pets))
      return pets
    }
  } catch (error) {
    console.error("Error loading pets:", error)
    return pets
  }
}

export function savePets(petsData: Pet[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("petpal_pets", JSON.stringify(petsData))
}

export function getPetById(id: string): Pet | undefined {
  const allPets = getPets()
  return allPets.find((pet) => pet.id === id)
}

export function addPet(pet: Omit<Pet, "id">): Pet {
  const allPets = getPets()
  const newPet: Pet = {
    ...pet,
    id: Math.random().toString(36).substr(2, 9),
  }
  allPets.push(newPet)
  savePets(allPets)
  return newPet
}

export function updatePet(id: string, updates: Partial<Pet>): Pet | null {
  const allPets = getPets()
  const index = allPets.findIndex((pet) => pet.id === id)
  if (index !== -1) {
    allPets[index] = { ...allPets[index], ...updates }
    savePets(allPets)
    return allPets[index]
  }
  return null
}

export function deletePet(id: string): boolean {
  const allPets = getPets()
  const index = allPets.findIndex((pet) => pet.id === id)
  if (index !== -1) {
    allPets.splice(index, 1)
    savePets(allPets)
    return true
  }
  return false
}

// Application management functions
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

// Update the default applications to match the adoption history
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
]

// Add function to get applications by user
export function getApplicationsByUser(userId: string): AdoptionApplication[] {
  const applications = getApplications()
  return applications.filter((app) => app.adopterId === userId)
}

// Add function to get pet name for application
export function getPetNameForApplication(petId: string): string {
  const pet = getPetById(petId)
  return pet ? pet.name : "Unknown Pet"
}

export function getApplications(): AdoptionApplication[] {
  if (typeof window === "undefined") return defaultApplications

  try {
    const stored = localStorage.getItem("petpal_applications")
    if (stored) {
      return JSON.parse(stored)
    } else {
      // Initialize with default data
      localStorage.setItem("petpal_applications", JSON.stringify(defaultApplications))
      return defaultApplications
    }
  } catch (error) {
    console.error("Error loading applications:", error)
    return defaultApplications
  }
}

export function saveApplications(applicationsData: AdoptionApplication[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("petpal_applications", JSON.stringify(applicationsData))
}

export function getApplicationById(id: string): AdoptionApplication | undefined {
  const allApplications = getApplications()
  return allApplications.find((application) => application.id === id)
}

export function addApplication(application: Omit<AdoptionApplication, "id">): AdoptionApplication {
  const allApplications = getApplications()
  const newApplication: AdoptionApplication = {
    ...application,
    id: Math.random().toString(36).substr(2, 9),
  }
  allApplications.push(newApplication)
  saveApplications(allApplications)
  return newApplication
}

export function updateApplication(id: string, updates: Partial<AdoptionApplication>): AdoptionApplication | null {
  const allApplications = getApplications()
  const index = allApplications.findIndex((application) => application.id === id)
  if (index !== -1) {
    allApplications[index] = { ...allApplications[index], ...updates }
    saveApplications(allApplications)
    return allApplications[index]
  }
  return null
}

export function deleteApplication(id: string): boolean {
  const allApplications = getApplications()
  const index = allApplications.findIndex((application) => application.id === id)
  if (index !== -1) {
    allApplications.splice(index, 1)
    saveApplications(allApplications)
    return true
  }
  return false
}

// Message management functions
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

export function getMessages(petId?: string): Message[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem("petpal_messages")
    const messages = stored ? JSON.parse(stored) : []
    return petId ? messages.filter((msg: Message) => msg.petId === petId) : messages
  } catch (error) {
    console.error("Error loading messages:", error)
    return []
  }
}

export function addMessage(message: Omit<Message, "id" | "timestamp" | "read">): Message {
  const messages = getMessages()
  const newMessage: Message = {
    ...message,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    read: false,
  }
  messages.push(newMessage)

  if (typeof window !== "undefined") {
    localStorage.setItem("petpal_messages", JSON.stringify(messages))
  }

  return newMessage
}

export function markMessageAsRead(messageId: string): void {
  const messages = getMessages()
  const messageIndex = messages.findIndex((msg) => msg.id === messageId)
  if (messageIndex !== -1) {
    messages[messageIndex].read = true
    if (typeof window !== "undefined") {
      localStorage.setItem("petpal_messages", JSON.stringify(messages))
    }
  }
}

export function deleteMessage(messageId: string): boolean {
  const messages = getMessages()
  const messageIndex = messages.findIndex((msg) => msg.id === messageId)
  if (messageIndex !== -1) {
    messages.splice(messageIndex, 1)
    if (typeof window !== "undefined") {
      localStorage.setItem("petpal_messages", JSON.stringify(messages))
    }
    return true
  }
  return false
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  species?: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  color: string;
  description: string;
  images?: string[];
  imageUrl?: string;
  location: string;
  distance?: string;
  vaccinated?: boolean;
  neutered?: boolean;
  microchipped?: boolean;
  houseTrained?: boolean;
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  energyLevel?: string;
  activityLevel?: string;
  hypoallergenic?: boolean;
  shelterId?: string;
  shelterName?: string;
  shelterPhone?: string;
  shelterEmail?: string;
  status: string;
  medicalHistory?: string;
  specialNeeds?: string;
  adoptionFee?: number;
  dateAdded?: string;
  shelter?: {
    name: string;
    contact?: string;
    phone?: string;
    email: string;
    address: string;
  };
  healthRecords?: Array<{
    date: string;
    type: string;
    description: string;
  }>;
  medicalInfo?: string;
  personality?: string[];
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName?: string;
  petImageUrl?: string;
  adopterId: string;
  adopterName?: string;
  adopterEmail?: string;
  status: string;
  submittedDate?: string;
  date?: string;
  notes?: string;
  timeline?: ApplicationTimelineEvent[];
  progress?: number;
  currentStep?: string;
  daysAgo?: number;
  shelterName?: string;
  homeType?: string;
  hasYard?: boolean;
  otherPets?: string;
  experience?: string;
  workSchedule?: string;
  reason?: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  status: string;
  date?: string;
  description: string;
  completed: boolean;
}

export interface Message {
  id: string;
  petId: string;
  senderId: string;
  senderName: string;
  senderType: "adopter" | "admin";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface LostPet {
  id: string;
  name: string;
  breed: string;
  type: string;
  species?: string;
  color: string;
  size: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  description: string;
  images?: string[];
  photos?: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  status: string;
  reward?: number;
}

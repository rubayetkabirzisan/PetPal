import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Donation {
  id: string
  donorId: string
  donorName: string
  donorEmail: string
  amount: number
  currency: string
  donationType: "one-time" | "monthly" | "yearly"
  purpose: "general" | "medical" | "food" | "shelter" | "education" | "emergency"
  date: string
  paymentMethod: "credit-card" | "paypal" | "bank-transfer" | "cash"
  status: "completed" | "pending" | "failed" | "refunded"
  message?: string
  isAnonymous: boolean
  petId?: string // If donation is for a specific pet
}

export interface DonationCampaign {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  currency: string
  startDate: string
  endDate: string
  status: "active" | "completed" | "paused" | "cancelled"
  beneficiaryType: "general" | "specific-pet" | "medical-emergency"
  beneficiaryId?: string
  imageUrl?: string
  donorCount: number
}

export interface Donor {
  id: string
  name: string
  email: string
  totalDonated: number
  donationCount: number
  firstDonation: string
  lastDonation: string
  isRecurring: boolean
  preferredCauses: string[]
  communicationPreferences: {
    email: boolean
    sms: boolean
    newsletter: boolean
  }
}

// Storage keys
const DONATIONS_STORAGE_KEY = "petpal_donations"
const CAMPAIGNS_STORAGE_KEY = "petpal_donation_campaigns"
const DONORS_STORAGE_KEY = "petpal_donors"

// Default donations for demo
const defaultDonations: Donation[] = [
  {
    id: "donation-1",
    donorId: "donor-1",
    donorName: "John Smith",
    donorEmail: "john.smith@email.com",
    amount: 50.00,
    currency: "USD",
    donationType: "one-time",
    purpose: "medical",
    date: "2024-07-20",
    paymentMethod: "credit-card",
    status: "completed",
    message: "Hope this helps with medical expenses!",
    isAnonymous: false,
    petId: "1"
  },
  {
    id: "donation-2",
    donorId: "donor-2",
    donorName: "Anonymous",
    donorEmail: "donor.anonymous@email.com",
    amount: 25.00,
    currency: "USD",
    donationType: "monthly",
    purpose: "food",
    date: "2024-07-18",
    paymentMethod: "paypal",
    status: "completed",
    isAnonymous: true
  },
  {
    id: "donation-3",
    donorId: "donor-3",
    donorName: "Sarah Johnson",
    donorEmail: "sarah.johnson@email.com",
    amount: 100.00,
    currency: "USD",
    donationType: "one-time",
    purpose: "shelter",
    date: "2024-07-15",
    paymentMethod: "bank-transfer",
    status: "completed",
    message: "Thank you for the amazing work you do!",
    isAnonymous: false
  }
]

// Default campaigns for demo
const defaultCampaigns: DonationCampaign[] = [
  {
    id: "campaign-1",
    title: "Emergency Surgery for Buddy",
    description: "Buddy needs emergency surgery to remove a tumor. Your donation can help save his life.",
    targetAmount: 2500.00,
    currentAmount: 1250.00,
    currency: "USD",
    startDate: "2024-07-01",
    endDate: "2024-08-01",
    status: "active",
    beneficiaryType: "specific-pet",
    beneficiaryId: "1",
    donorCount: 15
  },
  {
    id: "campaign-2",
    title: "Monthly Food Fund",
    description: "Help us provide nutritious food for all our rescue animals throughout the month.",
    targetAmount: 1000.00,
    currentAmount: 750.00,
    currency: "USD",
    startDate: "2024-07-01",
    endDate: "2024-07-31",
    status: "active",
    beneficiaryType: "general",
    donorCount: 28
  },
  {
    id: "campaign-3",
    title: "New Shelter Renovation",
    description: "We're expanding our shelter to accommodate more animals in need.",
    targetAmount: 10000.00,
    currentAmount: 3500.00,
    currency: "USD",
    startDate: "2024-06-15",
    endDate: "2024-09-15",
    status: "active",
    beneficiaryType: "general",
    donorCount: 42
  }
]

// Default donors for demo
const defaultDonors: Donor[] = [
  {
    id: "donor-1",
    name: "John Smith",
    email: "john.smith@email.com",
    totalDonated: 150.00,
    donationCount: 3,
    firstDonation: "2024-05-15",
    lastDonation: "2024-07-20",
    isRecurring: false,
    preferredCauses: ["medical", "emergency"],
    communicationPreferences: {
      email: true,
      sms: false,
      newsletter: true
    }
  },
  {
    id: "donor-2",
    name: "Anonymous",
    email: "donor.anonymous@email.com",
    totalDonated: 75.00,
    donationCount: 3,
    firstDonation: "2024-05-20",
    lastDonation: "2024-07-18",
    isRecurring: true,
    preferredCauses: ["food", "general"],
    communicationPreferences: {
      email: false,
      sms: false,
      newsletter: false
    }
  },
  {
    id: "donor-3",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    totalDonated: 250.00,
    donationCount: 2,
    firstDonation: "2024-06-01",
    lastDonation: "2024-07-15",
    isRecurring: false,
    preferredCauses: ["shelter", "education"],
    communicationPreferences: {
      email: true,
      sms: true,
      newsletter: true
    }
  }
]

/**
 * Get all donations
 */
export async function getDonations(): Promise<Donation[]> {
  try {
    const stored = await AsyncStorage.getItem(DONATIONS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(defaultDonations))
      return defaultDonations
    }
  } catch (error) {
    console.error("Error loading donations:", error)
    return defaultDonations
  }
}

/**
 * Add new donation
 */
export async function addDonation(donation: Omit<Donation, 'id'>): Promise<string> {
  try {
    const donations = await getDonations()
    const newDonation: Donation = {
      ...donation,
      id: `donation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
    
    donations.push(newDonation)
    await AsyncStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(donations))
    
    // Update campaign if donation is for a specific campaign
    if (donation.purpose !== "general") {
      await updateCampaignProgress(donation.amount)
    }
    
    return newDonation.id
  } catch (error) {
    console.error("Error adding donation:", error)
    return ""
  }
}

/**
 * Get donation campaigns
 */
export async function getDonationCampaigns(): Promise<DonationCampaign[]> {
  try {
    const stored = await AsyncStorage.getItem(CAMPAIGNS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(defaultCampaigns))
      return defaultCampaigns
    }
  } catch (error) {
    console.error("Error loading donation campaigns:", error)
    return defaultCampaigns
  }
}

/**
 * Update campaign progress
 */
export async function updateCampaignProgress(donationAmount: number, campaignId?: string): Promise<boolean> {
  try {
    const campaigns = await getDonationCampaigns()
    
    if (campaignId) {
      const campaignIndex = campaigns.findIndex(campaign => campaign.id === campaignId)
      if (campaignIndex >= 0) {
        campaigns[campaignIndex].currentAmount += donationAmount
        campaigns[campaignIndex].donorCount += 1
        
        // Check if campaign is completed
        if (campaigns[campaignIndex].currentAmount >= campaigns[campaignIndex].targetAmount) {
          campaigns[campaignIndex].status = "completed"
        }
      }
    } else {
      // Update general fund campaigns
      campaigns.forEach(campaign => {
        if (campaign.beneficiaryType === "general" && campaign.status === "active") {
          campaign.currentAmount += donationAmount / campaigns.filter(c => c.beneficiaryType === "general").length
          campaign.donorCount += 1
        }
      })
    }
    
    await AsyncStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns))
    return true
  } catch (error) {
    console.error("Error updating campaign progress:", error)
    return false
  }
}

/**
 * Get donors
 */
export async function getDonors(): Promise<Donor[]> {
  try {
    const stored = await AsyncStorage.getItem(DONORS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      await AsyncStorage.setItem(DONORS_STORAGE_KEY, JSON.stringify(defaultDonors))
      return defaultDonors
    }
  } catch (error) {
    console.error("Error loading donors:", error)
    return defaultDonors
  }
}

/**
 * Calculate donation statistics
 */
export async function calculateDonationStatistics(): Promise<{
  totalDonations: number
  totalAmount: number
  averageDonation: number
  recurringDonors: number
  topCauses: Array<{ cause: string; amount: number; count: number }>
  monthlyTrend: Array<{ month: string; amount: number; count: number }>
}> {
  try {
    const donations = await getDonations()
    const donors = await getDonors()
    
    const totalDonations = donations.length
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0)
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0
    const recurringDonors = donors.filter(donor => donor.isRecurring).length
    
    // Calculate top causes
    const causeStats = donations.reduce((acc, donation) => {
      const cause = donation.purpose
      if (!acc[cause]) {
        acc[cause] = { amount: 0, count: 0 }
      }
      acc[cause].amount += donation.amount
      acc[cause].count += 1
      return acc
    }, {} as Record<string, { amount: number; count: number }>)
    
    const topCauses = Object.entries(causeStats)
      .map(([cause, stats]) => ({ cause, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
    
    // Calculate monthly trend (last 6 months)
    const monthlyStats = donations.reduce((acc, donation) => {
      const date = new Date(donation.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = { amount: 0, count: 0 }
      }
      acc[monthKey].amount += donation.amount
      acc[monthKey].count += 1
      return acc
    }, {} as Record<string, { amount: number; count: number }>)
    
    const monthlyTrend = Object.entries(monthlyStats)
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
    
    return {
      totalDonations,
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageDonation: Math.round(averageDonation * 100) / 100,
      recurringDonors,
      topCauses,
      monthlyTrend
    }
  } catch (error) {
    console.error("Error calculating donation statistics:", error)
    return {
      totalDonations: 0,
      totalAmount: 0,
      averageDonation: 0,
      recurringDonors: 0,
      topCauses: [],
      monthlyTrend: []
    }
  }
}

/**
 * Get donations by donor
 */
export async function getDonationsByDonor(donorId: string): Promise<Donation[]> {
  try {
    const donations = await getDonations()
    return donations.filter(donation => donation.donorId === donorId)
  } catch (error) {
    console.error("Error loading donations by donor:", error)
    return []
  }
}

/**
 * Get donations for a specific campaign
 */
export async function getDonationsForCampaign(campaignId: string): Promise<Donation[]> {
  try {
    const donations = await getDonations()
    const campaigns = await getDonationCampaigns()
    const campaign = campaigns.find(c => c.id === campaignId)
    
    if (!campaign) return []
    
    if (campaign.beneficiaryType === "specific-pet" && campaign.beneficiaryId) {
      return donations.filter(donation => donation.petId === campaign.beneficiaryId)
    }
    
    return donations.filter(donation => donation.purpose === campaign.beneficiaryType)
  } catch (error) {
    console.error("Error loading donations for campaign:", error)
    return []
  }
}

/**
 * Initialize donation tracking data
 */
export async function initializeDonationTracking(): Promise<void> {
  try {
    const donationsStored = await AsyncStorage.getItem(DONATIONS_STORAGE_KEY)
    if (!donationsStored) {
      await AsyncStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(defaultDonations))
      console.log("Initialized donations data")
    }

    const campaignsStored = await AsyncStorage.getItem(CAMPAIGNS_STORAGE_KEY)
    if (!campaignsStored) {
      await AsyncStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(defaultCampaigns))
      console.log("Initialized donation campaigns data")
    }

    const donorsStored = await AsyncStorage.getItem(DONORS_STORAGE_KEY)
    if (!donorsStored) {
      await AsyncStorage.setItem(DONORS_STORAGE_KEY, JSON.stringify(defaultDonors))
      console.log("Initialized donors data")
    }
  } catch (error) {
    console.error("Error initializing donation tracking:", error)
  }
}

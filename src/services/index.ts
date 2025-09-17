/**
 * Services Index - Centralized export for all API services
 * Import services from this file for consistent access to backend functionality
 */

// Core services
export { default as ApiService, apiService } from './ApiService'
export { default as AuthService } from './AuthService'

// Entity services
export { default as AdoptionHistoryService } from './AdoptionHistoryService'
export { default as ApplicationsService } from './ApplicationsService'
export { default as CareEntryService } from './CareEntryService'
export { default as LostPetsService } from './LostPetsService'
export { default as MessagesService } from './MessagesService'
export { default as PetsService } from './PetsService'
export { default as RemindersService } from './RemindersService'

// User and profile services
export { default as NotificationService } from './NotificationService'
export { default as ProfileService } from './ProfileService'
export { default as VerificationService } from './VerificationService'

// Administrative services  
export { default as AnalyticsService } from './AnalyticsService'
export { default as EmergencyService } from './EmergencyService'

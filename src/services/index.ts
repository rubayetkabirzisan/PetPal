// Service exports for easy importing
export { default as AdminService } from './AdminService';
export { default as AdoptionService } from './AdoptionService';
export { default as AnalyticsService } from './AnalyticsService';
export { default as AuthService } from './AuthService';
export { default as CareService } from './CareService';
export { default as EmergencyService } from './EmergencyService';
export { default as LocationService } from './LocationService';
export { default as LostPetService } from './LostPetService';
export { default as MessageService } from './MessageService';
export { default as NotificationService } from './NotificationService';
export { default as PetService } from './PetService';
export { default as ReminderService } from './ReminderService';

// Type exports
export type { AdoptionResponse, Application, ApplicationFormData } from './AdoptionService';
export type { AnalyticsData, AnalyticsResponse, DashboardMetrics } from './AnalyticsService';
export type { AuthResponse, LoginCredentials, RegisterData, User } from './AuthService';
export type { CareEntry, CareResponse, CreateCareEntryData } from './CareService';
export type { CreateEmergencyData, EmergencyAction, EmergencyResponse } from './EmergencyService';
export type { GPSTracking, LocationResponse, SafeZone } from './LocationService';
export type { CreateLostPetData, CreateSightingData, LostPet, LostPetResponse } from './LostPetService';
export type { ChatRoom, Message, MessageResponse } from './MessageService';
export type { Notification, NotificationResponse } from './NotificationService';
export type { Pet, PetFilter, PetResponse } from './PetService';
export type { CreateReminderData, Reminder, ReminderResponse } from './ReminderService';


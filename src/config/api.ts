/**
 * src/config/api.ts
 *
 * Single source of truth for the backend base URL.
 * Change API_BASE_URL here and every screen picks it up automatically.
 *
 * Development:
 *   Android emulator  → "http://10.0.2.2:5000"
 *   iOS simulator     → "http://localhost:5000"
 *   Physical device   → "http://<your-machine-ip>:5000"
 *
 * Production:
 *   Replace with your deployed backend URL.
 */
import { Platform } from 'react-native';
export const API_BASE_URL = 'http://192.168.0.101:5000';
export const API = {
  // Auth
  signup:  `${API_BASE_URL}/api/users/signup`,
  login:   `${API_BASE_URL}/api/users/login`,

  // Pets
  pets: {
    all:    `${API_BASE_URL}/api/pets/view`,
    byId:   (id: string) => `${API_BASE_URL}/api/pets/${id}`,
  },

  // Reminders
  reminders: {
    byUser:       (userId: string) => `${API_BASE_URL}/api/reminders/viewById/${userId}`,
    add:          `${API_BASE_URL}/api/reminders/addNew`,
    markComplete: (id: string)     => `${API_BASE_URL}/api/reminders/markCompleted/${id}`,
    delete:       (id: string)     => `${API_BASE_URL}/api/reminders/delete/${id}`,
  },

  // Care journal
  careEntries: {
    all:    `${API_BASE_URL}/api/careEntries/viewAll`,
    byId:   (id: string) => `${API_BASE_URL}/api/careEntries/viewById/${id}`,
    create: `${API_BASE_URL}/api/careEntries/create`,
    update: (id: string) => `${API_BASE_URL}/api/careEntries/update/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/careEntries/delete/${id}`,
  },

  // Notifications
  notifications: {
    all:      `${API_BASE_URL}/api/notifications/viewAll`,
    markRead: (id: string) => `${API_BASE_URL}/api/notifications/markRead/${id}`,
  },

  // Messages
  messages: {
    conversations: (userId: string) => `${API_BASE_URL}/api/messages/conversations/${userId}`,
    history:       (userId: string, otherUserId: string, petId: string) => `${API_BASE_URL}/api/messages/history/${userId}/${otherUserId}/${petId}`,
    send:          `${API_BASE_URL}/api/messages/send`,
  },

  // Lost pets
  lostPets: {
    all:    `${API_BASE_URL}/api/lostpets/viewAll`,
    update: (id: string) => `${API_BASE_URL}/api/lostpets/update/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/lostpets/delete/${id}`,
  },

  // Profile
  profile: {
    view:   (userId: string) => `${API_BASE_URL}/api/profile/view/${userId}`,
    update: (userId: string) => `${API_BASE_URL}/api/profile/update/${userId}`,
  },

  // Analytics
  analytics: `${API_BASE_URL}/api/analytics/view`,

  // ML service (Flask — to be built in Week 1)
  ml: {
    match:       `${API_BASE_URL}/api/match`,
    verifyScore: `${API_BASE_URL}/api/verify-score`,
  },
};

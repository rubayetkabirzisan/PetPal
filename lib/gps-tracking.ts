export interface PetGPSDevice {
  id: string
  petName: string
  ownerId: string
  ownerName: string
  deviceModel: string
  serialNumber: string
  isOnline: boolean
  batteryLevel: number
  lastUpdate: string
  currentLocation: {
    latitude: number
    longitude: number
    address: string
  }
  activity: {
    status: "resting" | "walking" | "running" | "playing"
    dailySteps: number
    activeMinutes: number
    caloriesBurned: number
  }
  geofences: Geofence[]
  locationHistory: LocationHistory[]
  settings: DeviceSettings
}

export interface Geofence {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  isActive: boolean
  alertOnExit: boolean
  alertOnEntry: boolean
}

export interface LocationHistory {
  timestamp: string
  latitude: number
  longitude: number
  activity: string
  address: string
}

export interface DeviceSettings {
  trackingInterval: number
  lowBatteryAlert: number
  geofenceAlerts: boolean
  activityTracking: boolean
}

export interface GPSAlert {
  id: string
  deviceId: string
  petName: string
  type: "geofence-exit" | "geofence-entry" | "low-battery" | "device-offline" | "unusual-activity"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: string
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

// Mock GPS devices data
const mockGPSDevices: PetGPSDevice[] = [
  {
    id: "gps-1",
    petName: "Buddy",
    ownerId: "demo-user",
    ownerName: "John Smith",
    deviceModel: "PetTracker Pro 2024",
    serialNumber: "PT2024001",
    isOnline: true,
    batteryLevel: 85,
    lastUpdate: "2024-01-20T14:30:00Z",
    currentLocation: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: "123 Main St, Austin, TX",
    },
    activity: {
      status: "walking",
      dailySteps: 8500,
      activeMinutes: 120,
      caloriesBurned: 340,
    },
    geofences: [
      {
        id: "geo-1",
        name: "Home",
        latitude: 30.2672,
        longitude: -97.7431,
        radius: 100,
        isActive: true,
        alertOnExit: true,
        alertOnEntry: false,
      },
      {
        id: "geo-2",
        name: "Dog Park",
        latitude: 30.265,
        longitude: -97.74,
        radius: 50,
        isActive: true,
        alertOnExit: false,
        alertOnEntry: true,
      },
    ],
    locationHistory: [
      {
        timestamp: "2024-01-20T14:30:00Z",
        latitude: 30.2672,
        longitude: -97.7431,
        activity: "walking",
        address: "123 Main St, Austin, TX",
      },
      {
        timestamp: "2024-01-20T14:00:00Z",
        latitude: 30.265,
        longitude: -97.74,
        activity: "playing",
        address: "Central Dog Park, Austin, TX",
      },
      {
        timestamp: "2024-01-20T13:30:00Z",
        latitude: 30.268,
        longitude: -97.745,
        activity: "walking",
        address: "Oak Street, Austin, TX",
      },
    ],
    settings: {
      trackingInterval: 60,
      lowBatteryAlert: 20,
      geofenceAlerts: true,
      activityTracking: true,
    },
  },
  {
    id: "gps-2",
    petName: "Luna",
    ownerId: "user-2",
    ownerName: "Sarah Johnson",
    deviceModel: "PetTracker Lite",
    serialNumber: "PTL2024002",
    isOnline: true,
    batteryLevel: 45,
    lastUpdate: "2024-01-20T14:25:00Z",
    currentLocation: {
      latitude: 30.27,
      longitude: -97.75,
      address: "456 Oak Ave, Austin, TX",
    },
    activity: {
      status: "resting",
      dailySteps: 3200,
      activeMinutes: 45,
      caloriesBurned: 120,
    },
    geofences: [
      {
        id: "geo-3",
        name: "Home",
        latitude: 30.27,
        longitude: -97.75,
        radius: 75,
        isActive: true,
        alertOnExit: true,
        alertOnEntry: false,
      },
    ],
    locationHistory: [
      {
        timestamp: "2024-01-20T14:25:00Z",
        latitude: 30.27,
        longitude: -97.75,
        activity: "resting",
        address: "456 Oak Ave, Austin, TX",
      },
      {
        timestamp: "2024-01-20T12:00:00Z",
        latitude: 30.272,
        longitude: -97.752,
        activity: "walking",
        address: "Neighborhood Walk, Austin, TX",
      },
    ],
    settings: {
      trackingInterval: 120,
      lowBatteryAlert: 25,
      geofenceAlerts: true,
      activityTracking: true,
    },
  },
  {
    id: "gps-3",
    petName: "Max",
    ownerId: "user-3",
    ownerName: "Mike Wilson",
    deviceModel: "PetTracker Pro 2024",
    serialNumber: "PT2024003",
    isOnline: false,
    batteryLevel: 15,
    lastUpdate: "2024-01-20T10:15:00Z",
    currentLocation: {
      latitude: 30.28,
      longitude: -97.76,
      address: "789 Pine St, Austin, TX",
    },
    activity: {
      status: "resting",
      dailySteps: 1200,
      activeMinutes: 15,
      caloriesBurned: 45,
    },
    geofences: [
      {
        id: "geo-4",
        name: "Home",
        latitude: 30.28,
        longitude: -97.76,
        radius: 100,
        isActive: true,
        alertOnExit: true,
        alertOnEntry: false,
      },
    ],
    locationHistory: [
      {
        timestamp: "2024-01-20T10:15:00Z",
        latitude: 30.28,
        longitude: -97.76,
        activity: "resting",
        address: "789 Pine St, Austin, TX",
      },
    ],
    settings: {
      trackingInterval: 60,
      lowBatteryAlert: 20,
      geofenceAlerts: true,
      activityTracking: true,
    },
  },
]

// Mock GPS alerts data
const mockGPSAlerts: GPSAlert[] = [
  {
    id: "alert-1",
    deviceId: "gps-3",
    petName: "Max",
    type: "low-battery",
    severity: "critical",
    message: "Device battery is critically low (15%). Please charge immediately.",
    timestamp: "2024-01-20T14:00:00Z",
    location: {
      latitude: 30.28,
      longitude: -97.76,
      address: "789 Pine St, Austin, TX",
    },
    acknowledged: false,
  },
  {
    id: "alert-2",
    deviceId: "gps-3",
    petName: "Max",
    type: "device-offline",
    severity: "high",
    message: "Device has been offline for more than 4 hours.",
    timestamp: "2024-01-20T13:30:00Z",
    acknowledged: false,
  },
  {
    id: "alert-3",
    deviceId: "gps-2",
    petName: "Luna",
    type: "low-battery",
    severity: "medium",
    message: "Device battery is getting low (45%). Consider charging soon.",
    timestamp: "2024-01-20T12:00:00Z",
    acknowledged: false,
  },
  {
    id: "alert-4",
    deviceId: "gps-1",
    petName: "Buddy",
    type: "geofence-exit",
    severity: "medium",
    message: "Buddy has left the Home safe zone.",
    timestamp: "2024-01-20T11:30:00Z",
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: "123 Main St, Austin, TX",
    },
    acknowledged: true,
    acknowledgedBy: "John Smith",
    acknowledgedAt: "2024-01-20T11:35:00Z",
  },
]

export function getGPSDevices(): PetGPSDevice[] {
  return mockGPSDevices
}

export function getDevicesByOwner(ownerId: string): PetGPSDevice[] {
  return mockGPSDevices.filter((device) => device.ownerId === ownerId)
}

export function getGPSDeviceById(id: string): PetGPSDevice | null {
  return mockGPSDevices.find((device) => device.id === id) || null
}

export function getGPSAlerts(): GPSAlert[] {
  return mockGPSAlerts
}

export function getCriticalAlerts(): GPSAlert[] {
  return mockGPSAlerts.filter((alert) => alert.severity === "critical" && !alert.acknowledged)
}

export function acknowledgeAlert(alertId: string, acknowledgedBy: string): GPSAlert | null {
  const alertIndex = mockGPSAlerts.findIndex((alert) => alert.id === alertId)
  if (alertIndex === -1) return null

  mockGPSAlerts[alertIndex] = {
    ...mockGPSAlerts[alertIndex],
    acknowledged: true,
    acknowledgedBy,
    acknowledgedAt: new Date().toISOString(),
  }

  return mockGPSAlerts[alertIndex]
}

export function updateDeviceLocation(
  deviceId: string,
  location: { latitude: number; longitude: number; address: string },
): boolean {
  const deviceIndex = mockGPSDevices.findIndex((device) => device.id === deviceId)
  if (deviceIndex === -1) return false

  const device = mockGPSDevices[deviceIndex]
  const newLocationEntry: LocationHistory = {
    timestamp: new Date().toISOString(),
    latitude: location.latitude,
    longitude: location.longitude,
    activity: device.activity.status,
    address: location.address,
  }

  mockGPSDevices[deviceIndex] = {
    ...device,
    currentLocation: location,
    lastUpdate: new Date().toISOString(),
    locationHistory: [newLocationEntry, ...device.locationHistory.slice(0, 49)], // Keep last 50 entries
  }

  return true
}

export function getGPSStats() {
  const totalDevices = mockGPSDevices.length
  const onlineDevices = mockGPSDevices.filter((device) => device.isOnline).length
  const offlineDevices = totalDevices - onlineDevices
  const lowBatteryDevices = mockGPSDevices.filter(
    (device) => device.batteryLevel <= device.settings.lowBatteryAlert,
  ).length
  const criticalAlerts = mockGPSAlerts.filter((alert) => alert.severity === "critical" && !alert.acknowledged).length
  const totalAlerts = mockGPSAlerts.filter((alert) => !alert.acknowledged).length

  return {
    totalDevices,
    onlineDevices,
    offlineDevices,
    lowBatteryDevices,
    criticalAlerts,
    totalAlerts,
  }
}

export function createGeofence(deviceId: string, geofence: Omit<Geofence, "id">): boolean {
  const deviceIndex = mockGPSDevices.findIndex((device) => device.id === deviceId)
  if (deviceIndex === -1) return false

  const newGeofence: Geofence = {
    ...geofence,
    id: `geo-${Date.now()}`,
  }

  mockGPSDevices[deviceIndex].geofences.push(newGeofence)
  return true
}

export function removeGeofence(deviceId: string, geofenceId: string): boolean {
  const deviceIndex = mockGPSDevices.findIndex((device) => device.id === deviceId)
  if (deviceIndex === -1) return false

  mockGPSDevices[deviceIndex].geofences = mockGPSDevices[deviceIndex].geofences.filter(
    (geofence) => geofence.id !== geofenceId,
  )

  return true
}

export function updateDeviceSettings(deviceId: string, settings: Partial<DeviceSettings>): boolean {
  const deviceIndex = mockGPSDevices.findIndex((device) => device.id === deviceId)
  if (deviceIndex === -1) return false

  mockGPSDevices[deviceIndex].settings = {
    ...mockGPSDevices[deviceIndex].settings,
    ...settings,
  }

  return true
}

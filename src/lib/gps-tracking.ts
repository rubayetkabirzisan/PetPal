import AsyncStorage from '@react-native-async-storage/async-storage';

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

// AsyncStorage keys
const GPS_DEVICES_STORAGE_KEY = "petpal_gps_devices";
const GPS_ALERTS_STORAGE_KEY = "petpal_gps_alerts";

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

/**
 * Initialize GPS tracking data in AsyncStorage
 */
export async function initializeGPSTrackingData(): Promise<void> {
  try {
    const existingDevices = await AsyncStorage.getItem(GPS_DEVICES_STORAGE_KEY);
    if (!existingDevices) {
      await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(mockGPSDevices));
      console.log("GPS devices data initialized successfully");
    }

    const existingAlerts = await AsyncStorage.getItem(GPS_ALERTS_STORAGE_KEY);
    if (!existingAlerts) {
      await AsyncStorage.setItem(GPS_ALERTS_STORAGE_KEY, JSON.stringify(mockGPSAlerts));
      console.log("GPS alerts data initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize GPS tracking data:", error);
  }
}

/**
 * Get all GPS devices
 */
export async function getGPSDevices(): Promise<PetGPSDevice[]> {
  try {
    const stored = await AsyncStorage.getItem(GPS_DEVICES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with mock data if not found
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(mockGPSDevices));
  } catch (error) {
    console.error("Error loading GPS devices:", error);
  }
  return mockGPSDevices;
}

/**
 * Get devices by owner ID
 */
export async function getDevicesByOwner(ownerId: string): Promise<PetGPSDevice[]> {
  try {
    const devices = await getGPSDevices();
    return devices.filter((device) => device.ownerId === ownerId);
  } catch (error) {
    console.error(`Error finding devices for owner ${ownerId}:`, error);
    return [];
  }
}

/**
 * Get a GPS device by ID
 */
export async function getGPSDeviceById(id: string): Promise<PetGPSDevice | null> {
  try {
    const devices = await getGPSDevices();
    return devices.find((device) => device.id === id) || null;
  } catch (error) {
    console.error(`Error finding device ${id}:`, error);
    return null;
  }
}

/**
 * Get all GPS alerts
 */
export async function getGPSAlerts(): Promise<GPSAlert[]> {
  try {
    const stored = await AsyncStorage.getItem(GPS_ALERTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with mock data if not found
    await AsyncStorage.setItem(GPS_ALERTS_STORAGE_KEY, JSON.stringify(mockGPSAlerts));
  } catch (error) {
    console.error("Error loading GPS alerts:", error);
  }
  return mockGPSAlerts;
}

/**
 * Get critical alerts that haven't been acknowledged
 */
export async function getCriticalAlerts(): Promise<GPSAlert[]> {
  try {
    const alerts = await getGPSAlerts();
    return alerts.filter((alert) => alert.severity === "critical" && !alert.acknowledged);
  } catch (error) {
    console.error("Error finding critical alerts:", error);
    return [];
  }
}

/**
 * Get alerts for a specific device
 */
export async function getAlertsByDevice(deviceId: string): Promise<GPSAlert[]> {
  try {
    const alerts = await getGPSAlerts();
    return alerts.filter((alert) => alert.deviceId === deviceId);
  } catch (error) {
    console.error(`Error finding alerts for device ${deviceId}:`, error);
    return [];
  }
}

/**
 * Acknowledge a GPS alert
 */
export async function acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<GPSAlert | null> {
  try {
    const alerts = await getGPSAlerts();
    const alertIndex = alerts.findIndex((alert) => alert.id === alertId);
    if (alertIndex === -1) return null;

    const updatedAlert = {
      ...alerts[alertIndex],
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString(),
    };

    const updatedAlerts = [
      ...alerts.slice(0, alertIndex),
      updatedAlert,
      ...alerts.slice(alertIndex + 1)
    ];
    
    await AsyncStorage.setItem(GPS_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
    return updatedAlert;
  } catch (error) {
    console.error(`Error acknowledging alert ${alertId}:`, error);
    return null;
  }
}

/**
 * Create a new GPS alert
 */
export async function createGPSAlert(alertData: Omit<GPSAlert, 'id' | 'timestamp' | 'acknowledged' | 'acknowledgedBy' | 'acknowledgedAt'>): Promise<GPSAlert> {
  try {
    const alerts = await getGPSAlerts();
    const newAlert: GPSAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      ...alertData,
    };

    const updatedAlerts = [newAlert, ...alerts];
    await AsyncStorage.setItem(GPS_ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
    return newAlert;
  } catch (error) {
    console.error("Error creating GPS alert:", error);
    throw error;
  }
}

/**
 * Update a device's location and add to location history
 */
export async function updateDeviceLocation(
  deviceId: string,
  location: { latitude: number; longitude: number; address: string },
): Promise<boolean> {
  try {
    const devices = await getGPSDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);
    if (deviceIndex === -1) return false;

    const device = devices[deviceIndex];
    const newLocationEntry: LocationHistory = {
      timestamp: new Date().toISOString(),
      latitude: location.latitude,
      longitude: location.longitude,
      activity: device.activity.status,
      address: location.address,
    };

    const updatedDevice = {
      ...device,
      currentLocation: location,
      lastUpdate: new Date().toISOString(),
      locationHistory: [newLocationEntry, ...device.locationHistory.slice(0, 49)], // Keep last 50 entries
    };

    const updatedDevices = [
      ...devices.slice(0, deviceIndex),
      updatedDevice,
      ...devices.slice(deviceIndex + 1)
    ];
    
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return true;
  } catch (error) {
    console.error(`Error updating location for device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Update a device's activity status
 */
export async function updateDeviceActivity(
  deviceId: string, 
  activity: PetGPSDevice['activity']
): Promise<boolean> {
  try {
    const devices = await getGPSDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);
    if (deviceIndex === -1) return false;

    const updatedDevice = {
      ...devices[deviceIndex],
      activity,
      lastUpdate: new Date().toISOString(),
    };

    const updatedDevices = [
      ...devices.slice(0, deviceIndex),
      updatedDevice,
      ...devices.slice(deviceIndex + 1)
    ];
    
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return true;
  } catch (error) {
    console.error(`Error updating activity for device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Update a device's online status and battery level
 */
export async function updateDeviceStatus(
  deviceId: string,
  status: { isOnline: boolean; batteryLevel: number }
): Promise<boolean> {
  try {
    const devices = await getGPSDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);
    if (deviceIndex === -1) return false;

    const device = devices[deviceIndex];
    const updatedDevice = {
      ...device,
      isOnline: status.isOnline,
      batteryLevel: status.batteryLevel,
      lastUpdate: new Date().toISOString(),
    };

    // Create low battery alert if needed
    if (status.batteryLevel <= device.settings.lowBatteryAlert && status.batteryLevel < device.batteryLevel) {
      const severity = status.batteryLevel < 10 ? "critical" : 
                      status.batteryLevel < 20 ? "high" : "medium";
                      
      await createGPSAlert({
        deviceId,
        petName: device.petName,
        type: "low-battery",
        severity,
        message: `Device battery is ${severity === "critical" ? "critically " : ""}low (${status.batteryLevel}%). ${
          severity === "critical" ? "Please charge immediately." : "Consider charging soon."
        }`,
        location: device.currentLocation,
      });
    }

    // Create offline alert if device goes offline
    if (!status.isOnline && device.isOnline) {
      await createGPSAlert({
        deviceId,
        petName: device.petName,
        type: "device-offline",
        severity: "high",
        message: "Device has gone offline and is no longer transmitting location data.",
        location: device.currentLocation,
      });
    }

    const updatedDevices = [
      ...devices.slice(0, deviceIndex),
      updatedDevice,
      ...devices.slice(deviceIndex + 1)
    ];
    
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return true;
  } catch (error) {
    console.error(`Error updating status for device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Get GPS tracking statistics
 */
export async function getGPSStats() {
  try {
    const devices = await getGPSDevices();
    const alerts = await getGPSAlerts();
    
    const totalDevices = devices.length;
    const onlineDevices = devices.filter((device) => device.isOnline).length;
    const offlineDevices = totalDevices - onlineDevices;
    const lowBatteryDevices = devices.filter(
      (device) => device.batteryLevel <= device.settings.lowBatteryAlert,
    ).length;
    const criticalAlerts = alerts.filter((alert) => alert.severity === "critical" && !alert.acknowledged).length;
    const totalAlerts = alerts.filter((alert) => !alert.acknowledged).length;

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      lowBatteryDevices,
      criticalAlerts,
      totalAlerts,
      onlinePercentage: totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0,
    };
  } catch (error) {
    console.error("Error calculating GPS statistics:", error);
    return {
      totalDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      lowBatteryDevices: 0,
      criticalAlerts: 0,
      totalAlerts: 0,
      onlinePercentage: 0,
    };
  }
}

/**
 * Create a new geofence for a device
 */
export async function createGeofence(deviceId: string, geofence: Omit<Geofence, "id">): Promise<boolean> {
  try {
    const devices = await getGPSDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);
    if (deviceIndex === -1) return false;

    const newGeofence: Geofence = {
      ...geofence,
      id: `geo-${Date.now()}`,
    };

    const updatedDevice = {
      ...devices[deviceIndex],
      geofences: [...devices[deviceIndex].geofences, newGeofence],
    };

    const updatedDevices = [
      ...devices.slice(0, deviceIndex),
      updatedDevice,
      ...devices.slice(deviceIndex + 1)
    ];
    
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return true;
  } catch (error) {
    console.error(`Error creating geofence for device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Update an existing geofence
 */
export async function updateGeofence(deviceId: string, geofenceId: string, updates: Partial<Omit<Geofence, "id">>): Promise<boolean> {
  try {
    const devices = await getGPSDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);
    if (deviceIndex === -1) return false;
    
    const geofenceIndex = devices[deviceIndex].geofences.findIndex(geo => geo.id === geofenceId);
    if (geofenceIndex === -1) return false;
    
    const updatedGeofences = [...devices[deviceIndex].geofences];
    updatedGeofences[geofenceIndex] = {
      ...updatedGeofences[geofenceIndex],
      ...updates
    };
    
    const updatedDevice = {
      ...devices[deviceIndex],
      geofences: updatedGeofences
    };
    
    const updatedDevices = [
      ...devices.slice(0, deviceIndex),
      updatedDevice,
      ...devices.slice(deviceIndex + 1)
    ];
    
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return true;
  } catch (error) {
    console.error(`Error updating geofence ${geofenceId} for device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Remove a geofence from a device
 */
export async function removeGeofence(deviceId: string, geofenceId: string): Promise<boolean> {
  try {
    const devices = await getGPSDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);
    if (deviceIndex === -1) return false;

    const updatedDevice = {
      ...devices[deviceIndex],
      geofences: devices[deviceIndex].geofences.filter(
        (geofence) => geofence.id !== geofenceId,
      ),
    };

    const updatedDevices = [
      ...devices.slice(0, deviceIndex),
      updatedDevice,
      ...devices.slice(deviceIndex + 1)
    ];
    
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return true;
  } catch (error) {
    console.error(`Error removing geofence ${geofenceId} for device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Update device settings
 */
export async function updateDeviceSettings(deviceId: string, settings: Partial<DeviceSettings>): Promise<boolean> {
  try {
    const devices = await getGPSDevices();
    const deviceIndex = devices.findIndex((device) => device.id === deviceId);
    if (deviceIndex === -1) return false;

    const updatedDevice = {
      ...devices[deviceIndex],
      settings: {
        ...devices[deviceIndex].settings,
        ...settings,
      },
    };

    const updatedDevices = [
      ...devices.slice(0, deviceIndex),
      updatedDevice,
      ...devices.slice(deviceIndex + 1)
    ];
    
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return true;
  } catch (error) {
    console.error(`Error updating settings for device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Register a new GPS device
 */
export async function registerGPSDevice(deviceData: Omit<PetGPSDevice, 'id' | 'locationHistory'>): Promise<PetGPSDevice> {
  try {
    const devices = await getGPSDevices();
    
    const newDevice: PetGPSDevice = {
      id: `gps-${Date.now()}`,
      locationHistory: [{
        timestamp: new Date().toISOString(),
        latitude: deviceData.currentLocation.latitude,
        longitude: deviceData.currentLocation.longitude,
        activity: deviceData.activity.status,
        address: deviceData.currentLocation.address,
      }],
      ...deviceData
    };
    
    const updatedDevices = [newDevice, ...devices];
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return newDevice;
  } catch (error) {
    console.error("Error registering new GPS device:", error);
    throw error;
  }
}

/**
 * Delete a GPS device
 */
export async function deleteGPSDevice(deviceId: string): Promise<boolean> {
  try {
    const devices = await getGPSDevices();
    const updatedDevices = devices.filter(device => device.id !== deviceId);
    
    if (updatedDevices.length === devices.length) {
      // Device not found
      return false;
    }
    
    await AsyncStorage.setItem(GPS_DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    return true;
  } catch (error) {
    console.error(`Error deleting GPS device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Clear all GPS tracking data (for testing/reset)
 */
export async function clearAllGPSTrackingData(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(GPS_DEVICES_STORAGE_KEY);
    await AsyncStorage.removeItem(GPS_ALERTS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear GPS tracking data:", error);
    return false;
  }
}

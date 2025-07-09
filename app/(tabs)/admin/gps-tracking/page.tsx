import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Header } from "../../../../components/header";
import { Navigation } from "../../../../components/navigation";
import {
    acknowledgeAlert,
    getCriticalAlerts,
    getGPSAlerts,
    getGPSDevices,
    getGPSStats,
    type GPSAlert,
    type PetGPSDevice,
} from "../../../../lib/gps-tracking";
import { colors } from "../../../../src/theme/theme";

export default function AdminGPSTrackingPage() {
  const [devices, setDevices] = useState<PetGPSDevice[]>([]);
  const [alerts, setAlerts] = useState<GPSAlert[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<PetGPSDevice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [deviceSettings, setDeviceSettings] = useState({
    trackingInterval: 60,
    lowBatteryAlert: 20,
    geofenceAlerts: true,
    activityTracking: true,
  });
  const [newGeofence, setNewGeofence] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: 100,
    alertOnExit: true,
    alertOnEntry: false,
  });
  const [activeTab, setActiveTab] = useState<'devices' | 'alerts'>('devices');
  const [criticalAlertsData, setCriticalAlertsData] = useState<GPSAlert[]>([]);
  const [statsData, setStatsData] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    lowBatteryDevices: 0,
    criticalAlerts: 0,
    totalAlerts: 0,
    onlinePercentage: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const allDevices = await getGPSDevices();
        const allAlerts = await getGPSAlerts();
        const criticalAlerts = await getCriticalAlerts();
        const stats = await getGPSStats();

        setDevices(allDevices);
        setAlerts(allAlerts);
        setCriticalAlertsData(criticalAlerts);
        setStatsData(stats);
      } catch (error) {
        console.error("Error loading GPS data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && device.isOnline) ||
      (statusFilter === "offline" && !device.isOnline) ||
      (statusFilter === "low-battery" && device.batteryLevel <= device.settings.lowBatteryAlert);

    return matchesSearch && matchesStatus;
  });

  const handleAcknowledgeAlert = async (alertId: string) => {
    const updatedAlert = await acknowledgeAlert(alertId, "Admin User");
    if (updatedAlert) {
      setAlerts(alerts.map((alert) => (alert.id === alertId ? updatedAlert : alert)));
      // Update critical alerts data
      const criticalAlerts = await getCriticalAlerts();
      setCriticalAlertsData(criticalAlerts);
    }
  };

  const handleSaveSettings = () => {
    if (selectedDevice) {
      // In a real app, this would update the device settings via API
      const updatedDevices = devices.map((device) =>
        device.id === selectedDevice.id ? { ...device, settings: deviceSettings } : device
      );
      setDevices(updatedDevices);
      setShowSettings(false);
      Alert.alert("Success", "Settings saved successfully!");
    }
  };

  const handleAddGeofence = () => {
    if (selectedDevice && newGeofence.name && newGeofence.latitude && newGeofence.longitude) {
      const geofence = {
        id: Math.random().toString(36).substr(2, 9),
        name: newGeofence.name,
        latitude: Number.parseFloat(newGeofence.latitude),
        longitude: Number.parseFloat(newGeofence.longitude),
        radius: newGeofence.radius,
        isActive: true,
        alertOnExit: newGeofence.alertOnExit,
        alertOnEntry: newGeofence.alertOnEntry,
      };

      const updatedDevices = devices.map((device) =>
        device.id === selectedDevice.id ? { ...device, geofences: [...device.geofences, geofence] } : device
      );
      setDevices(updatedDevices);
      setSelectedDevice({ ...selectedDevice, geofences: [...selectedDevice.geofences, geofence] });
      setNewGeofence({
        name: "",
        latitude: "",
        longitude: "",
        radius: 100,
        alertOnExit: true,
        alertOnEntry: false,
      });
      Alert.alert("Success", "Geofence added successfully!");
    }
  };

  const handleRemoveGeofence = (geofenceId: string) => {
    if (selectedDevice) {
      const updatedDevices = devices.map((device) =>
        device.id === selectedDevice.id
          ? { ...device, geofences: device.geofences.filter((g) => g.id !== geofenceId) }
          : device
      );
      setDevices(updatedDevices);
      setSelectedDevice({
        ...selectedDevice,
        geofences: selectedDevice.geofences.filter((g) => g.id !== geofenceId),
      });
      Alert.alert("Success", "Geofence removed successfully!");
    }
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "walking":
        return <MaterialCommunityIcons name="walk" size={16} color="#3b82f6" />;
      case "running":
        return <MaterialIcons name="directions-run" size={16} color="#f97316" />;
      case "playing":
        return <Ionicons name="heart" size={16} color="#ec4899" />;
      default:
        return <Ionicons name="time-outline" size={16} color="#6b7280" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "geofence-exit":
      case "geofence-entry":
        return <MaterialIcons name="security" size={16} color="#8B4513" />;
      case "low-battery":
        return <Ionicons name="battery-dead-outline" size={16} color="#8B4513" />;
      case "device-offline":
        return <Ionicons name="wifi-outline" size={16} color="#8B4513" />;
      default:
        return <Ionicons name="warning-outline" size={16} color="#8B4513" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return styles.criticalAlert;
      case "high":
        return styles.highAlert;
      case "medium":
        return styles.mediumAlert;
      default:
        return styles.lowAlert;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="GPS Tracking System" userType="admin" showNotifications={true} />
        <View style={styles.loadingContainer}>
          <Ionicons name="map-outline" size={48} color={colors.primary} style={styles.loadingIcon} />
          <ActivityIndicator size="large" color={colors.primary} style={styles.activityIndicator} />
          <Text style={styles.loadingText}>Loading GPS tracking system...</Text>
        </View>
        <Navigation userType="admin" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="GPS Tracking System"
        subtitle="Monitor all pets and manage devices"
        userType="admin"
        showNotifications={true}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Critical Alerts */}
        {criticalAlertsData.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertCardHeader}>
              <View style={styles.headerRow}>
                <Ionicons name="warning" size={20} color="#ef4444" />
                <Text style={styles.cardTitle}>Critical Alerts ({criticalAlertsData.length})</Text>
              </View>
            </View>
            <View style={styles.alertCardContent}>
              {criticalAlertsData.slice(0, 3).map((alert: GPSAlert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertItemInfo}>
                    {getAlertIcon(alert.type)}
                    <View style={styles.alertTextContainer}>
                      <Text style={styles.alertPetName}>{alert.petName}</Text>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.acknowledgeButton}
                    onPress={() => handleAcknowledgeAlert(alert.id)}
                  >
                    <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {criticalAlertsData.length > 3 && (
                <Text style={styles.moreAlertsText}>+{criticalAlertsData.length - 3} more critical alerts</Text>
              )}
            </View>
          </View>
        )}

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <View style={styles.statsIconContainer}>
              <Ionicons name="wifi" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statsNumber}>{statsData.onlineDevices}</Text>
            <Text style={styles.statsLabel}>Online</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsIconContainer}>
              <Ionicons name="warning" size={24} color="#dc2626" />
            </View>
            <Text style={styles.statsNumber}>{statsData.criticalAlerts}</Text>
            <Text style={styles.statsLabel}>Critical</Text>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#8B4513" style={styles.searchIcon} />
            <TouchableOpacity 
              style={styles.input}
              onPress={() => Alert.alert("Search", "Search functionality would go here")}
            >
              <Text style={styles.inputPlaceholder}>Search by pet name, owner, or device...</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => Alert.alert("Filter", "Filter options would appear here")}
          >
            <Ionicons name="filter" size={18} color="#8B4513" />
            <Text style={styles.filterText}>
              {statusFilter === "all" ? "All Devices" : 
               statusFilter === "online" ? "Online Only" :
               statusFilter === "offline" ? "Offline Only" : "Low Battery"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsList}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'devices' && styles.activeTab]}
              onPress={() => setActiveTab('devices')}
            >
              <Text style={[styles.tabText, activeTab === 'devices' && styles.activeTabText]}>
                Devices ({statsData.totalDevices})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
              onPress={() => setActiveTab('alerts')}
            >
              <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
                Alerts ({unacknowledgedAlerts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'devices' ? (
            <View style={styles.tabContent}>
              {filteredDevices.length === 0 ? (
                <View style={styles.emptyStateCard}>
                  <Ionicons name="map" size={48} color="#8B4513" style={styles.emptyStateIcon} />
                  <Text style={styles.emptyStateTitle}>No Devices Found</Text>
                  <Text style={styles.emptyStateMessage}>No GPS devices match your search criteria.</Text>
                </View>
              ) : (
                <View style={styles.devicesList}>
                  {filteredDevices.map((device) => (
                    <View key={device.id} style={styles.deviceCard}>
                      <View style={styles.deviceHeader}>
                        <View style={styles.deviceHeaderLeft}>
                          <View style={styles.deviceIcon}>
                            <Ionicons name="map" size={24} color="#FF7A47" />
                          </View>
                          <View style={styles.deviceTitleContainer}>
                            <Text style={styles.deviceTitle}>{device.petName}</Text>
                            <Text style={styles.deviceDescription}>Owner: {device.ownerName}</Text>
                          </View>
                        </View>
                        <View style={styles.deviceStatus}>
                          {device.isOnline ? (
                            <Ionicons name="wifi" size={16} color="#16a34a" />
                          ) : (
                            <MaterialIcons name="wifi-off" size={16} color="#dc2626" />
                          )}
                          <View style={device.isOnline ? styles.onlineBadge : styles.offlineBadge}>
                            <Text style={device.isOnline ? styles.onlineBadgeText : styles.offlineBadgeText}>
                              {device.isOnline ? "Online" : "Offline"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.deviceContent}>
                        {/* Device Info */}
                        <View style={styles.deviceInfo}>
                          <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>Device Model</Text>
                            <Text style={styles.infoValue}>{device.deviceModel}</Text>
                          </View>
                          <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>Serial Number</Text>
                            <Text style={styles.infoValue}>{device.serialNumber}</Text>
                          </View>
                        </View>

                        {/* Battery Level */}
                        <View style={styles.batteryContainer}>
                          <View style={styles.batteryHeader}>
                            <View style={styles.batteryLabel}>
                              <Ionicons name="battery-half" size={16} color="#8B4513" />
                              <Text style={styles.batteryText}>Battery</Text>
                            </View>
                            <Text
                              style={[
                                styles.batteryPercentage,
                                device.batteryLevel <= 20
                                  ? styles.batteryLow
                                  : device.batteryLevel <= 50
                                    ? styles.batteryMedium
                                    : styles.batteryHigh,
                              ]}
                            >
                              {device.batteryLevel}%
                            </Text>
                          </View>
                          <View style={styles.progressBarContainer}>
                            <View 
                              style={[
                                styles.progressBar, 
                                {
                                  width: `${device.batteryLevel}%`,
                                  backgroundColor: device.batteryLevel <= 20 ? '#ef4444' : device.batteryLevel <= 50 ? '#f97316' : '#16a34a'
                                }
                              ]} 
                            />
                          </View>
                        </View>

                        {/* Current Activity */}
                        <View style={styles.activityContainer}>
                          <View style={styles.activityStatus}>
                            {getActivityIcon(device.activity.status)}
                            <Text style={styles.activityText}>{device.activity.status}</Text>
                          </View>
                          <View style={styles.stepCounter}>
                            <Text style={styles.stepCount}>{device.activity.dailySteps}</Text>
                            <Text style={styles.stepLabel}>steps today</Text>
                          </View>
                        </View>

                        {/* Location */}
                        <View style={styles.locationContainer}>
                          <View style={styles.locationHeader}>
                            <Ionicons name="location" size={16} color="#8B4513" />
                            <Text style={styles.locationLabel}>Current Location</Text>
                          </View>
                          <Text style={styles.locationAddress}>{device.currentLocation.address}</Text>
                          <Text style={styles.locationUpdated}>Updated: {formatTime(device.lastUpdate)}</Text>
                        </View>

                        {/* Owner Contact */}
                        <View style={styles.ownerContactContainer}>
                          <View style={styles.ownerLabel}>
                            <Ionicons name="people" size={16} color="#8B4513" />
                            <Text style={styles.ownerText}>Owner Contact</Text>
                          </View>
                          <TouchableOpacity style={styles.contactButton}>
                            <Ionicons name="call" size={14} color="#8B4513" style={styles.contactIcon} />
                            <Text style={styles.contactText}>Contact</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.viewDetailsButton}
                            onPress={() => setSelectedDevice(device)}
                          >
                            <Ionicons name="location" size={16} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>View Details</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => {
                              setSelectedDevice(device);
                              setDeviceSettings(device.settings);
                              setShowSettings(true);
                            }}
                          >
                            <Ionicons name="settings" size={16} color="#FF7A47" style={styles.buttonIcon} />
                            <Text style={styles.settingsButtonText}>Settings</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tabContent}>
              {alerts.length === 0 ? (
                <View style={styles.emptyStateCard}>
                  <Ionicons name="warning" size={48} color="#8B4513" style={styles.emptyStateIcon} />
                  <Text style={styles.emptyStateTitle}>No Alerts</Text>
                  <Text style={styles.emptyStateMessage}>All GPS devices are operating normally!</Text>
                </View>
              ) : (
                <View style={styles.alertsList}>
                  {alerts.map((alert) => (
                    <View 
                      key={alert.id} 
                      style={[
                        styles.alertCard, 
                        getAlertColor(alert.severity),
                        alert.acknowledged && styles.acknowledgedAlert
                      ]}
                    >
                      <View style={styles.alertContent}>
                        <View style={styles.alertContentRow}>
                          <View style={styles.alertIconContainer}>
                            {getAlertIcon(alert.type)}
                          </View>
                          <View style={styles.alertDetails}>
                            <View style={styles.alertHeaderRow}>
                              <Text style={styles.alertDetailTitle}>{alert.petName}</Text>
                              <View style={[styles.severityBadge, getAlertColor(alert.severity)]}>
                                <Text style={styles.severityText}>{alert.severity}</Text>
                              </View>
                            </View>
                            <Text style={styles.alertDetailMessage}>{alert.message}</Text>
                            <Text style={styles.alertTimestamp}>{formatTime(alert.timestamp)}</Text>
                            {alert.location && (
                              <Text style={styles.alertLocation}>Location: {alert.location.address}</Text>
                            )}
                            {alert.acknowledged && (
                              <Text style={styles.alertAcknowledged}>Acknowledged by {alert.acknowledgedBy}</Text>
                            )}
                          </View>
                          {!alert.acknowledged && (
                            <TouchableOpacity
                              style={styles.alertAcknowledgeButton}
                              onPress={() => handleAcknowledgeAlert(alert.id)}
                            >
                              <Text style={styles.alertAcknowledgeText}>Acknowledge</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Navigation userType="admin" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  loadingIcon: {
    marginBottom: 16,
  },
  activityIndicator: {
    marginBottom: 12,
  },
  loadingText: {
    color: '#8B4513',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 90,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  alertCardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginLeft: 8,
  },
  alertCardContent: {
    padding: 12,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  alertItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  alertPetName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B4513',
  },
  alertMessage: {
    fontSize: 12,
    color: '#8B4513',
  },
  acknowledgeButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  acknowledgeButtonText: {
    fontSize: 12,
    color: '#8B4513',
  },
  moreAlertsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginHorizontal: 4,
  },
  statsIconContainer: {
    marginBottom: 8,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statsLabel: {
    fontSize: 14,
    color: '#8B4513',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 8,
    paddingLeft: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  inputPlaceholder: {
    color: '#9ca3af',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 12,
  },
  filterText: {
    color: '#8B4513',
    marginLeft: 8,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#8B4513',
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: '600',
  },
  tabContent: {
    marginTop: 4,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  emptyStateMessage: {
    color: '#8B4513',
    textAlign: 'center',
  },
  devicesList: {
    marginTop: 4,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  deviceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFB899',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceTitleContainer: {
    flex: 1,
  },
  deviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
  },
  deviceDescription: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.8,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  offlineBadge: {
    backgroundColor: '#fee2e2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  onlineBadgeText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '500',
  },
  offlineBadgeText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
  deviceContent: {
    padding: 16,
  },
  deviceInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#8B4513',
  },
  batteryContainer: {
    marginBottom: 16,
  },
  batteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 6,
  },
  batteryPercentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  batteryLow: {
    color: '#ef4444',
  },
  batteryMedium: {
    color: '#f97316',
  },
  batteryHigh: {
    color: '#16a34a',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  activityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  stepCounter: {
    alignItems: 'flex-end',
  },
  stepCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  stepLabel: {
    fontSize: 12,
    color: '#8B4513',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationLabel: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 6,
  },
  locationAddress: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 22,
  },
  locationUpdated: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.8,
    marginLeft: 22,
    marginTop: 2,
  },
  ownerContactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 6,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  contactIcon: {
    marginRight: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#8B4513',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A47',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
  },
  settingsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF7A47',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  settingsButtonText: {
    color: '#FF7A47',
    fontWeight: '500',
    fontSize: 14,
  },
  alertsList: {
    marginTop: 4,
  },
  alertContent: {
    padding: 16,
  },
  alertContentRow: {
    flexDirection: 'row',
  },
  alertIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  alertDetails: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertDetailTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B4513',
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8B4513',
  },
  alertDetailMessage: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 8,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.8,
  },
  alertLocation: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.8,
    marginTop: 4,
  },
  alertAcknowledged: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.8,
    marginTop: 4,
    fontStyle: 'italic',
  },
  alertAcknowledgeButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  alertAcknowledgeText: {
    fontSize: 12,
    color: '#8B4513',
  },
  criticalAlert: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  highAlert: {
    backgroundColor: '#ffedd5',
    borderColor: '#fed7aa',
  },
  mediumAlert: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  lowAlert: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  acknowledgedAlert: {
    opacity: 0.6,
  },
});

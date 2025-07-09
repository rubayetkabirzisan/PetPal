import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { acknowledgeAlert, getDevicesByOwner, getGPSAlerts, type GPSAlert, type PetGPSDevice } from "@/lib/gps-tracking";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdopterGPSTrackingPage() {
  const [devices, setDevices] = useState<PetGPSDevice[]>([]);
  const [alerts, setAlerts] = useState<GPSAlert[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<PetGPSDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  const { user } = useAuth();
  const userId = user?.id || "demo-user";

  useEffect(() => {
    const loadData = async () => {
      try {
        const userDevices = await getDevicesByOwner(userId);
        const allAlerts = await getGPSAlerts();
        const userAlerts = allAlerts.filter((alert: GPSAlert) => 
          userDevices.some((device: PetGPSDevice) => device.id === alert.deviceId)
        );

        setDevices(userDevices);
        setAlerts(userAlerts);
      } catch (error) {
        console.error("Error loading GPS data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const updatedAlert = await acknowledgeAlert(alertId, user?.name || "User");
      if (updatedAlert) {
        setAlerts(alerts.map((alert) => (alert.id === alertId ? updatedAlert : alert)));
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "walking":
        return <Feather name="navigation" size={16} color="#2563EB" />;
      case "running":
        return <Feather name="zap" size={16} color="#EA580C" />;
      case "playing":
        return <Feather name="heart" size={16} color="#EC4899" />;
      default:
        return <Feather name="clock" size={16} color="#4B5563" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "geofence-exit":
      case "geofence-entry":
        return <Feather name="shield" size={16} color="#8B4513" />;
      case "low-battery":
        return <Feather name="battery" size={16} color="#8B4513" />;
      case "device-offline":
        return <Feather name="wifi-off" size={16} color="#8B4513" />;
      default:
        return <Feather name="alert-triangle" size={16} color="#8B4513" />;
    }
  };

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" };
      case "high":
        return { bg: "#FFEDD5", text: "#EA580C", border: "#FED7AA" };
      case "medium":
        return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" };
      default:
        return { bg: "#DBEAFE", text: "#2563EB", border: "#BFDBFE" };
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
        <Header title="GPS Tracking" userType="adopter" showNotifications={true} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <Feather name="map-pin" size={48} color="#FF7A47" style={styles.loadingIcon} />
            <Text style={styles.loadingText}>Loading GPS tracking...</Text>
          </View>
        </View>
        <Navigation userType="adopter" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="GPS Tracking" subtitle="Monitor your pets' location" userType="adopter" showNotifications={true} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="wifi" size={24} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>{devices.filter((d) => d.isOnline).length}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Feather name="alert-triangle" size={24} color="#DC2626" />
            </View>
            <Text style={styles.statValue}>{unacknowledgedAlerts.length}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        {/* Critical Alerts */}
        {unacknowledgedAlerts.filter((alert) => alert.severity === "critical").length > 0 && (
          <View style={styles.criticalAlertCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerTitleContainer}>
                <Feather name="alert-triangle" size={20} color="#DC2626" style={styles.headerIcon} />
                <Text style={styles.criticalCardTitle}>Critical Alerts</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              {unacknowledgedAlerts
                .filter((alert) => alert.severity === "critical")
                .slice(0, 3)
                .map((alert) => (
                  <View key={alert.id} style={styles.alertItem}>
                    <View style={styles.alertInfo}>
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
                      <Text style={styles.acknowledgeButtonText}>OK</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Main Content - Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tabButton, selectedDevice === null && styles.tabButtonActive]}
              onPress={() => setSelectedDevice(null)}
            >
              <Text style={[styles.tabButtonText, selectedDevice === null && styles.tabButtonTextActive]}>
                My Pets ({devices.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, selectedDevice !== null && styles.tabButtonActive]}
              onPress={() => setSelectedDevice(devices[0] || null)}
            >
              <Text style={[styles.tabButtonText, selectedDevice !== null && styles.tabButtonTextActive]}>
                Alerts ({unacknowledgedAlerts.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {/* Devices Tab */}
            {selectedDevice === null && (
              <View style={styles.devicesContainer}>
                {devices.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Feather name="map-pin" size={48} color="#8B4513" style={styles.emptyIcon} />
                    <Text style={styles.emptyTitle}>No GPS Devices</Text>
                    <Text style={styles.emptyMessage}>You don't have any GPS tracking devices yet.</Text>
                    <TouchableOpacity style={styles.getTrackerButton}>
                      <Text style={styles.getTrackerButtonText}>Get GPS Tracker</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.devicesList}>
                    {devices.map((device) => (
                      <View key={device.id} style={styles.deviceCard}>
                        <View style={styles.deviceHeader}>
                          <View style={styles.deviceHeaderLeft}>
                            <View style={styles.deviceIcon}>
                              <Feather name="map-pin" size={24} color="#FF7A47" />
                            </View>
                            <View style={styles.deviceInfo}>
                              <Text style={styles.deviceName}>{device.petName}</Text>
                              <Text style={styles.deviceModel}>{device.deviceModel}</Text>
                            </View>
                          </View>
                          <View style={styles.deviceStatus}>
                            {device.isOnline ? (
                              <Feather name="wifi" size={16} color="#16A34A" style={styles.statusIcon} />
                            ) : (
                              <Feather name="wifi-off" size={16} color="#DC2626" style={styles.statusIcon} />
                            )}
                            <View
                              style={[
                                styles.statusBadge,
                                device.isOnline ? styles.onlineBadge : styles.offlineBadge,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  device.isOnline ? styles.onlineBadgeText : styles.offlineBadgeText,
                                ]}
                              >
                                {device.isOnline ? "Online" : "Offline"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.deviceContent}>
                          {/* Battery Level */}
                          <View style={styles.batterySection}>
                            <View style={styles.batteryHeader}>
                              <View style={styles.batteryInfo}>
                                <Feather name="battery" size={16} color="#8B4513" style={styles.batteryIcon} />
                                <Text style={styles.batteryLabel}>Battery</Text>
                              </View>
                              <Text
                                style={[
                                  styles.batteryValue,
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
                                  device.batteryLevel <= 20
                                    ? styles.progressBarLow
                                    : device.batteryLevel <= 50
                                    ? styles.progressBarMedium
                                    : styles.progressBarHigh,
                                  { width: `${device.batteryLevel}%` },
                                ]}
                              />
                            </View>
                          </View>

                          {/* Current Activity */}
                          <View style={styles.activitySection}>
                            <View style={styles.activityInfo}>
                              {getActivityIcon(device.activity.status)}
                              <Text style={styles.activityStatus}>
                                {device.activity.status.charAt(0).toUpperCase() + device.activity.status.slice(1)}
                              </Text>
                            </View>
                            <View style={styles.stepsInfo}>
                              <Text style={styles.stepsValue}>{device.activity.dailySteps}</Text>
                              <Text style={styles.stepsLabel}>steps today</Text>
                            </View>
                          </View>

                          {/* Location */}
                          <View style={styles.locationSection}>
                            <View style={styles.locationHeader}>
                              <Feather name="map-pin" size={16} color="#8B4513" />
                              <Text style={styles.locationLabel}>Current Location</Text>
                            </View>
                            <Text style={styles.locationAddress}>{device.currentLocation.address}</Text>
                            <Text style={styles.locationTimestamp}>Updated: {formatTime(device.lastUpdate)}</Text>
                          </View>

                          {/* Action Buttons */}
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={styles.viewMapButton}
                              onPress={() => {
                                setSelectedDevice(device);
                                setShowDeviceModal(true);
                              }}
                            >
                              <Feather name="target" size={16} color="white" style={styles.buttonIcon} />
                              <Text style={styles.viewMapButtonText}>View Map</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.settingsButton}>
                              <Feather name="settings" size={16} color="#FF7A47" style={styles.buttonIcon} />
                              <Text style={styles.settingsButtonText}>Settings</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Alerts Tab */}
            {selectedDevice !== null && (
              <View style={styles.alertsContainer}>
                {alerts.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Feather name="alert-triangle" size={48} color="#8B4513" style={styles.emptyIcon} />
                    <Text style={styles.emptyTitle}>No Alerts</Text>
                    <Text style={styles.emptyMessage}>All your pets are safe and sound!</Text>
                  </View>
                ) : (
                  <View style={styles.alertsList}>
                    {alerts.map((alert) => {
                      const alertStyle = getAlertStyle(alert.severity);
                      return (
                        <View
                          key={alert.id}
                          style={[
                            styles.alertCard,
                            {
                              backgroundColor: alertStyle.bg,
                              borderColor: alertStyle.border,
                              opacity: alert.acknowledged ? 0.6 : 1,
                            },
                          ]}
                        >
                          <View style={styles.alertCardContent}>
                            <View style={styles.alertCardHeader}>
                              <View style={styles.alertCardIconContainer}>{getAlertIcon(alert.type)}</View>
                              <View style={styles.alertCardInfo}>
                                <View style={styles.alertCardTitleContainer}>
                                  <Text style={styles.alertCardTitle}>{alert.petName}</Text>
                                  <View
                                    style={[
                                      styles.severityBadge,
                                      { backgroundColor: alertStyle.bg, borderColor: alertStyle.border },
                                    ]}
                                  >
                                    <Text style={[styles.severityBadgeText, { color: alertStyle.text }]}>
                                      {alert.severity}
                                    </Text>
                                  </View>
                                </View>
                                <Text style={styles.alertCardMessage}>{alert.message}</Text>
                                <Text style={styles.alertCardTimestamp}>{formatTime(alert.timestamp)}</Text>
                                {alert.location && (
                                  <Text style={styles.alertCardLocation}>
                                    Location: {alert.location.address}
                                  </Text>
                                )}
                                {alert.acknowledged && (
                                  <Text style={styles.alertCardAcknowledged}>
                                    Acknowledged by {alert.acknowledgedBy}
                                  </Text>
                                )}
                              </View>
                              {!alert.acknowledged && (
                                <TouchableOpacity
                                  style={styles.alertCardButton}
                                  onPress={() => handleAcknowledgeAlert(alert.id)}
                                >
                                  <Text style={styles.alertCardButtonText}>Acknowledge</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Device Detail Modal would go here in a real implementation */}
      {/* For now, we're just showing different tabs */}

      <Navigation userType="adopter" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 80, // Space for navigation
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#8B4513",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
  },
  statLabel: {
    fontSize: 14,
    color: "#8B4513",
  },
  criticalAlertCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  criticalCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  alertItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  alertTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  alertPetName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 12,
    color: "#8B4513",
  },
  acknowledgeButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#8B4513",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  acknowledgeButtonText: {
    color: "#8B4513",
    fontSize: 12,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsHeader: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8",
    borderRadius: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#FF7A47",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
  },
  tabButtonTextActive: {
    color: "white",
  },
  tabContent: {},
  devicesContainer: {},
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#8B4513",
    textAlign: "center",
    marginBottom: 16,
  },
  getTrackerButton: {
    backgroundColor: "#FF7A47",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  getTrackerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  devicesList: {
    gap: 16,
  },
  deviceCard: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    padding: 16,
  },
  deviceHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFB899",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deviceInfo: {},
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 4,
  },
  deviceModel: {
    fontSize: 14,
    color: "#8B4513",
    opacity: 0.8,
  },
  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 6,
  },
  statusBadge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  onlineBadge: {
    backgroundColor: "#DCFCE7",
  },
  offlineBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  onlineBadgeText: {
    color: "#16A34A",
  },
  offlineBadgeText: {
    color: "#DC2626",
  },
  deviceContent: {
    padding: 16,
  },
  batterySection: {
    marginBottom: 16,
  },
  batteryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  batteryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryIcon: {
    marginRight: 8,
  },
  batteryLabel: {
    fontSize: 14,
    color: "#8B4513",
  },
  batteryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  batteryLow: {
    color: "#DC2626",
  },
  batteryMedium: {
    color: "#EA580C",
  },
  batteryHigh: {
    color: "#16A34A",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressBarLow: {
    backgroundColor: "#DC2626",
  },
  progressBarMedium: {
    backgroundColor: "#EA580C",
  },
  progressBarHigh: {
    backgroundColor: "#16A34A",
  },
  activitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activityInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityStatus: {
    fontSize: 14,
    color: "#8B4513",
    marginLeft: 8,
  },
  stepsInfo: {
    alignItems: "flex-end",
  },
  stepsValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8B4513",
  },
  stepsLabel: {
    fontSize: 12,
    color: "#8B4513",
  },
  locationSection: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    color: "#8B4513",
    marginLeft: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: "#8B4513",
    marginLeft: 24,
    marginBottom: 4,
  },
  locationTimestamp: {
    fontSize: 12,
    color: "#8B4513",
    opacity: 0.75,
    marginLeft: 24,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  viewMapButton: {
    flex: 1,
    backgroundColor: "#FF7A47",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewMapButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  settingsButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#FF7A47",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButtonText: {
    color: "#FF7A47",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonIcon: {
    marginRight: 8,
  },
  alertsContainer: {},
  alertsList: {
    gap: 12,
  },
  alertCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  alertCardContent: {
    padding: 16,
  },
  alertCardHeader: {
    flexDirection: "row",
  },
  alertCardIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  alertCardInfo: {
    flex: 1,
  },
  alertCardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  alertCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8B4513",
    marginRight: 8,
  },
  severityBadge: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 1,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  alertCardMessage: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 8,
  },
  alertCardTimestamp: {
    fontSize: 12,
    color: "#8B4513",
    marginBottom: 4,
  },
  alertCardLocation: {
    fontSize: 12,
    color: "#8B4513",
    marginBottom: 4,
  },
  alertCardAcknowledged: {
    fontSize: 12,
    color: "#8B4513",
    fontStyle: "italic",
  },
  alertCardButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#8B4513",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  alertCardButtonText: {
    color: "#8B4513",
    fontSize: 12,
  },
});

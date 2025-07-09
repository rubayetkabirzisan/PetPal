import { useAuth } from '@/hooks/useAuth';
import { getNotifications, markNotificationAsRead, type Notification } from '@/lib/notifications';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { user } = useAuth();

  useEffect(() => {
    async function loadNotifications() {
      if (user) {
        try {
          const userNotifications = await getNotifications(user.id, "adopter");
          setNotifications(
            userNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          );
        } catch (error) {
          console.error("Error loading notifications:", error);
        }
      }
    }
    
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "new_pet":
        if (notification.data?.petId) {
          router.push(`/adopter/pet/${notification.data.petId}` as any);
        }
        break;
      case "message":
        if (notification.data?.petId) {
          router.push(`/adopter/chat/${notification.data.petId}` as any);
        }
        break;
      case "adoption_approved":
      case "adoption_rejected":
        router.push("/(tabs)/adopter/dashboard" as any);
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_pet":
        return <Feather name="heart" size={16} color="#FF7A47" />;
      case "message":
        return <Feather name="message-circle" size={16} color="#3B82F6" />;
      case "adoption_approved":
        return <Feather name="check-circle" size={16} color="#16A34A" />;
      case "adoption_rejected":
        return <Feather name="x" size={16} color="#DC2626" />;
      default:
        return <Feather name="bell" size={16} color="#8B4513" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => (filter === "all" ? true : !n.read));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/adopter/dashboard" as any)}
          >
            <Feather name="arrow-left" size={24} color="#8B4513" style={styles.backIcon} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Feather name="bell" size={24} color="#FF7A47" style={styles.titleIcon} />
            <Text style={styles.title}>Notifications</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "all" ? styles.filterButtonActive : styles.filterButtonInactive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text 
              style={filter === "all" ? styles.filterTextActive : styles.filterTextInactive}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "unread" ? styles.filterButtonActive : styles.filterButtonInactive,
            ]}
            onPress={() => setFilter("unread")}
          >
            <Text 
              style={filter === "unread" ? styles.filterTextActive : styles.filterTextInactive}
            >
              Unread ({notifications.filter((n) => !n.read).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.notificationsList}
        >
          {filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
              onPress={() => handleNotificationClick(notification)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationContent}>
                <View style={styles.iconContainer}>
                  {getNotificationIcon(notification.type)}
                </View>
                <View style={styles.notificationDetails}>
                  <View style={styles.notificationHeader}>
                    <Text 
                      style={styles.notificationTitle}
                      numberOfLines={1}
                    >
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>New</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <View style={styles.timestampContainer}>
                    <Feather name="clock" size={12} color="#8B4513" style={styles.clockIcon} />
                    <Text style={styles.timestamp}>
                      {new Date(notification.timestamp).toLocaleDateString()} at{" "}
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredNotifications.length === 0 && (
            <View style={styles.emptyContainer}>
              <Feather name="bell" size={64} color="#E8E8E8" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>
                {filter === "all" 
                  ? "You don't have any notifications yet." 
                  : "All caught up! No unread notifications."
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    marginRight: 8,
  },
  backText: {
    color: '#8B4513',
    fontWeight: '500',
    fontSize: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B4513',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FF7A47',
  },
  filterButtonInactive: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextInactive: {
    color: '#8B4513',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  notificationsList: {
    paddingBottom: 24,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    flex: 1,
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#FF7A47',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#8B4513',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from 'axios';
import React, { useState, useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import NavigationHeader from "../components/NavigationHeader";
import { API } from "../config/api";
import { spacing } from "../theme/theme";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserPreferences, getDefaultPreferences } from "../lib/preferences";

interface Notification {
  id?: string;
  _id?: string;
  title: string;
  message: string;
  time: string;
  type: 'application' | 'message' | 'reminder' | 'update';
  read: boolean;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { theme } = useTheme();
  const colors = (theme as any).colors;
  const styles = getStyles(theme.colors);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      
      const fetchAndFilterNotifications = async () => {
        try {
          const [notifsResponse, userPrefs] = await Promise.all([
            axios.get(API.notifications.byUser(user.id)),
            getUserPreferences(user.id)
          ]);
          
          const prefs = userPrefs || getDefaultPreferences(user.id);
          const notificationsPrefs = prefs.notifications || {
            newPets: true, applicationUpdates: true, messages: true
          };

          // Filter based on preferences
          const filtered = notifsResponse.data.filter((n: Notification) => {
            if (n.type === 'application' && !notificationsPrefs.applicationUpdates) return false;
            if (n.type === 'message' && !notificationsPrefs.messages) return false;
            if (n.type === 'update' && !notificationsPrefs.newPets) return false;
            return true;
          });

          setNotifications(filtered.reverse());
        } catch (error) {
          console.error('Error fetching/filtering notifications:', error);
        }
      };
      
      fetchAndFilterNotifications();
    }, [user])
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return 'document-text';
      case 'message':
        return 'chatbubble';
      case 'reminder':
        return 'alarm';
      case 'update':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application':
        return colors.success;
      case 'message':
        return colors.primary;
      case 'reminder':
        return '#FFB800';
      case 'update':
        return colors.secondary;
      default:
        return colors.text;
    }
  };

  const markAllAsRead = () => {
    if (!user?.id) return;
    axios.patch(API.notifications.markAllRead(user.id))
      .then(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) => ({ ...notif, read: true }))
        );
      })
      .catch((error) => {
        console.error('Error marking all notifications as read:', error);
      });
  };

  const markAsRead = (notificationId: string) => {
    axios.patch(API.notifications.markRead(notificationId))
    .then((response) => {
      // Update the notification state locally
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          (notif._id || notif.id) === notificationId ? { ...notif, read: true } : notif
        )
      );
    })
    .catch((error) => {
      console.error('Error marking notification as read:', error);
    });
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead((notification._id || notification.id) as string);
    Alert.alert(notification.title, notification.message);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavigationHeader title="Notifications" showBackButton={true} />
      
      <View style={styles.actionHeader}>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification, index) => (
          <TouchableOpacity
            key={notification._id || notification.id || `notif-${index}`}
            style={[
              styles.notificationItem,
              !notification.read && styles.unreadNotification
            ]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={styles.notificationLeft}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: getNotificationColor(notification.type) + '20' }
              ]}>
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={20}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.read && styles.unreadTitle
                  ]}>
                    {notification.title}
                  </Text>
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>
                
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                
                <Text style={styles.notificationTime}>
                  {notification.time}
                </Text>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! We'll notify you when there are updates.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  markAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  unreadNotification: {
    backgroundColor: colors.primary + '08',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  unreadTitle: {
    color: colors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

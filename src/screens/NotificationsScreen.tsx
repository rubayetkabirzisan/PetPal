import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { colors, spacing } from "../theme/theme"

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'application' | 'message' | 'reminder' | 'update';
  read: boolean;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Application Update',
      message: 'Your application for Buddy has been approved! Please contact the shelter to arrange pickup.',
      time: '2 hours ago',
      type: 'application',
      read: false
    },
    {
      id: '2',
      title: 'New Message',
      message: 'Happy Paws Shelter sent you a message about Max.',
      time: '1 day ago',
      type: 'message',
      read: false
    },
    {
      id: '3',
      title: 'Reminder',
      message: 'Don\'t forget to schedule a vet appointment for Luna within 7 days of adoption.',
      time: '2 days ago',
      type: 'reminder',
      read: true
    },
    {
      id: '4',
      title: 'App Update',
      message: 'New features available! Check out our improved pet matching system.',
      time: '1 week ago',
      type: 'update',
      read: true
    }
  ];

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavigationHeader 
        title="Notifications" 
        showBackButton={true} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.read && styles.unreadNotification
            ]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  markAllButton: {
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

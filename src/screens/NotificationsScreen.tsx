import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import React from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { colors, spacing } from "../theme/theme"

// Define the app's navigation types
type RootStackParamList = {
  Landing: undefined;
  Auth: undefined;
  AdopterTabs: {
    screen?: string;
    params?: any;
  };
  AdminTabs: {
    screen?: string;
    params?: any;
  };
  PetProfile: {
    petId?: string;
  };
  Notifications: undefined;
  ApplicationTracker: {
    applicationId?: string;
  };
  ApplicationList: undefined;
  DummyApplicationList: undefined;
  ModernApplicationList: undefined;
  Chat: undefined;
  PetCareReminders: undefined;
  LostPetDetails: undefined;
  // Add other screens as needed
};

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'application' | 'message' | 'reminder' | 'update';
  read: boolean;
  targetScreen?: string;
  targetParams?: any;
}

export default function NotificationsScreen() {
  // Type the navigation properly
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Application Update',
      message: 'Your application for Buddy has been approved! Please contact the shelter to arrange pickup.',
      time: '2 hours ago',
      type: 'application',
      read: false,
      targetScreen: 'ApplicationDetails',
      targetParams: { applicationId: 'app123', petName: 'Buddy' }
    },
    {
      id: '2',
      title: 'New Message',
      message: 'Happy Paws Shelter sent you a message about Max.',
      time: '1 day ago',
      type: 'message',
      read: false,
      targetScreen: 'Chat',
      targetParams: { conversationId: 'conv456', shelterName: 'Happy Paws Shelter', petName: 'Max' }
    },
    {
      id: '3',
      title: 'Reminder',
      message: 'Don\'t forget to schedule a vet appointment for Luna within 7 days of adoption.',
      time: '2 days ago',
      type: 'reminder',
      read: true,
      targetScreen: 'PetCareReminders',
      targetParams: { petId: 'pet789', petName: 'Luna' }
    },
    {
      id: '4',
      title: 'Pet Updates',
      message: 'Luna\'s GPS tracker has detected movement outside the safe zone.',
      time: '3 days ago',
      type: 'application',
      read: true,
      targetScreen: 'PetProfile',
      targetParams: { petId: 'pet789' }
    },
    {
      id: '5',
      title: 'Lost Pet Alert',
      message: 'A pet matching Max\'s description has been reported in your area.',
      time: '5 days ago',
      type: 'reminder',
      read: true,
      targetScreen: 'LostPetDetails',
      targetParams: { petId: 'pet456' }
    },
    {
      id: '6',
      title: 'App Update',
      message: 'New features available! Check out our improved pet matching system.',
      time: '1 week ago',
      type: 'update',
      read: true,
      targetScreen: 'AIMatching',
      targetParams: {}
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

  // Handle navigation based on notification type
  const handleNotificationPress = (notification: Notification) => {
    if (!notification.targetScreen) return;
    
    try {
      // Using React Navigation directly since this component is used in the Stack Navigator
      console.log(`Processing notification for: ${notification.targetScreen}`);
      
      switch (notification.targetScreen) {
        case 'ApplicationDetails':
          console.log(`Navigating to application: ${notification.targetParams?.applicationId || 'no ID'}`);
          // Try application tracker first, fallback to application list
          if (notification.targetParams?.applicationId) {
            navigation.navigate('ApplicationTracker', { 
              applicationId: notification.targetParams.applicationId 
            });
          } else {
            navigation.navigate('ModernApplicationList');
          }
          break;
          
        case 'Chat':
          console.log('Navigating to dashboard for messages');
          // Navigate to the dashboard tab
          navigation.navigate('AdopterTabs', { 
            screen: 'Dashboard'
          });
          break;
          
        case 'PetCareReminders':
          console.log('Navigating to dashboard for care reminders');
          // Navigate to the dashboard tab
          navigation.navigate('AdopterTabs', { 
            screen: 'Dashboard'
          });
          break;
          
        case 'PetProfile':
          console.log(`Navigating to pet: ${notification.targetParams?.petId || 'no ID'}`);
          if (notification.targetParams?.petId) {
            navigation.navigate('PetProfile', { 
              petId: notification.targetParams.petId 
            });
          } else {
            // Fallback to browse pets
            navigation.navigate('AdopterTabs', { 
              screen: 'Browse'
            });
          }
          break;
          
        case 'LostPetDetails':
          console.log('Navigating to lost pets');
          navigation.navigate('AdopterTabs', { 
            screen: 'LostPets'
          });
          break;
          
        case 'AIMatching':
          console.log('Navigating to browse for AI matching');
          navigation.navigate('AdopterTabs', { 
            screen: 'Browse'
          });
          break;
          
        default:
          console.log('Unknown target, navigating to dashboard');
          navigation.navigate('AdopterTabs', { 
            screen: 'Dashboard'
          });
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to this notification. Please try again later.');
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

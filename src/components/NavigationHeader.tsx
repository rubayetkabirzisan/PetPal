import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { useRouter } from "expo-router"
import React, { useState, useCallback } from "react"
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { colors } from "../theme/theme"
import { API } from "../config/api"

interface NavigationHeaderProps {
  title: string
  showBackButton?: boolean
  showNotificationIcon?: boolean
  backButtonAction?: () => void
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  showBackButton = false,
  showNotificationIcon = false,
  backButtonAction,
}) => {
  const navigation = useNavigation<any>() // Use any type for now to allow nested navigation
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);
  const [notificationCount, setNotificationCount] = useState(0) 
  
  // Determine if user is admin
  const isAdmin = user?.type === "admin"

  useFocusEffect(
    useCallback(() => {
      if (!showNotificationIcon || !user?.id) return;
      
      // Fetch actual notification count from backend for this user
      fetch(API.notifications.byUser(user.id))
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const unreadCount = data.filter(n => !n.read).length;
            setNotificationCount(unreadCount);
          }
        })
        .catch(err => console.error('Error fetching notification count:', err));
    }, [showNotificationIcon, user])
  );

  const handleBackPress = () => {
    if (backButtonAction) {
      backButtonAction()
    } else if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }

  const handleProfilePress = () => {
    // Navigate to the Profile screen in the AdopterTabs navigator
    navigation.navigate("AdopterTabs", { screen: "Profile" });
  }

  const handleNotificationsPress = () => {
    // Navigate to the Notifications screen which is registered in App.tsx
    navigation.navigate('Notifications');
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          // Empty view for spacing when back button is not shown
          <View style={styles.spacer} />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.iconContainer}>
          {showNotificationIcon && (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleNotificationsPress}
            >
              <Ionicons name="notifications-outline" size={24} color="white" />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleProfilePress}
          >
            <Ionicons name="person-circle-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.primary, // Better visual representation with primary color
    paddingTop: Platform.OS === "ios" ? 50 : 24, // Increased padding for status bar
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Slightly increased shadow
    shadowRadius: 4,
    elevation: 5, // Better elevation on Android
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "white", // White text for better contrast with primary color background
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  spacer: {
    width: 30, // Approximate width of the back button for balance
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30", // Bright red for better visibility on primary color
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: "white", // White border for better visibility
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  }
})

export default NavigationHeader

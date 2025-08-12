import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { useAuth } from "../src/contexts/AuthContext"
import { useTheme } from "../src/contexts/ThemeContext"
import { colors } from "../src/theme/theme"

interface NavigationHeaderProps {
  title: string
  showBackButton?: boolean
  backButtonAction?: () => void
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  showBackButton = false,
  backButtonAction,
}) => {
  const navigation = useNavigation()
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [notificationCount, setNotificationCount] = useState(3) // Default to 3 notifications for demo
  
  // Determine if user is admin
  const isAdmin = user?.type === "admin"

  useEffect(() => {
    // You could fetch actual notification count from your backend here
    // For now, just demonstrating with a static count
  }, [])

  const handleBackPress = () => {
    if (backButtonAction) {
      backButtonAction()
    } else if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }

  const handleProfilePress = () => {
    // Use navigation for screens instead of router for paths
    if (isAdmin) {
      navigation.navigate('AdminProfile' as never);
    } else {
      navigation.navigate('AdopterProfile' as never);
    }
  }

  const handleNotificationsPress = () => {
    // Use navigation for screens instead of router for paths
    if (isAdmin) {
      navigation.navigate('AdminNotifications' as never);
    } else {
      navigation.navigate('AdopterNotifications' as never);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            {/* <Ionicons name="arrow-back" size={24} color="white" /> */}
          </TouchableOpacity>
        ) : (
          // Empty view for spacing when back button is not shown
          <View style={styles.spacer} />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.iconContainer}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary, // Better visual representation with primary color
    paddingTop: Platform.OS === "ios" ? 50 : 24, // Increased padding for status bar
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: "#000",
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

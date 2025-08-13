import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { clearUserNotifications } from "../../lib/notifications"
import { clearUserPreferences, getUserPreferences, saveUserPreferences, UserPreferences } from "../../lib/preferences"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { colors, spacing } from "../theme/theme"

interface SettingsSection {
  title: string
  items: SettingsItem[]
}

interface SettingsItem {
  icon: string
  title: string
  subtitle?: string
  type: 'navigation' | 'switch' | 'action'
  value?: boolean
  onPress?: () => void
  onToggle?: (value: boolean) => void
  disabled?: boolean
}

export default function SettingsScreen() {
  const navigation = useNavigation()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserPreferences()
  }, [user])

  const loadUserPreferences = async () => {
    if (user?.id) {
      try {
        const userPrefs = await getUserPreferences(user.id)
        setPreferences(userPrefs)
      } catch (error) {
        console.error("Error loading preferences:", error)
      }
    }
    setLoading(false)
  }

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!preferences || !user?.id) return

    const updatedPrefs = { ...preferences, ...updates }
    setPreferences(updatedPrefs)
    
    try {
      await saveUserPreferences(updatedPrefs)
    } catch (error) {
      console.error("Error saving preferences:", error)
      Alert.alert("Error", "Failed to save preferences. Please try again.")
    }
  }

  const handleNotificationToggle = (key: keyof UserPreferences['notifications']) => {
    return (value: boolean) => {
      if (preferences) {
        updatePreferences({
          notifications: {
            ...preferences.notifications,
            [key]: value
          }
        })
      }
    }
  }

  const handleDataExport = () => {
    Alert.alert(
      "Export Data", 
      "Your data export will be sent to your email address within 24 hours.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request Export", onPress: () => {
          Alert.alert("Success", "Data export request submitted. You'll receive an email soon.")
        }}
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            Alert.alert("Account Deletion", "Please contact support to complete account deletion.")
          }
        }
      ]
    )
  }

  const handleClearData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all your preferences, notifications, and cached data from this device.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive", 
          onPress: async () => {
            try {
              if (user?.id) {
                await clearUserPreferences(user.id)
                await clearUserNotifications(user.id)
              }
              Alert.alert("Success", "All data cleared successfully.")
              await loadUserPreferences()
            } catch (error) {
              Alert.alert("Error", "Failed to clear data. Please try again.")
            }
          }
        }
      ]
    )
  }

  const sections: SettingsSection[] = [
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications",
          title: "New Pet Alerts",
          subtitle: "Get notified about new pets matching your preferences",
          type: "switch",
          value: preferences?.notifications?.newPets ?? true,
          onToggle: handleNotificationToggle('newPets')
        },
        {
          icon: "document-text",
          title: "Application Updates",
          subtitle: "Notifications about your adoption applications",
          type: "switch",
          value: preferences?.notifications?.applicationUpdates ?? true,
          onToggle: handleNotificationToggle('applicationUpdates')
        },
        {
          icon: "chatbubble",
          title: "Messages",
          subtitle: "Chat notifications from shelters",
          type: "switch", 
          value: preferences?.notifications?.messages ?? true,
          onToggle: handleNotificationToggle('messages')
        }
      ]
    },
    {
      title: "App Settings",
      items: [
        {
          icon: "moon",
          title: "Dark Mode",
          subtitle: "Switch between light and dark themes",
          type: "switch",
          value: isDarkMode,
          onToggle: toggleTheme
        },
        {
          icon: "language",
          title: "Language",
          subtitle: "English (US)",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Multiple language support will be available soon.")
        },
        {
          icon: "text",
          title: "Text Size",
          subtitle: "Adjust font size for better readability",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Text size options will be available soon.")
        }
      ]
    },
    {
      title: "Location & Privacy",
      items: [
        {
          icon: "location",
          title: "Location Services",
          subtitle: "Required for pet matching and GPS tracking",
          type: "navigation",
          onPress: () => Alert.alert("Location Settings", "Please adjust location permissions in your device settings.")
        },
        {
          icon: "shield-checkmark",
          title: "Data Sharing",
          subtitle: "Control how your data is used",
          type: "navigation",
          onPress: () => Alert.alert("Privacy Settings", "Manage your data sharing preferences.")
        },
        {
          icon: "lock-closed",
          title: "Privacy Policy",
          subtitle: "Read our privacy policy",
          type: "navigation",
          onPress: () => Alert.alert("Privacy Policy", "Our privacy policy protects your personal information.")
        }
      ]
    },
    {
      title: "Account & Security",
      items: [
        {
          icon: "person-circle",
          title: "Edit Profile",
          subtitle: "Update your personal information",
          type: "navigation",
          onPress: () => navigation.goBack() // Go back to profile screen
        },
        {
          icon: "key",
          title: "Change Password",
          subtitle: "Update your account password",
          type: "navigation",
          onPress: () => Alert.alert("Change Password", "Password change functionality will be available soon.")
        },
        {
          icon: "download",
          title: "Export Data",
          subtitle: "Download a copy of your data",
          type: "action",
          onPress: handleDataExport
        },
        {
          icon: "trash",
          title: "Clear App Data",
          subtitle: "Remove all data from this device",
          type: "action",
          onPress: handleClearData
        }
      ]
    },
    {
      title: "Support & About",
      items: [
        {
          icon: "help-circle",
          title: "Help & Support",
          subtitle: "Get help with the app",
          type: "navigation",
          onPress: () => Alert.alert("Support", "Contact us at support@petpal.com for assistance.")
        },
        {
          icon: "star",
          title: "Rate App",
          subtitle: "Share your feedback on the app store",
          type: "action",
          onPress: () => Alert.alert("Rate PetPal", "Thank you for using PetPal! Please rate us on the app store.")
        },
        {
          icon: "document",
          title: "Terms of Service",
          subtitle: "Read our terms and conditions",
          type: "navigation",
          onPress: () => Alert.alert("Terms of Service", "Please read our terms of service carefully.")
        },
        {
          icon: "information-circle",
          title: "About",
          subtitle: "Version 1.0.0",
          type: "navigation",
          onPress: () => Alert.alert("About PetPal", "PetPal v1.0.0\n\nHelping pets find their forever homes since 2024.")
        }
      ]
    },
    {
      title: "Danger Zone",
      items: [
        {
          icon: "warning",
          title: "Delete Account",
          subtitle: "Permanently delete your account and all data",
          type: "action",
          onPress: handleDeleteAccount
        }
      ]
    }
  ]

  const renderSettingsItem = (item: SettingsItem, sectionTitle: string) => {
    const isDangerZone = sectionTitle === "Danger Zone"
    
    return (
      <TouchableOpacity
        key={item.title}
        style={[
          styles.settingsItem,
          isDangerZone && styles.dangerItem,
          item.disabled && styles.disabledItem
        ]}
        onPress={item.onPress}
        disabled={item.disabled || item.type === 'switch'}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <View style={[
            styles.iconContainer,
            isDangerZone && styles.dangerIconContainer
          ]}>
            <Ionicons
              name={item.icon as any}
              size={20}
              color={isDangerZone ? colors.error : colors.primary}
            />
          </View>
          <View style={styles.itemContent}>
            <Text style={[
              styles.itemTitle,
              isDangerZone && styles.dangerText,
              item.disabled && styles.disabledText
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={[
                styles.itemSubtitle,
                item.disabled && styles.disabledText
              ]}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.itemRight}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={item.value ? colors.primary : colors.text}
              disabled={item.disabled}
            />
          )}
          {item.type === 'navigation' && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={item.disabled ? colors.border : colors.text}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavigationHeader 
        title="Settings" 
        showBackButton={true} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item) => renderSettingsItem(item, section.title))}
            </View>
          </View>
        ))}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for pets and their families
          </Text>
          <Text style={styles.versionText}>
            PetPal v1.0.0 • Built with React Native
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
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
  },
  headerRight: {
    width: 40, // Balance the header
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dangerItem: {
    borderBottomColor: colors.error + '20',
  },
  disabledItem: {
    opacity: 0.5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dangerIconContainer: {
    backgroundColor: colors.error + '10',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  dangerText: {
    color: colors.error,
  },
  disabledText: {
    color: colors.text + '60',
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.text + '80',
    lineHeight: 18,
  },
  itemRight: {
    marginLeft: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: colors.text + '80',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  versionText: {
    fontSize: 12,
    color: colors.text + '60',
    textAlign: 'center',
  },
})

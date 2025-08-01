"use client"

import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { colors } from "../theme/theme"

interface AdopterProfileScreenProps {
}

export default function AdopterProfileScreen() {
  const navigation = useNavigation()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Demo User",
    email: "demo@example.com",
    phone: "+1 (555) 123-4567",
    location: "Austin, TX",
    bio: "Animal lover looking for the perfect companion. I have experience with both dogs and cats.",
  })

  const { user, logout } = useAuth()

  const handleSave = () => {
    setIsEditing(false)
    Alert.alert("Success", "Profile updated successfully!")
  }

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Sign Out", 
        style: "destructive", 
        onPress: async () => {
          await logout()
          navigation.reset({
            index: 0,
            routes: [{ name: 'AuthScreen' as never }],
          })
        }
      },
    ])
  }

  const menuItems = [
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "2 new notifications",
      path: "notifications",
      onPress: () => navigation.navigate('Notifications' as never),
    },
    {
      icon: "heart-outline",
      title: "Adoption History",
      subtitle: "View your adopted pets",
      path: "history",
      onPress: () => navigation.navigate('AdoptionHistory' as never),
    },
    {
      icon: "document-text-outline",
      title: "Applications",
      subtitle: "Track your applications",
      path: "applications",
      onPress: () => navigation.navigate('ModernApplicationList' as never),
    },
    {
      icon: "chatbubble-outline",
      title: "Messages",
      subtitle: "Chat with shelters",
      path: "messages",
      onPress: () => navigation.navigate('Messages' as never),
    },
    {
      icon: "settings-outline",
      title: "Settings",
      subtitle: "App preferences",
      path: "settings",
      onPress: () => navigation.navigate('Settings' as never),
    },
    {
      icon: "log-out-outline",
      title: "Log Out",
      subtitle: "Sign out of your account",
      path: "logout",
      onPress: () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Log Out", 
            style: "destructive", 
            onPress: async () => {
              await logout()
              navigation.reset({
                index: 0,
                routes: [{ name: 'AuthScreen' as never }],
              })
            }
          }
        ])
      },
    },
  ]

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="white" />
          </View>
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileType}>Pet Adopter</Text>
      </View>

      {/* Profile Details */}
      <View style={styles.profileDetails}>
        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={profile.location}
                onChangeText={(text) => setProfile({ ...profile, location: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={16} color={colors.text} />
              <Text style={styles.infoText}>{profile.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={16} color={colors.text} />
              <Text style={styles.infoText}>{profile.phone}</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color={colors.text} />
              <Text style={styles.infoText}>{profile.location}</Text>
            </View>

            <View style={styles.bioSection}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.menuItem, item.title === "Log Out" ? { borderColor: colors.error } : {}]} 
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, item.title === "Log Out" ? { backgroundColor: "#FFF1F0" } : {}]}>
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={item.title === "Log Out" ? colors.error : colors.primary} 
                />
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={[
                  styles.menuItemTitle, 
                  item.title === "Log Out" ? { color: colors.error } : {}
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={item.title === "Log Out" ? colors.error : colors.text} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    backgroundColor: "white",
    alignItems: "center",
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  profileDetails: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileInfo: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
  },
  bioSection: {
    marginTop: 8,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  menuContainer: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  logoutContainer: {
    margin: 16,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
})

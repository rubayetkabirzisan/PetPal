"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors, spacing } from "../theme/theme"

const { width, height } = Dimensions.get("window")

interface LandingScreenProps {
  navigation: any
}

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const [showAnimation, setShowAnimation] = useState(true)
  const [showUserSelection, setShowUserSelection] = useState(false)
  const fadeAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(0.8)

  useEffect(() => {
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    // Show user selection after 3 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false)
      setShowUserSelection(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleUserTypeSelection = (userType: "adopter" | "admin") => {
    navigation.navigate("Auth", { userType })
  }

  if (showAnimation) {
    return (
      <View style={styles.animationContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="heart" size={64} color={colors.primary} />
          </View>
          <Text style={styles.appTitle}>PetPal</Text>
          <Text style={styles.appSubtitle}>Connecting Hearts, Creating Families</Text>
        </Animated.View>
      </View>
    )
  }

  if (showUserSelection) {
    return (
      <View style={styles.selectionContainer}>
        <View style={styles.headerSection}>
          <View style={styles.smallLogoCircle}>
            <Ionicons name="heart" size={40} color="white" />
          </View>
          <Text style={styles.welcomeTitle}>Welcome to PetPal</Text>
          <Text style={styles.welcomeSubtitle}>Choose how you'd like to continue</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleUserTypeSelection("adopter")}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="search" size={32} color="white" />
            </View>
            <Text style={styles.optionTitle}>I'm Looking to Adopt</Text>
            <Text style={styles.optionDescription}>
              Find your perfect pet companion and start your adoption journey
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleUserTypeSelection("admin")}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="people" size={32} color="white" />
            </View>
            <Text style={styles.optionTitle}>I'm a Shelter/Foster</Text>
            <Text style={styles.optionDescription}>Manage pets, applications, and help find loving homes</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Every pet deserves a loving home 🐾</Text>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: spacing.sm,
  },
  appSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  selectionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  smallLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    opacity: 0.7,
  },
})

"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { colors, spacing } from "../theme/theme"
import { API } from "../config/api"

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(API.users.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      
      if (res.ok) {
        Alert.alert("Code Sent", "Check your backend console for the Ethereal email reset link to get your code!")
        setStep(2)
      } else {
        Alert.alert("Error", data.message || "Could not send reset code")
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not connect to the server")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!token || !newPassword) {
      Alert.alert("Error", "Please enter both the reset code and your new password")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(API.users.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      })

      const data = await res.json()
      
      if (res.ok) {
        Alert.alert("Success", "Your password has been reset successfully!", [
          { text: "Log In", onPress: () => navigation.navigate("Auth") }
        ])
      } else {
        Alert.alert("Error", data.message || "Could not reset password")
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not connect to the server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="lock-closed" size={40} color="white" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? "Enter your email to receive a reset code" 
              : "Enter the code and your new password"}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 1 ? (
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
                editable={!loading}
              />
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="6-Digit Reset Code"
                  value={token}
                  onChangeText={setToken}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.textSecondary}
                  editable={!loading}
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor={colors.textSecondary}
                  editable={!loading}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={step === 1 ? handleRequestReset : handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>
              {loading ? "Please wait..." : step === 1 ? "Send Reset Code" : "Reset Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: spacing.xs,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
})

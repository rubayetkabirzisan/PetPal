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
// import { useAuth } from "../contexts/AuthContext"
import { colors, spacing } from "../theme/theme"

interface AuthScreenProps {
  navigation: any
  route: any
}


const API_BASE = "http://192.168.31.136:5000/api/users";
export default function AuthScreen({ navigation, route }: AuthScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  
  // Sign-up form fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  
  // const { login } = useAuth()

  const userType = route.params?.userType || "adopter"

  const handleAuth = async () => {
  if (isLogin) {
    // LOGIN
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType })
      })

      const data = await res.json()
      if (res.ok) {
        Alert.alert("Success", "Login successful!")

        // Navigate by user type
        if (data.user.userType === "adopter") {
          navigation.navigate("AdopterTabs")
        } else {
          navigation.navigate("AdminTabs")
        }
      } else {
        Alert.alert("Error", data.message || "Login failed")
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  } else {
    // SIGNUP
    handleSignUp()
  }
}

const handleSignUp = async () => {
  if (!name || !email || !password) {
    Alert.alert("Error", "Please fill in all required fields (Name, Email, Password)")
    return
  }

  setLoading(true)
  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        location,
        bio,
        userType,
      })
    })

    const data = await res.json()
    if (res.ok) {
      Alert.alert("Success", "Account created! Please log in.", [
        {
          text: "OK",
          onPress: () => {
            // Reset form and switch to login mode
            setName("")
            setPhone("")
            setLocation("")
            setBio("")
            setPassword("")
            setIsLogin(true)
          }
        }
      ])
    } else {
      Alert.alert("Error", data.message || "Signup failed")
    }
  } catch (err) {
    Alert.alert("Error", "Something went wrong. Try again.")
  } finally {
    setLoading(false)
  }
}


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart" size={40} color="white" />
          </View>
          <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
          <Text style={styles.subtitle}>{userType === "adopter" ? "Adopter" : "Shelter/Foster"} Login</Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Bio (Tell us about yourself)"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}

          {!isLogin && (
            <Text style={styles.requiredFieldsNote}>* Required fields</Text>
          )}

          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>{loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchButtonText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backButtonText}>Back to selection</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.text,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  switchButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    marginLeft: spacing.sm,
  },
})
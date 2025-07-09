import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authenticateUser, registerUser } from '../../lib/auth';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '', type: 'adopter' as 'adopter' | 'admin' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    shelterName: '',
    type: 'adopter' as 'adopter' | 'admin',
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const success = await authenticateUser(
        loginData.email,
        loginData.password,
        loginData.type
      );

      if (success) {
        Alert.alert('Success', 'Login successful!', [
          { 
            text: 'OK', 
            onPress: () => {
              // Use a type-safe path pattern
              if (loginData.type === 'admin') {
                router.replace("/(tabs)/admin/dashboard" as any);
              } else {
                router.replace("/(tabs)/adopter/dashboard" as any);
              }
            }
          }
        ]);
      } else {
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerData.email || !registerData.password || !registerData.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Admin registration requires shelter name
      if (registerData.type === 'admin' && !registerData.shelterName) {
        Alert.alert('Error', 'Please enter shelter name');
        setLoading(false);
        return;
      }

      const success = await registerUser(
        registerData.email, 
        registerData.password, 
        registerData.name
      );

      if (success) {
        Alert.alert('Success', 'Registration successful!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to the appropriate dashboard
              if (registerData.type === 'admin') {
                router.replace("/(tabs)/admin/dashboard" as any);
              } else {
                router.replace("/(tabs)/adopter/dashboard" as any);
              }
            }
          }
        ]);
      } else {
        Alert.alert('Error', 'Registration failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during registration.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Info', `${provider} login would be implemented with OAuth integration`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="heart" size={32} color="white" />
          </View>
          <Text style={styles.title}>Welcome to PetPal</Text>
          <Text style={styles.subtitle}>Find your perfect pet companion</Text>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          {/* Tab Headers */}
          <View style={styles.tabHeader}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'register' && styles.activeTab]}
              onPress={() => setActiveTab('register')}
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          {activeTab === 'login' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Login to Your Account</Text>
              <Text style={styles.sectionSubtitle}>Enter your credentials to access your account</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={18} color="#8B4513" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#8B451380"
                    value={loginData.email}
                    onChangeText={(text) => setLoginData((prev) => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={18} color="#8B4513" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#8B451380"
                    value={loginData.password}
                    onChangeText={(text) => setLoginData((prev) => ({ ...prev, password: text }))}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Type</Text>
                <View style={styles.radioGroup}>
                  <Pressable
                    style={styles.radioOption}
                    onPress={() => setLoginData((prev) => ({ ...prev, type: 'adopter' }))}
                  >
                    <View style={[styles.radio, loginData.type === 'adopter' && styles.radioSelected]}>
                      {loginData.type === 'adopter' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Pet Adopter</Text>
                  </Pressable>
                  
                  <Pressable
                    style={styles.radioOption}
                    onPress={() => setLoginData((prev) => ({ ...prev, type: 'admin' }))}
                  >
                    <View style={[styles.radio, loginData.type === 'admin' && styles.radioSelected]}>
                      {loginData.type === 'admin' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Shelter Admin</Text>
                  </Pressable>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton]}
                  onPress={() => handleSocialLogin('Google')}
                >
                  <Ionicons name="logo-google" size={18} color="#8B4513" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => handleSocialLogin('Facebook')}
                >
                  <Ionicons name="logo-facebook" size={18} color="#8B4513" />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Create Your Account</Text>
              <Text style={styles.sectionSubtitle}>Join PetPal to find your perfect companion</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={18} color="#8B4513" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#8B451380"
                    value={registerData.name}
                    onChangeText={(text) => setRegisterData((prev) => ({ ...prev, name: text }))}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={18} color="#8B4513" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#8B451380"
                    value={registerData.email}
                    onChangeText={(text) => setRegisterData((prev) => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={18} color="#8B4513" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor="#8B451380"
                    value={registerData.password}
                    onChangeText={(text) => setRegisterData((prev) => ({ ...prev, password: text }))}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={18} color="#8B4513" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#8B451380"
                    value={registerData.confirmPassword}
                    onChangeText={(text) => setRegisterData((prev) => ({ ...prev, confirmPassword: text }))}
                    secureTextEntry
                  />
                </View>
              </View>

              {registerData.type === 'admin' && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Shelter Name</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business" size={18} color="#8B4513" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter shelter name"
                      placeholderTextColor="#8B451380"
                      value={registerData.shelterName}
                      onChangeText={(text) => setRegisterData((prev) => ({ ...prev, shelterName: text }))}
                    />
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Type</Text>
                <View style={styles.radioGroup}>
                  <Pressable
                    style={styles.radioOption}
                    onPress={() => setRegisterData((prev) => ({ ...prev, type: 'adopter' }))}
                  >
                    <View style={[styles.radio, registerData.type === 'adopter' && styles.radioSelected]}>
                      {registerData.type === 'adopter' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Pet Adopter</Text>
                  </Pressable>
                  
                  <Pressable
                    style={styles.radioOption}
                    onPress={() => setRegisterData((prev) => ({ ...prev, type: 'admin' }))}
                  >
                    <View style={[styles.radio, registerData.type === 'admin' && styles.radioSelected]}>
                      {registerData.type === 'admin' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Shelter Admin</Text>
                  </Pressable>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton]}
                  onPress={() => handleSocialLogin('Google')}
                >
                  <Ionicons name="logo-google" size={18} color="#8B4513" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => handleSocialLogin('Facebook')}
                >
                  <Ionicons name="logo-facebook" size={18} color="#8B4513" />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing up, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF7A47',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B4513',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF7A47',
  },
  tabText: {
    fontSize: 16,
    color: '#8B4513',
    opacity: 0.7,
  },
  activeTabText: {
    fontWeight: 'bold',
    opacity: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#8B4513',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: '#FF7A47',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7A47',
  },
  radioLabel: {
    fontSize: 14,
    color: '#8B4513',
  },
  primaryButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#8B4513',
    textTransform: 'uppercase',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  facebookButton: {
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8B4513',
  },
  footer: {
    marginTop: 24,
    marginBottom: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#8B4513',
  },
  footerLink: {
    color: '#FF7A47',
  },
});

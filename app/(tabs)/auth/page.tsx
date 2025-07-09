import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { authenticateUser, registerUser } from '../../../lib/auth';
import { useTheme } from '../../../src/contexts/ThemeContext';

export default function AuthPage() {
  const { theme } = useTheme();

  // State for login form
  const [loginData, setLoginData] = useState({ 
    email: '', 
    password: '', 
    type: 'adopter' as 'adopter' | 'admin' 
  });

  // State for registration form
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    shelterName: '',
    type: 'adopter' as 'adopter' | 'admin',
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Handle login submission
  const handleLogin = async () => {
    setLoading(true);
    setMessage('');

    try {
      const user = await authenticateUser(loginData.email, loginData.password, loginData.type);
      if (user) {
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        setTimeout(() => {
          if (user.type === 'admin') {
            router.replace('/(tabs)/admin/dashboard');
          } else {
            router.replace('/(tabs)/adopter/dashboard' as any);
          }
        }, 1500);
      } else {
        setMessage('Invalid credentials. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred during login.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration submission
  const handleRegister = async () => {
    setLoading(true);
    setMessage('');

    if (registerData.password !== registerData.confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const user = await registerUser(registerData.email, registerData.password, registerData.name);
      if (user) {
        setMessage('Registration successful! Redirecting...');
        setMessageType('success');
        setTimeout(() => {
          router.replace('/(tabs)/adopter/dashboard' as any);
        }, 1500);
      } else {
        setMessage('Registration failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred during registration.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setMessage(`${provider} login would be implemented with OAuth integration`);
    setMessageType('success');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="heart" size={32} color="white" />
            </View>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>Welcome to PetPal</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onBackground }]}>Find your perfect pet companion</Text>
          </View>

          {/* Alert/Message */}
          {message ? (
            <View style={[
              styles.alert,
              messageType === 'success' 
                ? { backgroundColor: '#E6F7F0', borderColor: '#A1E3C7' }
                : { backgroundColor: '#FEEEE9', borderColor: '#F5BCBC' }
            ]}>
              <Ionicons 
                name={messageType === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                size={16} 
                color={messageType === 'success' ? '#22C55E' : '#EF4444'} 
                style={styles.alertIcon}
              />
              <Text style={[
                styles.alertText,
                { color: messageType === 'success' ? '#22C55E' : '#EF4444' }
              ]}>
                {message}
              </Text>
            </View>
          ) : null}

          {/* Auth Card */}
          <View style={[styles.card, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline
          }]}>
            {/* Tab Header */}
            <View style={styles.tabHeader}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'login' && [styles.activeTab, { borderColor: theme.colors.primary }]
                ]}
                onPress={() => setActiveTab('login')}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === 'login' 
                    ? { color: theme.colors.primary } 
                    : { color: theme.colors.onSurface }
                ]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'register' && [styles.activeTab, { borderColor: theme.colors.primary }]
                ]}
                onPress={() => setActiveTab('register')}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === 'register' 
                    ? { color: theme.colors.primary } 
                    : { color: theme.colors.onSurface }
                ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Tab Content */}
            {activeTab === 'login' && (
              <View style={styles.tabContent}>
                <View style={styles.formHeader}>
                  <Text style={[styles.formTitle, { color: theme.colors.onSurface }]}>
                    Login to Your Account
                  </Text>
                  <Text style={[styles.formSubtitle, { color: theme.colors.onSurface }]}>
                    Enter your credentials to access your account
                  </Text>
                </View>

                <View style={styles.form}>
                  {/* Email Input */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="mail" 
                        size={18} 
                        color={theme.colors.onSurface} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={[styles.input, { 
                          borderColor: theme.colors.outline,
                          color: theme.colors.onSurface
                        }]}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.outline}
                        value={loginData.email}
                        onChangeText={(text) => setLoginData({...loginData, email: text})}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed" 
                        size={18} 
                        color={theme.colors.onSurface} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={[styles.input, { 
                          borderColor: theme.colors.outline,
                          color: theme.colors.onSurface
                        }]}
                        placeholder="Enter your password"
                        placeholderTextColor={theme.colors.outline}
                        value={loginData.password}
                        onChangeText={(text) => setLoginData({...loginData, password: text})}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  {/* Account Type Selection */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Account Type</Text>
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setLoginData({...loginData, type: 'adopter'})}
                      >
                        <View style={[
                          styles.radioButton,
                          loginData.type === 'adopter' && { borderColor: theme.colors.primary }
                        ]}>
                          {loginData.type === 'adopter' && (
                            <View style={[styles.radioButtonInner, { backgroundColor: theme.colors.primary }]} />
                          )}
                        </View>
                        <Text style={[styles.radioLabel, { color: theme.colors.onSurface }]}>Pet Adopter</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setLoginData({...loginData, type: 'admin'})}
                      >
                        <View style={[
                          styles.radioButton,
                          loginData.type === 'admin' && { borderColor: theme.colors.primary }
                        ]}>
                          {loginData.type === 'admin' && (
                            <View style={[styles.radioButtonInner, { backgroundColor: theme.colors.primary }]} />
                          )}
                        </View>
                        <Text style={[styles.radioLabel, { color: theme.colors.onSurface }]}>Shelter Admin</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.submitButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                  
                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                    <Text style={[styles.dividerText, { color: theme.colors.onSurface, backgroundColor: theme.colors.surface }]}>
                      Or continue with
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                  </View>

                  {/* Social Login Buttons */}
                  <View style={styles.socialButtons}>
                    <TouchableOpacity
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      onPress={() => handleSocialLogin('google')}
                    >
                      <Ionicons name="logo-google" size={18} color={theme.colors.onSurface} style={styles.socialIcon} />
                      <Text style={[styles.socialButtonText, { color: theme.colors.onSurface }]}>Google</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      onPress={() => handleSocialLogin('facebook')}
                    >
                      <Ionicons name="logo-facebook" size={18} color={theme.colors.onSurface} style={styles.socialIcon} />
                      <Text style={[styles.socialButtonText, { color: theme.colors.onSurface }]}>Facebook</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Register Tab Content */}
            {activeTab === 'register' && (
              <View style={styles.tabContent}>
                <View style={styles.formHeader}>
                  <Text style={[styles.formTitle, { color: theme.colors.onSurface }]}>
                    Create Your Account
                  </Text>
                  <Text style={[styles.formSubtitle, { color: theme.colors.onSurface }]}>
                    Join PetPal to find your perfect companion
                  </Text>
                </View>

                <View style={styles.form}>
                  {/* Name Input */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Full Name</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="person" 
                        size={18} 
                        color={theme.colors.onSurface} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={[styles.input, { 
                          borderColor: theme.colors.outline,
                          color: theme.colors.onSurface
                        }]}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.colors.outline}
                        value={registerData.name}
                        onChangeText={(text) => setRegisterData({...registerData, name: text})}
                      />
                    </View>
                  </View>

                  {/* Email Input */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="mail" 
                        size={18} 
                        color={theme.colors.onSurface} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={[styles.input, { 
                          borderColor: theme.colors.outline,
                          color: theme.colors.onSurface
                        }]}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.outline}
                        value={registerData.email}
                        onChangeText={(text) => setRegisterData({...registerData, email: text})}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed" 
                        size={18} 
                        color={theme.colors.onSurface} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={[styles.input, { 
                          borderColor: theme.colors.outline,
                          color: theme.colors.onSurface
                        }]}
                        placeholder="Create a password"
                        placeholderTextColor={theme.colors.outline}
                        value={registerData.password}
                        onChangeText={(text) => setRegisterData({...registerData, password: text})}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed" 
                        size={18} 
                        color={theme.colors.onSurface} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={[styles.input, { 
                          borderColor: theme.colors.outline,
                          color: theme.colors.onSurface
                        }]}
                        placeholder="Confirm your password"
                        placeholderTextColor={theme.colors.outline}
                        value={registerData.confirmPassword}
                        onChangeText={(text) => setRegisterData({...registerData, confirmPassword: text})}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  {/* Account Type Selection */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.colors.onSurface }]}>Account Type</Text>
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setRegisterData({...registerData, type: 'adopter'})}
                      >
                        <View style={[
                          styles.radioButton,
                          registerData.type === 'adopter' && { borderColor: theme.colors.primary }
                        ]}>
                          {registerData.type === 'adopter' && (
                            <View style={[styles.radioButtonInner, { backgroundColor: theme.colors.primary }]} />
                          )}
                        </View>
                        <Text style={[styles.radioLabel, { color: theme.colors.onSurface }]}>Pet Adopter</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => setRegisterData({...registerData, type: 'admin'})}
                      >
                        <View style={[
                          styles.radioButton,
                          registerData.type === 'admin' && { borderColor: theme.colors.primary }
                        ]}>
                          {registerData.type === 'admin' && (
                            <View style={[styles.radioButtonInner, { backgroundColor: theme.colors.primary }]} />
                          )}
                        </View>
                        <Text style={[styles.radioLabel, { color: theme.colors.onSurface }]}>Shelter Admin</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Shelter Name Input (only for admin) */}
                  {registerData.type === 'admin' && (
                    <View style={styles.formGroup}>
                      <Text style={[styles.label, { color: theme.colors.onSurface }]}>Shelter Name</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons 
                          name="business" 
                          size={18} 
                          color={theme.colors.onSurface} 
                          style={styles.inputIcon} 
                        />
                        <TextInput
                          style={[styles.input, { 
                            borderColor: theme.colors.outline,
                            color: theme.colors.onSurface
                          }]}
                          placeholder="Enter shelter name"
                          placeholderTextColor={theme.colors.outline}
                          value={registerData.shelterName}
                          onChangeText={(text) => setRegisterData({...registerData, shelterName: text})}
                        />
                      </View>
                    </View>
                  )}

                  {/* Register Button */}
                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.submitButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>
                  
                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                    <Text style={[styles.dividerText, { color: theme.colors.onSurface, backgroundColor: theme.colors.surface }]}>
                      Or continue with
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                  </View>

                  {/* Social Login Buttons */}
                  <View style={styles.socialButtons}>
                    <TouchableOpacity
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      onPress={() => handleSocialLogin('google')}
                    >
                      <Ionicons name="logo-google" size={18} color={theme.colors.onSurface} style={styles.socialIcon} />
                      <Text style={[styles.socialButtonText, { color: theme.colors.onSurface }]}>Google</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      onPress={() => handleSocialLogin('facebook')}
                    >
                      <Ionicons name="logo-facebook" size={18} color={theme.colors.onSurface} style={styles.socialIcon} />
                      <Text style={[styles.socialButtonText, { color: theme.colors.onSurface }]}>Facebook</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.onBackground }]}>
              By signing up, you agree to our{' '}
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    fontSize: 14,
    flex: 1,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  formHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  socialIcon: {
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '500',
  }
});

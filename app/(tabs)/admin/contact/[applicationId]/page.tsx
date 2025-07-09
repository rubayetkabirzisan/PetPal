"use client"

import { useAuth } from "@/hooks/useAuth"
import { getApplications, getPetById, type AdoptionApplication } from "@/lib/data"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

export default function ContactAdopter() {
  const params = useLocalSearchParams<{ applicationId: string }>()
  const applicationId = params.applicationId as string
  
  const [application, setApplication] = useState<AdoptionApplication | null>(null)
  const [pet, setPet] = useState<any>(null)
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const applications = await getApplications()
        const app = applications.find((a) => a.id === applicationId)

        if (app) {
          setApplication(app)
          const petData = await getPetById(app.petId)
          setPet(petData)

          // Set default subject based on application status
          const defaultSubject =
            app.status === "Approved"
              ? `Great news about your application for ${petData?.name}!`
              : app.status === "Rejected"
                ? `Update on your application for ${petData?.name}`
                : `Thank you for your interest in ${petData?.name}`

          setSubject(defaultSubject)

          // Set default message
          const defaultMessage =
            app.status === "Approved"
              ? `Dear ${app.adopterName},\n\nWe're excited to let you know that your application to adopt ${petData?.name} has been approved! We believe you'll be a wonderful match.\n\nNext steps:\n1. Schedule a meet and greet\n2. Complete the adoption paperwork\n3. Prepare for your new family member\n\nPlease contact us at your earliest convenience to arrange the next steps.\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`
              : app.status === "Rejected"
                ? `Dear ${app.adopterName},\n\nThank you for your interest in adopting ${petData?.name}. After careful consideration, we've decided to move forward with another applicant who we feel is the best match for ${petData?.name}'s specific needs.\n\nWe encourage you to browse our other available pets, as we may have another wonderful companion waiting for you.\n\nThank you for considering adoption.\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`
                : `Dear ${app.adopterName},\n\nThank you for your application to adopt ${petData?.name}. We've received your application and are currently reviewing it.\n\nWe'll be in touch within the next 24-48 hours with an update. In the meantime, please don't hesitate to reach out if you have any questions.\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`

          setMessage(defaultMessage)
        } else {
          router.push("/(tabs)/admin/applications" as any)
        }
      } catch (error) {
        console.error("Error loading application data:", error)
        Alert.alert("Error", "Failed to load application data")
        router.push("/(tabs)/admin/applications" as any)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [applicationId, router, user])

  const handleSendContact = async () => {
    setSending(true)

    // Simulate sending email/making call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSent(true)
      
      // Redirect back to applications after 3 seconds
      setTimeout(() => {
        router.push("/(tabs)/admin/applications" as any)
      }, 3000)
    } catch (error) {
      Alert.alert("Error", "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  if (loading || !application || !pet) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="email" size={64} color="#E8E8E8" />
        <Text style={styles.loadingText}>Loading contact details...</Text>
      </View>
    )
  }

  if (sent) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.successCard}>
          <MaterialIcons name="check-circle" size={64} color="#22c55e" style={styles.successIcon} />
          <Text style={styles.successTitle}>Message Sent!</Text>
          <Text style={styles.successMessage}>
            Your {contactMethod} has been sent to {application.adopterName}.
          </Text>
          <Text style={styles.redirectingText}>Redirecting back to applications...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push("/(tabs)/admin/applications" as any)}
        >
          <Feather name="arrow-left" size={24} color="#8B4513" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <MaterialIcons name="email" size={24} color="#FF7A47" style={styles.headerIcon} />
          <Text style={styles.headerText}>Contact Adopter</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Application Summary */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Application Details</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.adopterInfo}>
                <MaterialIcons name="person" size={16} color="#FF7A47" />
                <View style={styles.adopterTextContainer}>
                  <Text style={styles.adopterName}>{application.adopterName}</Text>
                  <Text style={styles.adopterEmail}>{application.adopterEmail}</Text>
                </View>
              </View>
              
              <View style={styles.petInfoCard}>
                <Text style={styles.petInfoText}>
                  <Text style={styles.bold}>Pet:</Text> {pet.name} - {pet.breed} ({pet.age})
                </Text>
                <Text style={styles.petInfoText}>
                  <Text style={styles.bold}>Application Status:</Text> {application.status}
                </Text>
                <Text style={styles.petInfoText}>
                  <Text style={styles.bold}>Submitted:</Text> {new Date(application.submittedDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.contactMethodHeader}>
                {contactMethod === "email" ? (
                  <MaterialIcons name="email" size={20} color="#FF7A47" />
                ) : (
                  <MaterialIcons name="phone" size={20} color="#FF7A47" />
                )}
                <Text style={styles.cardTitle}>Contact {application.adopterName}</Text>
              </View>
              <Text style={styles.cardDescription}>
                Send a {contactMethod} to the adopter about their application
              </Text>
            </View>
            
            <View style={styles.cardContent}>
              {/* Contact Method Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Contact Method</Text>
                <View style={styles.contactMethodSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.methodOption,
                      contactMethod === "email" && styles.methodOptionSelected
                    ]}
                    onPress={() => setContactMethod("email")}
                  >
                    <Text style={[
                      styles.methodOptionText,
                      contactMethod === "email" && styles.methodOptionTextSelected
                    ]}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.methodOption,
                      contactMethod === "phone" && styles.methodOptionSelected
                    ]}
                    onPress={() => setContactMethod("phone")}
                  >
                    <Text style={[
                      styles.methodOptionText,
                      contactMethod === "phone" && styles.methodOptionTextSelected
                    ]}>Phone Call</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {contactMethod === "email" ? (
                <>
                  {/* Email Subject */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Subject</Text>
                    <TextInput
                      style={styles.input}
                      value={subject}
                      onChangeText={setSubject}
                      placeholder="Enter email subject"
                    />
                  </View>

                  {/* Email Message */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Message</Text>
                    <TextInput
                      style={styles.textarea}
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Type your message here..."
                      multiline={true}
                      numberOfLines={10}
                    />
                  </View>
                </>
              ) : (
                <>
                  {/* Phone Call Notes */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Call Notes / Talking Points</Text>
                    <TextInput
                      style={styles.textarea}
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Notes for your phone conversation..."
                      multiline={true}
                      numberOfLines={8}
                    />
                  </View>

                  <View style={styles.phoneAlert}>
                    <MaterialIcons name="phone" size={16} color="#1e40af" />
                    <Text style={styles.phoneAlertText}>
                      Phone number: {application.adopterEmail.replace("@", " (call via email provider) @")}
                    </Text>
                  </View>
                </>
              )}

              {/* Quick Templates */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Quick Templates</Text>
                <View style={styles.templatesList}>
                  {[
                    {
                      label: "Schedule Meet & Greet",
                      template: `Hi ${application.adopterName},\n\nWe'd love to schedule a meet and greet with ${pet.name}! When would be a good time for you this week?\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`,
                    },
                    {
                      label: "Request More Info",
                      template: `Hi ${application.adopterName},\n\nThank you for your interest in ${pet.name}. Could you tell us a bit more about your living situation and experience with pets?\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`,
                    },
                    {
                      label: "Application Update",
                      template: `Hi ${application.adopterName},\n\nWe wanted to give you an update on your application for ${pet.name}. We're still reviewing applications and will have a decision within the next few days.\n\nThank you for your patience!\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`,
                    },
                  ].map((template, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.templateButton}
                      onPress={() => setMessage(template.template)}
                    >
                      <Text style={styles.templateButtonText}>{template.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (sending || (!subject.trim() && contactMethod === "email") || !message.trim()) && styles.disabledButton
                ]}
                disabled={sending || (!subject.trim() && contactMethod === "email") || !message.trim()}
                onPress={handleSendContact}
              >
                {sending ? (
                  <Text style={styles.sendButtonText}>Sending...</Text>
                ) : (
                  <View style={styles.sendButtonContent}>
                    <Feather name="send" size={16} color="white" style={styles.sendIcon} />
                    <Text style={styles.sendButtonText}>
                      Send {contactMethod === "email" ? "Email" : "Call Notes"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
  },
  loadingText: {
    marginTop: 16,
    color: "#8B4513",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  cardDescription: {
    fontSize: 14,
    color: "#8B4513",
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
  },
  adopterInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  adopterTextContainer: {
    marginLeft: 12,
  },
  adopterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
  },
  adopterEmail: {
    fontSize: 14,
    color: "#8B4513",
  },
  petInfoCard: {
    backgroundColor: "#FFF5F0",
    padding: 12,
    borderRadius: 8,
  },
  petInfoText: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  contactMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#8B4513",
    backgroundColor: "white",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#8B4513",
    minHeight: 150,
    textAlignVertical: "top",
    backgroundColor: "white",
  },
  contactMethodSelector: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    overflow: "hidden",
  },
  methodOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "white",
  },
  methodOptionSelected: {
    backgroundColor: "#FF7A47",
  },
  methodOptionText: {
    fontWeight: "500",
    color: "#8B4513",
  },
  methodOptionTextSelected: {
    color: "white",
  },
  phoneAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  phoneAlertText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#1e40af",
  },
  templatesList: {
    gap: 8,
  },
  templateButton: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    backgroundColor: "white",
  },
  templateButtonText: {
    fontSize: 14,
    color: "#8B4513",
  },
  sendButton: {
    backgroundColor: "#FF7A47",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#FFB899",
    opacity: 0.7,
  },
  sendButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  successCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    width: "90%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: "#8B4513",
    textAlign: "center",
    marginBottom: 16,
  },
  redirectingText: {
    fontSize: 14,
    color: "#8B4513",
    opacity: 0.7,
  },
})

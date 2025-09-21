"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { API_CONFIG, apiCall } from "../config/api"
import { colors } from "../theme/theme"

interface Message {
  id: string
  text: string
  sender: "user" | "shelter"
  timestamp: string
  senderName?: string
}

interface ChatScreenProps {
  navigation?: any
  route?: any
  isAdminView?: boolean
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  // Get the params from route if available
  const messageId = route?.params?.messageId
  const shelterName = route?.params?.shelterName || "Shelter Chat"
  const shelterImage = route?.params?.shelterImage

  // Reference to the ScrollView for auto-scrolling
  const scrollViewRef = useRef<ScrollView>(null)

  // You can use messageId to fetch specific chat messages
  // For now, we'll use the mock data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm interested in learning about pets available for adoption at your shelter. Do you have any medium-sized dogs that are good with children?",
      sender: "user",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      text: "Hello! Thank you for your interest in our shelter. We currently have several medium-sized dogs that are great with children. We have a 3-year-old Lab mix and a 2-year-old Beagle who are both very friendly and well-socialized.",
      sender: "shelter",
      timestamp: "10:35 AM",
      senderName: `Sarah - ${shelterName}`,
    },
    {
      id: "3",
      text: "That sounds perfect! I have a 5-year-old daughter and we're looking for an active companion. What's the next step to visit the shelter?",
      sender: "user",
      timestamp: "10:37 AM",
    },
    {
      id: "4",
      text: "Wonderful! You can schedule a visit to our shelter through our online calendar. We're open daily from 10AM to 5PM. Would you like me to send you the link to schedule a visit?",
      sender: "shelter",
      timestamp: "10:40 AM",
      senderName: "Sarah - Happy Paws Shelter",
    },
  ])

  const [newMessage, setNewMessage] = useState("")

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100) // Small delay to ensure rendering is complete
  }, [messages])

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Scroll to the bottom after sending
      scrollViewRef.current?.scrollToEnd({ animated: true })

      // Simulate shelter response
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thank you for your message! I'll get back to you shortly.",
          sender: "shelter",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          senderName: "Sarah - Happy Paws Shelter",
        }
        setMessages((prev) => [...prev, response])
        // Scroll to the bottom after receiving shelter response
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 1000)
    }
  }

  const handleScheduleVisit = async () => {
    try {
      // Make API call to schedule visit
      const result = await apiCall(API_CONFIG.ENDPOINTS.SCHEDULE_VISIT("1"), {
        method: "POST",
        body: JSON.stringify({
          userId: "user-001",
          preferredDate: new Date().toISOString().split("T")[0], // Today's date
          preferredTime: "Morning (10am-12pm)",
          notes: "Looking forward to meeting the available pets",
        }),
      })

      if (result.success) {
        // Add the message from API response
        const visitMessage: Message = {
          id: result.data.message.id,
          text: result.data.message.text,
          sender: "user",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, visitMessage])
        scrollViewRef.current?.scrollToEnd({ animated: true })

        console.log("Visit request sent successfully:", result.data.action)
      } else {
        console.error("Failed to schedule visit:", result.error)
      }
    } catch (error) {
      console.error("Error scheduling visit:", error)
      // Fallback to local functionality if API fails
      const visitMessage: Message = {
        id: Date.now().toString(),
        text: "I'd like to schedule a visit to meet the pet. What times are available?",
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, visitMessage])
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  }

  const handleViewApplication = async () => {
    try {
      // Make API call to view application status
      const result = await apiCall(API_CONFIG.ENDPOINTS.VIEW_APPLICATION("1"), {
        method: "POST",
        body: JSON.stringify({
          userId: "user-001",
        }),
      })

      if (result.success) {
        // Add the message from API response
        const appMessage: Message = {
          id: result.data.message.id,
          text: result.data.message.text,
          sender: "user",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, appMessage])
        scrollViewRef.current?.scrollToEnd({ animated: true })

        console.log("Application status:", result.data.applicationStatus)
      } else {
        console.error("Failed to view application:", result.error)
      }
    } catch (error) {
      console.error("Error viewing application:", error)
      // Fallback to local functionality if API fails
      const appMessage: Message = {
        id: Date.now().toString(),
        text: "Can you tell me the status of my adoption application?",
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, appMessage])
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  }

  const handleVoiceCall = async () => {
    try {
      // Make API call to initiate voice call
      const result = await apiCall(API_CONFIG.ENDPOINTS.VOICE_CALL("1"), {
        method: "POST",
        body: JSON.stringify({
          userId: "user-001",
        }),
      })

      if (result.success) {
        // Add the system message from API response
        const callMessage: Message = {
          id: result.data.message.id,
          text: result.data.message.text,
          sender: "user",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, callMessage])
        scrollViewRef.current?.scrollToEnd({ animated: true })

        const phoneNumber = result.data.callDetails?.shelterContact || "+1234567890" // Fallback number
        const phoneUrl = `tel:${phoneNumber}`

        // Check if the device can make phone calls
        const canCall = await Linking.canOpenURL(phoneUrl)
        if (canCall) {
          await Linking.openURL(phoneUrl)
        } else {
          Alert.alert(
            "Call Not Available",
            "Your device doesn't support making phone calls or the number is invalid.",
            [{ text: "OK" }],
          )
        }

        console.log("Voice call initiated:", result.data.callDetails)
      } else {
        console.error("Failed to initiate voice call:", result.error)
        Alert.alert("Call Failed", "Unable to initiate voice call. Please try again later.", [{ text: "OK" }])
      }
    } catch (error) {
      console.error("Error initiating voice call:", error)
      Alert.alert("Start Voice Call?", "Would you like to call the shelter directly?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: async () => {
            const fallbackNumber = "+1234567890" // Replace with actual shelter number
            const phoneUrl = `tel:${fallbackNumber}`
            const canCall = await Linking.canOpenURL(phoneUrl)
            if (canCall) {
              await Linking.openURL(phoneUrl)
            }
          },
        },
      ])
    }
  }

  const handleVideoCall = async () => {
    try {
      // Make API call to initiate video call
      const result = await apiCall(API_CONFIG.ENDPOINTS.VIDEO_CALL("1"), {
        method: "POST",
        body: JSON.stringify({
          userId: "user-001",
        }),
      })

      if (result.success) {
        // Add the system message from API response
        const videoCallMessage: Message = {
          id: result.data.message.id,
          text: result.data.message.text,
          sender: "user",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, videoCallMessage])
        scrollViewRef.current?.scrollToEnd({ animated: true })

        const roomUrl = result.data.callDetails?.roomUrl

        if (roomUrl) {
          // If we have a video call room URL, open it
          const canOpen = await Linking.canOpenURL(roomUrl)
          if (canOpen) {
            await Linking.openURL(roomUrl)
          } else {
            Alert.alert("Video Call", "Video call room created. Please check your messages for the meeting link.", [
              { text: "OK" },
            ])
          }
        } else {
          Alert.alert("Start Video Call?", "Choose your preferred video calling platform:", [
            { text: "Cancel", style: "cancel" },
            {
              text: "FaceTime",
              onPress: async () => {
                const facetimeUrl = "facetime://+1234567890" // Replace with actual number
                const canOpen = await Linking.canOpenURL(facetimeUrl)
                if (canOpen) {
                  await Linking.openURL(facetimeUrl)
                } else {
                  Alert.alert("FaceTime not available", "FaceTime is not installed or available on this device.")
                }
              },
            },
            {
              text: "WhatsApp",
              onPress: async () => {
                const whatsappUrl =
                  "https://wa.me/1234567890?text=Hi, I would like to start a video call about pet adoption"
                const canOpen = await Linking.canOpenURL(whatsappUrl)
                if (canOpen) {
                  await Linking.openURL(whatsappUrl)
                } else {
                  Alert.alert("WhatsApp not available", "WhatsApp is not installed on this device.")
                }
              },
            },
          ])
        }

        console.log("Video call initiated:", result.data.callDetails)
      } else {
        console.error("Failed to initiate video call:", result.error)
        Alert.alert("Video Call Failed", "Unable to start video call. Please try again later.", [{ text: "OK" }])
      }
    } catch (error) {
      console.error("Error initiating video call:", error)
      Alert.alert("Start Video Call?", "Choose your preferred video calling platform:", [
        { text: "Cancel", style: "cancel" },
        {
          text: "FaceTime",
          onPress: async () => {
            const facetimeUrl = "facetime://+1234567890"
            const canOpen = await Linking.canOpenURL(facetimeUrl)
            if (canOpen) {
              await Linking.openURL(facetimeUrl)
            } else {
              Alert.alert("FaceTime not available", "FaceTime is not installed or available on this device.")
            }
          },
        },
        {
          text: "WhatsApp",
          onPress: async () => {
            const whatsappUrl =
              "https://wa.me/1234567890?text=Hi, I would like to start a video call about pet adoption"
            const canOpen = await Linking.canOpenURL(whatsappUrl)
            if (canOpen) {
              await Linking.openURL(whatsappUrl)
            } else {
              Alert.alert("WhatsApp not available", "WhatsApp is not installed on this device.")
            }
          },
        },
      ])
    }
  }

  const handleAttachFile = async () => {
    try {
      // Simulate file selection - in production, this would open a file picker
      const mockFile = {
        fileName: "pet_medical_records.pdf",
        fileType: "application/pdf",
        fileSize: "1.2 MB",
      }

      // Make API call to attach file
      const result = await apiCall(API_CONFIG.ENDPOINTS.ATTACH_FILE("1"), {
        method: "POST",
        body: JSON.stringify({
          userId: "user-001",
          ...mockFile,
        }),
      })

      if (result.success) {
        // Add the message from API response
        const attachMessage: Message = {
          id: result.data.message.id,
          text: result.data.message.text,
          sender: "user",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, attachMessage])
        scrollViewRef.current?.scrollToEnd({ animated: true })

        console.log("File attached successfully:", result.data.action)
      } else {
        console.error("Failed to attach file:", result.error)
      }
    } catch (error) {
      console.error("Error attaching file:", error)
      // Fallback to local functionality if API fails
      const attachMessage: Message = {
        id: Date.now().toString(),
        text: "📎 File attachment feature - you can upload photos, documents, or medical records here",
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, attachMessage])
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  }

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[styles.messageContainer, message.sender === "user" ? styles.userMessage : styles.shelterMessage]}
    >
      {message.sender === "shelter" && message.senderName && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      <Text
        style={[styles.messageText, message.sender === "user" ? styles.userMessageText : styles.shelterMessageText]}
      >
        {message.text}
      </Text>
      <Text
        style={[styles.messageTime, message.sender === "user" ? styles.userMessageTime : styles.shelterMessageTime]}
      >
        {message.timestamp}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <NavigationHeader title={shelterName} showBackButton={true} backButtonAction={() => navigation?.goBack()} />

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Quick Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusInfo}>
            <View style={styles.onlineIndicator} />
            <Text style={styles.statusText}>Online</Text>
          </View>
          <View style={styles.callActions}>
            <TouchableOpacity style={styles.callButton} onPress={() => handleVoiceCall()}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.videoCallButton} onPress={() => handleVideoCall()}>
              <Ionicons name="videocam-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.text + "80"}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.attachButton} onPress={() => handleAttachFile()}>
              <Ionicons name="attach-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color={newMessage.trim() ? "white" : colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => handleScheduleVisit()}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.quickActionText}>Schedule Visit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => handleViewApplication()}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <Text style={styles.quickActionText}>Application</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => handleVoiceCall()}>
            <Ionicons name="call-outline" size={16} color={colors.primary} />
            <Text style={styles.quickActionText}>Voice Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={() => handleVideoCall()}>
            <Ionicons name="videocam-outline" size={16} color={colors.primary} />
            <Text style={styles.quickActionText}>Video Call</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  statusBar: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "500",
  },
  callActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  videoCallButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  shelterMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: "white",
  },
  shelterMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "right",
  },
  shelterMessageTime: {
    color: colors.text,
    opacity: 0.6,
  },
  inputContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: 4,
  },
  attachButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: colors.border,
  },
  quickActions: {
    backgroundColor: "white",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  quickAction: {
    flex: 1,
    minWidth: "22%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 2,
  },
  quickActionText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "500",
    textAlign: "center",
  },
})

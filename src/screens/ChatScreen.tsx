"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
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
  // Get the messageId from route params if available
  const messageId = route?.params?.messageId;
  
  // You can use messageId to fetch specific chat messages
  // For now, we'll use the mock data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm interested in adopting Buddy. Could you tell me more about his temperament?",
      sender: "user",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      text: "Hello! Thank you for your interest in Buddy. He's a very friendly and energetic dog who loves playing fetch and swimming. He's great with kids and gets along well with other dogs.",
      sender: "shelter",
      timestamp: "10:35 AM",
      senderName: "Sarah - Happy Paws Shelter",
    },
    {
      id: "3",
      text: "That sounds perfect! I have a 5-year-old daughter and we're looking for an active companion. What's the next step in the adoption process?",
      sender: "user",
      timestamp: "10:37 AM",
    },
    {
      id: "4",
      text: "Wonderful! The first step would be to fill out our adoption application. Once that's reviewed, we can schedule a meet and greet with Buddy. Would you like me to send you the application link?",
      sender: "shelter",
      timestamp: "10:40 AM",
      senderName: "Sarah - Happy Paws Shelter",
    },
  ])

  const [newMessage, setNewMessage] = useState("")

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
      }, 1000)
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
      <NavigationHeader 
        title="Happy Paws Shelter" 
        showBackButton={true}
        backButtonAction={() => navigation?.goBack()}
      />
      
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Quick Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusInfo}>
            <View style={styles.onlineIndicator} />
            <Text style={styles.statusText}>Online</Text>
          </View>
          <View style={styles.callActions}>
            <TouchableOpacity style={styles.callButton} onPress={() => console.log("Voice call")}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.videoCallButton} onPress={() => console.log("Video call")}>
              <Ionicons name="videocam-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
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
          <TouchableOpacity style={styles.attachButton} onPress={() => console.log("Attach file")}>
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
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.quickActionText}>Schedule Visit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="document-text-outline" size={16} color={colors.primary} />
          <Text style={styles.quickActionText}>Application</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="heart-outline" size={16} color={colors.primary} />
          <Text style={styles.quickActionText}>View Pet</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
})

"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

const { width } = Dimensions.get("window")

// Theme colors matching your dashboard
const colors = {
  primary: "#3B82F6", // Blue primary color
  background: "#F8FAFC",
  text: "#1E293B",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
}

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

interface Message {
  id: string
  text: string
  timestamp: Date
  sender: "adopter" | "shelter"
  type?: "text" | "image" | "system"
  imageUri?: string
}

interface Shelter {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: string
}

interface ChatWithShelterScreenProps {
  navigation?: any
  route?: {
    params?: {
      shelterId?: string
      petId?: string
    }
  }
}

export default function ChatWithShelterScreen({ navigation, route }: ChatWithShelterScreenProps) {
  const shelterId = route?.params?.shelterId || "1"
  const petId = route?.params?.petId
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [shelter, setShelter] = useState<Shelter | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Mock shelter data
    setShelter({
      id: shelterId,
      name: "Happy Paws Shelter",
      avatar: "https://via.placeholder.com/40x40",
      isOnline: true,
    })

    // Mock messages
    const mockMessages: Message[] = [
      {
        id: "1",
        text: "Hi! I'm interested in adopting Buddy. Can you tell me more about him?",
        timestamp: new Date(Date.now() - 3600000),
        sender: "adopter",
      },
      {
        id: "2",
        text: "Hello! Thank you for your interest in Buddy. He's a wonderful 2-year-old Golden Retriever who loves playing fetch and is great with kids.",
        timestamp: new Date(Date.now() - 3500000),
        sender: "shelter",
      },
      {
        id: "3",
        text: "That sounds perfect! What's the adoption process like?",
        timestamp: new Date(Date.now() - 3400000),
        sender: "adopter",
      },
      {
        id: "4",
        text: "Great question! First, we'll need you to fill out an adoption application. Then we can schedule a meet-and-greet with Buddy. If everything goes well, we can proceed with the adoption paperwork.",
        timestamp: new Date(Date.now() - 3300000),
        sender: "shelter",
      },
      {
        id: "5",
        text: "How long does the whole process usually take?",
        timestamp: new Date(Date.now() - 1800000),
        sender: "adopter",
      },
    ]

    setMessages(mockMessages)
  }, [shelterId])

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        timestamp: new Date(),
        sender: "adopter",
      }

      setMessages(prev => [...prev, newMessage])
      setInputText("")

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)

      // Mock shelter response (simulate typing delay)
      setTimeout(() => {
        const responses = [
          "Thanks for your message! Let me get back to you on that.",
          "That's a great question. The process typically takes 3-5 business days.",
          "I'd be happy to help you with that. Let me check our records.",
          "We can schedule that for you.",
        ]
        
        const mockResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          sender: "shelter",
        }

        setMessages(prev => [...prev, mockResponse])
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }, 2000)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isAdopter = item.sender === "adopter"
    
    return (
      <View style={[styles.messageContainer, isAdopter ? styles.adopterMessage : styles.shelterMessage]}>
        {!isAdopter && (
          <Image source={{ uri: shelter?.avatar }} style={styles.avatarSmall} />
        )}
        <View style={[styles.messageBubble, isAdopter ? styles.adopterBubble : styles.shelterBubble]}>
          <Text style={[styles.messageText, isAdopter ? styles.adopterText : styles.shelterText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isAdopter ? styles.adopterTime : styles.shelterTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    )
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.shelterInfo}>
        <Image source={{ uri: shelter?.avatar }} style={styles.avatar} />
        <View style={styles.shelterDetails}>
          <Text style={styles.shelterName}>{shelter?.name}</Text>
          <View style={styles.onlineStatus}>
            <View style={[styles.onlineIndicator, { backgroundColor: shelter?.isOnline ? colors.success : colors.textSecondary }]} />
            <Text style={styles.onlineText}>
              {shelter?.isOnline ? "Online" : `Last seen ${shelter?.lastSeen}`}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.headerAction}>
        <Ionicons name="call-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.headerAction}>
        <Ionicons name="videocam-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )

  const renderInputArea = () => (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.attachButton}>
        <Ionicons name="attach-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
        onPress={sendMessage}
        disabled={!inputText.trim()}
      >
        <Ionicons 
          name="send" 
          size={20} 
          color={inputText.trim() ? "white" : colors.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  )

  if (!shelter) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {renderInputArea()}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === "ios" ? 50 : spacing.sm,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  shelterInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  shelterDetails: {
    flex: 1,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  onlineText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  headerAction: {
    marginLeft: spacing.md,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  adopterMessage: {
    justifyContent: "flex-end",
  },
  shelterMessage: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  adopterBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  shelterBubble: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  adopterText: {
    color: "white",
  },
  shelterText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
  adopterTime: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "right",
  },
  shelterTime: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "white",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachButton: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    minHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: colors.border,
  },
})

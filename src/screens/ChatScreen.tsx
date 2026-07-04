"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
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
import NavigationHeader from "../components/NavigationHeader"
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

import axios from "axios";
import { API } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { user } = useAuth();
  
  // Get the params from route if available
  const otherUserId = route?.params?.otherUserId || route?.params?.shelterId;
  const shelterName = route?.params?.shelterName || route?.params?.otherUserName || "Shelter Chat";
  const shelterImage = route?.params?.shelterImage;
  const petId = route?.params?.petId;
  const petName = route?.params?.petName;
  
  // Reference to the ScrollView for auto-scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("")

  const fetchHistory = async () => {
    if (!user?.id || !otherUserId) return;
    try {
      const res = await axios.get(API.messages.history(user.id, otherUserId, petId || 'general'));
      
      const formatted = res.data.map((m: any) => ({
        id: m._id,
        text: m.text,
        sender: m.senderId === user.id ? "user" : "shelter",
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        senderName: m.senderName
      }));
      
      setMessages(formatted);
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchHistory();
      const interval = setInterval(fetchHistory, 3000); // short-poll every 3s
      return () => clearInterval(interval);
    }, [user?.id, otherUserId])
  );
  
  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100); // Small delay to ensure rendering is complete
  }, [messages.length]);

  const sendMessage = async () => {
    if (newMessage.trim() && user?.id && otherUserId) {
      const text = newMessage.trim();
      setNewMessage("");

      try {
        await axios.post(API.messages.send, {
          senderId: user.id,
          receiverId: otherUserId,
          text: text,
          senderName: user.name,
          petId: petId,
          petName: petName
        });
        
        fetchHistory(); // instantly fetch to show the message
      } catch (err) {
        console.error("Send message error:", err);
      }
    }
  }

  const handleScheduleVisit = () => {
    // Navigate to schedule visit screen or show modal
    if (navigation) {
      // For now, we'll add a message to the chat to show functionality
      const visitMessage: Message = {
        id: Date.now().toString(),
        text: "I'd like to schedule a visit to meet the pet. What times are available?",
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, visitMessage])
      scrollViewRef.current?.scrollToEnd({ animated: true })
      
      // Simulate shelter response
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: "Great! We're available for visits Monday-Friday 10am-6pm, and weekends 9am-5pm. What day works best for you?",
          sender: "shelter",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          senderName: "Sarah - Happy Paws Shelter",
        }
        setMessages((prev) => [...prev, response])
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 1500)
    }
  }

  const handleViewApplication = () => {
    // Navigate to application screen or show current application status
    if (navigation) {
      // For demo purposes, add a message about application status
      const appMessage: Message = {
        id: Date.now().toString(),
        text: "Can you tell me the status of my adoption application?",
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, appMessage])
      scrollViewRef.current?.scrollToEnd({ animated: true })
      
      // Simulate shelter response
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: "Your application is currently under review. We should have an update for you within 2-3 business days. Thank you for your patience!",
          sender: "shelter",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          senderName: "Sarah - Happy Paws Shelter",
        }
        setMessages((prev) => [...prev, response])
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 1500)
    }
  }

  const handleVoiceCall = () => {
    // Start voice call functionality
    const callMessage: Message = {
      id: Date.now().toString(),
      text: "📞 Voice call initiated with Happy Paws Shelter",
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, callMessage])
    scrollViewRef.current?.scrollToEnd({ animated: true })
    
    // In a real app, this would integrate with calling services like Twilio, Agora, etc.
    console.log("Starting voice call with shelter...")
  }

  const handleVideoCall = () => {
    // Start video call functionality
    const videoCallMessage: Message = {
      id: Date.now().toString(),
      text: "📹 Video call initiated with Happy Paws Shelter",
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, videoCallMessage])
    scrollViewRef.current?.scrollToEnd({ animated: true })
    
    // In a real app, this would integrate with video calling services
    console.log("Starting video call with shelter...")
  }

  const handleAttachFile = () => {
    // Handle file attachment - photos, documents, etc.
    const attachMessage: Message = {
      id: Date.now().toString(),
      text: "📎 File attachment feature - you can upload photos, documents, or medical records here",
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, attachMessage])
    scrollViewRef.current?.scrollToEnd({ animated: true })
    
    // In a real app, this would open file picker or camera
    console.log("Opening file attachment options...")
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
        title={shelterName} 
        showBackButton={true}
        backButtonAction={() => navigation?.goBack()}
      />
      
      {petName && (
        <View style={styles.contextBanner}>
          <Ionicons name="paw" size={16} color={colors.primary} />
          <Text style={styles.contextBannerText}>Inquiring about: <Text style={{fontWeight: 'bold'}}>{petName}</Text></Text>
        </View>
      )}
      
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
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => handleScheduleVisit()}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.quickActionText}>Schedule Visit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => handleViewApplication()}
        >
          <Ionicons name="document-text-outline" size={16} color={colors.primary} />
          <Text style={styles.quickActionText}>Application</Text>
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
    backgroundColor: "#F9F9F9",
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  contextBanner: {
    backgroundColor: "#E8F4FD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#B9DCF4",
  },
  contextBannerText: {
    marginLeft: 6,
    color: colors.primary,
    fontSize: 14,
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
  }
})
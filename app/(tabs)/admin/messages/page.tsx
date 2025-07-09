import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { addMessage, getMessages, getPetById, type Message } from '@/lib/data';

interface ConversationSummary {
  petId: string;
  petName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  adopterName: string;
  adopterId: string;
  petImage?: string;
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [quickReplyModalVisible, setQuickReplyModalVisible] = useState(false);

  const { user } = useAuth();
  
  const loadConversations = useCallback(async () => {
    try {
      const allMessages = await getMessages();
      
      // Group messages by petId
      const conversationMap = new Map<string, ConversationSummary>();
      
      for (const message of allMessages) {
        const pet = await getPetById(message.petId);
        if (!pet) continue;
        
        const existing = conversationMap.get(message.petId);
        
        if (!existing) {
          conversationMap.set(message.petId, {
            petId: message.petId,
            petName: pet.name,
            lastMessage: message.message,
            lastMessageTime: message.timestamp,
            unreadCount: message.senderType === "adopter" && !message.read ? 1 : 0,
            adopterName: message.senderType === "adopter" ? message.senderName : "Unknown Adopter",
            adopterId: message.senderType === "adopter" ? message.senderId : "unknown",
            petImage: pet.images && pet.images.length > 0 ? pet.images[0] : undefined,
          });
        } else {
          // Update with latest message
          if (new Date(message.timestamp).getTime() > new Date(existing.lastMessageTime).getTime()) {
            existing.lastMessage = message.message;
            existing.lastMessageTime = message.timestamp;
          }
          
          // Count unread messages from adopters
          if (message.senderType === "adopter" && !message.read) {
            existing.unreadCount++;
          }
          
          // Update adopter info if this message is from adopter
          if (message.senderType === "adopter") {
            existing.adopterName = message.senderName;
            existing.adopterId = message.senderId;
          }
        }
      }
      
      const conversationList = Array.from(conversationMap.values()).sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
      
      setConversations(conversationList);
      setLoading(false);
      
      // Auto-select first conversation if none selected
      if (conversationList.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationList[0].petId);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setLoading(false);
    }
  }, [selectedConversation]);
  
  const loadMessages = useCallback(async (petId: string) => {
    try {
      const petMessages = await getMessages(petId);
      setMessages(petMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, []);
  
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);
  
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation, loadMessages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const message = await addMessage({
        petId: selectedConversation,
        senderId: user?.id || "admin",
        senderName: user?.shelterName || "Shelter Admin",
        senderType: "admin",
        message: newMessage,
      });
      
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      
      // Update conversation list
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const selectQuickReply = (reply: string) => {
    setNewMessage(reply);
    setQuickReplyModalVisible(false);
  };
  
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.adopterName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedConv = conversations.find((c) => c.petId === selectedConversation);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A47" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Header
        title="Messages"
        subtitle={selectedConversation ? selectedConv?.petName : undefined}
        showBackButton={!!selectedConversation}
        backHref={selectedConversation ? undefined : "/admin/dashboard"}
        userType="admin"
      />
      
      <View style={styles.content}>
        {!selectedConversation ? (
          // Conversations List View
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Feather name="search" size={16} color="#8B4513" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conversations..."
                placeholderTextColor="#8B4513"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            {/* Conversations List */}
            <FlatList
              data={filteredConversations}
              keyExtractor={(item) => item.petId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.conversationCard}
                  onPress={() => setSelectedConversation(item.petId)}
                  activeOpacity={0.7}
                >
                  <View style={styles.conversationContent}>
                    <View style={styles.avatarContainer}>
                      {item.petImage ? (
                        <Image
                          source={{ uri: item.petImage }}
                          style={styles.avatar}
                          defaultSource={require('../../../../assets/images/favicon.png')}
                        />
                      ) : (
                        <View style={[styles.avatar, styles.placeholderAvatar]}>
                          <Text style={styles.placeholderText}>{item.petName[0]}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.conversationDetails}>
                      <View style={styles.conversationHeader}>
                        <Text style={styles.petName} numberOfLines={1}>
                          {item.petName}
                        </Text>
                        <View style={styles.timestampContainer}>
                          {item.unreadCount > 0 && (
                            <View style={styles.badgeContainer}>
                              <Text style={styles.badgeText}>{item.unreadCount}</Text>
                            </View>
                          )}
                          <Text style={styles.timestamp}>{item.lastMessageTime}</Text>
                        </View>
                      </View>
                      <Text style={styles.adopterName} numberOfLines={1}>
                        with {item.adopterName}
                      </Text>
                      <Text style={styles.lastMessage} numberOfLines={2}>
                        {item.lastMessage}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={[
                styles.conversationsList,
                filteredConversations.length === 0 && styles.emptyListContainer
              ]}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="message-circle" size={64} color="#E8E8E8" />
                  <Text style={styles.emptyTitle}>No conversations found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? "Try adjusting your search" : "No messages yet"}
                  </Text>
                </View>
              }
            />
          </>
        ) : (
          // Chat View
          <>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedConversation(null)}
              >
                <Feather name="arrow-left" size={20} color="#8B4513" />
              </TouchableOpacity>
              <View style={styles.chatHeaderInfo}>
                <Text style={styles.chatHeaderTitle}>{selectedConv?.petName}</Text>
                <Text style={styles.chatHeaderSubtitle}>with {selectedConv?.adopterName}</Text>
              </View>
            </View>
            
            {/* Messages */}
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[
                  styles.messageContainer,
                  item.senderType === "admin" ? styles.sentMessage : styles.receivedMessage
                ]}>
                  <View style={[
                    styles.messageBubble,
                    item.senderType === "admin" ? styles.sentBubble : styles.receivedBubble
                  ]}>
                    <Text style={[
                      styles.messageText,
                      item.senderType === "admin" ? styles.sentMessageText : styles.receivedMessageText
                    ]}>
                      {item.message}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>{item.timestamp}</Text>
                </View>
              )}
              inverted
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
            />
            
            {/* Message Input */}
            <View style={styles.inputContainer}>
              <TouchableOpacity 
                style={styles.quickRepliesButton}
                onPress={() => setQuickReplyModalVisible(true)}
              >
                <Feather name="list" size={20} color="#FF7A47" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor="#8B4513"
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  !newMessage.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Feather name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Quick Replies Modal */}
            <Modal
              visible={quickReplyModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setQuickReplyModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Quick Replies</Text>
                    <TouchableOpacity onPress={() => setQuickReplyModalVisible(false)}>
                      <Feather name="x" size={24} color="#8B4513" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={[
                      "Thank you for your interest! We'd love to schedule a meet and greet.",
                      "Could you tell us more about your living situation?",
                      "We'll need to review your application and get back to you within 24 hours.",
                      "Feel free to ask any questions about the pet's care requirements.",
                      "The adoption fee for this pet is $250, which includes vaccinations and microchipping.",
                      "This pet requires special care. Are you prepared for that responsibility?",
                      "Would you like to arrange a video call to see the pet?",
                      "Your application looks great! The next step is a home visit."
                    ]}
                    keyExtractor={(item, index) => `quick-reply-${index}`}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.quickReplyItem}
                        onPress={() => selectQuickReply(item)}
                      >
                        <Feather name="corner-down-right" size={16} color="#FF7A47" style={styles.quickReplyIcon} />
                        <Text style={styles.quickReplyText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
      
      {!selectedConversation && <Navigation userType="admin" />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#8B4513',
    fontSize: 16,
  },
  conversationsList: {
    paddingBottom: 20,
  },
  conversationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  conversationContent: {
    flexDirection: 'row',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFB899',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  placeholderAvatar: {
    backgroundColor: '#FFB899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    flex: 1,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#FF7A47',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#8B4513',
  },
  adopterName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#8B4513',
    lineHeight: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
  },
  chatHeaderInfo: {
    marginLeft: 8,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  chatHeaderSubtitle: {
    fontSize: 14,
    color: '#8B4513',
  },
  messagesList: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sentBubble: {
    backgroundColor: '#FF7A47',
  },
  receivedBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessageText: {
    color: '#8B4513',
  },
  messageTime: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    borderRadius: 8,
    marginTop: 8,
  },
  quickRepliesButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    color: '#8B4513',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7A47',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
  },
  quickReplyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  quickReplyIcon: {
    marginRight: 12,
  },
  quickReplyText: {
    fontSize: 16,
    color: '#8B4513',
    flex: 1,
  },
});
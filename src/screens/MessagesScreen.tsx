import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';

interface Message {
  id: string;
  petName: string;
  shelterName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  petImage: string;
}

interface MessagesScreenProps {
  navigation: any;
}

const mockMessages: Message[] = [
  {
    id: "1",
    petName: "Buddy",
    shelterName: "Happy Paws Shelter",
    lastMessage: "Thank you for your interest in Buddy! We'd love to schedule a meet and greet.",
    timestamp: "2 hours ago",
    unread: true,
    petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    petName: "Luna",
    shelterName: "Feline Friends Rescue",
    lastMessage: "Your application has been approved! When would you like to pick up Luna?",
    timestamp: "1 day ago",
    unread: true,
    petImage: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    petName: "Max",
    shelterName: "Austin Animal Center",
    lastMessage: "We received your application and will review it within 2-3 business days.",
    timestamp: "3 days ago",
    unread: false,
    petImage: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=100&h=100&fit=crop",
  },
];

export default function MessagesScreen({ navigation }: MessagesScreenProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = messages.filter(
    (message) =>
      message.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.shelterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter((m) => m.unread).length;

  const handleMessagePress = (messageId: string, shelterName: string) => {
    navigation.navigate("ChatWithShelter", {
      shelterId: shelterName,
      petId: messageId
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>{unreadCount} unread messages</Text>
      </View>

      <View style={styles.content}>
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

        {/* Messages List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          {filteredMessages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={styles.messageCard}
              onPress={() => handleMessagePress(message.id, message.shelterName)}
              activeOpacity={0.8}
            >
              <View style={styles.messageContent}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: message.petImage }}
                    style={styles.avatar}
                  />
                </View>
                <View style={styles.messageDetails}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.petName} numberOfLines={1}>
                      {message.petName}
                    </Text>
                    <View style={styles.timestampContainer}>
                      {message.unread && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>New</Text>
                        </View>
                      )}
                      <Text style={styles.timestamp}>{message.timestamp}</Text>
                    </View>
                  </View>
                  <Text style={styles.shelterName} numberOfLines={1}>
                    {message.shelterName}
                  </Text>
                  <Text style={styles.lastMessage} numberOfLines={2}>
                    {message.lastMessage}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredMessages.length === 0 && (
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={64} color="#E8E8E8" />
              <Text style={styles.emptyTitle}>No messages found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? "Try adjusting your search" : "Your conversations will appear here"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  header: {
    backgroundColor: '#FF7A47',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
  },
  scrollView: {
    flex: 1,
  },
  messagesList: {
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  messageContent: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8E8E8',
  },
  messageDetails: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    flex: 1,
    marginRight: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: '#FF7A47',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  shelterName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#8B4513',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
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
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

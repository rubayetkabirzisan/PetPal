"use client"

import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import NavigationHeader from '../../components/NavigationHeader';

interface SimpleHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  navigation: any;
}

// Custom header component with back button
const SimpleHeader = ({ title, subtitle, showBackButton, navigation }: SimpleHeaderProps) => {
  return (
    <View style={headerStyles.container}>
      {showBackButton && (
        <TouchableOpacity style={headerStyles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#8B4513" />
        </TouchableOpacity>
      )}
      <View style={headerStyles.titleContainer}>
        <Text style={headerStyles.title}>{title}</Text>
        {subtitle && <Text style={headerStyles.subtitle}>{subtitle}</Text>}
      </View>
      <TouchableOpacity style={headerStyles.notificationButton}>
        <Feather name="bell" size={24} color="#8B4513" />
        <View style={headerStyles.notificationBadge}>
          <Text style={headerStyles.notificationBadgeText}>2</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF5F0',
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B4513',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF7A47',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

interface Message {
  id: string;
  shelterName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  shelterImage: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    shelterName: "Happy Paws Shelter",
    lastMessage: "Thank you for your interest in our available pets! We'd love to schedule a meet and greet.",
    timestamp: "2 hours ago",
    unread: true,
    shelterImage: "https://images.unsplash.com/photo-1518176258769-f227c798150e?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    shelterName: "Feline Friends Rescue",
    lastMessage: "Your application has been approved! When would you like to visit our shelter?",
    timestamp: "1 day ago",
    unread: true,
    shelterImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    shelterName: "Austin Animal Center",
    lastMessage: "We received your application and will review it within 2-3 business days.",
    timestamp: "3 days ago",
    unread: false,
    shelterImage: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=100&h=100&fit=crop",
  },
];

interface MessagesScreenProps {
  navigation: any;
}

export default function MessagesScreen({ navigation }: MessagesScreenProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = messages.filter(
    (message) =>
      message.shelterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter((m) => m.unread).length;

  const handleMessagePress = (messageId: string) => {
    const selectedMessage = messages.find(message => message.id === messageId);
    if (selectedMessage) {
      navigation.navigate("Chat", { 
        messageId,
        shelterName: selectedMessage.shelterName,
        shelterImage: selectedMessage.shelterImage
      });
    }
  };

  return (
    <View style={styles.container}>
      <NavigationHeader
        title="Messages"
        showBackButton={true}
      />

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
              onPress={() => handleMessagePress(message.id)}
              activeOpacity={0.8}
            >
              <View style={styles.messageContent}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: message.shelterImage }}
                    style={styles.avatar}
                    defaultSource={{ uri: '../../assets/images/favicon.png' }}
                  />
                </View>
                <View style={styles.messageDetails}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.shelterNameTitle} numberOfLines={1}>
                      {message.shelterName}
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
    </View>
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
    paddingTop: 16,
    paddingBottom: 80,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 12,
    marginBottom: 24,
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
  scrollView: {
    flex: 1,
  },
  messagesList: {
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
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
  messageContent: {
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
  messageDetails: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shelterNameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    flex: 1,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: '#FF7A47',
    marginRight: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#8B4513',
  },
  shelterName: {
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
    color: '#8B4513',
    textAlign: 'center',
  },
});
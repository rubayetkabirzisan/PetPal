"use client"

import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import NavigationHeader from '../components/NavigationHeader';

interface SimpleHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  navigation: any;
}

// Custom header component with back button
const SimpleHeader = ({ title, subtitle, showBackButton, navigation }: SimpleHeaderProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const headerStyles = getHeaderStyles(colors);

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

const getHeaderStyles = (colors: any) => StyleSheet.create({
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

import { useAuth } from '../contexts/AuthContext';
import { API } from '../config/api';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from "../contexts/ThemeContext";

interface Conversation {
  id: string; // The OTHER user's ID
  name: string;
  userType: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  unreadCount: number;
  petName?: string;
}

interface MessagesScreenProps {
  navigation: any;
}

export default function MessagesScreen({ navigation }: MessagesScreenProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);

  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConversations = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(API.messages.conversations(user.id));
      setConversations(res.data);
    } catch (err) {
      console.error("Error fetching conversations", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }, [user?.id])
  );

  const filteredConversations = conversations.filter(
    (conv) => (conv.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleMessagePress = (otherUserId: string, name: string, petId?: string, petName?: string) => {
    navigation.navigate("Chat", { 
      otherUserId,
      shelterName: name,
      petId,
      petName
    });
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
          {filteredConversations.map((message) => (
            <TouchableOpacity
              key={`${message.id}_${message.petId || 'general'}`}
              style={styles.messageCard}
              onPress={() => handleMessagePress(message.id, message.name, message.petId, message.petName)}
              activeOpacity={0.8}
            >
              <View style={styles.messageContent}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop" }}
                    style={styles.avatar}
                    defaultSource={require('../../assets/images/favicon.png')}
                  />
                </View>
                <View style={styles.messageDetails}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.shelterNameTitle} numberOfLines={1}>
                      {message.name}
                    </Text>
                    <View style={styles.timestampContainer}>
                      {message.unread && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>{message.unreadCount} New</Text>
                        </View>
                      )}
                      <Text style={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </View>
                  {message.petName && (
                    <Text style={{fontSize: 12, color: '#FF7A47', marginBottom: 2, fontWeight: '500'}}>
                      Inquiring about: {message.petName}
                    </Text>
                  )}
                  <Text style={styles.lastMessage} numberOfLines={2}>
                    {message.lastMessage}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredConversations.length === 0 && (
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

const getStyles = (colors: any) => StyleSheet.create({
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: colors.text,
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

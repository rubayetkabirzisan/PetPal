import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TabsLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  
  // This is a placeholder to show active notifications as simple numbers
  const getNotificationBadge = (count: number) => {
    return count > 0 ? count : undefined;
  };

  if (isAdmin) {
    // Admin tabs navigation
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.outline,
          tabBarStyle: { 
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="admin/dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="admin/pets"
          options={{
            title: 'Pets',
            tabBarIcon: ({ color }) => <Ionicons name="paw" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="admin/applications"
          options={{
            title: 'Applications',
            tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />,
            tabBarBadge: getNotificationBadge(3),
          }}
        />
        <Tabs.Screen
          name="admin/messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
            tabBarBadge: getNotificationBadge(5),
          }}
        />
        <Tabs.Screen
          name="admin/lost-pets"
          options={{
            title: 'Lost Pets',
            tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
          }}
        />
      </Tabs>
    );
  }

  // Default adopter tabs navigation
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: { 
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="adopter/dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="adopter/browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="adopter/applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />,
          tabBarBadge: getNotificationBadge(1),
        }}
      />
      <Tabs.Screen
        name="adopter/messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
          tabBarBadge: getNotificationBadge(2),
        }}
      />
      <Tabs.Screen
        name="adopter/care-journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="demo"
        options={{
          title: 'Demo',
          tabBarIcon: ({ color }) => <Ionicons name="flask" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          headerShown: false
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 2,
    right: -6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
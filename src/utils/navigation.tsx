import { Ionicons } from '@expo/vector-icons';
import React from 'react';

// Type definition for tab bar icon props
export type TabBarIconProps = {
  color: string;
  size?: number;
};

// Helper function to create tab bar icons
export const createTabIcon = (name: any) => {
  return ({ color, size = 24 }: TabBarIconProps) => {
    return <Ionicons name={name} size={size} color={color} />;
  };
};

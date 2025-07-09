import { Ionicons } from "@expo/vector-icons";
import { getGPSAlerts } from "@lib/gps-tracking";
import { getLostPets } from "@lib/lost-pets";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NavigationProps {
  userType: "adopter" | "admin";
}

/**
 * Bottom tab navigation component for the PetPal app
 */
export function Navigation({ userType }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [lostPetsCount, setLostPetsCount] = useState(0);
  const [gpsAlertsCount, setGpsAlertsCount] = useState(0);

  useEffect(() => {
    // Get notification counts
    const loadNotificationCounts = async () => {
      try {
        const lostPets = await getLostPets();
        const activeLostPets = lostPets.filter((pet) => pet.status === "lost");
        setLostPetsCount(activeLostPets.length);

        const gpsAlerts = await getGPSAlerts();
        const activeAlerts = gpsAlerts.filter((alert) => !alert.acknowledged);
        setGpsAlertsCount(activeAlerts.length);
      } catch (error) {
        console.error("Error loading notification counts:", error);
      }
    };

    loadNotificationCounts();
  }, []);

  // Navigation items for adopters
  const adopterNavItems = [
    {
      href: "/(tabs)/adopter/dashboard",
      icon: "home-outline",
      activeIcon: "home",
      label: "Home",
      badge: null,
    },
    {
      href: "/(tabs)/adopter/browse",
      icon: "search-outline",
      activeIcon: "search",
      label: "Browse",
      badge: null,
    },
    {
      href: "/(tabs)/adopter/lost-pets",
      icon: "warning-outline",
      activeIcon: "warning",
      label: "Lost Pets",
      badge: lostPetsCount > 0 ? lostPetsCount : null,
    },
    {
      href: "/(tabs)/adopter/applications", // Assuming this is the closest equivalent
      icon: "shield-outline",
      activeIcon: "shield",
      label: "Tracking",
      badge: gpsAlertsCount > 0 ? gpsAlertsCount : null,
    },
    {
      href: "/(tabs)/adopter/certificates", // Using certificates as profile equivalent
      icon: "person-outline",
      activeIcon: "person",
      label: "Profile",
      badge: null,
    },
  ];

  // Navigation items for admins
  const adminNavItems = [
    {
      href: "/(tabs)/admin/dashboard",
      icon: "home-outline",
      activeIcon: "home",
      label: "Home",
      badge: null,
    },
    {
      href: "/(tabs)/admin/pets",
      icon: "heart-outline",
      activeIcon: "heart",
      label: "Pets",
      badge: null,
    },
    {
      href: "/(tabs)/admin/lost-pets",
      icon: "warning-outline",
      activeIcon: "warning",
      label: "Lost Pets",
      badge: lostPetsCount > 0 ? lostPetsCount : null,
    },
    {
      href: "/(tabs)/admin/messages", // Using messages as GPS tracking equivalent
      icon: "shield-outline",
      activeIcon: "shield",
      label: "GPS",
      badge: gpsAlertsCount > 0 ? gpsAlertsCount : null,
    },
    {
      href: "/(tabs)/admin/applications", // Using applications as verification equivalent
      icon: "location-outline",
      activeIcon: "location",
      label: "Verify",
      badge: null,
    },
  ];

  const navItems = userType === "adopter" ? adopterNavItems : adminNavItems;

  return (
    <View style={styles.navContainer}>
      <View style={styles.innerContainer}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const iconName = isActive ? item.activeIcon : item.icon;

          return (
            <TouchableOpacity
              key={item.href}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => router.push(item.href as any)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={iconName as any}
                  size={22}
                  color={isActive ? "#FF7A47" : "#8B4513"}
                />
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.badge > 9 ? "9+" : item.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    zIndex: 50,
    paddingBottom: 4, // Adjust for safe area on newer iPhones
  },
  innerContainer: {
    maxWidth: 500,
    marginHorizontal: "auto",
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: "#FFF5F0",
  },
  iconWrapper: {
    position: "relative",
    marginBottom: 4,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF4136",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  activeLabel: {
    color: "#FF7A47",
  },
  inactiveLabel: {
    color: "#8B4513",
  },
});

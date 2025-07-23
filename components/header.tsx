import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Link, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  userType?: "adopter" | "admin";
  showBackButton?: boolean;
  backHref?: string;
}

export function Header({
  title = "PetPal",
  subtitle,
  showNotifications = false,
  userType = "adopter",
  showBackButton = false,
  backHref,
}: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  // Add React Navigation for more reliable navigation
  const navigation = useNavigation();

  // Determine home path based on user type
  const homePath = userType === "admin" ? "/(tabs)/admin/dashboard" : "/(tabs)/adopter/dashboard";

  // Determine if we should show home button (not on dashboard pages and landing page)
  const showHomeButton = !pathname?.includes("/dashboard") && pathname !== "/";

  // Determine if we should show landing page button (only on dashboard pages)
  const showLandingButton = pathname?.includes("/dashboard");
  
  // Safe navigation back function
  const handleGoBack = () => {
    try {
      // Try React Navigation first as it's more reliable
      if (navigation) {
        navigation.goBack();
      } else if (backHref && router) {
        // Fall back to Expo Router if needed
        router.push(backHref as any);
      } else if (router) {
        // Last resort
        router.back();
      }
    } catch (error) {
      console.warn("Navigation error:", error);
    }
  };

  useEffect(() => {
    // Mock notification count - in real app, this would come from API
    setNotificationCount(3);
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {/* Back Button, Home Button, or Landing Button */}
          {showBackButton ? (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleGoBack}
            >
              <Ionicons name="arrow-back" size={24} color="#8B4513" />
            </TouchableOpacity>
          ) : showHomeButton ? (
            <Link href={homePath as any} asChild>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="home" size={24} color="#8B4513" />
              </TouchableOpacity>
            </Link>
          ) : showLandingButton ? (
            <Link href="/" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="heart" size={24} color="#FF7A47" />
              </TouchableOpacity>
            </Link>
          ) : null}

          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        <View style={styles.rightSection}>
          {showNotifications && (
            <View style={styles.notificationContainer}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => {
                  const path = userType === "admin" ? "/admin/notifications" : "/adopter/notifications";
                  router.push(path as any);
                }}
              >
                <Ionicons name="notifications" size={22} color="#8B4513" />
                {notificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 9 ? "9+" : notificationCount.toString()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {user && (
            <View style={styles.userContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    zIndex: 10,
  },
  container: {
    maxWidth: 500,
    marginHorizontal: "auto",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    position: "relative",
  },
  notificationContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF7A47",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: "#FFB899",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4513",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  subtitle: {
    fontSize: 12,
    color: "#8B4513",
  },
});

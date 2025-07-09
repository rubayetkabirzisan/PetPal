import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function LandingPage() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [showUserSelection, setShowUserSelection] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;
  
  // Floating hearts animations
  const floatingHeart1 = useRef(new Animated.Value(0)).current;
  const floatingHeart2 = useRef(new Animated.Value(0)).current;
  const floatingHeart3 = useRef(new Animated.Value(0)).current;
  const bounceDots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ];

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Main logo bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -20,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ])
      ),
      // Heart pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(heartPulse, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(heartPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
      // Floating hearts
      Animated.loop(
        Animated.timing(floatingHeart1, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(floatingHeart2, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
          delay: 300,
        })
      ),
      Animated.loop(
        Animated.timing(floatingHeart3, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
          delay: 600,
        })
      ),
      // Text fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Bouncing dots
      ...bounceDots.map((dot, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -10,
              duration: 500,
              useNativeDriver: true,
              delay: index * 200,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 500,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
          ])
        )
      ),
    ]).start();

    // Show animation for 3 seconds then transition to user selection
    const timer = setTimeout(() => {
      setShowAnimation(false);
      setShowUserSelection(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleUserTypeSelection = (userType: "adopter" | "admin") => {
    if (userType === "adopter") {
      router.push("/(tabs)/adopter/dashboard" as any);
    } else {
      router.push("/(tabs)/admin/dashboard" as any);
    }
  };

  // Floating heart opacity and scale interpolation
  const getHeartAnimatedStyle = (anim: Animated.Value) => {
    const opacity = anim.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0, 1, 0],
    });

    return {
      opacity,
      transform: [
        {
          scale: anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 1, 0.3],
          }),
        },
      ],
    };
  };

  if (showAnimation) {
    return (
      <SafeAreaView style={styles.animationContainer}>
        <View style={styles.center}>
          {/* Animated Logo */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoCircle,
                { transform: [{ translateY: bounceAnim }] },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: heartPulse }] }}>
                <Ionicons name="heart" size={64} color="#FF7A47" />
              </Animated.View>
            </Animated.View>

            {/* Floating hearts */}
            <Animated.View
              style={[
                styles.floatingHeart1,
                getHeartAnimatedStyle(floatingHeart1),
              ]}
            >
              <Ionicons name="heart" size={16} color="#FF7A47" />
            </Animated.View>

            <Animated.View
              style={[
                styles.floatingHeart2,
                getHeartAnimatedStyle(floatingHeart2),
              ]}
            >
              <Ionicons name="heart" size={12} color="#FF7A47" />
            </Animated.View>

            <Animated.View
              style={[
                styles.floatingHeart3,
                getHeartAnimatedStyle(floatingHeart3),
              ]}
            >
              <Ionicons name="heart" size={20} color="#FF7A47" />
            </Animated.View>
          </View>

          {/* Animated Text */}
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
              PetPal
            </Animated.Text>
            <Animated.Text
              style={[
                styles.subtitle,
                { opacity: fadeAnim },
              ]}
            >
              Connecting Hearts, Creating Families
            </Animated.Text>

            {/* Bouncing dots */}
            <View style={styles.dotsContainer}>
              {bounceDots.map((dot, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    { transform: [{ translateY: dot }] },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (showUserSelection) {
    return (
      <SafeAreaView style={styles.selectionContainer}>
        <View style={styles.selectionContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLogoContainer}>
              <Ionicons name="heart" size={40} color="white" />
            </View>
            <Text style={styles.headerTitle}>Welcome to PetPal</Text>
            <Text style={styles.headerSubtitle}>Choose how you'd like to continue</Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={[styles.card, styles.cardElevated]}
              onPress={() => handleUserTypeSelection("adopter")}
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="search" size={32} color="white" />
                </View>
                <Text style={styles.cardTitle}>I'm Looking to Adopt</Text>
                <Text style={styles.cardDescription}>
                  Find your perfect pet companion and start your adoption journey
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.cardElevated]}
              onPress={() => handleUserTypeSelection("admin")}
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="people" size={32} color="white" />
                </View>
                <Text style={styles.cardTitle}>I'm a Shelter/Foster</Text>
                <Text style={styles.cardDescription}>
                  Manage pets, applications, and help find loving homes
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Every pet deserves a loving home 🐾</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  // Animation screen styles
  animationContainer: {
    flex: 1,
    backgroundColor: "#FF7A47",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    position: "relative",
    width: 128,
    height: 128,
    marginBottom: 32,
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  floatingHeart1: {
    position: "absolute",
    top: -16,
    left: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeart2: {
    position: "absolute",
    top: -8,
    right: -24,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeart3: {
    position: "absolute",
    bottom: -16,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },

  // Selection screen styles
  selectionContainer: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  selectionContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "center",
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  headerLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF7A47",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#8B4513",
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    overflow: "hidden",
  },
  cardElevated: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 32,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF7A47",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 14,
    color: "#8B4513",
    textAlign: "center",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "rgba(139, 69, 19, 0.7)",
  },
});

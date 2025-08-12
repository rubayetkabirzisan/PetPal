import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { colors } from "../theme/theme"

import AdminDashboardScreen from "../screens/AdminDashboardScreen"
import AdminGPSTrackingScreen from "../screens/AdminGPSTrackingScreen"
import AdminLostPetsScreen from "../screens/AdminLostPetsScreen"
import AdopterVerificationScreen from "../screens/AdopterVerificationScreen"
import ManagePetsScreen from "../screens/ManagePetsScreen"

const Tab = createBottomTabNavigator()

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Pets") {
            iconName = focused ? "heart" : "heart-outline"
          } else if (route.name === "LostPets") {
            iconName = focused ? "alert-circle" : "alert-circle-outline"
          } else if (route.name === "GPS") {
            iconName = focused ? "shield" : "shield-outline"
          } else if (route.name === "Verify") {
            iconName = focused ? "checkmark-circle" : "checkmark-circle-outline"
          } else {
            iconName = "home-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false, // Hide headers to use custom NavigationHeader component
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: "Home", headerShown: false }} />
      <Tab.Screen name="Pets" component={ManagePetsScreen} options={{ title: "Pets", headerShown: false }} />
      <Tab.Screen name="LostPets" component={AdminLostPetsScreen} options={{ title: "Lost Pets", headerShown: false }} />
      <Tab.Screen name="GPS" component={AdminGPSTrackingScreen} options={{ title: "GPS", headerShown: false }} />
      <Tab.Screen name="Verify" component={AdopterVerificationScreen} options={{ title: "Verify", headerShown: false }} />
    </Tab.Navigator>
  )
}

import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { colors } from "../theme/theme"

import AdopterDashboardScreen from "../screens/AdopterDashboardScreen"
import AdopterProfileScreen from "../screens/AdopterProfileScreen"
import BrowsePetsScreen from "../screens/BrowsePetsScreen"
import GPSTrackingScreen from "../screens/GPSTrackingScreen"
import LostPetsScreen from "../screens/LostPetsScreen"
import MessagesScreen from "../screens/MessagesScreen"

const Tab = createBottomTabNavigator()

export default function AdopterTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Browse") {
            iconName = focused ? "search" : "search-outline"
          } else if (route.name === "Messages") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "LostPets") {
            iconName = focused ? "alert-circle" : "alert-circle-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
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
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdopterDashboardScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Browse" component={BrowsePetsScreen} options={{ title: "Browse" }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: "Messages" }} />
      <Tab.Screen name="LostPets" component={LostPetsScreen} options={{ title: "Lost Pets" }} />
      <Tab.Screen name="Profile" component={AdopterProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  )
}

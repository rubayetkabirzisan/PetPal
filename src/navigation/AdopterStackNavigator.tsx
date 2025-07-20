import { createStackNavigator } from "@react-navigation/stack"
import { colors } from "../theme/theme"

import ApplicationDetailsScreen from "../screens/ApplicationDetailsScreen"
import ApplicationFormScreen from "../screens/ApplicationFormScreen"
import ApplicationListScreen from "../screens/ApplicationListScreen"
import ChatScreen from "../screens/ChatScreen"
import PetProfileScreen from "../screens/PetProfileScreen"
import AdopterTabNavigator from "./AdopterTabNavigator"

const Stack = createStackNavigator()

export default function AdopterStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="AdopterTabs" component={AdopterTabNavigator} />
      <Stack.Screen name="PetProfile" component={PetProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ApplicationForm" component={ApplicationFormScreen} />
      <Stack.Screen name="ApplicationDetails" component={ApplicationDetailsScreen} />
      <Stack.Screen name="ApplicationList" component={ApplicationListScreen} />
    </Stack.Navigator>
  )
}

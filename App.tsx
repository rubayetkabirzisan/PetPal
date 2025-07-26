import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { Provider as PaperProvider } from "react-native-paper"
import { AuthProvider } from "./src/contexts/AuthContext"
import AdminTabNavigator from "./src/navigation/AdminTabNavigator"
import AdopterTabNavigator from "./src/navigation/AdopterTabNavigator"
import AdoptionHistoryScreen from "./src/screens/AdoptionHistoryScreen"
import ApplicationDetailsScreen from "./src/screens/ApplicationDetailsScreen"
import ApplicationFormScreen from "./src/screens/ApplicationFormScreen"
import ApplicationListScreen from "./src/screens/ApplicationListScreen"
import ApplicationTrackerScreen from "./src/screens/ApplicationTrackerScreen"
import AuthScreen from "./src/screens/AuthScreen"
import CareJournalScreen from "./src/screens/CareJournalScreen"
import ChatScreen from "./src/screens/ChatScreen"
import LandingScreen from "./src/screens/LandingScreen"
import MessagesScreen from "./src/screens/MessagesScreen"
import ModernApplicationListScreen from "./src/screens/ModernApplicationListScreen"
import PetLocationScreen from "./src/screens/PetLocationScreen"
import PetProfileScreen from "./src/screens/PetProfileScreen"
import RemindersScreen from "./src/screens/RemindersScreen"
import ReportLostPetScreen from "./src/screens/ReportLostPetScreen"
import SafeZoneScreen from "./src/screens/SafeZoneScreen"
import { theme } from "./src/theme/theme"

const Stack = createStackNavigator()

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="AdopterTabs" component={AdopterTabNavigator} />
            <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
            <Stack.Screen
              name="PetProfile"
              component={PetProfileScreen}
              options={{ headerShown: true, title: "Pet Profile" }}
            />
            <Stack.Screen
              name="ApplicationForm"
              component={ApplicationFormScreen}
              options={{ headerShown: true, title: "Adoption Application" }}
            />
            <Stack.Screen
              name="ApplicationList"
              component={ApplicationDetailsScreen}
              options={{ headerShown: true, title: "Your Applications" }}
            />
            <Stack.Screen
              name="DummyApplicationList"
              component={ApplicationListScreen}
              options={{ headerShown: true, title: "Your Applications (Demo)" }}
            />
            <Stack.Screen
              name="ModernApplicationList"
              component={ModernApplicationListScreen}
              options={{ headerShown: false, title: "Your Applications" }}
            />
            <Stack.Screen
              name="ApplicationTracker"
              component={ApplicationTrackerScreen}
              options={{ headerShown: true, title: "Track Application" }}
            />
            <Stack.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AdoptionHistory" component={AdoptionHistoryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Reminders" component={RemindersScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: "Chat" }} />
            <Stack.Screen name="CareJournal" component={CareJournalScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="ReportLostPet" 
              component={ReportLostPetScreen} 
              options={{ headerShown: true, title: "Report Lost Pet" }}
            />
            <Stack.Screen 
              name="PetMap" 
              component={PetLocationScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SafeZone" 
              component={SafeZoneScreen} 
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  )
}

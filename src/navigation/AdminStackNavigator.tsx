import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import EditPetScreen from "../screens/EditPetScreen";
import ManagePetsScreen from "../screens/ManagePetsScreen";
import PetProfileScreen from "../screens/PetProfileScreen";

const Stack = createStackNavigator();

export default function AdminStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ManagePets" component={ManagePetsScreen} options={{ title: "Manage Pets" }} />
      <Stack.Screen name="EditPet" component={EditPetScreen} options={{ title: "Edit Pet" }} />
      <Stack.Screen name="PetProfile" component={PetProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
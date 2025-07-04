import { Stack } from "expo-router";
import './global.css';

// NativeWind styles will be automatically applied through the babel plugin
export default function RootLayout() {
  return <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false
        }}
      />
    </Stack>;
}

#!/bin/bash
# Script to update all dependencies to be compatible with Expo SDK 54

echo "🔄 Updating dependencies to match Expo SDK 54..."

# Update packages (passing -- --force to npm)
npx expo install @expo/vector-icons@^15.0.2 \
@react-native-async-storage/async-storage@2.2.0 \
@react-native-community/datetimepicker@8.4.4 \
@react-native-community/slider@5.0.1 \
expo-blur@~15.0.7 \
expo-camera@~17.0.8 \
expo-constants@~18.0.8 \
expo-font@~14.0.8 \
expo-haptics@~15.0.7 \
expo-image@~3.0.8 \
expo-image-picker@~17.0.8 \
expo-linear-gradient@~15.0.7 \
expo-linking@~8.0.8 \
expo-location@~19.0.7 \
expo-notifications@~0.32.11 \
expo-router@~6.0.5 \
expo-sharing@~14.0.7 \
expo-splash-screen@~31.0.10 \
expo-status-bar@~3.0.8 \
expo-symbols@~1.0.7 \
expo-system-ui@~6.0.7 \
expo-web-browser@~15.0.7 \
react@19.1.0 \
react-dom@19.1.0 \
react-native@0.81.4 \
react-native-gesture-handler@~2.28.0 \
react-native-reanimated@~4.1.0 \
react-native-safe-area-context@~5.6.0 \
react-native-screens@~4.16.0 \
react-native-svg@15.12.1 \
react-native-web@^0.21.0 \
react-native-webview@13.15.0 -- --force

# Update dev dependencies
npm install --save-dev @types/react@~19.1.10 eslint-config-expo@~10.0.0 typescript@~5.9.2 --force

echo "✅ Dependencies updated successfully!"
echo "🧹 Running cleanup and cache reset..."
echo "⚠️ Remember to restart your development server with 'npx expo start --clear'"
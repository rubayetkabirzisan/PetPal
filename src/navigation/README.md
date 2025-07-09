# PetPal Navigation Components

This directory contains React Navigation components that can be used as an alternative to the current Expo Router-based navigation.

## Current Navigation Structure

The app currently uses **Expo Router** for navigation:
- `app/_layout.tsx` - Root Stack Navigator
- `app/(tabs)/_layout.tsx` - Tab Navigator with conditional rendering based on user type (admin/adopter)
- Individual screen files in the `app/` directory structure

## Alternative Tab Navigators

These files provide alternative React Navigation implementations that could replace or supplement the Expo Router tabs:

- `AdminTabNavigator.tsx` - Bottom tab navigator for the admin user flow
- `AdopterTabNavigator.tsx` - Bottom tab navigator for the adopter user flow

## How to Use These Navigators

To use these tab navigators instead of the current Expo Router tabs:

1. Modify `app/_layout.tsx` to remove the tab screen:
```tsx
// Remove or modify this screen
<Stack.Screen
  name="(tabs)"
  options={{
    headerShown: false
  }}
/>
```

2. Add a new screen to render these navigators:
```tsx
<Stack.Screen
  name="admin-tabs"
  component={AdminTabNavigator}
  options={{
    headerShown: false
  }}
/>

<Stack.Screen
  name="adopter-tabs"
  component={AdopterTabNavigator}
  options={{
    headerShown: false
  }}
/>
```

3. Update navigation logic to navigate to the appropriate tabs based on user type

## Notes

- These components depend on `@react-navigation/bottom-tabs` which is already installed in the project
- The components are fully configured with screens, icons, and styling
- The navigation is set up to match the existing app design and UX

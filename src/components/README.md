# NavigationHeader Component

This is a professional navigation header component for the PetPal application. It includes features like:

1. Customizable page title
2. Optional back button
3. Notification icon with badge counter
4. Profile icon for account access

## Usage

Import the component in your screen:

```typescript
import NavigationHeader from "../../components/NavigationHeader"
```

Then add it to your screen layout:

```typescript
<View style={styles.container}>
  <NavigationHeader 
    title="Page Title" 
    showBackButton={true} // Optional, defaults to false
    backButtonAction={() => customBackAction()} // Optional, uses navigation.goBack() by default
  />
  <View style={styles.content}>
    {/* Rest of your screen content */}
  </View>
</View>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | The title displayed in the header |
| showBackButton | boolean | No | false | Whether to show a back button |
| backButtonAction | function | No | navigation.goBack() | Custom back button action |

## Styling

The component uses the app's theme colors and adapts to both light and dark mode. The header automatically adjusts for iOS and Android platforms.

## Navigation

The component integrates with both React Navigation and Expo Router. It handles navigation to:

- Profile screens
- Notification screens

Based on the user type (admin or adopter).

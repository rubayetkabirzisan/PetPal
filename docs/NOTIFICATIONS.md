# PetPal Notifications

This project uses `expo-notifications` for push notifications and local notification management.

## Important Notes

### Expo Go Limitations
When running in Expo Go, you'll see warnings about limited notification functionality. This is expected and doesn't break the app:

```
ERROR  expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go with the release of SDK 53. Use a development build instead of Expo Go.
WARN  `expo-notifications` functionality is not fully supported in Expo Go
```

### What Works in Expo Go
- ✅ Local notifications (in-app notification list)
- ✅ Notification state management
- ✅ Badge counts and read/unread status
- ✅ All notification UI components

### What Requires Development Build
- ❌ Push notifications (background notifications)
- ❌ Notification sounds and badges when app is closed
- ❌ Background notification handling

## How It's Handled

The app includes proper fallback handling:

1. **Warning Suppression**: LogBox.ignoreLogs() suppresses expected warnings
2. **Graceful Degradation**: Functions detect Expo Go and adjust behavior
3. **Local Storage**: All notifications are stored locally and work regardless of push capability
4. **Error Handling**: Push notification failures are caught and logged gracefully

## For Production

To get full notification functionality in production:

1. Create a development build with `expo build` or EAS Build
2. Test on physical devices with the standalone app
3. Configure proper push notification certificates/keys for iOS/Android

## Code Structure

- `lib/notifications.ts` - Core notification functionality
- `src/screens/NotificationsScreen.tsx` - Notification list UI
- Components use the notification functions to display and manage notifications

The notification system is fully functional for the app's core features regardless of the Expo Go limitations.

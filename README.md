# PetPal Mobile App

A React Native mobile application for pet adoption, built with Expo.

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Project Structure

The project follows a hybrid structure combining Expo Router (similar to Next.js file-based routing) with a traditional src folder organization:

```
PetPal/
├── app/                           # Expo Router file-based routing (similar to Next.js pages)
│   ├── _layout.tsx                # Root layout with global styles
│   ├── (tabs)/                    # Tab-based navigation group
│   │   ├── _layout.tsx            # Tab configuration
│   │   ├── index.tsx              # Home tab
│   │   ├── admin/                 # Admin tab screens
│   │   │   ├── dashboard.tsx      # Admin dashboard
│   │   │   ├── pets.tsx           # Manage pets
│   │   │   ├── applications.tsx   # View applications
│   │   │   └── messages.tsx       # Admin messages
│   │   └── adopter/               # Adopter tab screens
│   │       ├── dashboard.tsx      # Adopter dashboard
│   │       ├── browse.tsx         # Browse pets
│   │       ├── applications.tsx   # My applications
│   │       └── messages.tsx       # Adopter messages
│   ├── auth/                      # Authentication screens
│   │   └── index.tsx              # Login/Register screen
│   ├── admin/                     # Admin deep screens (non-tab)
│   │   ├── add-pet/               # Add new pet form
│   │   │   └── index.tsx
│   │   ├── pets/                  # Pet management screens
│   │   │   ├── edit/
│   │   │   │   └── [id].tsx       # Edit pet (dynamic route)
│   │   │   └── records/
│   │   │       └── [id].tsx       # Pet records (dynamic route)
│   │   └── contact/
│   │       └── [applicationId].tsx # Contact adopter (dynamic route)
│   └── adopter/                   # Adopter deep screens (non-tab)
│       ├── pet/                   # Pet detail screens
│       │   └── [id]/              # Dynamic pet ID route
│       │       ├── index.tsx      # Pet details
│       │       └── apply/         # Apply to adopt
│       │           └── index.tsx
│       └── chat/                  # Chat screens
│           └── [id].tsx           # Individual chat (dynamic route)
├── src/                           # Source code organized by feature
│   ├── components/                # Shared components not tied to specific screens
│   ├── contexts/                  # React contexts for state management
│   │   └── AuthContext.tsx        # Authentication context
│   ├── navigation/                # Navigation configuration
│   │   ├── AdminTabNavigator.tsx  # Admin tab navigator configuration
│   │   └── AdopterTabNavigator.tsx # Adopter tab navigator configuration
│   ├── screens/                   # Screen components that map to routes
│   │   ├── AdminDashboardScreen.tsx
│   │   ├── AdopterDashboardScreen.tsx
│   │   ├── ApplicationTrackerScreen.tsx
│   │   ├── BrowsePetsScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ManagePetsScreen.tsx
│   │   ├── PetProfileScreen.tsx
│   │   └── ...more screens
│   ├── theme/                     # Styling themes and constants
│   │   └── theme.ts              # Theme configuration
│   └── lib/                       # Utility functions and data
│       ├── data.ts               # Sample data for development
│       └── utils.ts              # Utility functions
├── components/                    # Shared UI components
│   ├── Header.tsx                # App header component
│   └── ui/                       # UI component library
│       ├── badge.tsx             # Badge component
│       ├── button.tsx            # Button component
│       └── ...more UI components
├── hooks/                         # Custom React hooks
│   └── useAuth.ts                # Authentication hook
├── assets/                        # Static assets
│   ├── images/                   # Images and icons
│   └── fonts/                    # Custom fonts
├── App.tsx                        # Root component (redirects to Expo Router)
└── index.js                       # Entry point
```

## NextJS to React Native/Expo Router Migration Notes

This project is a migration of a NextJS pet adoption application to React Native using Expo Router. Here's how the structure maps:

### File Structure Mapping

1. **NextJS → Expo Router**:
   - `app/page.tsx` → `app/index.tsx` (root screen)
   - `app/[dynamic]/page.tsx` → `app/[dynamic]/index.tsx` (dynamic routes)
   - `app/layout.tsx` → `app/_layout.tsx` (layouts)

2. **Component Organization**:
   - UI components in `components/ui/` remain in the same location
   - Screen-specific components moved to `src/screens/`
   - Shared utility functions in `lib/` moved to `src/lib/`

3. **Navigation**:
   - NextJS file-based routing → Expo Router file-based routing
   - NextJS grouped routes → Expo Router groups (e.g., `(tabs)`)
   - Dynamic segments use the same `[param]` syntax

4. **Entry Points**:
   - NextJS has no explicit entry file → React Native uses `index.js` and `App.tsx`
   - App configuration in `app.json` for Expo settings

## Development

You can run the app with:

```bash
# Start the development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

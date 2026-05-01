# 🐾 PetPal

A full-stack mobile application for pet adoption built with **React Native (Expo)** and **Node.js/MongoDB**. PetPal connects animal shelters and adopters through a feature-rich platform covering everything from AI-powered pet matching to GPS tracking and care journaling.

---

## ✨ Features

### For Adopters
- **Browse & Search Pets** — Filter available pets by type, breed, age, and more
- **AI Pet Matching** — Answer a preference questionnaire and get ranked match scores based on lifestyle, living space, experience, and household
- **Adoption Applications** — Submit and track adoption applications with real-time status updates
- **In-App Messaging** — Chat directly with shelter admins during the application process
- **Care Journal** — Log care entries (medical, feeding, grooming, vet visits, etc.) for your pet
- **Reminders** — Set recurring reminders for vaccines, grooming, checkups, and medication
- **Lost Pet Reports** — Report a lost pet and browse community sightings
- **Pet Location & Safe Zone** — View pet location on a map and configure geo-fenced safe zones
- **Adoption History** — Track all past adoptions in one place
- **Push Notifications** — Stay updated on application status changes and reminders

### For Admins
- **Dashboard** — Overview of shelter activity and key stats
- **Manage Pets** — Add, edit, and remove pet listings with photos and detailed profiles
- **Applications Management** — Review, approve, or reject adoption applications
- **Adopter Verification** — Verify adopter profiles before approval
- **GPS Tracking** — Real-time GPS tracking screen for shelter pets
- **Analytics** — Visualise adoption trends, application rates, and pet statistics
- **Notifications Center** — Send and manage notifications to adopters
- **Lost Pet Management** — Admin view for all reported lost pets
- **Emergency Actions** — Handle emergency situations for pets in care

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React Native 0.81 + Expo 54 | Cross-platform mobile framework |
| Expo Router | File-based navigation (Next.js-style) |
| React Navigation (Stack + Tabs) | Screen navigation |
| NativeWind + Tailwind CSS | Utility-first styling |
| React Native Paper | Material Design UI components |
| react-native-maps | Map and GPS visualisation |
| expo-notifications | Push notification support |
| expo-camera / expo-image-picker | Camera and media access |
| react-native-chart-kit | Analytics charts |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| MongoDB Atlas | Cloud-hosted database |

---

## 📁 Project Structure

```
PetPal/
├── App.tsx                        # Root component & navigation stack
├── app/                           # Expo Router screens (file-based routing)
│   └── (tabs)/
│       ├── admin/                 # Admin tab screens
│       └── adopter/               # Adopter tab screens
├── src/
│   ├── screens/                   # 40 screen components
│   ├── contexts/                  # AuthContext, ThemeContext
│   ├── navigation/                # Tab navigator configs
│   ├── theme/                     # Global theme & colors
│   └── lib/                       # Data helpers & utilities
├── components/                    # Shared UI components
├── Backend/
│   ├── server.js                  # Express app entry point
│   ├── models/                    # Mongoose schemas
│   │   ├── User.js
│   │   ├── Pet.js
│   │   ├── LostPet.js
│   │   ├── Reminder.js
│   │   ├── Notification.js
│   │   ├── careEntry.js
│   │   └── analytics.js
│   └── routes/                    # API route handlers
│       ├── userRoutes.js
│       ├── petRoutes.js
│       ├── careEntryRoutes.js
│       ├── reminders.js
│       ├── notificationRoutes.js
│       ├── LostpetRoutes.js
│       └── analytics.js
├── utils/                         # Form validation, image utils
├── hooks/                         # Custom hooks (useAuth, etc.)
└── assets/                        # Images and fonts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Expo Go](https://expo.dev/client) app on your phone (for quick testing)
- MongoDB Atlas account (or a local MongoDB instance)

---

### 1. Clone the repository

```bash
git clone https://github.com/rubayetkabirzisan/PetPal.git
cd PetPal
```

### 2. Set up the Backend

```bash
cd Backend
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the server:

```bash
node server.js
```

The API will be running at `http://localhost:5000`.

### 3. Set up the Frontend

From the project root:

```bash
npm install
```

Update the API base URL in your config/lib files to point to your backend (local or deployed).

Start the Expo development server:

```bash
npx expo start
```

Then scan the QR code with the Expo Go app, or press `a` for Android emulator / `i` for iOS simulator.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST/GET | `/api/users` | Register and authenticate users |
| GET/POST/PUT/DELETE | `/api/pets` | Manage pet listings |
| GET/POST | `/api/applications` | Submit and manage adoption applications |
| GET/POST | `/api/careEntries` | Log and retrieve care journal entries |
| GET/POST/PUT | `/api/reminders` | Manage pet care reminders |
| GET/POST | `/api/notifications` | Send and fetch notifications |
| GET/POST | `/api/lostpets` | Report and browse lost pets |
| GET | `/api/analytics` | Fetch shelter analytics data |
| GET/POST | `/api/adoption-history` | Retrieve adoption records |
| GET/PUT | `/api/profile` | User profile management |

---

## 👤 User Roles

| Role | Access |
|------|--------|
| **Adopter** | Browse pets, apply for adoption, track applications, care journal, reminders, messaging |
| **Admin** | Full shelter management, analytics, pet CRUD, GPS tracking, adopter verification |

---

## 📦 Key Dependencies

```json
"expo": "~54.0.33",
"react-native": "0.81.5",
"react": "19.1.0",
"nativewind": "^4.1.23",
"react-native-maps": "1.20.1",
"react-native-paper": "^5.14.5",
"@react-navigation/stack": "^7.4.2",
"expo-notifications": "~0.31.4",
"expo-location": "~18.1.6",
"axios": "^1.13.4"
```

---

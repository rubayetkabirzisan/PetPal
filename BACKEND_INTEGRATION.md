# Backend Integration Guide

This guide explains how to connect your React Native PetPal app with the Node.js/MongoDB backend.

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd src/backEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://rubayetkabirz:admin@cluster0.xqq91hf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_jwt_secret_here
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### 2. Frontend Setup

1. The backend integration services are already created in:
   - `src/services/ApiService.ts` - Base API configuration
   - `src/services/AuthService.ts` - Authentication
   - `src/services/PetsService.ts` - Pet management
   - `src/services/ApplicationsService.ts` - Adoption applications
   - `src/services/MessagesService.ts` - Messaging

2. Update your API base URL in `src/services/ApiService.ts`:
   - For development: `http://localhost:5000/api` (default)
   - For production: Update to your deployed backend URL

### 3. Using Backend Services

#### Authentication Example:

```tsx
import authService from '../services/AuthService';
import { useAuth } from '../contexts/BackendAuthContext';

// In your component
const { login, register, useBackend, setUseBackend } = useAuth();

// Login with backend
const handleLogin = async () => {
  try {
    const success = await login(email, password, userType);
    if (success) {
      console.log('Login successful');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Register with backend
const handleRegister = async () => {
  try {
    const success = await register(email, password, name, userType);
    if (success) {
      console.log('Registration successful');
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

#### Pets Management Example:

```tsx
import petsService from '../services/PetsService';

// Get all pets
const loadPets = async () => {
  try {
    const pets = await petsService.getAllPets();
    setPets(pets);
  } catch (error) {
    console.error('Failed to load pets:', error);
  }
};

// Create a new pet
const createPet = async (petData) => {
  try {
    const newPet = await petsService.createPet(petData);
    console.log('Pet created:', newPet);
  } catch (error) {
    console.error('Failed to create pet:', error);
  }
};
```

#### Applications Management Example:

```tsx
import applicationsService from '../services/ApplicationsService';

// Submit application
const submitApplication = async (applicationData) => {
  try {
    const application = await applicationsService.createApplication(applicationData);
    console.log('Application submitted:', application);
  } catch (error) {
    console.error('Failed to submit application:', error);
  }
};

// Get user's applications
const loadUserApplications = async (userId) => {
  try {
    const applications = await applicationsService.getApplicationsByUser(userId);
    setApplications(applications);
  } catch (error) {
    console.error('Failed to load applications:', error);
  }
};
```

#### Messaging Example:

```tsx
import messagesService from '../services/MessagesService';

// Send message
const sendMessage = async (messageText) => {
  try {
    const message = await messagesService.sendMessage({
      text: messageText,
      sender: 'user',
      senderName: 'John Doe'
    });
    console.log('Message sent:', message);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

// Load conversation
const loadMessages = async () => {
  try {
    const messages = await messagesService.getAllMessages();
    setMessages(messages);
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
};
```

### 4. Switching Between Backend and Local Storage

You can toggle between backend and local storage authentication:

```tsx
const { useBackend, setUseBackend } = useAuth();

// Switch to backend mode
setUseBackend(true);

// Switch to local storage mode (for demo/offline)
setUseBackend(false);
```

### 5. Error Handling

All services include proper error handling. Common error scenarios:

- Network connectivity issues
- Server errors (500)
- Authentication failures (401)
- Validation errors (400)
- Not found errors (404)

### 6. Production Deployment

1. Deploy your backend to a cloud service (Heroku, AWS, etc.)
2. Update the `API_BASE_URL` in `src/services/ApiService.ts`
3. Ensure proper environment variables are set
4. Test all endpoints thoroughly

## Available Backend Endpoints

### Authentication
- `POST /api/users/signup` - Register user
- `POST /api/users/login` - Login user

### Pets
- `GET /api/pets` - Get all pets
- `GET /api/pets/:id` - Get pet by ID
- `POST /api/pets` - Create pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/:id` - Get message by ID
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message

### Other Services
- Notifications: `/api/notifications`
- Analytics: `/api/analytics`
- Lost Pets: `/api/lostpets`
- Care Entries: `/api/careEntries`
- Reminders: `/api/reminders`
- User Profiles: `/api/profile`

## Troubleshooting

1. **Connection Issues**: Ensure backend server is running on port 5000
2. **CORS Errors**: Backend already includes CORS middleware
3. **Authentication Issues**: Check if JWT token is properly stored
4. **MongoDB Connection**: Verify MongoDB URI in .env file

## Next Steps

1. Test the connection by starting the backend server
2. Update your existing screens to use the new services
3. Replace mock data with real API calls
4. Add proper loading states and error handling
5. Implement real-time features using WebSocket if needed
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'adopter' | 'admin';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>({
    id: 'demo-user',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'adopter'
  });
  const [isLoading, setIsLoading] = useState(false);

  return {
    user,
    isLoading,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    resetPassword: async () => {},
  };
};

import { useState } from "react"

export interface User {
  id: string
  email: string
  name: string
  type: "adopter" | "admin"
  shelterName?: string
}

/**
 * Simple auth hook that returns a demo user
 * This is for demonstration purposes only
 */
export function useAuth() {
  // Always return a demo user - no authentication required
  const demoUser: User = {
    id: "demo-user-123",
    email: "demo@petpal.com",
    name: "Demo User",
    type: "adopter",
  }

  const [user] = useState<User>(demoUser)
  const [isAuthenticated] = useState(true)
  const [isLoading] = useState(false)

  const login = (user: User) => {
    // No-op since we're skipping auth
    console.log("Login called with", user)
  }

  const logout = () => {
    // No-op since we're skipping auth
    console.log("Logout called")
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}

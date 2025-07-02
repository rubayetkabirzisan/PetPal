"use client"

import { useState } from "react"

export interface User {
  id: string
  email: string
  name: string
  type: "adopter" | "admin"
  shelterName?: string
}

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
  }

  const logout = () => {
    // No-op since we're skipping auth
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}

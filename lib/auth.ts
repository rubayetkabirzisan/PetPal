"use client"

export interface User {
  id: string
  email: string
  name: string
  type: "adopter" | "admin"
  shelterName?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const AUTH_STORAGE_KEY = "petpal_auth"

export function getStoredAuth(): AuthState {
  if (typeof window === "undefined") return { user: null, isAuthenticated: false }

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { user: parsed, isAuthenticated: true }
    }
  } catch (error) {
    console.error("Error parsing stored auth:", error)
  }

  return { user: null, isAuthenticated: false }
}

export function setStoredAuth(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function authenticateUser(email: string, password: string, type: "adopter" | "admin"): User | null {
  // Simulate authentication logic
  if (email && password.length >= 6) {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split("@")[0],
      type,
      shelterName: type === "admin" ? "Happy Paws Shelter" : undefined,
    }
    setStoredAuth(user)
    return user
  }
  return null
}

export function registerUser(email: string, password: string, name: string): User | null {
  // Simulate registration logic
  if (email && password.length >= 6 && name) {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      type: "adopter",
    }
    setStoredAuth(user)
    return user
  }
  return null
}

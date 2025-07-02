"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Mail, Lock, User, Building, AlertCircle, CheckCircle } from "lucide-react"
import { authenticateUser, registerUser } from "@/lib/auth"

export default function AuthPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "", type: "adopter" as "adopter" | "admin" })
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    shelterName: "",
    type: "adopter" as "adopter" | "admin",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const user = authenticateUser(loginData.email, loginData.password, loginData.type)
      if (user) {
        setMessage("Login successful! Redirecting...")
        setMessageType("success")
        setTimeout(() => {
          router.push(user.type === "admin" ? "/admin/dashboard" : "/adopter/dashboard")
        }, 1500)
      } else {
        setMessage("Invalid credentials. Please try again.")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("An error occurred during login.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (registerData.password !== registerData.confirmPassword) {
      setMessage("Passwords do not match.")
      setMessageType("error")
      setLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setMessage("Password must be at least 6 characters long.")
      setMessageType("error")
      setLoading(false)
      return
    }

    try {
      const user = registerUser(registerData.email, registerData.password, registerData.name)
      if (user) {
        setMessage("Registration successful! Redirecting...")
        setMessageType("success")
        setTimeout(() => {
          router.push("/adopter/dashboard")
        }, 1500)
      } else {
        setMessage("Registration failed. Please try again.")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("An error occurred during registration.")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: "google" | "facebook") => {
    setMessage(`${provider} login would be implemented with OAuth integration`)
    setMessageType("success")
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF7A47] to-[#FF9B73] rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#8B4513]">Welcome to PetPal</h1>
          <p className="text-[#8B4513] mt-2">Find your perfect pet companion</p>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {messageType === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={messageType === "success" ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-[#E8E8E8] shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">Login to Your Account</CardTitle>
                <CardDescription className="text-[#8B4513]">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-[#8B4513]">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-[#8B4513]">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                        className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#8B4513]">Account Type</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="loginType"
                          value="adopter"
                          checked={loginData.type === "adopter"}
                          onChange={(e) =>
                            setLoginData((prev) => ({ ...prev, type: e.target.value as "adopter" | "admin" }))
                          }
                          className="text-[#FF7A47]"
                        />
                        <span className="text-[#8B4513]">Pet Adopter</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="loginType"
                          value="admin"
                          checked={loginData.type === "admin"}
                          onChange={(e) =>
                            setLoginData((prev) => ({ ...prev, type: e.target.value as "adopter" | "admin" }))
                          }
                          className="text-[#FF7A47]"
                        />
                        <span className="text-[#8B4513]">Shelter Admin</span>
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#E8E8E8]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[#8B4513]">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("google")}
                    className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("facebook")}
                    className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">Create Your Account</CardTitle>
                <CardDescription className="text-[#8B4513]">Join PetPal to find your perfect companion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-[#8B4513]">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, name: e.target.value }))}
                        className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-[#8B4513]">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-[#8B4513]">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                        className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-[#8B4513]">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
                        required
                      />
                    </div>
                  </div>

                  {registerData.type === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="shelter-name" className="text-[#8B4513]">
                        Shelter Name
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
                        <Input
                          id="shelter-name"
                          type="text"
                          placeholder="Enter shelter name"
                          value={registerData.shelterName}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, shelterName: e.target.value }))}
                          className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[#8B4513]">Account Type</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="registerType"
                          value="adopter"
                          checked={registerData.type === "adopter"}
                          onChange={(e) =>
                            setRegisterData((prev) => ({ ...prev, type: e.target.value as "adopter" | "admin" }))
                          }
                          className="text-[#FF7A47]"
                        />
                        <span className="text-[#8B4513]">Pet Adopter</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="registerType"
                          value="admin"
                          checked={registerData.type === "admin"}
                          onChange={(e) =>
                            setRegisterData((prev) => ({ ...prev, type: e.target.value as "adopter" | "admin" }))
                          }
                          className="text-[#FF7A47]"
                        />
                        <span className="text-[#8B4513]">Shelter Admin</span>
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#E8E8E8]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[#8B4513]">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("google")}
                    className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("facebook")}
                    className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-[#8B4513]">
            By signing up, you agree to our{" "}
            <a href="#" className="text-[#FF7A47] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#FF7A47] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Home, ArrowLeft, Heart } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"

interface HeaderProps {
  title?: string
  subtitle?: string
  showNotifications?: boolean
  userType?: "adopter" | "admin"
  showBackButton?: boolean
  backHref?: string
}

export function Header({
  title = "PetPal",
  subtitle,
  showNotifications = false,
  userType = "adopter",
  showBackButton = false,
  backHref,
}: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(0)
  const { user } = useAuth()
  const pathname = usePathname()

  // Determine home path based on user type
  const homePath = userType === "admin" ? "/admin/dashboard" : "/adopter/dashboard"

  // Determine if we should show home button (not on dashboard pages and landing page)
  const showHomeButton = !pathname.includes("/dashboard") && pathname !== "/"

  // Determine if we should show landing page button (only on dashboard pages)
  const showLandingButton = pathname.includes("/dashboard")

  useEffect(() => {
    // Mock notification count - in real app, this would come from API
    setNotificationCount(3)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Back Button, Home Button, or Landing Button */}
            {showBackButton && backHref ? (
              <Link href={backHref}>
                <ArrowLeft className="h-6 w-6 text-[#8B4513]" />
              </Link>
            ) : showHomeButton ? (
              <Link href={homePath}>
                <Home className="h-6 w-6 text-[#8B4513]" />
              </Link>
            ) : showLandingButton ? (
              <Link href="/">
                <Heart className="h-6 w-6 text-[#FF7A47]" />
              </Link>
            ) : null}

            <div>
              <h1 className="text-xl font-bold text-[#8B4513]">{title}</h1>
              {subtitle && <p className="text-sm text-[#8B4513]">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {showNotifications && (
              <div className="relative">
                <Link href={userType === "admin" ? "/admin/notifications" : "/adopter/notifications"}>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5 text-[#8B4513]" />
                    {notificationCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-[#FF7A47] hover:bg-[#FF7A47]"
                      >
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            )}

            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#FFB899] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[#8B4513]">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

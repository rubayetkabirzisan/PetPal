"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Home, Search, Heart, User, Shield, MapPin, AlertTriangle } from "lucide-react"
import { getLostPets } from "@/lib/lost-pets"
import { getGPSAlerts } from "@/lib/gps-tracking"

interface NavigationProps {
  userType: "adopter" | "admin"
}

export function Navigation({ userType }: NavigationProps) {
  const pathname = usePathname()
  const [lostPetsCount, setLostPetsCount] = useState(0)
  const [gpsAlertsCount, setGpsAlertsCount] = useState(0)

  useEffect(() => {
    // Get notification counts
    try {
      const lostPets = getLostPets()
      const activeLostPets = lostPets.filter((pet) => pet.status === "Lost")
      setLostPetsCount(activeLostPets.length)

      const gpsAlerts = getGPSAlerts()
      const activeAlerts = gpsAlerts.filter((alert) => !alert.acknowledged)
      setGpsAlertsCount(activeAlerts.length)
    } catch (error) {
      console.error("Error loading notification counts:", error)
    }
  }, [])

  const adopterNavItems = [
    {
      href: "/adopter/dashboard",
      icon: Home,
      label: "Home",
      badge: null,
    },
    {
      href: "/adopter/browse",
      icon: Search,
      label: "Browse",
      badge: null,
    },
    {
      href: "/adopter/lost-pets",
      icon: AlertTriangle,
      label: "Lost Pets",
      badge: lostPetsCount > 0 ? lostPetsCount : null,
    },
    {
      href: "/adopter/gps-tracking",
      icon: Shield,
      label: "Tracking",
      badge: gpsAlertsCount > 0 ? gpsAlertsCount : null,
    },
    {
      href: "/adopter/profile",
      icon: User,
      label: "Profile",
      badge: null,
    },
  ]

  const adminNavItems = [
    {
      href: "/admin/dashboard",
      icon: Home,
      label: "Home",
      badge: null,
    },
    {
      href: "/admin/pets",
      icon: Heart,
      label: "Pets",
      badge: null,
    },
    {
      href: "/admin/lost-pets",
      icon: AlertTriangle,
      label: "Lost Pets",
      badge: lostPetsCount > 0 ? lostPetsCount : null,
    },
    {
      href: "/admin/gps-tracking",
      icon: Shield,
      label: "GPS",
      badge: gpsAlertsCount > 0 ? gpsAlertsCount : null,
    },
    {
      href: "/admin/adopter-verification",
      icon: MapPin,
      label: "Verify",
      badge: null,
    },
  ]

  const navItems = userType === "adopter" ? adopterNavItems : adminNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors relative",
                  isActive ? "text-[#FF7A47] bg-[#FFF5F0]" : "text-[#8B4513] hover:text-[#FF7A47] hover:bg-[#FFF5F0]",
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500"
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

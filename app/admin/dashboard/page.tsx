"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, BarChart3, Users, Plus, TrendingUp, Calendar, AlertTriangle, Shield } from "lucide-react"
import { getPets, getApplications, type Pet, type AdoptionApplication } from "@/lib/data"
import { getLostPets } from "@/lib/lost-pets"
import { getGPSAlerts } from "@/lib/gps-tracking"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

export default function AdminDashboard() {
  const [pets, setPets] = useState<Pet[]>([])
  const [applications, setApplications] = useState<AdoptionApplication[]>([])
  const [lostPetsCount, setLostPetsCount] = useState(0)
  const [gpsAlertsCount, setGpsAlertsCount] = useState(0)
  const [stats, setStats] = useState({
    totalPets: 0,
    adoptedThisMonth: 0,
    pendingApplications: 0,
    averageStayTime: "0 days",
  })

  useEffect(() => {
    // Load data
    const allPets = getPets()
    const allApplications = getApplications()

    setPets(allPets)
    setApplications(allApplications)

    // Load lost pets and GPS alerts
    const lostPets = getLostPets()
    const activeLostPets = lostPets.filter((pet) => pet.status === "Lost")
    setLostPetsCount(activeLostPets.length)

    const gpsAlerts = getGPSAlerts()
    const activeAlerts = gpsAlerts.filter((alert) => !alert.acknowledged)
    setGpsAlertsCount(activeAlerts.length)

    // Calculate stats
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const adoptedThisMonth = allPets.filter((pet) => {
      if (pet.status === "Adopted") {
        const adoptedDate = new Date(pet.dateAdded)
        return adoptedDate.getMonth() === currentMonth && adoptedDate.getFullYear() === currentYear
      }
      return false
    }).length

    const pendingApps = allApplications.filter((app) => app.status === "Pending").length

    // Calculate average stay time
    const availablePets = allPets.filter((pet) => pet.status === "Available")
    const totalDays = availablePets.reduce((sum, pet) => {
      const daysSince = Math.floor((Date.now() - new Date(pet.dateAdded).getTime()) / (1000 * 60 * 60 * 24))
      return sum + daysSince
    }, 0)
    const avgDays = availablePets.length > 0 ? Math.round(totalDays / availablePets.length) : 0

    setStats({
      totalPets: allPets.length,
      adoptedThisMonth,
      pendingApplications: pendingApps,
      averageStayTime: `${avgDays} days`,
    })
  }, [])

  const recentAdoptions = pets
    .filter((pet) => pet.status === "Adopted")
    .slice(0, 3)
    .map((pet) => ({
      petName: pet.name,
      adopterName: "Recent Adopter",
      date: pet.dateAdded,
      breed: pet.breed,
    }))

  const currentPets = pets.filter((pet) => pet.status !== "Adopted").slice(0, 3)

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header title="Admin Dashboard" subtitle="Happy Paws Shelter" userType="admin" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7A47] mb-1">{stats.totalPets}</div>
              <div className="text-sm text-[#8B4513]">Total Pets</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7A47] mb-1">{stats.adoptedThisMonth}</div>
              <div className="text-sm text-[#8B4513]">Adopted This Month</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7A47] mb-1">{stats.pendingApplications}</div>
              <div className="text-sm text-[#8B4513]">Pending Applications</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7A47] mb-1">{stats.averageStayTime}</div>
              <div className="text-sm text-[#8B4513]">Avg. Stay Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Cards */}
        {(lostPetsCount > 0 || gpsAlertsCount > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {lostPetsCount > 0 && (
              <Link href="/admin/lost-pets">
                <Card className="border-red-200 bg-red-50 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-red-600 mb-1">{lostPetsCount}</div>
                    <div className="text-sm text-red-700">Lost Pets</div>
                  </CardContent>
                </Card>
              </Link>
            )}
            {gpsAlertsCount > 0 && (
              <Link href="/admin/gps-tracking">
                <Card className="border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-orange-600 mb-1">{gpsAlertsCount}</div>
                    <div className="text-sm text-orange-700">GPS Alerts</div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/add-pet">
              <Button className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add New Pet
              </Button>
            </Link>
            <Link href="/admin/lost-pets">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Manage Lost Pets ({lostPetsCount} active)
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link href="/admin/applications">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Review Applications ({stats.pendingApplications} pending)
              </Button>
            </Link>
            <Link href="/admin/gps-tracking">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                GPS Tracking ({gpsAlertsCount} alerts)
              </Button>
            </Link>
            <Link href="/admin/foster-management">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Foster Management
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Adoptions */}
        {recentAdoptions.length > 0 && (
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-[#8B4513] text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#FF7A47]" />
                Recent Adoptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAdoptions.map((adoption, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#FFF5F0] rounded-lg">
                  <div>
                    <p className="font-semibold text-[#8B4513]">{adoption.petName}</p>
                    <p className="text-sm text-[#8B4513]">{adoption.breed}</p>
                    <p className="text-xs text-[#8B4513]">Adopted by {adoption.adopterName}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs text-[#8B4513]">
                      <Calendar className="h-3 w-3 mr-1" />
                      {adoption.date}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Current Pets */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg">Current Pets</CardTitle>
            <CardDescription className="text-[#8B4513]">Pets currently in your care</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentPets.map((pet) => {
              const daysInShelter = Math.floor((Date.now() - new Date(pet.dateAdded).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <Link key={pet.id} href={`/admin/pets/edit/${pet.id}`}>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E8E8E8] hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#FFB899] rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-[#FF7A47]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#8B4513]">{pet.name}</p>
                        <p className="text-sm text-[#8B4513]">{pet.breed}</p>
                        <p className="text-xs text-[#8B4513]">{daysInShelter} days in shelter</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          pet.status === "Available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {pet.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              )
            })}
            <Link href="/admin/pets">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
              >
                View All Pets ({pets.length})
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Analytics Preview */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg">This Month's Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#8B4513]">Most Popular Breed</span>
              <span className="font-semibold text-[#FF7A47]">Golden Retriever</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B4513]">Adoption Rate</span>
              <span className="font-semibold text-[#FF7A47]">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B4513]">Average Age of Adopted Pets</span>
              <span className="font-semibold text-[#FF7A47]">2.5 years</span>
            </div>
            <Link href="/admin/analytics">
              <Button
                variant="outline"
                className="w-full mt-4 border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
              >
                View Detailed Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Navigation userType="admin" />
    </div>
  )
}

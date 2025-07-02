"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Heart, Settings, Bell, LogOut, Edit } from "lucide-react"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Demo User",
    email: "demo@example.com",
    phone: "+1 (555) 123-4567",
    location: "Austin, TX",
    bio: "Animal lover looking for the perfect companion. I have experience with both dogs and cats.",
    preferences: {
      petTypes: ["Dogs", "Cats"],
      sizes: ["Small", "Medium"],
      ages: ["Young", "Adult"],
    },
  })

  const { user } = useAuth()

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to your backend
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header title="My Profile" subtitle="Manage your account" showNotifications={true} userType="adopter" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="border-[#E8E8E8] shadow-lg">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-[#FF7A47] rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-xl text-[#8B4513]">{profile.name}</CardTitle>
            <p className="text-sm text-[#8B4513]">Pet Adopter</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="text-sm font-medium text-[#8B4513] mb-2 block">Name</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="border-[#E8E8E8] focus:border-[#FF7A47]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#8B4513] mb-2 block">Email</label>
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="border-[#E8E8E8] focus:border-[#FF7A47]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#8B4513] mb-2 block">Phone</label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="border-[#E8E8E8] focus:border-[#FF7A47]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#8B4513] mb-2 block">Location</label>
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="border-[#E8E8E8] focus:border-[#FF7A47]"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                    Save Changes
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-[#8B4513]" />
                    <span className="text-sm text-[#8B4513]">{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-[#8B4513]" />
                    <span className="text-sm text-[#8B4513]">{profile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-[#8B4513]" />
                    <span className="text-sm text-[#8B4513]">{profile.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E8E8]">
                  <p className="text-sm text-[#8B4513] mb-3">{profile.bio}</p>
                </div>

                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pet Preferences */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-lg text-[#8B4513] flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Pet Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-[#8B4513] mb-2">Preferred Pet Types</h4>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.petTypes.map((type) => (
                  <Badge key={type} className="bg-[#FFB899] text-[#8B4513]">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#8B4513] mb-2">Preferred Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.sizes.map((size) => (
                  <Badge key={size} className="bg-[#FFB899] text-[#8B4513]">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#8B4513] mb-2">Preferred Ages</h4>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.ages.map((age) => (
                  <Badge key={age} className="bg-[#FFB899] text-[#8B4513]">
                    {age}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link href="/adopter/notifications">
            <Card className="border-[#E8E8E8] hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-[#FF7A47]" />
                    <span className="text-[#8B4513] font-medium">Notifications</span>
                  </div>
                  <Badge className="bg-[#FF7A47] text-white">2</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/adopter/history">
            <Card className="border-[#E8E8E8] hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-[#FF7A47]" />
                  <span className="text-[#8B4513] font-medium">Adoption History</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-[#E8E8E8] hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-[#FF7A47]" />
                <span className="text-[#8B4513] font-medium">Settings</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <LogOut className="h-5 w-5 text-red-600" />
                <span className="text-red-600 font-medium">Sign Out</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}

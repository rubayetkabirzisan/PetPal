"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ArrowLeft, TrendingUp, Users, Calendar, PieChart, BarChart3, Clock } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getPets, getApplications, type Pet } from "@/lib/data"

interface AnalyticsData {
  totalPets: number
  adoptedPets: number
  availablePets: number
  pendingAdoptions: number
  adoptionRate: number
  averageStayTime: number
  monthlyAdoptions: { month: string; count: number }[]
  breedPopularity: { breed: string; count: number }[]
  ageDistribution: { range: string; count: number }[]
  applicationStats: { status: string; count: number }[]
  recentTrends: { metric: string; value: number; change: number }[]
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("6months")
  const [loading, setLoading] = useState(true)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    calculateAnalytics()
  }, [timeRange])

  const calculateAnalytics = () => {
    setLoading(true)

    const pets = getPets()
    const applications = getApplications()

    // Basic stats
    const totalPets = pets.length
    const adoptedPets = pets.filter((p) => p.status === "Adopted").length
    const availablePets = pets.filter((p) => p.status === "Available").length
    const pendingAdoptions = pets.filter((p) => p.status === "Pending Adoption").length
    const adoptionRate = totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0

    // Average stay time calculation
    const availablePetsWithDays = pets
      .filter((p) => p.status === "Available")
      .map((p) => {
        const daysSince = Math.floor((Date.now() - new Date(p.dateAdded).getTime()) / (1000 * 60 * 60 * 24))
        return daysSince
      })

    const averageStayTime =
      availablePetsWithDays.length > 0
        ? Math.round(availablePetsWithDays.reduce((sum, days) => sum + days, 0) / availablePetsWithDays.length)
        : 0

    // Monthly adoptions (last 6 months)
    const monthlyAdoptions = generateMonthlyData(pets.filter((p) => p.status === "Adopted"))

    // Breed popularity
    const breedCounts = pets.reduce(
      (acc, pet) => {
        acc[pet.breed] = (acc[pet.breed] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const breedPopularity = Object.entries(breedCounts)
      .map(([breed, count]) => ({ breed, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Age distribution
    const ageDistribution = [
      { range: "0-1 years", count: pets.filter((p) => p.age.includes("month") || p.age.includes("1 year")).length },
      { range: "1-3 years", count: pets.filter((p) => p.age.includes("2 year") || p.age.includes("3 year")).length },
      { range: "3-5 years", count: pets.filter((p) => p.age.includes("4 year") || p.age.includes("5 year")).length },
      {
        range: "5+ years",
        count: pets.filter((p) => {
          const ageNum = Number.parseInt(p.age)
          return ageNum >= 6
        }).length,
      },
    ]

    // Application stats
    const applicationStats = [
      { status: "Pending", count: applications.filter((a) => a.status === "Pending").length },
      { status: "Approved", count: applications.filter((a) => a.status === "Approved").length },
      { status: "Rejected", count: applications.filter((a) => a.status === "Rejected").length },
    ]

    // Recent trends (simulated)
    const recentTrends = [
      {
        metric: "New Applications",
        value: applications.filter((a) => {
          const appDate = new Date(a.submittedDate)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return appDate >= weekAgo
        }).length,
        change: 15,
      },
      { metric: "Adoptions This Month", value: adoptedPets, change: 8 },
      { metric: "Average Response Time", value: 2.4, change: -12 },
      { metric: "Visitor Engagement", value: 87, change: 5 },
    ]

    setAnalytics({
      totalPets,
      adoptedPets,
      availablePets,
      pendingAdoptions,
      adoptionRate,
      averageStayTime,
      monthlyAdoptions,
      breedPopularity,
      ageDistribution,
      applicationStats,
      recentTrends,
    })

    setLoading(false)
  }

  const generateMonthlyData = (adoptedPets: Pet[]) => {
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      // Simulate some adoption data
      const count = Math.floor(Math.random() * 8) + 2
      months.push({ month: monthName, count })
    }

    return months
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4 animate-pulse" />
          <p className="text-[#8B4513]">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center">
              <ArrowLeft className="h-6 w-6 text-[#8B4513] mr-2" />
              <span className="text-[#8B4513] font-medium">Back</span>
            </Link>
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-lg font-bold text-[#8B4513]">Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Time Range Selector */}
        <Card className="border-[#E8E8E8]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#8B4513]">Time Range:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 border-[#E8E8E8] focus:border-[#FF7A47]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7A47] mb-1">{analytics.totalPets}</div>
              <div className="text-sm text-[#8B4513]">Total Pets</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7A47] mb-1">{analytics.adoptionRate}%</div>
              <div className="text-sm text-[#8B4513]">Adoption Rate</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7A47] mb-1">{analytics.adoptedPets}</div>
              <div className="text-sm text-[#8B4513]">Adopted</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7A47] mb-1">{analytics.averageStayTime}</div>
              <div className="text-sm text-[#8B4513]">Avg. Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trends */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#FF7A47]" />
              Recent Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.recentTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#FFF5F0] rounded-lg">
                <div>
                  <p className="font-medium text-[#8B4513]">{trend.metric}</p>
                  <p className="text-lg font-bold text-[#FF7A47]">{trend.value}</p>
                </div>
                <div className="text-right">
                  <Badge className={trend.change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {trend.change > 0 ? "+" : ""}
                    {trend.change}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Adoptions Chart */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-[#FF7A47]" />
              Monthly Adoptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.monthlyAdoptions.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-[#8B4513]">{month.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-[#E8E8E8] rounded-full h-2">
                      <div
                        className="bg-[#FF7A47] h-2 rounded-full"
                        style={{ width: `${(month.count / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#8B4513] w-6">{month.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Breed Popularity */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-[#FF7A47]" />
              Popular Breeds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.breedPopularity.map((breed, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded border border-[#E8E8E8]"
              >
                <span className="text-sm font-medium text-[#8B4513]">{breed.breed}</span>
                <Badge className="bg-[#FFB899] text-[#8B4513]">{breed.count} pets</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-[#FF7A47]" />
              Age Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.ageDistribution.map((age, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-[#8B4513]">{age.range}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-[#E8E8E8] rounded-full h-2">
                    <div
                      className="bg-[#FF7A47] h-2 rounded-full"
                      style={{ width: `${(age.count / analytics.totalPets) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#8B4513] w-6">{age.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-[#FF7A47]" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.applicationStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#FFF5F0] rounded-lg">
                <span className="text-sm font-medium text-[#8B4513]">{stat.status}</span>
                <Badge
                  className={
                    stat.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : stat.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {stat.count} applications
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-lg">Export Data</CardTitle>
            <CardDescription className="text-[#8B4513]">Download analytics reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
              onClick={() => alert("CSV export would download here")}
            >
              Export as CSV
            </Button>
            <Button
              variant="outline"
              className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
              onClick={() => alert("PDF report would download here")}
            >
              Generate PDF Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

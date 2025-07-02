"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Battery,
  Wifi,
  WifiOff,
  Clock,
  AlertTriangle,
  Settings,
  Shield,
  NavigationIcon,
  Heart,
  Zap,
  Target,
  Home,
} from "lucide-react"
import { getDevicesByOwner, getGPSAlerts, acknowledgeAlert, type PetGPSDevice, type GPSAlert } from "@/lib/gps-tracking"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function AdopterGPSTrackingPage() {
  const [devices, setDevices] = useState<PetGPSDevice[]>([])
  const [alerts, setAlerts] = useState<GPSAlert[]>([])
  const [selectedDevice, setSelectedDevice] = useState<PetGPSDevice | null>(null)
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const userId = user?.id || "demo-user"

  useEffect(() => {
    const loadData = () => {
      try {
        const userDevices = getDevicesByOwner(userId)
        const allAlerts = getGPSAlerts()
        const userAlerts = allAlerts.filter((alert) => userDevices.some((device) => device.id === alert.deviceId))

        setDevices(userDevices)
        setAlerts(userAlerts)
      } catch (error) {
        console.error("Error loading GPS data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  const handleAcknowledgeAlert = (alertId: string) => {
    const updatedAlert = acknowledgeAlert(alertId, user?.name || "User")
    if (updatedAlert) {
      setAlerts(alerts.map((alert) => (alert.id === alertId ? updatedAlert : alert)))
    }
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "walking":
        return <NavigationIcon className="h-4 w-4 text-blue-600" />
      case "running":
        return <Zap className="h-4 w-4 text-orange-600" />
      case "playing":
      case "running":
        return <Zap className="h-4 w-4 text-orange-600" />
      case "playing":
        return <Heart className="h-4 w-4 text-pink-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "geofence-exit":
      case "geofence-entry":
        return <Shield className="h-4 w-4" />
      case "low-battery":
        return <Battery className="h-4 w-4" />
      case "device-offline":
        return <WifiOff className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return timestamp
    }
  }

  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header title="GPS Tracking" userType="adopter" showNotifications={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
            <p className="text-[#8B4513]">Loading GPS tracking...</p>
          </div>
        </div>
        <Navigation userType="adopter" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <Header title="GPS Tracking" subtitle="Monitor your pets' location" userType="adopter" showNotifications={true} />

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-[#8B4513]">{devices.filter((d) => d.isOnline).length}</p>
              <p className="text-sm text-[#8B4513]">Online</p>
            </CardContent>
          </Card>

          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-[#8B4513]">{unacknowledgedAlerts.length}</p>
              <p className="text-sm text-[#8B4513]">Alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {unacknowledgedAlerts.filter((alert) => alert.severity === "critical").length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">Critical Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {unacknowledgedAlerts
                .filter((alert) => alert.severity === "critical")
                .slice(0, 3)
                .map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="text-sm font-medium text-[#8B4513]">{alert.petName}</p>
                        <p className="text-xs text-[#8B4513]">{alert.message}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="text-xs"
                    >
                      OK
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="devices">My Pets ({devices.length})</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({unacknowledgedAlerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            {devices.length === 0 ? (
              <Card className="border-[#E8E8E8] text-center py-8">
                <CardContent>
                  <MapPin className="h-12 w-12 text-[#8B4513] mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No GPS Devices</h3>
                  <p className="text-[#8B4513]">You don't have any GPS tracking devices yet.</p>
                  <Button className="mt-4 bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Get GPS Tracker</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <Card key={device.id} className="border-[#E8E8E8] shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-[#FFB899] rounded-full flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-[#FF7A47]" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-[#8B4513]">{device.petName}</CardTitle>
                            <CardDescription className="text-[#8B4513]">{device.deviceModel}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {device.isOnline ? (
                            <Wifi className="h-4 w-4 text-green-600" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-600" />
                          )}
                          <Badge
                            className={device.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {device.isOnline ? "Online" : "Offline"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Battery Level */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Battery className="h-4 w-4 text-[#8B4513]" />
                            <span className="text-[#8B4513]">Battery</span>
                          </div>
                          <span
                            className={`font-medium ${
                              device.batteryLevel <= 20
                                ? "text-red-600"
                                : device.batteryLevel <= 50
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }`}
                          >
                            {device.batteryLevel}%
                          </span>
                        </div>
                        <Progress
                          value={device.batteryLevel}
                          className={`h-2 ${
                            device.batteryLevel <= 20
                              ? "[&>div]:bg-red-500"
                              : device.batteryLevel <= 50
                                ? "[&>div]:bg-orange-500"
                                : "[&>div]:bg-green-500"
                          }`}
                        />
                      </div>

                      {/* Current Activity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(device.activity.status)}
                          <span className="text-sm text-[#8B4513] capitalize">{device.activity.status}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#8B4513]">{device.activity.dailySteps}</p>
                          <p className="text-xs text-[#8B4513]">steps today</p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-[#8B4513]" />
                          <span className="text-sm text-[#8B4513]">Current Location</span>
                        </div>
                        <p className="text-sm text-[#8B4513] pl-6">{device.currentLocation.address}</p>
                        <p className="text-xs text-[#8B4513] pl-6">Updated: {formatTime(device.lastUpdate)}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                              onClick={() => setSelectedDevice(device)}
                            >
                              <Target className="h-4 w-4 mr-2" />
                              View Map
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md mx-auto">
                            <DialogHeader>
                              <DialogTitle className="text-[#8B4513]">
                                {selectedDevice?.petName} - Live Location
                              </DialogTitle>
                              <DialogDescription>Real-time GPS tracking and activity monitoring</DialogDescription>
                            </DialogHeader>

                            {selectedDevice && (
                              <div className="space-y-4">
                                {/* Mock Map */}
                                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border">
                                  <div className="text-center">
                                    <MapPin className="h-8 w-8 text-[#FF7A47] mx-auto mb-2" />
                                    <p className="text-sm text-[#8B4513] font-medium">Live GPS Map</p>
                                    <p className="text-xs text-[#8B4513]">
                                      Lat: {selectedDevice.currentLocation.latitude.toFixed(4)}
                                      <br />
                                      Lng: {selectedDevice.currentLocation.longitude.toFixed(4)}
                                    </p>
                                  </div>
                                </div>

                                {/* Device Status */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center p-3 bg-[#FFF5F0] rounded">
                                    <p className="text-lg font-bold text-[#8B4513]">{selectedDevice.batteryLevel}%</p>
                                    <p className="text-xs text-[#8B4513]">Battery Level</p>
                                  </div>
                                  <div className="text-center p-3 bg-[#FFF5F0] rounded">
                                    <p className="text-lg font-bold text-[#8B4513]">
                                      {selectedDevice.isOnline ? "Online" : "Offline"}
                                    </p>
                                    <p className="text-xs text-[#8B4513]">Device Status</p>
                                  </div>
                                </div>

                                {/* Activity Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="text-center p-2 bg-blue-50 rounded">
                                    <p className="text-sm font-bold text-blue-600">
                                      {selectedDevice.activity.dailySteps}
                                    </p>
                                    <p className="text-xs text-blue-600">Steps</p>
                                  </div>
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <p className="text-sm font-bold text-green-600">
                                      {selectedDevice.activity.activeMinutes}
                                    </p>
                                    <p className="text-xs text-green-600">Active Min</p>
                                  </div>
                                  <div className="text-center p-2 bg-orange-50 rounded">
                                    <p className="text-sm font-bold text-orange-600">
                                      {selectedDevice.activity.caloriesBurned}
                                    </p>
                                    <p className="text-xs text-orange-600">Calories</p>
                                  </div>
                                </div>

                                {/* Safe Zones */}
                                <div className="space-y-2">
                                  <h4 className="font-medium text-[#8B4513]">Safe Zones</h4>
                                  <div className="space-y-1">
                                    {selectedDevice.geofences
                                      .filter((g) => g.isActive)
                                      .map((geofence) => (
                                        <div
                                          key={geofence.id}
                                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Home className="h-4 w-4 text-[#8B4513]" />
                                            <span className="text-[#8B4513]">{geofence.name}</span>
                                          </div>
                                          <span className="text-xs text-[#8B4513]">{geofence.radius}m radius</span>
                                        </div>
                                      ))}
                                  </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="space-y-2">
                                  <h4 className="font-medium text-[#8B4513]">Recent Activity</h4>
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {selectedDevice.locationHistory.slice(0, 5).map((location, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                                      >
                                        <div className="flex items-center space-x-2">
                                          {getActivityIcon(location.activity)}
                                          <span className="text-[#8B4513] capitalize">{location.activity}</span>
                                        </div>
                                        <span className="text-xs text-[#8B4513]">{formatTime(location.timestamp)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-[#FF7A47] text-[#FF7A47] bg-transparent"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? (
              <Card className="border-[#E8E8E8] text-center py-8">
                <CardContent>
                  <AlertTriangle className="h-12 w-12 text-[#8B4513] mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No Alerts</h3>
                  <p className="text-[#8B4513]">All your pets are safe and sound!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`border ${getAlertColor(alert.severity)} ${alert.acknowledged ? "opacity-60" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">{getAlertIcon(alert.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-[#8B4513]">{alert.petName}</h4>
                              <Badge className={getAlertColor(alert.severity)} variant="outline">
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-[#8B4513] mb-2">{alert.message}</p>
                            <p className="text-xs text-[#8B4513]">{formatTime(alert.timestamp)}</p>
                            {alert.location && (
                              <p className="text-xs text-[#8B4513] mt-1">Location: {alert.location.address}</p>
                            )}
                            {alert.acknowledged && (
                              <p className="text-xs text-[#8B4513] mt-1">Acknowledged by {alert.acknowledgedBy}</p>
                            )}
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="text-xs"
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}

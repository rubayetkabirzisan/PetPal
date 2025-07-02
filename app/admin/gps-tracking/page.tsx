"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Search,
  Filter,
  Users,
  Phone,
  Save,
  Plus,
  Trash2,
} from "lucide-react"
import {
  getGPSDevices,
  getGPSAlerts,
  acknowledgeAlert,
  getGPSStats,
  getCriticalAlerts,
  type PetGPSDevice,
  type GPSAlert,
} from "@/lib/gps-tracking"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

export default function AdminGPSTrackingPage() {
  const [devices, setDevices] = useState<PetGPSDevice[]>([])
  const [alerts, setAlerts] = useState<GPSAlert[]>([])
  const [selectedDevice, setSelectedDevice] = useState<PetGPSDevice | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [deviceSettings, setDeviceSettings] = useState({
    trackingInterval: 60,
    lowBatteryAlert: 20,
    geofenceAlerts: true,
    activityTracking: true,
  })
  const [newGeofence, setNewGeofence] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: 100,
    alertOnExit: true,
    alertOnEntry: false,
  })

  useEffect(() => {
    const loadData = () => {
      try {
        const allDevices = getGPSDevices()
        const allAlerts = getGPSAlerts()

        setDevices(allDevices)
        setAlerts(allAlerts)
      } catch (error) {
        console.error("Error loading GPS data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && device.isOnline) ||
      (statusFilter === "offline" && !device.isOnline) ||
      (statusFilter === "low-battery" && device.batteryLevel <= device.settings.lowBatteryAlert)

    return matchesSearch && matchesStatus
  })

  const handleAcknowledgeAlert = (alertId: string) => {
    const updatedAlert = acknowledgeAlert(alertId, "Admin User")
    if (updatedAlert) {
      setAlerts(alerts.map((alert) => (alert.id === alertId ? updatedAlert : alert)))
    }
  }

  const handleSaveSettings = () => {
    if (selectedDevice) {
      // In a real app, this would update the device settings via API
      const updatedDevices = devices.map((device) =>
        device.id === selectedDevice.id ? { ...device, settings: deviceSettings } : device,
      )
      setDevices(updatedDevices)
      setShowSettings(false)
      alert("Settings saved successfully!")
    }
  }

  const handleAddGeofence = () => {
    if (selectedDevice && newGeofence.name && newGeofence.latitude && newGeofence.longitude) {
      const geofence = {
        id: Math.random().toString(36).substr(2, 9),
        name: newGeofence.name,
        latitude: Number.parseFloat(newGeofence.latitude),
        longitude: Number.parseFloat(newGeofence.longitude),
        radius: newGeofence.radius,
        isActive: true,
        alertOnExit: newGeofence.alertOnExit,
        alertOnEntry: newGeofence.alertOnEntry,
      }

      const updatedDevices = devices.map((device) =>
        device.id === selectedDevice.id ? { ...device, geofences: [...device.geofences, geofence] } : device,
      )
      setDevices(updatedDevices)
      setSelectedDevice({ ...selectedDevice, geofences: [...selectedDevice.geofences, geofence] })
      setNewGeofence({
        name: "",
        latitude: "",
        longitude: "",
        radius: 100,
        alertOnExit: true,
        alertOnEntry: false,
      })
      alert("Geofence added successfully!")
    }
  }

  const handleRemoveGeofence = (geofenceId: string) => {
    if (selectedDevice) {
      const updatedDevices = devices.map((device) =>
        device.id === selectedDevice.id
          ? { ...device, geofences: device.geofences.filter((g) => g.id !== geofenceId) }
          : device,
      )
      setDevices(updatedDevices)
      setSelectedDevice({
        ...selectedDevice,
        geofences: selectedDevice.geofences.filter((g) => g.id !== geofenceId),
      })
      alert("Geofence removed successfully!")
    }
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "walking":
        return <NavigationIcon className="h-4 w-4 text-blue-600" />
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

  const stats = getGPSStats()
  const criticalAlerts = getCriticalAlerts()
  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header title="GPS Tracking System" userType="admin" showNotifications={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
            <p className="text-[#8B4513]">Loading GPS tracking system...</p>
          </div>
        </div>
        <Navigation userType="admin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <Header
        title="GPS Tracking System"
        subtitle="Monitor all pets and manage devices"
        userType="admin"
        showNotifications={true}
      />

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">Critical Alerts ({criticalAlerts.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {criticalAlerts.slice(0, 3).map((alert) => (
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
                    Acknowledge
                  </Button>
                </div>
              ))}
              {criticalAlerts.length > 3 && (
                <p className="text-xs text-red-700 text-center">+{criticalAlerts.length - 3} more critical alerts</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-[#8B4513]">{stats.onlineDevices}</p>
              <p className="text-sm text-[#8B4513]">Online</p>
            </CardContent>
          </Card>

          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-[#8B4513]">{stats.criticalAlerts}</p>
              <p className="text-sm text-[#8B4513]">Critical</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-4 w-4" />
            <Input
              placeholder="Search by pet name, owner, or device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
              <Filter className="h-4 w-4 mr-2 text-[#8B4513]" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="online">Online Only</SelectItem>
              <SelectItem value="offline">Offline Only</SelectItem>
              <SelectItem value="low-battery">Low Battery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="devices">Devices ({stats.totalDevices})</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({unacknowledgedAlerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            {filteredDevices.length === 0 ? (
              <Card className="border-[#E8E8E8] text-center py-8">
                <CardContent>
                  <MapPin className="h-12 w-12 text-[#8B4513] mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No Devices Found</h3>
                  <p className="text-[#8B4513]">No GPS devices match your search criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDevices.map((device) => (
                  <Card key={device.id} className="border-[#E8E8E8] shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-[#FFB899] rounded-full flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-[#FF7A47]" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-[#8B4513]">{device.petName}</CardTitle>
                            <CardDescription className="text-[#8B4513]">Owner: {device.ownerName}</CardDescription>
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
                      {/* Device Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#8B4513] font-medium">Device Model</p>
                          <p className="text-[#8B4513]">{device.deviceModel}</p>
                        </div>
                        <div>
                          <p className="text-[#8B4513] font-medium">Serial Number</p>
                          <p className="text-[#8B4513]">{device.serialNumber}</p>
                        </div>
                      </div>

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

                      {/* Owner Contact */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-[#8B4513]" />
                          <span className="text-[#8B4513]">Owner Contact</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          <Phone className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
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
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-[#8B4513]">
                                {selectedDevice?.petName} - GPS Details
                              </DialogTitle>
                              <DialogDescription>Complete GPS tracking information and controls</DialogDescription>
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

                                {/* Geofences */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-[#8B4513]">Safe Zones</h4>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add Zone
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-md mx-auto">
                                        <DialogHeader>
                                          <DialogTitle className="text-[#8B4513]">Add Safe Zone</DialogTitle>
                                          <DialogDescription>
                                            Create a new geofence for {selectedDevice.petName}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label className="text-sm font-medium text-[#8B4513]">Zone Name</Label>
                                            <Input
                                              value={newGeofence.name}
                                              onChange={(e) => setNewGeofence({ ...newGeofence, name: e.target.value })}
                                              placeholder="e.g., Home, Park, School"
                                              className="border-[#E8E8E8] focus:border-[#FF7A47]"
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <Label className="text-sm font-medium text-[#8B4513]">Latitude</Label>
                                              <Input
                                                value={newGeofence.latitude}
                                                onChange={(e) =>
                                                  setNewGeofence({ ...newGeofence, latitude: e.target.value })
                                                }
                                                placeholder="30.2672"
                                                className="border-[#E8E8E8] focus:border-[#FF7A47]"
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-[#8B4513]">Longitude</Label>
                                              <Input
                                                value={newGeofence.longitude}
                                                onChange={(e) =>
                                                  setNewGeofence({ ...newGeofence, longitude: e.target.value })
                                                }
                                                placeholder="-97.7431"
                                                className="border-[#E8E8E8] focus:border-[#FF7A47]"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-[#8B4513]">
                                              Radius (meters)
                                            </Label>
                                            <div className="mt-2">
                                              <Slider
                                                value={[newGeofence.radius]}
                                                onValueChange={(value) =>
                                                  setNewGeofence({ ...newGeofence, radius: value[0] })
                                                }
                                                max={500}
                                                min={10}
                                                step={10}
                                                className="w-full"
                                              />
                                              <div className="flex justify-between text-xs text-[#8B4513] mt-1">
                                                <span>10m</span>
                                                <span>{newGeofence.radius}m</span>
                                                <span>500m</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                              <Switch
                                                id="alert-exit"
                                                checked={newGeofence.alertOnExit}
                                                onCheckedChange={(checked) =>
                                                  setNewGeofence({ ...newGeofence, alertOnExit: checked })
                                                }
                                              />
                                              <Label htmlFor="alert-exit" className="text-sm text-[#8B4513]">
                                                Alert when pet exits zone
                                              </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Switch
                                                id="alert-entry"
                                                checked={newGeofence.alertOnEntry}
                                                onCheckedChange={(checked) =>
                                                  setNewGeofence({ ...newGeofence, alertOnEntry: checked })
                                                }
                                              />
                                              <Label htmlFor="alert-entry" className="text-sm text-[#8B4513]">
                                                Alert when pet enters zone
                                              </Label>
                                            </div>
                                          </div>
                                          <Button
                                            onClick={handleAddGeofence}
                                            className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                                          >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Safe Zone
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                  <div className="space-y-1">
                                    {selectedDevice.geofences
                                      .filter((g) => g.isActive)
                                      .map((geofence) => (
                                        <div
                                          key={geofence.id}
                                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Shield className="h-4 w-4 text-[#8B4513]" />
                                            <span className="text-[#8B4513]">{geofence.name}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-xs text-[#8B4513]">{geofence.radius}m</span>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleRemoveGeofence(geofence.id)}
                                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
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

                                {/* Owner Info */}
                                <div className="space-y-2">
                                  <h4 className="font-medium text-[#8B4513]">Owner Information</h4>
                                  <div className="p-3 bg-gray-50 rounded text-sm">
                                    <p className="font-medium text-[#8B4513]">{selectedDevice.ownerName}</p>
                                    <p className="text-[#8B4513]">Owner ID: {selectedDevice.ownerId}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Dialog open={showSettings} onOpenChange={setShowSettings}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-[#FF7A47] text-[#FF7A47] bg-transparent"
                              onClick={() => {
                                setSelectedDevice(device)
                                setDeviceSettings(device.settings)
                                setShowSettings(true)
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md mx-auto">
                            <DialogHeader>
                              <DialogTitle className="text-[#8B4513]">Device Settings</DialogTitle>
                              <DialogDescription>
                                Configure tracking settings for {selectedDevice?.petName}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Tracking Interval */}
                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-[#8B4513]">Tracking Interval</Label>
                                <div className="space-y-2">
                                  <Slider
                                    value={[deviceSettings.trackingInterval]}
                                    onValueChange={(value) =>
                                      setDeviceSettings({ ...deviceSettings, trackingInterval: value[0] })
                                    }
                                    max={300}
                                    min={30}
                                    step={30}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-[#8B4513]">
                                    <span>30 sec</span>
                                    <span>{deviceSettings.trackingInterval} sec</span>
                                    <span>5 min</span>
                                  </div>
                                </div>
                              </div>

                              {/* Low Battery Alert */}
                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-[#8B4513]">
                                  Low Battery Alert Threshold
                                </Label>
                                <div className="space-y-2">
                                  <Slider
                                    value={[deviceSettings.lowBatteryAlert]}
                                    onValueChange={(value) =>
                                      setDeviceSettings({ ...deviceSettings, lowBatteryAlert: value[0] })
                                    }
                                    max={50}
                                    min={5}
                                    step={5}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-[#8B4513]">
                                    <span>5%</span>
                                    <span>{deviceSettings.lowBatteryAlert}%</span>
                                    <span>50%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Toggle Settings */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="geofence-alerts" className="text-sm font-medium text-[#8B4513]">
                                    Geofence Alerts
                                  </Label>
                                  <Switch
                                    id="geofence-alerts"
                                    checked={deviceSettings.geofenceAlerts}
                                    onCheckedChange={(checked) =>
                                      setDeviceSettings({ ...deviceSettings, geofenceAlerts: checked })
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="activity-tracking" className="text-sm font-medium text-[#8B4513]">
                                    Activity Tracking
                                  </Label>
                                  <Switch
                                    id="activity-tracking"
                                    checked={deviceSettings.activityTracking}
                                    onCheckedChange={(checked) =>
                                      setDeviceSettings({ ...deviceSettings, activityTracking: checked })
                                    }
                                  />
                                </div>
                              </div>

                              <Button
                                onClick={handleSaveSettings}
                                className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Settings
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                  <p className="text-[#8B4513]">All GPS devices are operating normally!</p>
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

      <Navigation userType="admin" />
    </div>
  )
}

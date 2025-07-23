import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { getApplications, getPets, type AdoptionApplication, type Pet } from "@/lib/data";
import { getGPSAlerts, type GPSAlert } from "@/lib/gps-tracking";
import { getLostPets, type LostPet } from "@/lib/lost-pets";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode, useEffect, useState } from "react";
import { GestureResponderEvent, Pressable, ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
}

const Card = ({ children, style = {}, onPress }: CardProps) => (
  <Pressable 
    style={({pressed}) => [
      styles.card, 
      style, 
      pressed && onPress && styles.cardPressed
    ]} 
    onPress={onPress}
  >
    {children}
  </Pressable>
);

interface CardContentProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  center?: boolean;
}

const CardContent = ({ children, style = {}, center = false }: CardContentProps) => (
  <View style={[styles.cardContent, center && styles.cardContentCenter, style]}>
    {children}
  </View>
);

interface CardHeaderProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const CardHeader = ({ children, style = {} }: CardHeaderProps) => (
  <View style={[styles.cardHeader, style]}>{children}</View>
);

interface CardTitleProps {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
}

const CardTitle = ({ children, style = {} }: CardTitleProps) => (
  <Text style={[styles.cardTitle, style]}>{children}</Text>
);

interface CardDescriptionProps {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
}

const CardDescription = ({ children, style = {} }: CardDescriptionProps) => (
  <Text style={[styles.cardDescription, style]}>{children}</Text>
);

interface ButtonProps {
  children: ReactNode;
  variant?: 'default' | 'outline';
  style?: ViewStyle | ViewStyle[];
  onPress?: (event: GestureResponderEvent) => void;
}

const Button = ({ children, variant = "default", style = {}, onPress = () => {} }: ButtonProps) => {
  const buttonStyles = [
    styles.button,
    variant === "outline" ? styles.buttonOutline : styles.buttonDefault,
    style,
  ];
  
  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning';
  style?: ViewStyle | ViewStyle[];
}

const Badge = ({ children, variant = "default", style = {} }: BadgeProps) => {
  let badgeStyle = [styles.badge, style];
  
  if (variant === "success") {
    badgeStyle.push(styles.badgeSuccess);
  } else if (variant === "warning") {
    badgeStyle.push(styles.badgeWarning);
  }
  
  return <View style={badgeStyle}><Text style={styles.badgeText}>{children}</Text></View>;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [lostPetsCount, setLostPetsCount] = useState(0);
  const [gpsAlertsCount, setGpsAlertsCount] = useState(0);
  const [stats, setStats] = useState({
    totalPets: 0,
    adoptedThisMonth: 0,
    pendingApplications: 0,
    averageStayTime: "0 days",
  });

  useEffect(() => {
    // Load data
    async function loadData() {
      try {
        const allPets = await getPets();
        const allApplications = await getApplications();
        const lostPets = await getLostPets();
        const gpsAlerts = await getGPSAlerts();

        setPets(allPets);
        setApplications(allApplications);

        // Process lost pets and GPS alerts
        const activeLostPets = lostPets.filter((pet: LostPet) => pet.status === "lost");
        setLostPetsCount(activeLostPets.length);

        const activeAlerts = gpsAlerts.filter((alert: GPSAlert) => !alert.acknowledged);
        setGpsAlertsCount(activeAlerts.length);

        // Calculate stats
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const adoptedThisMonth = allPets.filter((pet: Pet) => {
          if (pet.status === "Adopted") {
            const adoptedDate = new Date(pet.dateAdded);
            return adoptedDate.getMonth() === currentMonth && adoptedDate.getFullYear() === currentYear;
          }
          return false;
        }).length;

        const pendingApps = allApplications.filter((app: AdoptionApplication) => app.status === "Pending").length;

        // Calculate average stay time
        const availablePets = allPets.filter((pet: Pet) => pet.status === "Available");
        const totalDays = availablePets.reduce((sum: number, pet: Pet) => {
          const daysSince = Math.floor((Date.now() - new Date(pet.dateAdded).getTime()) / (1000 * 60 * 60 * 24));
          return sum + daysSince;
        }, 0);
        const avgDays = availablePets.length > 0 ? Math.round(totalDays / availablePets.length) : 0;

        setStats({
          totalPets: allPets.length,
          adoptedThisMonth,
          pendingApplications: pendingApps,
          averageStayTime: `${avgDays} days`,
        });
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      }
    }
    
    loadData();
  }, []);

  const recentAdoptions = pets
    .filter((pet) => pet.status === "Adopted")
    .slice(0, 3)
    .map((pet) => ({
      petName: pet.name,
      adopterName: "Recent Adopter",
      date: pet.dateAdded,
      breed: pet.breed,
    }));

  const currentPets = pets.filter((pet) => pet.status !== "Adopted").slice(0, 3);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <Header title="Admin Dashboard" subtitle="Happy Paws Shelter" userType="admin" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <CardContent center>
              <Text style={styles.statNumber}>{stats.totalPets}</Text>
              <Text style={styles.statLabel}>Total Pets</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent center>
              <Text style={styles.statNumber}>{stats.adoptedThisMonth}</Text>
              <Text style={styles.statLabel}>Adopted This Month</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent center>
              <Text style={styles.statNumber}>{stats.pendingApplications}</Text>
              <Text style={styles.statLabel}>Pending Applications</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent center>
              <Text style={styles.statNumber}>{stats.averageStayTime}</Text>
              <Text style={styles.statLabel}>Avg. Stay Time</Text>
            </CardContent>
          </Card>
        </View>

        {/* Alert Cards */}
        {(lostPetsCount > 0 || gpsAlertsCount > 0) && (
          <View style={styles.alertGrid}>
            {lostPetsCount > 0 && (
              <Card style={styles.alertCardLost} onPress={() => navigateTo("/admin/lost-pets")}>
                <CardContent center>
                  <Ionicons name="warning" size={24} color="#dc2626" style={styles.alertIcon} />
                  <Text style={styles.alertNumber}>{lostPetsCount}</Text>
                  <Text style={styles.alertLabel}>Lost Pets</Text>
                </CardContent>
              </Card>
            )}
            {gpsAlertsCount > 0 && (
              <Card style={styles.alertCardGPS} onPress={() => navigateTo("/admin/gps-tracking")}>
                <CardContent center>
                  <Ionicons name="shield" size={24} color="#ea580c" style={styles.alertIcon} />
                  <Text style={[styles.alertNumber, { color: "#ea580c" }]}>{gpsAlertsCount}</Text>
                  <Text style={[styles.alertLabel, { color: "#c2410c" }]}>GPS Alerts</Text>
                </CardContent>
              </Card>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              style={styles.primaryButton}
              onPress={() => navigateTo("/admin/add-pet")}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="add" size={16} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Add New Pet</Text>
              </View>
            </Button>
            
            <Button
              variant="outline"
              style={styles.actionButton}
              onPress={() => navigateTo("/admin/lost-pets")}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="warning" size={16} style={styles.buttonIconOutline} />
                <Text style={styles.buttonTextOutline}>
                  Manage Lost Pets ({lostPetsCount} active)
                </Text>
              </View>
            </Button>
            
            <Button
              variant="outline"
              style={styles.actionButton}
              onPress={() => navigateTo("/admin/analytics")}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="stats-chart" size={16} style={styles.buttonIconOutline} />
                <Text style={styles.buttonTextOutline}>View Analytics</Text>
              </View>
            </Button>
            
            <Button
              variant="outline"
              style={styles.actionButton}
              onPress={() => navigateTo("/admin/applications")}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="people" size={16} style={styles.buttonIconOutline} />
                <Text style={styles.buttonTextOutline}>
                  Review Applications ({stats.pendingApplications} pending)
                </Text>
              </View>
            </Button>
            
            <Button
              variant="outline"
              style={styles.actionButton}
              onPress={() => navigateTo("/admin/gps-tracking")}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="shield" size={16} style={styles.buttonIconOutline} />
                <Text style={styles.buttonTextOutline}>
                  GPS Tracking ({gpsAlertsCount} alerts)
                </Text>
              </View>
            </Button>
            
            <Button
              variant="outline"
              style={styles.actionButton}
              onPress={() => navigateTo("/admin/foster-management")}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="people" size={16} style={styles.buttonIconOutline} />
                <Text style={styles.buttonTextOutline}>Foster Management</Text>
              </View>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Adoptions */}
        {recentAdoptions.length > 0 && (
          <Card>
            <CardHeader>
              <View style={styles.headerWithIcon}>
                <Ionicons name="trending-up" size={20} color="#FF7A47" />
                <CardTitle>Recent Adoptions</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              {recentAdoptions.map((adoption, index) => (
                <View key={index} style={styles.adoptionItem}>
                  <View>
                    <Text style={styles.adoptionPetName}>{adoption.petName}</Text>
                    <Text style={styles.adoptionBreed}>{adoption.breed}</Text>
                    <Text style={styles.adoptionAdopter}>
                      Adopted by {adoption.adopterName}
                    </Text>
                  </View>
                  <View style={styles.adoptionDate}>
                    <View style={styles.adoptionDateContent}>
                      <Ionicons name="calendar" size={12} color="#8B4513" />
                      <Text style={styles.adoptionDateText}>{adoption.date}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Current Pets */}
        <Card>
          <CardHeader>
            <CardTitle>Current Pets</CardTitle>
            <CardDescription>Pets currently in your care</CardDescription>
          </CardHeader>
          <CardContent>
            {currentPets.map((pet) => {
              const daysInShelter = Math.floor(
                (Date.now() - new Date(pet.dateAdded).getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petItem}
                  onPress={() => navigateTo(`/admin/pets/edit/${pet.id}`)}
                >
                  <View style={styles.petContent}>
                    <View style={styles.petIconContainer}>
                      <Ionicons name="heart" size={24} color="#FF7A47" />
                    </View>
                    <View style={styles.petInfo}>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petBreed}>{pet.breed}</Text>
                      <Text style={styles.petDays}>{daysInShelter} days in shelter</Text>
                    </View>
                  </View>
                  <View>
                    <Badge
                      variant={pet.status === "Available" ? "success" : "warning"}
                    >
                      {pet.status}
                    </Badge>
                  </View>
                </TouchableOpacity>
              );
            })}
            <Button
              variant="outline"
              style={styles.viewAllButton}
              onPress={() => navigateTo("/admin/pets")}
            >
              <Text style={styles.buttonTextOutline}>View All Pets ({pets.length})</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Analytics Preview */}
        <Card>
          <CardHeader>
            <CardTitle>This Month's Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Most Popular Breed</Text>
              <Text style={styles.insightValue}>Golden Retriever</Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Adoption Rate</Text>
              <Text style={styles.insightValue}>85%</Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Average Age of Adopted Pets</Text>
              <Text style={styles.insightValue}>2.5 years</Text>
            </View>
            <Button
              variant="outline"
              style={[styles.viewAllButton, { marginTop: 16 }]}
              onPress={() => navigateTo("/admin/analytics")}
            >
              <Text style={styles.buttonTextOutline}>View Detailed Analytics</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>

      <Navigation userType="admin" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "#E8E8E8",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF7A47",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8B4513",
  },
  alertGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  alertCardLost: {
    width: "48%",
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  alertCardGPS: {
    width: "48%",
    backgroundColor: "#ffedd5",
    borderColor: "#fed7aa",
  },
  alertIcon: {
    marginBottom: 8,
  },
  alertNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  alertLabel: {
    fontSize: 12,
    color: "#991b1b",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 16,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
  },
  cardDescription: {
    fontSize: 12,
    color: "#8B4513",
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardContentCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
  },
  buttonDefault: {
    backgroundColor: "#FF7A47",
  },
  buttonOutline: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FF7A47",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    textAlign: "center",
  },
  buttonTextOutline: {
    color: "#FF7A47",
    fontWeight: "500",
  },
  buttonIcon: {
    color: "white",
    marginRight: 8,
  },
  buttonIconOutline: {
    color: "#FF7A47",
    marginRight: 8,
  },
  primaryButton: {
    marginBottom: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  viewAllButton: {
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  adoptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF5F0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  adoptionPetName: {
    fontWeight: "600",
    color: "#8B4513",
  },
  adoptionBreed: {
    fontSize: 14,
    color: "#8B4513",
  },
  adoptionAdopter: {
    fontSize: 12,
    color: "#8B4513",
  },
  adoptionDate: {
    alignItems: "flex-end",
  },
  adoptionDateContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  adoptionDateText: {
    fontSize: 12,
    color: "#8B4513",
    marginLeft: 4,
  },
  petItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 8,
  },
  petContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  petIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFB899",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontWeight: "600",
    color: "#8B4513",
  },
  petBreed: {
    fontSize: 14,
    color: "#8B4513",
  },
  petDays: {
    fontSize: 12,
    color: "#8B4513",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeWarning: {
    backgroundColor: "#fef9c3",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#166534",
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  insightLabel: {
    color: "#8B4513",
  },
  insightValue: {
    fontWeight: "600",
    color: "#FF7A47",
  },
});

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, MapPin, MessageCircle, Shield, Calendar, Phone, Mail } from "lucide-react"
import { getPetById, type Pet } from "@/lib/data"
import { useAuth } from "@/hooks/useAuth"

interface PetProfileScreenProps {
  petId?: string
}

const PetProfileScreen = ({ petId = "1" }: PetProfileScreenProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [pet, setPet] = useState<Pet | null>(null)

  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const petData = getPetById(petId)
    if (petData) {
      setPet(petData)
    }

    // Check if pet is favorited
    const favorites = JSON.parse(localStorage.getItem("petpal_favorites") || "[]")
    setIsFavorited(favorites.includes(petId))
  }, [petId])

  const handleApplyForAdoption = () => {
    if (!pet || !user) {
      // Redirect to auth if not logged in
      router.push("/auth")
      return
    }

    // Redirect to adoption application form
    router.push(`/adopter/pet/${pet.id}/apply`)
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("petpal_favorites") || "[]")
    let newFavorites

    if (isFavorited) {
      newFavorites = favorites.filter((id: string) => id !== petId)
    } else {
      newFavorites = [...favorites, petId]
    }

    localStorage.setItem("petpal_favorites", JSON.stringify(newFavorites))
    setIsFavorited(!isFavorited)
  }

  if (!pet) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Heart size={48} color="#FF7A47" />
          <p style={styles.loadingText}>Loading pet details...</p>
        </div>
      </div>
    )
  }

  const petImages = pet.images || [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
  ]

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={24} color="#8B4513" />
        </button>
        <button style={styles.favoriteButton} onClick={toggleFavorite}>
          <Heart size={24} color={isFavorited ? "#FF7A47" : "#E8E8E8"} fill={isFavorited ? "#FF7A47" : "transparent"} />
        </button>
      </div>

      <div style={styles.content}>
        {/* Image Carousel */}
        <div style={styles.imageContainer}>
          <div style={styles.imageCarousel}>
            <img src={petImages[currentImageIndex] || "/placeholder.svg"} alt={pet.name} style={styles.petImage} />
          </div>

          {/* Image Indicators */}
          <div style={styles.imageIndicators}>
            {petImages.map((_, index) => (
              <div
                key={index}
                style={{
                  ...styles.indicator,
                  ...(index === currentImageIndex ? styles.activeIndicator : {}),
                }}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Pet Info */}
        <div style={styles.petInfo}>
          <h1 style={styles.petName}>{pet.name}</h1>
          <div style={styles.locationContainer}>
            <MapPin size={16} color="#8B4513" />
            <span style={styles.locationText}>
              {pet.location} • {pet.distance}
            </span>
          </div>

          {/* Basic Info Tags */}
          <div style={styles.tagsContainer}>
            <div style={styles.tag}>
              <span style={styles.tagText}>{pet.breed}</span>
            </div>
            <div style={styles.tag}>
              <span style={styles.tagText}>{pet.age}</span>
            </div>
            <div style={styles.tag}>
              <span style={styles.tagText}>{pet.gender}</span>
            </div>
            <div style={styles.tag}>
              <span style={styles.tagText}>{pet.size}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>About {pet.name}</h2>
          <p style={styles.description}>{pet.description}</p>
        </div>

        {/* Personality */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Personality</h2>
          <div style={styles.personalityContainer}>
            {pet.personality.map((trait, index) => (
              <div key={index} style={styles.personalityTag}>
                <span style={styles.personalityText}>{trait}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Health & Care */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Health & Care</h2>
          <div style={styles.healthGrid}>
            <div style={styles.healthItem}>
              <div style={{ ...styles.healthIcon, ...(pet.vaccinated ? styles.healthIconActive : {}) }}>
                <Shield size={20} color={pet.vaccinated ? "#22C55E" : "#EF4444"} />
              </div>
              <span style={styles.healthText}>{pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}</span>
            </div>
            <div style={styles.healthItem}>
              <div style={{ ...styles.healthIcon, ...(pet.neutered ? styles.healthIconActive : {}) }}>
                <Shield size={20} color={pet.neutered ? "#22C55E" : "#EF4444"} />
              </div>
              <span style={styles.healthText}>{pet.neutered ? "Neutered" : "Not Neutered"}</span>
            </div>
            <div style={styles.healthItem}>
              <div style={{ ...styles.healthIcon, ...(pet.microchipped ? styles.healthIconActive : {}) }}>
                <Shield size={20} color={pet.microchipped ? "#22C55E" : "#EF4444"} />
              </div>
              <span style={styles.healthText}>{pet.microchipped ? "Microchipped" : "Not Microchipped"}</span>
            </div>
          </div>

          {/* Health Records */}
          <div style={styles.healthRecords}>
            <h3 style={styles.healthRecordsTitle}>Recent Health Records</h3>
            {pet.healthRecords.map((record, index) => (
              <div key={index} style={styles.healthRecord}>
                <Calendar size={16} color="#FF7A47" />
                <div style={styles.healthRecordInfo}>
                  <p style={styles.healthRecordType}>{record.type}</p>
                  <p style={styles.healthRecordDate}>{record.date}</p>
                  <p style={styles.healthRecordDescription}>{record.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shelter Contact */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact Shelter</h2>
          <div style={styles.shelterCard}>
            <h3 style={styles.shelterName}>{pet.shelter.name}</h3>
            <div style={styles.contactItem}>
              <Phone size={16} color="#FF7A47" />
              <span style={styles.contactText}>{pet.shelter.contact}</span>
            </div>
            <div style={styles.contactItem}>
              <Mail size={16} color="#FF7A47" />
              <span style={styles.contactText}>{pet.shelter.email}</span>
            </div>
            <div style={styles.contactItem}>
              <MapPin size={16} color="#FF7A47" />
              <span style={styles.contactText}>{pet.shelter.address}</span>
            </div>
          </div>
        </div>

        <div style={styles.bottomSpacing} />
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button style={styles.chatButton} onClick={() => router.push(`/adopter/chat/${pet.id}`)}>
          <MessageCircle size={20} color="#FF7A47" />
          <span style={styles.chatButtonText}>Chat with Shelter</span>
        </button>

        <button style={styles.adoptButton} onClick={handleApplyForAdoption}>
          <span style={styles.adoptButtonText}>Apply for Adoption</span>
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FFF5F0",
    position: "relative" as const,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  loadingText: {
    marginTop: "16px",
    color: "#8B4513",
    fontSize: "16px",
  },
  header: {
    position: "absolute" as const,
    top: "50px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    padding: "0 20px",
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "24px",
    padding: "12px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },
  favoriteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "24px",
    padding: "12px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },
  content: {
    paddingBottom: "140px",
  },
  imageContainer: {
    position: "relative" as const,
  },
  imageCarousel: {
    position: "relative" as const,
  },
  petImage: {
    width: "100%",
    height: "320px",
    objectFit: "cover" as const,
  },
  imageIndicators: {
    position: "absolute" as const,
    bottom: "20px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },
  indicator: {
    width: "10px",
    height: "10px",
    borderRadius: "5px",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activeIndicator: {
    backgroundColor: "#FFFFFF",
    transform: "scale(1.2)",
  },
  petInfo: {
    padding: "24px",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    marginTop: "-24px",
    position: "relative" as const,
    zIndex: 5,
  },
  petName: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  locationContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  locationText: {
    fontSize: "16px",
    color: "#8B4513",
    marginLeft: "6px",
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "12px",
  },
  tag: {
    backgroundColor: "#FFB899",
    borderRadius: "20px",
    padding: "8px 16px",
  },
  tagText: {
    fontSize: "14px",
    color: "#8B4513",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: "12px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  description: {
    fontSize: "16px",
    color: "#8B4513",
    lineHeight: "26px",
    margin: 0,
  },
  personalityContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "12px",
  },
  personalityTag: {
    backgroundColor: "#FFF5F0",
    border: "2px solid #FF7A47",
    borderRadius: "20px",
    padding: "8px 16px",
  },
  personalityText: {
    fontSize: "14px",
    color: "#FF7A47",
    fontWeight: "600",
  },
  healthGrid: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "24px",
  },
  healthItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    flex: 1,
  },
  healthIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "24px",
    backgroundColor: "#FEF2F2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "12px",
  },
  healthIconActive: {
    backgroundColor: "#F0FDF4",
  },
  healthText: {
    fontSize: "12px",
    color: "#8B4513",
    textAlign: "center" as const,
    fontWeight: "600",
  },
  healthRecords: {
    borderTop: "2px solid #E8E8E8",
    paddingTop: "20px",
  },
  healthRecordsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  healthRecord: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#FFF5F0",
    borderRadius: "12px",
  },
  healthRecordInfo: {
    marginLeft: "12px",
    flex: 1,
  },
  healthRecordType: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#8B4513",
    margin: 0,
  },
  healthRecordDate: {
    fontSize: "14px",
    color: "#8B4513",
    opacity: 0.7,
    margin: 0,
  },
  healthRecordDescription: {
    fontSize: "14px",
    color: "#8B4513",
    marginTop: "4px",
    margin: "4px 0 0 0",
  },
  shelterCard: {
    backgroundColor: "#FFF5F0",
    borderRadius: "16px",
    padding: "20px",
    border: "2px solid #FFB899",
  },
  shelterName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  contactText: {
    fontSize: "16px",
    color: "#8B4513",
    marginLeft: "12px",
  },
  bottomSpacing: {
    height: "120px",
  },
  actionButtons: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: "24px",
    borderTop: "2px solid #E8E8E8",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
  },
  chatButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    border: "2px solid #FF7A47",
    borderRadius: "16px",
    padding: "16px",
    gap: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  chatButtonText: {
    fontSize: "16px",
    color: "#FF7A47",
    fontWeight: "600",
  },
  adoptButton: {
    backgroundColor: "#FF7A47",
    borderRadius: "16px",
    padding: "18px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(255, 122, 71, 0.3)",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  adoptButtonText: {
    fontSize: "18px",
    color: "#FFFFFF",
    fontWeight: "600",
  },
}

export default PetProfileScreen

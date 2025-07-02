"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Calendar, Heart, FileText, Share } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getAdoptionCertificates, downloadCertificate, type AdoptionCertificate } from "@/lib/certificates"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

export default function AdoptionCertificates() {
  const [certificates, setCertificates] = useState<AdoptionCertificate[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const userCertificates = getAdoptionCertificates(user.id)
      setCertificates(userCertificates)
    }
    setLoading(false)
  }, [user])

  const handleDownload = (certificate: AdoptionCertificate) => {
    downloadCertificate(certificate)
  }

  const handleShare = (certificate: AdoptionCertificate) => {
    if (navigator.share) {
      navigator.share({
        title: `${certificate.petName} Adoption Certificate`,
        text: `I adopted ${certificate.petName} from ${certificate.shelterName}!`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `I adopted ${certificate.petName} from ${certificate.shelterName}! 🐾❤️`
      navigator.clipboard.writeText(text)
      alert("Adoption story copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4 animate-pulse" />
          <p className="text-[#8B4513]">Loading certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header title="Adoption Certificates" subtitle="Your adoption achievements" userType="adopter" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {certificates.length > 0 ? (
          <>
            {/* Summary Card */}
            <Card className="border-[#E8E8E8] bg-gradient-to-r from-[#FF7A47] to-[#FF9B73] text-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 mr-3" />
                  <div>
                    <h2 className="text-xl font-bold">Adoption Journey</h2>
                    <p className="text-sm opacity-90">Your completed adoptions</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{certificates.length}</div>
                    <div className="text-sm opacity-90">Pets Adopted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{new Set(certificates.map((c) => c.shelterName)).size}</div>
                    <div className="text-sm opacity-90">Shelters Helped</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#8B4513]">Your Certificates</h3>

              {certificates.map((certificate) => (
                <Card key={certificate.id} className="border-[#E8E8E8] shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#FF7A47] rounded-full flex items-center justify-center mr-3">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-[#8B4513] text-lg">{certificate.petName}</CardTitle>
                          <CardDescription className="text-[#8B4513]">
                            {certificate.petBreed} • {certificate.petAge}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Adopted
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-[#8B4513]">Adoption Date:</span>
                        <div className="flex items-center text-[#8B4513] mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {certificate.adoptionDate}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-[#8B4513]">Shelter:</span>
                        <div className="text-[#8B4513] mt-1">{certificate.shelterName}</div>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-[#8B4513]">Certificate ID:</span>
                      <div className="text-[#8B4513] font-mono text-sm mt-1">{certificate.certificateNumber}</div>
                    </div>

                    {certificate.specialNotes && (
                      <div>
                        <span className="font-medium text-[#8B4513]">Special Notes:</span>
                        <div className="text-[#8B4513] text-sm mt-1 italic">{certificate.specialNotes}</div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={() => handleDownload(certificate)}
                        className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        onClick={() => handleShare(certificate)}
                        variant="outline"
                        className="border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
                        size="sm"
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No certificates yet</h3>
            <p className="text-[#8B4513] mb-6">Complete an adoption to receive your first certificate!</p>
            <Link href="/adopter/dashboard">
              <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                <Heart className="h-4 w-4 mr-2" />
                Browse Pets
              </Button>
            </Link>
          </div>
        )}

        {/* Info Card */}
        <Card className="border-[#E8E8E8]">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-[#FF7A47] mt-0.5" />
              <div>
                <h4 className="font-medium text-[#8B4513] mb-1">About Adoption Certificates</h4>
                <p className="text-sm text-[#8B4513]">
                  Your adoption certificates serve as official documentation of your pet adoptions. They can be used for
                  veterinary records, pet insurance, and as cherished keepsakes of your adoption journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}

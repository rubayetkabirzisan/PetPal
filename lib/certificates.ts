"use client"

export interface AdoptionCertificate {
  id: string
  userId: string
  petId: string
  petName: string
  petBreed: string
  petAge: string
  adoptionDate: string
  shelterName: string
  shelterAddress: string
  adopterName: string
  adopterAddress: string
  certificateNumber: string
  issuedDate: string
  specialNotes?: string
}

const CERTIFICATES_KEY = "petpal_adoption_certificates"

// Sample certificates for demo
const sampleCertificates: AdoptionCertificate[] = [
  {
    id: "cert-1",
    userId: "user-1",
    petId: "1",
    petName: "Buddy",
    petBreed: "Golden Retriever",
    petAge: "3 years",
    adoptionDate: "2024-01-15",
    shelterName: "Happy Paws Shelter",
    shelterAddress: "123 Pet Street, Austin, TX 78701",
    adopterName: "Demo User",
    adopterAddress: "456 Home Avenue, Austin, TX 78702",
    certificateNumber: "HP-2024-001",
    issuedDate: "2024-01-15",
    specialNotes: "Buddy was rescued from a difficult situation and has shown remarkable progress in his foster home.",
  },
]

export function getAdoptionCertificates(userId: string): AdoptionCertificate[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(CERTIFICATES_KEY)
    const allCertificates = stored ? JSON.parse(stored) : sampleCertificates
    return allCertificates.filter((cert: AdoptionCertificate) => cert.userId === userId)
  } catch (error) {
    console.error("Error loading certificates:", error)
    return []
  }
}

export function createAdoptionCertificate(
  userId: string,
  petId: string,
  petName: string,
  petBreed: string,
  petAge: string,
  shelterName: string,
  adopterName: string,
  specialNotes?: string,
): AdoptionCertificate {
  const certificate: AdoptionCertificate = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    petId,
    petName,
    petBreed,
    petAge,
    adoptionDate: new Date().toISOString().split("T")[0],
    shelterName,
    shelterAddress: "123 Pet Street, Austin, TX 78701",
    adopterName,
    adopterAddress: "456 Home Avenue, Austin, TX 78702",
    certificateNumber: `${shelterName.substring(0, 2).toUpperCase()}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
    issuedDate: new Date().toISOString().split("T")[0],
    specialNotes,
  }

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CERTIFICATES_KEY)
    const certificates = stored ? JSON.parse(stored) : []
    certificates.push(certificate)
    localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates))
  }

  return certificate
}

export function downloadCertificate(certificate: AdoptionCertificate): void {
  // Create a simple HTML certificate for download
  const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Adoption Certificate - ${certificate.petName}</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: linear-gradient(135deg, #fff5f0 0%, #ffffff 100%);
        }
        .certificate {
          border: 8px solid #FF7A47;
          padding: 40px;
          background: white;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
          color: #8B4513;
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subheader {
          color: #FF7A47;
          font-size: 18px;
          margin-bottom: 30px;
        }
        .content {
          color: #8B4513;
          font-size: 16px;
          line-height: 1.8;
          margin: 30px 0;
        }
        .pet-name {
          color: #FF7A47;
          font-size: 24px;
          font-weight: bold;
        }
        .adopter-name {
          color: #8B4513;
          font-size: 20px;
          font-weight: bold;
        }
        .details {
          margin: 30px 0;
          text-align: left;
          display: inline-block;
        }
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .signature {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-bottom: 2px solid #8B4513;
          margin-bottom: 10px;
          height: 40px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">🐾 ADOPTION CERTIFICATE 🐾</div>
        <div class="subheader">Official Certificate of Pet Adoption</div>
        
        <div class="content">
          This certifies that
          <div class="adopter-name">${certificate.adopterName}</div>
          has officially adopted
          <div class="pet-name">${certificate.petName}</div>
          a ${certificate.petAge} ${certificate.petBreed}
        </div>
        
        <div class="details">
          <strong>Adoption Date:</strong> ${certificate.adoptionDate}<br>
          <strong>Shelter:</strong> ${certificate.shelterName}<br>
          <strong>Certificate Number:</strong> ${certificate.certificateNumber}<br>
          <strong>Issued Date:</strong> ${certificate.issuedDate}
        </div>
        
        ${
          certificate.specialNotes
            ? `
          <div class="content">
            <strong>Special Notes:</strong><br>
            <em>${certificate.specialNotes}</em>
          </div>
        `
            : ""
        }
        
        <div class="signature-section">
          <div class="signature">
            <div class="signature-line"></div>
            <div>Shelter Representative</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div>Pet Adopter</div>
          </div>
        </div>
        
        <div style="margin-top: 30px; color: #FF7A47; font-style: italic;">
          "Every pet deserves a loving home. Thank you for opening your heart and home to ${certificate.petName}!"
        </div>
      </div>
    </body>
    </html>
  `

  // Create and download the file
  const blob = new Blob([certificateHTML], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${certificate.petName}_Adoption_Certificate.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

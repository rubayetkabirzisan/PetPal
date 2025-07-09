import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
// NOTE: expo-sharing package needs to be installed
// Use: npm install expo-sharing --save
// Import conditionally to handle cases where the package isn't installed
let Sharing: any;
try {
  Sharing = require('expo-sharing');
} catch (error) {
  console.warn('expo-sharing is not installed. Certificate sharing will be limited.');
}

export interface AdoptionCertificate {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  petBreed: string;
  petAge: string;
  adoptionDate: string;
  shelterName: string;
  shelterAddress: string;
  adopterName: string;
  adopterAddress: string;
  certificateNumber: string;
  issuedDate: string;
  specialNotes?: string;
}

const CERTIFICATES_KEY = "petpal_adoption_certificates";

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
  {
    id: "cert-2",
    userId: "user-1",
    petId: "3",
    petName: "Luna",
    petBreed: "Siamese Cat",
    petAge: "2 years",
    adoptionDate: "2024-03-22",
    shelterName: "Feline Friends Shelter",
    shelterAddress: "789 Cat Avenue, Austin, TX 78703",
    adopterName: "Demo User",
    adopterAddress: "456 Home Avenue, Austin, TX 78702",
    certificateNumber: "FF-2024-003",
    issuedDate: "2024-03-22",
    specialNotes: "Luna is very playful and loves chasing toys.",
  },
];

/**
 * Initialize certificates data in AsyncStorage
 */
export async function initializeCertificates(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
    if (!stored) {
      await AsyncStorage.setItem(CERTIFICATES_KEY, JSON.stringify(sampleCertificates));
      console.log("Certificate data initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing certificates:", error);
  }
}

/**
 * Get adoption certificates for a specific user
 */
export async function getAdoptionCertificates(userId: string): Promise<AdoptionCertificate[]> {
  try {
    const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
    const allCertificates: AdoptionCertificate[] = stored ? JSON.parse(stored) : sampleCertificates;
    return allCertificates.filter((cert: AdoptionCertificate) => cert.userId === userId);
  } catch (error) {
    console.error("Error loading certificates:", error);
    return [];
  }
}

/**
 * Get a specific certificate by ID
 */
export async function getCertificateById(certId: string): Promise<AdoptionCertificate | null> {
  try {
    const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
    const certificates: AdoptionCertificate[] = stored ? JSON.parse(stored) : [];
    const certificate = certificates.find(cert => cert.id === certId);
    return certificate || null;
  } catch (error) {
    console.error("Error getting certificate by ID:", error);
    return null;
  }
}

/**
 * Create a new adoption certificate
 */
export async function createAdoptionCertificate(
  userId: string,
  petId: string,
  petName: string,
  petBreed: string,
  petAge: string,
  shelterName: string,
  adopterName: string,
  specialNotes?: string,
): Promise<AdoptionCertificate> {
  const certificate: AdoptionCertificate = {
    id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
    certificateNumber: `${shelterName.substring(0, 2).toUpperCase()}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    issuedDate: new Date().toISOString().split("T")[0],
    specialNotes,
  };

  try {
    const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
    const certificates: AdoptionCertificate[] = stored ? JSON.parse(stored) : [];
    certificates.push(certificate);
    await AsyncStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
    console.log("Certificate created successfully:", certificate.id);
  } catch (error) {
    console.error("Error saving certificate:", error);
  }

  return certificate;
}

/**
 * Update an existing certificate
 */
export async function updateCertificate(updatedCertificate: AdoptionCertificate): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
    if (!stored) return false;
    
    const certificates: AdoptionCertificate[] = JSON.parse(stored);
    const index = certificates.findIndex(cert => cert.id === updatedCertificate.id);
    
    if (index === -1) return false;
    
    certificates[index] = updatedCertificate;
    await AsyncStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
    console.log("Certificate updated successfully:", updatedCertificate.id);
    return true;
  } catch (error) {
    console.error("Error updating certificate:", error);
    return false;
  }
}

/**
 * Delete a certificate
 */
export async function deleteCertificate(certId: string): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
    if (!stored) return false;
    
    const certificates: AdoptionCertificate[] = JSON.parse(stored);
    const initialLength = certificates.length;
    const updatedCertificates = certificates.filter(cert => cert.id !== certId);
    
    if (updatedCertificates.length === initialLength) return false;
    
    await AsyncStorage.setItem(CERTIFICATES_KEY, JSON.stringify(updatedCertificates));
    console.log("Certificate deleted successfully:", certId);
    return true;
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return false;
  }
}

/**
 * Generate and share an adoption certificate
 */
export async function shareCertificate(certificate: AdoptionCertificate): Promise<boolean> {
  // Create a simple HTML certificate for sharing
  const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Adoption Certificate - ${certificate.petName}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  `;

  try {
    // Create temp file path for the certificate
    const fileUri = FileSystem.cacheDirectory + `${certificate.petName}_Adoption_Certificate.html`;
    
    // Write the HTML content to the file
    await FileSystem.writeAsStringAsync(fileUri, certificateHTML, {
      encoding: FileSystem.EncodingType.UTF8
    });
    
    // Check if sharing is available
    if (Sharing) {
      try {
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (!isSharingAvailable) {
          console.warn('Sharing is not available on this device');
          return false;
        }
        
        // Share the file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: `${certificate.petName}'s Adoption Certificate`,
        });
        return true;
      } catch (err) {
        console.warn('Error using expo-sharing:', err);
        return false;
      }
    } else {
      console.warn('Expo Sharing is not available. Using alternative sharing if available.');
      // Use alternative sharing method if available in the platform
      return false;
    }
  } catch (error) {
    console.error('Error sharing certificate:', error);
    return false;
  }
}

/**
 * Generate and download an adoption certificate (React Native version)
 * For React Native, this function acts as an alias to shareCertificate
 * since direct download isn't applicable in the same way as web
 */
export async function downloadCertificate(certificate: AdoptionCertificate): Promise<boolean> {
  // In React Native context, downloading is the same as sharing
  return await shareCertificate(certificate);
}

/**
 * Search certificates by various criteria
 */
export async function searchCertificates(
  criteria: {
    petName?: string;
    adopterName?: string;
    shelterName?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<AdoptionCertificate[]> {
  try {
    const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
    const certificates: AdoptionCertificate[] = stored ? JSON.parse(stored) : [];
    
    return certificates.filter(cert => {
      let match = true;
      
      if (criteria.petName && !cert.petName.toLowerCase().includes(criteria.petName.toLowerCase())) {
        match = false;
      }
      
      if (criteria.adopterName && !cert.adopterName.toLowerCase().includes(criteria.adopterName.toLowerCase())) {
        match = false;
      }
      
      if (criteria.shelterName && !cert.shelterName.toLowerCase().includes(criteria.shelterName.toLowerCase())) {
        match = false;
      }
      
      if (criteria.dateFrom && new Date(cert.adoptionDate) < new Date(criteria.dateFrom)) {
        match = false;
      }
      
      if (criteria.dateTo && new Date(cert.adoptionDate) > new Date(criteria.dateTo)) {
        match = false;
      }
      
      return match;
    });
  } catch (error) {
    console.error("Error searching certificates:", error);
    return [];
  }
}

/**
 * Get certificate statistics
 */
export async function getCertificateStatistics(): Promise<{
  totalCount: number;
  monthlyCounts: Record<string, number>;
  shelterCounts: Record<string, number>;
  breedCounts: Record<string, number>;
}> {
  try {
    const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
    const certificates: AdoptionCertificate[] = stored ? JSON.parse(stored) : [];
    
    const monthlyCounts: Record<string, number> = {};
    const shelterCounts: Record<string, number> = {};
    const breedCounts: Record<string, number> = {};
    
    certificates.forEach(cert => {
      // Monthly counts - format: YYYY-MM
      const month = cert.adoptionDate.substring(0, 7);
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      
      // Shelter counts
      shelterCounts[cert.shelterName] = (shelterCounts[cert.shelterName] || 0) + 1;
      
      // Breed counts
      breedCounts[cert.petBreed] = (breedCounts[cert.petBreed] || 0) + 1;
    });
    
    return {
      totalCount: certificates.length,
      monthlyCounts,
      shelterCounts,
      breedCounts
    };
  } catch (error) {
    console.error("Error getting certificate statistics:", error);
    return {
      totalCount: 0,
      monthlyCounts: {},
      shelterCounts: {},
      breedCounts: {}
    };
  }
}

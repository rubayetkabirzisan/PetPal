import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import NavigationHeader from '../components/NavigationHeader';
import { colors, spacing } from '../theme/theme';

export default function DocumentScreen({ route }: any) {
  const { title, type } = route.params || { title: 'Document', type: 'privacy' };

  const getContent = () => {
    if (type === 'privacy') {
      return `Privacy Policy

Last Updated: January 1, 2024

1. Introduction
Welcome to PetPal. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our application and tell you about your privacy rights.

2. The Data We Collect About You
Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
• Identity Data includes first name, last name, username or similar identifier.
• Contact Data includes billing address, delivery address, email address and telephone numbers.
• Profile Data includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.

3. How We Use Your Personal Data
We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
• Where we need to perform the contract we are about to enter into or have entered into with you.
• Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.

4. Data Security
We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.

5. Your Legal Rights
Under certain circumstances, you have rights under data protection laws in relation to your personal data.`;
    } else if (type === 'terms') {
      return `Terms of Service

Last Updated: January 1, 2024

1. Acceptance of Terms
By accessing and using PetPal, you accept and agree to be bound by the terms and provision of this agreement.

2. Description of Service
PetPal provides users with access to a rich collection of resources, including various tools, search services, and pet adoption listings. You understand and agree that the Service is provided "AS-IS" and that PetPal assumes no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.

3. User Conduct
You understand that all information, data, text, software, music, sound, photographs, graphics, video, messages or other materials, whether publicly posted or privately transmitted, are the sole responsibility of the person from which such content originated.

4. Modifications to Service
PetPal reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.

5. Termination
You agree that PetPal, in its sole discretion, may terminate your password, account (or any part thereof) or use of the Service, and remove and discard any content within the Service, for any reason.`;
    } else if (type === 'data') {
      return `Data Sharing Preferences

Your Data, Your Control.

At PetPal, we believe in complete transparency regarding how your data is shared.

1. Analytics
We collect anonymized usage data to help us improve the application. This data cannot be traced back to you.

2. Shelter Partners
When you submit an adoption application, your contact details and preferences are shared securely with the specific shelter you applied to. We never sell your data to third-party advertisers.

3. Community Features
Your profile name and photo may be visible to other users if you participate in community forums or public pet sightings. You can hide this in your privacy settings.`;
    }

    return "Document content not available.";
  };

  return (
    <View style={styles.container}>
      <NavigationHeader title={title} showBackButton={true} />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.documentText}>
          {getContent()}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  documentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 24,
  },
});

import React from 'react';
import { Container, Typography, Box, Divider, List, ListItem, ListItemText } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6, mb: 6 }}>
      <Box sx={{ maxWidth: '100%', lineHeight: 1.8 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
          Privacy Policy
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          <strong>Effective Date: April 2026</strong>
          <br />
          Last Updated: April 2026
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* Section 1 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            1. Introduction
          </Typography>
          <Typography paragraph>
            Welcome to FunPlug Event Management Platform ("FunPlug", "we", "us", or "our"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </Typography>
          <Typography paragraph>
            Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our platform. By accessing and using FunPlug, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </Typography>
        </Box>

        {/* Section 2 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            2. Information We Collect
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            2.1 Information You Provide Directly
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Account Information"
                secondary="Username, email address, password, phone number, gender, profile picture, bio, location, date of birth"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Personal Details"
                secondary="First name, last name, business name, business category, website, social media links"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Payment Information"
                secondary="Payment method details, transaction history, billing address (processed by secure payment gateways)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Content You Create"
                secondary="Events, venues, services, performances, descriptions, images, videos, reviews, ratings"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Communication Data"
                secondary="Messages, support tickets, feedback, inquiries, survey responses"
              />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            2.2 Information Collected Automatically
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Device Information"
                secondary="Device type, operating system, browser type, device ID, mobile network information"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Usage Data"
                secondary="Pages visited, time spent, features accessed, clicks, scroll behavior, interactions"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Location Data"
                secondary="IP address, approximate geographic location, GPS coordinates (if permitted)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Cookies & Tracking Technologies"
                secondary="Session cookies, persistent cookies, web beacons, pixels, local storage data"
              />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            2.3 Information from Third Parties
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Payment Processors"
                secondary="M-Pesa and other payment gateways provide transaction confirmation and receipt data"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Analytics Providers"
                secondary="Google Analytics and similar services provide usage analytics"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Social Platforms"
                secondary="If you link accounts, basic profile information for authentication"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="User-Generated Content"
                secondary="Reviews, ratings, and feedback from other users about your events/services"
              />
            </ListItem>
          </List>
        </Box>

        {/* Section 3 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            3. How We Use Your Information
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Service Delivery"
                secondary="Providing, maintaining, and improving event management features and user experience"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Transactions"
                secondary="Processing ticket purchases, bookings, payments, refunds, and order confirmations"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Communication"
                secondary="Sending service updates, support responses, verification emails, password resets"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Personalization"
                secondary="Customizing recommendations, search results, and content based on preferences"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Security & Fraud Prevention"
                secondary="Detecting fraud, protecting against cyber attacks, preventing unauthorized access"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Analytics & Improvements"
                secondary="Analyzing platform usage to improve features, fix bugs, and enhance user experience"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Marketing & Promotions"
                secondary="Sending promotional emails, newsletters, offers (only with your consent)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Legal Compliance"
                secondary="Meeting legal obligations, regulatory requirements, and handling disputes"
              />
            </ListItem>
          </List>
        </Box>

        {/* Section 4 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            4. How We Share Your Information
          </Typography>
          <Typography paragraph>
            <strong>We DO NOT sell your personal information to third parties.</strong> However, we may share information in these limited circumstances:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Service Providers"
                secondary="Payment processors (M-Pesa), email providers, hosting services, analytics tools - under strict data processing agreements"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Event Organizers"
                secondary="When you purchase tickets, organizers receive your name and contact info (as needed for event coordination)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Venue/Service Providers"
                secondary="When you book services, relevant booking details are shared with the service provider"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Other Users"
                secondary="Your public profile information, reviews, ratings appear on the platform"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Legal Requirements"
                secondary="When required by law, court orders, or to protect rights and safety"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="With Your Consent"
                secondary="When you explicitly agree to share information with specific third parties"
              />
            </ListItem>
          </List>
        </Box>

        {/* Section 5 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            5. Data Security & Protection
          </Typography>
          <Typography paragraph>
            We implement industry-standard security measures to protect your personal information:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Encryption"
                secondary="HTTPS encryption for data in transit, encrypted storage for sensitive data"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Access Controls"
                secondary="Role-based access, authentication requirements, staff training on privacy"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Password Protection"
                secondary="Bcryptjs hashing with 10 salt rounds, password strength requirements"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Regular Audits"
                secondary="Security reviews, vulnerability assessments, penetration testing"
              />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            <strong>Note:</strong> While we strive to protect your information, no security system is impenetrable. We cannot guarantee absolute security.
          </Typography>
        </Box>

        {/* Section 6 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            6. Data Retention
          </Typography>
          <Typography paragraph>
            We retain your personal information for:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Active Accounts"
                secondary="As long as you maintain an active account"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Deleted Accounts"
                secondary="30 days grace period, then permanent deletion (legal records retained 7 years)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Transaction Records"
                secondary="Retained for 7 years for tax and audit purposes"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Legal Holds"
                secondary="Longer retention if required by law"
              />
            </ListItem>
          </List>
        </Box>

        {/* Section 7 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            7. Your Privacy Rights
          </Typography>
          <Typography paragraph>
            You have the following rights regarding your personal information:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Access"
                secondary="Request a copy of your personal data we hold"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Correction"
                secondary="Update or correct inaccurate information"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Deletion"
                secondary="Request deletion of your account and personal data"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Opt-Out"
                secondary="Unsubscribe from marketing emails anytime"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Cookie Control"
                secondary="Manage cookies through browser settings"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Data Portability"
                secondary="Export your data in common formats"
              />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            To exercise these rights, contact us at <strong>privacy@funplug.net</strong>
          </Typography>
        </Box>

        {/* Section 8 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            8. Cookies & Tracking
          </Typography>
          <Typography paragraph>
            <strong>What are cookies?</strong> Cookies are small text files stored on your device that help us remember preferences and improve your experience.
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            Types of Cookies We Use:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Essential"
                secondary="Required for login, security, basic functionality"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Preference"
                secondary="Remember language, theme, user preferences"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Analytics"
                secondary="Google Analytics to understand how users interact with our platform"
              />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            <strong>Manage Cookies:</strong> Most browsers allow you to control cookies. You can delete stored cookies and block new ones through browser settings. Disabling some cookies may affect platform functionality.
          </Typography>
        </Box>

        {/* Section 9 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            9. Third-Party Services
          </Typography>
          <Typography paragraph>
            Our platform integrates with third-party services:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="M-Pesa Payment Gateway"
                secondary="For payment processing (see M-Pesa privacy policy)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Cloudinary"
                secondary="For image/video storage (see Cloudinary privacy policy)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Google Analytics"
                secondary="For usage analytics (see Google privacy policy)"
              />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            We are not responsible for their privacy practices. Please review their privacy policies separately.
          </Typography>
        </Box>

        {/* Section 10 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            10. Children's Privacy
          </Typography>
          <Typography paragraph>
            FunPlug is not intended for users under 13 years old. We do not knowingly collect personal information from children under 13. If we discover we have collected data from a child under 13, we will delete it immediately. Parents who believe their child has provided information should contact us at <strong>privacy@funplug.net</strong>.
          </Typography>
        </Box>

        {/* Section 11 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            11. International Data Transfers
          </Typography>
          <Typography paragraph>
            Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. By using FunPlug, you consent to the transfer of your information to countries outside your country of residence.
          </Typography>
        </Box>

        {/* Section 12 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            12. Changes to This Policy
          </Typography>
          <Typography paragraph>
            We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes via email or prominent platform notification. Your continued use of FunPlug after changes constitutes acceptance of the updated policy.
          </Typography>
        </Box>

        {/* Section 13 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            13. Contact Us
          </Typography>
          <Typography paragraph>
            If you have questions about this Privacy Policy or our privacy practices:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography paragraph>
              <strong>Email:</strong> privacy@funplug.net<br />
              <strong>Support:</strong> support@funplug.net<br />
              <strong>Address:</strong> Jewel Complex, Nairobi, Kenya
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />
        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
          © {new Date().getFullYear()} FunPlug Event Management. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;

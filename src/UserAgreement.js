import React from 'react';
import { Container, Typography, Box, Divider, List, ListItem, ListItemText } from '@mui/material';

const UserAgreement = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6, mb: 6 }}>
      <Box sx={{ maxWidth: '100%', lineHeight: 1.8 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
          User Agreement & Code of Conduct
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
            1. Welcome to FunPlug
          </Typography>
          <Typography paragraph>
            Thank you for joining FunPlug Event Management Platform! This User Agreement establishes the guidelines for creating a safe, respectful, and vibrant community for all users. By signing up, you commit to following these guidelines and contributing positively to our platform.
          </Typography>
          <Typography paragraph>
            FunPlug is a collaborative platform designed to connect event organizers, service providers, and attendees. We're building a community based on trust, transparency, and mutual respect.
          </Typography>
        </Box>

        {/* Section 2 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            2. Community Values
          </Typography>
          <Typography paragraph>
            We expect all users to uphold these core values:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Honesty & Integrity"
                secondary="Provide accurate information, be transparent about your services and events"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Respect & Inclusivity"
                secondary="Treat all users with dignity regardless of background, identity, or beliefs"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Safety & Security"
                secondary="Prioritize the safety of yourself and others; report suspicious activity"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Fairness & Accountability"
                secondary="Honor commitments, deliver promised services, take responsibility for actions"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Collaboration"
                secondary="Work constructively to resolve conflicts; support community growth"
              />
            </ListItem>
          </List>
        </Box>

        {/* Section 3 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            3. User Responsibilities
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            3.1 Account Information
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Use your real name and accurate information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Maintain current and accurate profile details" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Update contact information if it changes" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use only one account per person or business" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Never impersonate another user" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            3.2 Content Guidelines
          </Typography>
          <Typography paragraph>
            When creating events, services, or posting reviews:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Provide accurate descriptions and details" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use high-quality, original images (or properly licensed ones)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Include all relevant terms and conditions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Disclose any conflicts of interest" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Avoid deceptive or misleading content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Base reviews on genuine personal experience" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            3.3 Communication Standards
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Respond to inquiries within 24 hours" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Be professional and courteous in all interactions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Honor payment deadlines and commitments" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Resolve disputes through civil discussion" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Never use the platform for threats or harassment" />
            </ListItem>
          </List>
        </Box>

        {/* Section 4 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            4. Prohibited Conduct
          </Typography>
          <Typography paragraph>
            Users are strictly prohibited from:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Fraud & Deception: Misrepresenting yourself, events, services, or credentials" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Harassment: Bullying, threatening, or attacking other users" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Hate Speech: Using slurs or promoting discrimination based on protected characteristics" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Explicit Content: Posting sexual, violent, or exploitative material" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Spam & Manipulation: Excessive advertising, fake reviews, or coordinated inauthentic behavior" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Copyright Violation: Using others' content without permission" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Illegal Activity: Promoting or facilitating illegal services or goods" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Hacking & Unauthorized Access: Attempting to breach Platform security" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Phishing & Scams: Attempting to deceive users for financial gain" />
            </ListItem>
          </List>
        </Box>

        {/* Section 5 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            5. For Event Organizers
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            5.1 Event Creation Standards
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Provide comprehensive event details (date, time, location, format)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Include clear ticket/entry information and pricing" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Comply with local permits and regulations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Ensure adequate venue capacity and safety measures" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communicate any changes immediately to attendees" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Honor ticket terms and provide promised experiences" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            5.2 Organizer Ethics
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Refund tickets promptly if events are cancelled" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communicate transparently about event changes" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Treat all attendees fairly without discrimination" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Respond to attendee concerns professionally" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Protect attendee data and privacy" />
            </ListItem>
          </List>
        </Box>

        {/* Section 6 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            6. For Service Providers
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            6.1 Service Standards
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Clearly describe services, pricing, and availability" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Meet all agreed-upon deadlines and specifications" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Maintain professional appearance and conduct" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Respond to booking inquiries promptly" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Provide high-quality service as promised" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            6.2 Licensing & Insurance
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Maintain all required licenses and certifications" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Carry appropriate insurance coverage" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Disclose any licensing issues or concerns" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Comply with professional standards and regulations" />
            </ListItem>
          </List>
        </Box>

        {/* Section 7 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            7. For Attendees
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            7.1 Attendee Responsibilities
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Arrive on time with valid tickets" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Follow all event rules and organizer guidelines" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Respect venue property and other attendees" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Behave responsibly and safely" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Provide honest reviews based on genuine experience" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            7.2 Review Guidelines
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Base reviews only on personal attendance/experience" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Be specific and constructive in feedback" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Avoid profanity, insults, or personal attacks" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Don't post duplicate or spammy reviews" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Respect organizer responses and attempt resolution" />
            </ListItem>
          </List>
        </Box>

        {/* Section 8 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            8. Dispute Resolution Process
          </Typography>
          <Typography paragraph>
            If you have a conflict with another user:
          </Typography>
          <List sx={{ mt: 1 }}>
            <ListItem>
              <ListItemText
                primary="Step 1: Direct Communication"
                secondary="Contact the other party directly through the platform messaging"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Step 2: FunPlug Mediation"
                secondary="Request mediation from our support team if direct communication fails"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Step 3: Formal Review"
                secondary="FunPlug will review evidence and make a binding decision"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Step 4: Resolution"
                secondary="Implement agreed resolution, refunds, or account action as appropriate"
              />
            </ListItem>
          </List>
        </Box>

        {/* Section 9 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            9. Warnings & Account Suspension
          </Typography>
          <Typography paragraph>
            Users who violate this agreement may receive:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Warning (1st Violation): Notification of policy breach" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Second Warning: Temporary feature restrictions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Third Warning: Automatic account suspension and ban" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Severe Violations: Immediate account termination" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            Severe violations (fraud, harassment, illegal activity) may result in immediate permanent ban without warnings.
          </Typography>
        </Box>

        {/* Section 10 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            10. Reporting Violations
          </Typography>
          <Typography paragraph>
            If you witness any policy violations, report them immediately:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Use the 'Report' button on any listing or review" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Email support@funplug.net with specific details" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Include evidence (screenshots, dates, times)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Do not confront violators directly" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            We take all reports seriously and investigate promptly. Your identity is protected when reporting.
          </Typography>
        </Box>

        {/* Section 11 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            11. Privacy & Data Protection
          </Typography>
          <Typography paragraph>
            By joining FunPlug, you agree to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Allow us to collect and use data as described in our Privacy Policy" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Understand that your profile may be publicly visible" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Accept that organizers receive limited information for event coordination" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Allow us to contact you about account, events, and platform updates" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            For full details, see our Privacy Policy.
          </Typography>
        </Box>

        {/* Section 12 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            12. Right to Modify Terms
          </Typography>
          <Typography paragraph>
            FunPlug may update this User Agreement at any time. Material changes will be communicated to you. Continued use of the platform constitutes acceptance of updated terms.
          </Typography>
        </Box>

        {/* Section 13 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            13. Questions?
          </Typography>
          <Typography paragraph>
            If you have questions about this User Agreement:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography paragraph>
              <strong>Email:</strong> support@funplug.net<br />
              <strong>Contact Form:</strong> Visit our Help Center<br />
              <strong>Address:</strong> Jewel Complex, Nairobi, Kenya
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />
        <Typography variant="body2" sx={{ bgcolor: 'info.lighter', p: 2, borderRadius: 1, mb: 3 }}>
          <strong>By signing up, you confirm that:</strong>
          <List dense>
            <ListItem>
              <ListItemText primary="✓ You have read and understood this User Agreement" />
            </ListItem>
            <ListItem>
              <ListItemText primary="✓ You agree to follow all community guidelines" />
            </ListItem>
            <ListItem>
              <ListItemText primary="✓ You will conduct yourself ethically and responsibly" />
            </ListItem>
            <ListItem>
              <ListItemText primary="✓ You accept the terms of this agreement" />
            </ListItem>
          </List>
        </Typography>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
          © {new Date().getFullYear()} FunPlug Event Management. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default UserAgreement;

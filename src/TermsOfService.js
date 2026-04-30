import React from 'react';
import { Container, Typography, Box, Divider, List, ListItem, ListItemText } from '@mui/material';

const TermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6, mb: 6 }}>
      <Box sx={{ maxWidth: '100%', lineHeight: 1.8 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
          Terms of Service
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
            1. Agreement to Terms
          </Typography>
          <Typography paragraph>
            By accessing and using the FunPlug Event Management Platform ("Platform"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use the Platform. We reserve the right to modify these terms at any time. Your continued use of the Platform following any changes constitutes your acceptance of the new terms.
          </Typography>
        </Box>

        {/* Section 2 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            2. Use License
          </Typography>
          <Typography paragraph>
            We grant you a limited, non-exclusive, non-transferable, and revocable license to use the Platform for lawful purposes only. You agree not to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Use the Platform for any illegal or unauthorized purpose" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Violate any laws or regulations applicable to your jurisdiction" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Infringe upon any intellectual property rights" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Harass, abuse, or harm any individual or entity" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Attempt to gain unauthorized access to our systems" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Transmit malware, viruses, or any harmful code" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Engage in spam, phishing, or fraudulent activities" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Scrape, crawl, or automate data extraction without permission" />
            </ListItem>
          </List>
        </Box>

        {/* Section 3 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            3. User Accounts
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            3.1 Account Responsibility
          </Typography>
          <Typography paragraph>
            You are responsible for maintaining the confidentiality of your account credentials and password. You agree to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Accept responsibility for all activities under your account" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Notify us immediately of unauthorized access" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use a strong, unique password" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Log out of your account when using shared devices" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            3.2 Account Termination
          </Typography>
          <Typography paragraph>
            We reserve the right to terminate accounts that:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Violate these Terms of Service" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Engage in fraudulent or illegal activities" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Remain inactive for 180 days" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Receive 3 or more warnings for policy violations" />
            </ListItem>
          </List>
        </Box>

        {/* Section 4 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            4. User Content & Intellectual Property
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            4.1 Your Content
          </Typography>
          <Typography paragraph>
            When you upload, post, or share content (text, images, videos) on FunPlug:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="You retain all ownership rights to your content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You grant FunPlug a worldwide, royalty-free license to use, display, and distribute your content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You warrant that you own or have permission to share the content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You are solely responsible for the accuracy and legality of your content" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            4.2 Content Restrictions
          </Typography>
          <Typography paragraph>
            You may not post content that is:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Illegal, obscene, defamatory, or hateful" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Sexually explicit or exploitative" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Violent or promotes violence" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Harassing, threatening, or bullying" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Spam, misleading, or deceptive" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Infringing on third-party intellectual property" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            4.3 Platform Content
          </Typography>
          <Typography paragraph>
            All content provided by FunPlug (text, graphics, logos, images, software) is the exclusive property of FunPlug and protected by copyright. You may not reproduce, modify, or distribute any platform content without permission.
          </Typography>
        </Box>

        {/* Section 5 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            5. Transactions & Payments
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            5.1 Payment Processing
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Payments are processed through secure payment gateways (M-Pesa, etc.)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You agree to pay all fees associated with your transactions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Prices are subject to change with notice" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You must provide accurate billing information" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            5.2 Refund Policy
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Ticket purchases for events are non-refundable unless explicitly stated" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Service bookings may be refundable within 48 hours of booking" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Refund requests must be submitted through our support system" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Refunds are processed within 5-7 business days" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            5.3 Disputed Transactions
          </Typography>
          <Typography paragraph>
            If you dispute a transaction, contact our support team within 30 days. We will investigate and work toward resolution.
          </Typography>
        </Box>

        {/* Section 6 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            6. Event & Service Liability
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            6.1 User as Organizer
          </Typography>
          <Typography paragraph>
            If you create or promote events on FunPlug, you are responsible for:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Ensuring the event complies with all local laws and regulations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Providing accurate event details and descriptions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Obtaining necessary permits and insurance" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Protecting attendee safety and security" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Honoring all ticket terms and conditions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Handling disputes with attendees professionally" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            6.2 User as Attendee
          </Typography>
          <Typography paragraph>
            By attending events, you agree to follow all event rules and regulations. FunPlug is not responsible for:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Event cancellations or postponements" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Injuries or property damage at events" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Lost or stolen items" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Organizer misconduct or breach of contract" />
            </ListItem>
          </List>
        </Box>

        {/* Section 7 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            7. Disclaimer of Warranties
          </Typography>
          <Typography paragraph>
            The Platform is provided "AS IS" and "AS AVAILABLE" without any warranties. We disclaim:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Implied warranties of merchantability or fitness for a particular purpose" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Warranties of accuracy, reliability, or completeness" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Warranties that the service will be uninterrupted or error-free" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            We do not warrant that defects will be corrected or that the Platform will be compatible with all systems.
          </Typography>
        </Box>

        {/* Section 8 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            8. Limitation of Liability
          </Typography>
          <Typography paragraph>
            To the fullest extent permitted by law, FunPlug shall not be liable for:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Indirect, incidental, special, consequential, or punitive damages" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Loss of profit, revenue, data, or business opportunities" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Claims arising from user content or third-party actions" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            Total liability shall not exceed the amount paid by you in the past 12 months.
          </Typography>
        </Box>

        {/* Section 9 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            9. Indemnification
          </Typography>
          <Typography paragraph>
            You agree to indemnify and hold harmless FunPlug from any claims, damages, losses, or expenses (including legal fees) arising from:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Your use of the Platform" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Your violation of these Terms" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Your content or user-generated data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Events or services you create or promote" />
            </ListItem>
          </List>
        </Box>

        {/* Section 10 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            10. Acceptable Use Policy
          </Typography>
          <Typography paragraph>
            You agree not to use the Platform to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Violate any applicable laws or regulations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Infringe intellectual property or privacy rights" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Transmit malware, viruses, or harmful code" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Engage in phishing, fraud, or scams" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Harass, bully, or threaten other users" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Create fake accounts or impersonate others" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Spam or send unsolicited messages" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Interfere with Platform functionality" />
            </ListItem>
          </List>
        </Box>

        {/* Section 11 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            11. Third-Party Links & Services
          </Typography>
          <Typography paragraph>
            FunPlug may contain links to third-party websites and services. We are not responsible for:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Content or accuracy of external sites" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Privacy practices of third parties" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Products or services offered by third parties" />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            Use third-party services at your own risk and review their terms and privacy policies.
          </Typography>
        </Box>

        {/* Section 12 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            12. Dispute Resolution
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
            12.1 Informal Resolution
          </Typography>
          <Typography paragraph>
            If you have a dispute with FunPlug, please first contact our support team at support@funplug.net. We will attempt to resolve the matter informally.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            12.2 Binding Arbitration
          </Typography>
          <Typography paragraph>
            If informal resolution fails, any dispute shall be resolved through binding arbitration in accordance with the laws of Kenya, rather than in court.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
            12.3 Venue
          </Typography>
          <Typography paragraph>
            You consent to the exclusive jurisdiction of courts located in Nairobi, Kenya for any legal proceedings.
          </Typography>
        </Box>

        {/* Section 13 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            13. Governing Law
          </Typography>
          <Typography paragraph>
            These Terms of Service are governed by the laws of Kenya, without regard to conflict of law provisions. Any legal action must be brought exclusively in the courts of Nairobi, Kenya.
          </Typography>
        </Box>

        {/* Section 14 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            14. Modifications to Terms
          </Typography>
          <Typography paragraph>
            We reserve the right to modify these Terms at any time. Changes become effective immediately upon posting. Your continued use of the Platform constitutes acceptance of modified terms. We encourage you to review these terms periodically.
          </Typography>
        </Box>

        {/* Section 15 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            15. Severability
          </Typography>
          <Typography paragraph>
            If any provision of these Terms is found invalid or unenforceable, that provision shall be removed, and the remaining terms shall continue in full force and effect.
          </Typography>
        </Box>

        {/* Section 16 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            16. Contact Us
          </Typography>
          <Typography paragraph>
            For questions about these Terms of Service:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography paragraph>
              <strong>Email:</strong> legal@funplug.net<br />
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

export default TermsOfService;

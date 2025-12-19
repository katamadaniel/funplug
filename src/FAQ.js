import React from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MotionAccordion = motion(Accordion);

const faqCategories = [
  {
    title: "General",
    items: [
      {
        question: "What is FunPlug?",
        answer:
          "FunPlug is a digital marketplace for the events industry. We connect performers, entertainers, vendors, service providers, event hosts, and clients in one transparent platform for bookings, ticket sales, and event planning.",
      },
      {
        question: "Who can use FunPlug?",
        answer:
          "FunPlug is for performers, entertainers, DJs, MCs, vendors, service providers, venue owners, event organizers, and clients looking to host or attend events.",
      },
    ],
  },
  {
    title: "Bookings & Events",
    items: [
      {
        question: "How does FunPlug help with event planning?",
        answer:
          "FunPlug reduces the stress of planning events by allowing you to discover trusted talent, vendors, venues, and events in one place. You can compare options, manage bookings, and track everything from your dashboard.",
      },
      {
        question: "Can I sell event tickets on FunPlug?",
        answer:
          "Yes. Event organizers can create events and sell tickets directly on FunPlug. We manage ticket availability, secure payments, and confirmations for attendees.",
      },
      {
        question: "What types of events are supported?",
        answer:
          "FunPlug supports concerts, corporate events, weddings, festivals, private parties, and many other event types.",
      },
    ],
  },
  {
    title: "Payments & Pricing",
    items: [
      {
        question: "Is it free to create an account?",
        answer:
          "Yes. Creating and maintaining an account on FunPlug is completely free. We only charge a small service fee on successful transactions.",
      },
      {
        question: "How do payments and bookings work?",
        answer:
          "Clients pay securely through FunPlug using supported payment methods. Payments are tracked transparently, and service providers receive confirmations and records for every transaction.",
      },
      {
        question: "Is FunPlug safe and transparent?",
        answer:
          "Yes. Transparency is a core principle of FunPlug. Profiles, pricing, availability, and transaction statuses are clearly displayed to help users make informed decisions.",
      },
    ],
  },
  {
    title: "Getting Started",
    items: [
      {
        question: "How do performers and vendors get bookings?",
        answer:
          "After registering, performers and vendors can create professional profiles, list services, set availability and rates, and receive booking requests from clients searching on the platform.",
      },
      {
        question: "How do I start using FunPlug?",
        answer:
          "Simply sign up for a free account, complete your profile, and start exploring events, booking services, or selling tickets.",
      },
    ],
  },
];

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "#fafafa", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={5}>
          {/* Header */}
          <Box textAlign="center">
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Everything you need to know about using FunPlug to plan events,
              book services, and sell tickets.
            </Typography>
          </Box>

          {/* FAQ Categories */}
          {faqCategories.map((category, catIndex) => (
            <Box key={catIndex}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                {category.title}
              </Typography>

              {category.items.map((faq, index) => (
                <MotionAccordion
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </MotionAccordion>
              ))}

              <Divider sx={{ my: 4 }} />
            </Box>
          ))}

          {/* CTA */}
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Still have questions?
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Join FunPlug today or reach out to our support team — we’re here to
              help you plan, book, and host better events.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/signup")}
                sx={{ borderRadius: 3, px: 4 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/contact")}
                sx={{ borderRadius: 3, px: 4 }}
              >
                Contact Support
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default FAQ;
import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import missionImage from "./mission.jpg";
import bannerImage from "./FunPlug.png";

const MotionBox = motion(Box);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const About = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      {/* BANNER */}
      <Box
        sx={{
          height: { xs: 220, md: 300 },
          backgroundImage: `linear-gradient(
            rgba(0,0,0,0.45),
            rgba(0,0,0,0.45)
          ), url(${bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={900}
            color="common.white"
          >
            About FunPlug
          </Typography>
          <Typography
            variant="subtitle1"
            color="common.white"
            sx={{ opacity: 0.9, mt: 1 }}
          >
            Everything events, in one trusted platform
          </Typography>
        </Container>
      </Box>

      {/* ABOUT SECTION (OVERLAP) */}
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: -6, md: -8 },
          py: { xs: 6, md: 10 },
          position: "relative",
          zIndex: 2,
        }}
      >
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  bgcolor: "background.paper",
                  boxShadow: theme.shadows[4],
                }}
              >
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Who We Are
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                  FunPlug is a digital marketplace built for the events industry.
                  We connect performers, entertainers, service providers,
                  vendors, and event hosts with clients in a transparent,
                  seamless, and efficient way.
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                  From booking talent and services to selling event tickets,
                  FunPlug brings everything events into one trusted platform,
                  reducing the stress of planning unforgettable experiences.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  mt={3}
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
                    onClick={() => navigate("/home")}
                    sx={{ borderRadius: 3, px: 4 }}
                  >
                    Explore FunPlug
                  </Button>
                </Stack>
              </Card>
            </MotionBox>
          </Grid>

          {/* MISSION IMAGE */}
          <Grid item xs={12} md={6}>
            <MotionBox
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box
                component="img"
                src={missionImage}
                alt="FunPlug mission"
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  boxShadow: theme.shadows[6],
                }}
              />
            </MotionBox>
          </Grid>
        </Grid>
      </Container>

      {/* MISSION */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.paper" }}>
        <Container maxWidth="md">
          <MotionBox
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            textAlign="center"
          >
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" color="text.secondary">
              To bridge the gap between event industry stakeholders and clients
              by creating a transparent marketplace where talent, services,
              venues, and events are easily discoverable, bookable, and
              manageable.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* STAKEHOLDERS */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4}>
          {[
            {
              icon: <CelebrationIcon fontSize="large" color="primary" />,
              title: "Performers & Entertainers",
              text: "Showcase your talent, manage availability, and receive direct bookings from verified clients.",
            },
            {
              icon: <StorefrontIcon fontSize="large" color="primary" />,
              title: "Vendors & Service Providers",
              text: "List your services, manage bookings, and grow your business with increased visibility.",
            },
            {
              icon: <GroupsIcon fontSize="large" color="primary" />,
              title: "Event Hosts & Clients",
              text: "Discover trusted talent, vendors, venues, and purchase tickets seamlessly.",
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <MotionBox
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    bgcolor: "background.paper",
                    boxShadow: theme.shadows[3],
                  }}
                >
                  <CardContent>
                    <Box mb={2}>{item.icon}</Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.text}
                    </Typography>
                  </CardContent>
                </Card>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Container maxWidth="md">
          <MotionBox
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            textAlign="center"
          >
            <EventIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Your Gateway to Stress-Free Events
            </Typography>
            <Typography sx={{ opacity: 0.9, mb: 4 }}>
              Whether you're planning, hosting, performing, or attending,
              FunPlug gives you clarity, trust, and convenience — all in one
              place.
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={() => navigate("/signup")}
              sx={{ borderRadius: 3, px: 5 }}
            >
              Join FunPlug Today
            </Button>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default About;

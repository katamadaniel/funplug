import React from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 4,
        px: 2,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Grid container spacing={4} justifyContent="center">
        {/* MAP */}
        <Grid item xs={12} md={4}>
          <Typography fontWeight={600} mb={1}>
            Our Location
          </Typography>
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 1,
            }}
          >
            <iframe
              title="location-map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.914766895325!2d36.88742007496549!3d-1.219399998768969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f15001ea5a7cf%3A0x4f6d959e1d215455!2sJEWEL%20COMPLEX!5e0!3m2!1sen!2ske!4v1766010208725!5m2!1sen!2ske"
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
            />
          </Box>
        </Grid>

        {/* INFO */}
        <Grid item xs={12} md={4} textAlign="center">
          <Typography variant="h6" fontWeight={700}>
            FunPlug
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Events, Venues & Services Management Platform
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} FunPlug. All rights reserved.
          </Typography>
        </Grid>

        {/* SOCIAL */}
        <Grid item xs={12} md={4} textAlign="center">
          <Typography fontWeight={600} mb={1}>
            Follow Us
          </Typography>

          <Box>
            {[ 
              { icon: <FacebookIcon />, link: "https://facebook.com/profile.php?id=61585229759024" },
              { icon: <TwitterIcon />, link: "https://x.com/FunplugEvents" },
              { icon: <InstagramIcon />, link: "https://instagram.com/funplugevents" },
              { icon: <LinkedInIcon />, link: "https://https://www.linkedin.com/company/funplug-events-management/" },
            ].map((s, i) => (
              <IconButton
                key={i}
                component="a"
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  mx: 0.5,
                  transition: "0.2s",
                  "&:hover": {
                    color: "primary.main",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {s.icon}
              </IconButton>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;

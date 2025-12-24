import React, { useState } from "react";
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  Tooltip,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CategoryIcon from "@mui/icons-material/Category";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import HelpIcon from "@mui/icons-material/Help";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

const Menu = ({ isAuthenticated }) => {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });    
    setOpen(false);
  };

  const authLinks = [
    { label: "Home", icon: <HomeIcon />, path: "/" },
    { label: "Profile", icon: <PersonIcon />, path: "/profile" },
    { label: "Events", icon: <EventIcon />, path: "/events" },
    { label: "Venues", icon: <LocationOnIcon />, path: "/venues" },
    { label: "Performance", icon: <EventIcon />, path: "/performance" },
    { label: "Services", icon: <CategoryIcon />, path: "/services" },
    { label: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
  ];

  const guestLinks = [
    { label: "Home", icon: <HomeIcon />, path: "/" },
    { label: "Category", icon: <CategoryIcon />, path: "/category" },
    { label: "About", icon: <InfoIcon />, path: "/about" },
    { label: "Contacts", icon: <ContactMailIcon />, path: "/contact" },
    { label: "FAQ", icon: <HelpIcon />, path: "/faq" },
  ];

  return (
    <>
      {/* TOP ACTION BAR */}
      <Box
        sx={{
          position: "fixed",
          top: 80,
          left: 16,
          zIndex: 1200,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 3,
          px: 1.5,
          py: 1,
        }}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={1}
          alignItems="center"
        >
          <Tooltip title="Menu">
            <IconButton onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* ALWAYS VISIBLE SEARCH */}
          <SearchBar compact={isMobile} />
        </Stack>
      </Box>

      {/* DRAWER */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            pt: 2,
          },
        }}
      >
        <List>
          {(isAuthenticated ? authLinks : guestLinks).map((item) => (
            <ListItem
              button
              key={item.label}
              onClick={() => handleNavigate(item.path)}
            >
              {item.icon}
              <ListItemText sx={{ ml: 2 }} primary={item.label} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* MOBILE SEARCH INSIDE DRAWER (OPTIONAL DUPLICATE) */}
        {isMobile && (
          <Box px={2}>
            <SearchBar fullWidth />
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default Menu;

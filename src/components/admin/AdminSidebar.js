import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EmailIcon from "@mui/icons-material/Email";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RemoveModeratorIcon from "@mui/icons-material/RemoveModerator";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import PolicyIcon from "@mui/icons-material/Policy";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 80;

const AdminSidebar = ({ adminProfile }) => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:900px)");

  const role = adminProfile?.role;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setCollapsed((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  const links = useMemo(
    () => [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: <DashboardIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      },
      {
        label: "Admins",
        path: "/admins",
        icon: <AdminPanelSettingsIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Moderation",
        path: "/moderation",
        icon: <RemoveModeratorIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "MODERATOR"],
      },
      {
        label: "Tasks",
        path: "/tasks",
        icon: <AssignmentIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      },
      {
        label: "Users",
        path: "/users",
        icon: <PeopleIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Events",
        path: "/events",
        icon: <EventIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Venues",
        path: "/venues",
        icon: <LocationOnIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Performance",
        path: "/performance",
        icon: <SportsEsportsIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Services",
        path: "/services",
        icon: <RoomServiceIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Notifications",
        path: "/notifications",
        icon: <NotificationsIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      },
      {
        label: "Emails",
        path: "/emails",
        icon: <EmailIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Payments",
        path: "/payments",
        icon: <ReceiptIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Policies",
        path: "/policies",
        icon: <PolicyIcon fontSize="medium" />,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
    []
  );

  const filteredLinks = useMemo(() => {
    if (!role) return [];
    return links.filter((item) => item.roles.includes(role));
  }, [links, role]);

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  if (!role) return null;

  const SidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
        }}
      >
        {!collapsed ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img
              src={`${process.env.PUBLIC_URL}/FunPlug.png`}
              alt="Logo"
              style={{ width: 40, height: 40, borderRadius: 8 }}
            />

            <Box>
              <Typography fontWeight={900} sx={{ fontSize: "1rem" }}>
                FunPlug Admin
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Role: {role}
              </Typography>
            </Box>
          </Box>
        ) : (
          <img
            src={`${process.env.PUBLIC_URL}/FunPlug.png`}
            alt="Logo"
            style={{ width: 38, height: 38, borderRadius: 8 }}
          />
        )}

        {!isMobile && (
          <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            <IconButton onClick={toggleCollapse}>
              <MenuOpenIcon
                sx={{
                  transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "0.2s ease",
                }}
              />
            </IconButton>
          </Tooltip>
        )}

        {isMobile && (
          <IconButton onClick={toggleMobile}>
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* SCROLLABLE MENU */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          py: 1,
        }}
      >
        <List>
          {filteredLinks.map((item) => (
            <Tooltip
              key={item.path}
              title={collapsed ? item.label : ""}
              placement="right"
              disableHoverListener={!collapsed}
            >
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                selected={isActive(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 42 : 48 }}>
                  {item.icon}
                </ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* FOOTER */}
      <Box sx={{ borderTop: "1px solid #eee", p: 1 }}>
        <Divider sx={{ mb: 1 }} />

        <List>
          <Tooltip
            title={collapsed ? "Settings" : ""}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItemButton
              component={Link}
              to="/settings"
              onClick={() => isMobile && setMobileOpen(false)}
              selected={isActive("/settings")}
              sx={{
                mx: 1,
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 42 : 48 }}>
                <SettingsIcon fontSize="medium" />
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </List>

        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              textAlign: "center",
              mt: 1,
            }}
          >
            © {new Date().getFullYear()} FunPlug
          </Typography>
        )}
      </Box>
    </Box>
  );

  // MOBILE
  if (isMobile) {
    return (
      <>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              borderRight: "1px solid #eee",
            },
          }}
        >
          {SidebarContent}
        </Drawer>

        {!mobileOpen && (
          <IconButton
            onClick={toggleMobile}
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 1400,
              bgcolor: "background.paper",
              boxShadow: 2,
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </>
    );
  }

  // DESKTOP
  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid #eee",
          transition: "width 0.25s ease",
          overflow: "hidden",
        },
      }}
    >
      {SidebarContent}
    </Drawer>
  );
};

export default AdminSidebar;
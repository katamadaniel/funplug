import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { useThemeMode } from "./theme/ThemeContext";
import { getAvatarUrl } from "./utils/avatar";
import funplugIcon from "./funplug-icon.png";

const Header = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { mode, toggleTheme } = useThemeMode();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(null);

  const avatarSrc = user?.avatar ? getAvatarUrl(user) : null;

  const handleLogout = () => {
    onLogout();
    setAnchorEl(null);
    navigate("/login");
  };

  return (
    <AppBar position="sticky" elevation={1} color="default">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* LOGO */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: 1,
          }}
        >
          <Box
                component="img"
                src={funplugIcon}
                alt="FunPlug logo"
            sx={{
              width: 40,
              height: 40,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          <Typography variant="h6" fontWeight={800}>
            FunPlug
          </Typography>
        </Box>

        {/* RIGHT */}
        {!isAuthenticated ? (
          <Box>
            <Button onClick={() => navigate("/login")}>Login</Button>
            <Button variant="contained" onClick={() => navigate("/signup")}>
              Signup
            </Button>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            {/* THEME TOGGLE */}
            <Tooltip title="Toggle theme">
              <IconButton onClick={toggleTheme}>
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* MOBILE */}
            {isMobile ? (
              <>
                <IconButton onClick={(e) => setMobileMenu(e.currentTarget)}>
                      <Avatar
                        src={avatarSrc}
                        alt={user?.username}
                        sx={{ width: 36, height: 36 }}
                      />
                    <SettingsIcon sx={{ ml: 0.5 }} />
                </IconButton>

                <Menu
                  anchorEl={mobileMenu}
                  open={Boolean(mobileMenu)}
                  onClose={() => setMobileMenu(null)}
                >
                  <MenuItem onClick={() => navigate("/contact-support")}>
                    Contact Support
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/change-password")}>
                    Change Password
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/delete-account")}>
                    Delete Account
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {/* DESKTOP */}
                <Tooltip title="Account settings">
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                    {avatarSrc ? (
                      <Avatar
                        src={avatarSrc}
                        alt={user?.username}
                        sx={{ width: 36, height: 36 }}
                      />
                    ) : (
                      <Skeleton
                        variant="circular"
                        width={36}
                        height={36}
                      />
                    )}
                    <SettingsIcon sx={{ ml: 0.5 }} />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => navigate("/problem-report")}>
                    Report Problem
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/contact-support")}>
                    Contact Support
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/change-password")}>
                    Change Password
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/delete-account")}>
                    Delete Account
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/privacy-policy")}>
                    Privacy Policy
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;

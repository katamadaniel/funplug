import React, { useState, useMemo } from "react";
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

  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return null;
    return getAvatarUrl(user);
  }, [user?.avatar]);

  const navigateAndScroll = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAnchorEl(null);
    setMobileMenu(null);
  };

  const handleLogout = () => {
    onLogout();
    setAnchorEl(null);
    setMobileMenu(null);
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
                        key={avatarSrc || "no-avatar"}
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
                  <MenuItem onClick={() => navigateAndScroll("/contact-support")}>
                    Contact Support
                  </MenuItem>
                  <MenuItem onClick={() => navigateAndScroll("/change-password")}>
                    Change Password
                  </MenuItem>
                  <MenuItem onClick={() => navigateAndScroll("/delete-account")}>
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
                        key={avatarSrc || "no-avatar"}
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
                  <MenuItem onClick={() => navigateAndScroll("/report-problem")}>
                    Report Problem
                  </MenuItem>
                  <MenuItem onClick={() => navigateAndScroll("/contact-support")}>
                    Contact Support
                  </MenuItem>
                  <MenuItem onClick={() => navigateAndScroll("/change-password")}>
                    Change Password
                  </MenuItem>
                  <MenuItem onClick={() => navigateAndScroll("/delete-account")}>
                    Delete Account
                  </MenuItem>
                  <MenuItem onClick={() => navigateAndScroll("/privacy-policy")}>
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { loginAdmin, fetchAdminProfile } from "../../services/adminService";

const AdminLogin = ({ setAdminAuthenticated, setAdmin }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const errors = {};
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

    if (!password) errors.password = "Password is required.";
    else if (password.length < 8)
      errors.password = "Password must be at least 8 characters.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getApiErrorMessage = (err) => {
    // If adminService throws normal Error(msg), err.message will exist
    const status = err?.response?.status;

    if (status === 429) {
      return "Too many login attempts. Try again later.";
    }

    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Login failed. Please try again.";

    if (msg.toLowerCase().includes("invalid")) return "Invalid email or password.";
    if (msg.toLowerCase().includes("unauthorized")) return "Invalid email or password.";
    if (msg.toLowerCase().includes("token")) return "Authentication failed. Please retry.";
    if (msg.toLowerCase().includes("network")) return "Network error. Check your connection.";

    return msg;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setApiError("");
    setSuccessMsg("");

    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? value.trimStart() : value,
    }));

    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePasswordKeyUp = (e) => {
    setCapsLockOn(e.getModifierState?.("CapsLock") || false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError("");
    setSuccessMsg("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      const res = await loginAdmin(email, password);

      if (!res?.token) {
        throw new Error("Login response missing token.");
      }

      const adminProfile = await fetchAdminProfile();

      setAdmin(adminProfile);
      setAdminAuthenticated(true);

      setSuccessMsg("Login successful. Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f4f6f8",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              mx: "auto",
              mb: 1,
              width: 52,
              height: 52,
            }}
          >
            <LockOutlinedIcon />
          </Avatar>

          <Typography variant="h5" fontWeight={700}>
            Admin Login
          </Typography>

          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Enter your admin credentials to continue.
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            fullWidth
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            autoComplete="email"
            disabled={loading}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onKeyUp={handlePasswordKeyUp}
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            disabled={loading}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    disabled={loading}
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {capsLockOn && (
            <Typography variant="caption" color="warning.main">
              Caps Lock is ON
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.3,
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "white" }} />
            ) : (
              "Login"
            )}
          </Button>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 2,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            This admin panel is restricted. Unauthorized access is prohibited.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
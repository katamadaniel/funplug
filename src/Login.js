import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, fetchProfile, resendVerification } from "./services/userService";
import { parseApiError } from "./utils/errorHandler";
import {
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = ({ setIsAuthenticated, setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  const showToast = (message, severity = "info") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address";

    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { token } = await login(formData);
      localStorage.setItem("token", token);

      const profile = await fetchProfile();

      if (profile.isBanned) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        showToast(
          "Your account has been banned. Please contact support.",
          "error"
        );
        return;
      }

      if (!profile.isVerified) {
        try {
          await resendVerification(formData.email);
          showToast(
            "Your verification link expired. A new email has been sent.",
            "warning"
          );
        } catch {
          showToast(
            "Please verify your email before logging in.",
            "warning"
          );
        }

        localStorage.removeItem("token");
        setIsAuthenticated(false);
        return;
      }

      setUser(profile);
      setIsAuthenticated(true);
      showToast("Login successful!", "success");

      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      console.error("Login error:", err);
      const parsedError = parseApiError(err);

      // Handle validation errors
      if (parsedError.isValidationError) {
        setErrors(parsedError.fieldErrors);
        showToast(parsedError.message, "warning");
      } else {
        // Handle other errors
        showToast(parsedError.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />

        <TextField
          label="Password"
          fullWidth
          margin="normal"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Box>

      <Typography align="center" sx={{ mt: 2 }}>
        Don't have an account? <a href="/signup">Signup</a>
      </Typography>

      <Typography align="center" sx={{ mt: 1 }}>
        <a href="/reset">Forgot Password?</a>
      </Typography>

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;

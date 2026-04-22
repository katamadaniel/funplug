import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";

import {
  fetchAllAdmins,
  createAdmin,
  deleteAdminById,
  fetchAdminProfile,
} from "../../services/adminService";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [profile, setProfile] = useState(null);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  const isSuperAdmin = useMemo(() => {
    return profile?.role === "SUPER_ADMIN";
  }, [profile]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const adminProfile = await fetchAdminProfile();
        setProfile(adminProfile);

        const data = await fetchAllAdmins();
        setAdmins(data);
      } catch (err) {
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);

  const handleInputChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const formErrors = {};

    if (!newAdmin.name.trim()) formErrors.name = "Name is required.";

    if (!newAdmin.email.trim()) {
      formErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email.trim())) {
      formErrors.email = "Enter a valid email.";
    }

    if (!newAdmin.password) {
      formErrors.password = "Password is required.";
    } else if (newAdmin.password.length < 8) {
      formErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const refreshAdmins = async () => {
    const data = await fetchAllAdmins();
    setAdmins(data);
  };

  const handleAddAdmin = async () => {
    if (!isSuperAdmin) {
      setError("Access denied. Only super admin can create admins.");
      return;
    }

    if (!validateForm()) return;

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      await createAdmin({
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim().toLowerCase(),
        password: newAdmin.password,
        role: newAdmin.role,
      });

      await refreshAdmins();

      setNewAdmin({ name: "", email: "", password: "", role: "ADMIN" });
      setSuccess("Admin added successfully.");
    } catch (err) {
      setError(err?.message || "Error adding admin.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setAdminToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    setDeleteLoading(true);
    setError("");
    setSuccess("");

    try {
      await deleteAdminById(adminToDelete._id);
      setAdmins((prev) => prev.filter((a) => a._id !== adminToDelete._id));
      setSuccess("Admin deleted successfully.");
      closeDeleteDialog();
    } catch (err) {
      setError(err?.message || "Error deleting admin.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const roleChipColor = (role) => {
    if (role === "SUPER_ADMIN") return "error";
    if (role === "MODERATOR") return "warning";
    return "primary";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          Admin Management
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Manage admin users, roles and access permissions.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* ADMIN LIST */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }} elevation={3}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Admin Accounts
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Only super admin can add or delete admins.
          </Typography>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa" }}>
                <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    No admins found.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin._id} hover>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={admin.role || "ADMIN"}
                        color={roleChipColor(admin.role)}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        disabled={!isSuperAdmin || admin.role === "SUPER_ADMIN"}
                        onClick={() => openDeleteDialog(admin)}
                        sx={{ fontWeight: 700 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ADD ADMIN FORM */}
      <Paper sx={{ mt: 3, p: 3, borderRadius: 3 }} elevation={3}>
        <Typography variant="h6" fontWeight={800}>
          Create New Admin
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Only the super admin can create admins and assign roles.
        </Typography>

        {!isSuperAdmin ? (
          <Alert severity="warning">
            You do not have permission to create admins.
          </Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              label="Full Name"
              name="name"
              value={newAdmin.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />

            <TextField
              label="Email Address"
              name="email"
              value={newAdmin.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={newAdmin.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
            />

            <TextField
              select
              label="Role"
              name="role"
              value={newAdmin.role}
              onChange={handleInputChange}
              fullWidth
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="MODERATOR">MODERATOR</MenuItem>
            </TextField>

            <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
              <Button
                variant="contained"
                onClick={handleAddAdmin}
                disabled={loading}
                sx={{ fontWeight: 800, borderRadius: 2, py: 1.2 }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Add Admin"}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Are you sure you want to delete{" "}
            <b>{adminToDelete?.name}</b> ({adminToDelete?.email})?
          </Typography>

          <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
            This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAdmin}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            sx={{ fontWeight: 800 }}
          >
            {deleteLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admins;
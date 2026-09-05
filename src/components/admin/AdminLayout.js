import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import AdminSidebar from "./AdminSidebar";
import { fetchAdminProfile, logoutAdmin } from "../../services/adminService";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/admin");
          return;
        }

        const profile = await fetchAdminProfile();
        setAdminProfile(profile);
      } catch (err) {
        console.error("Profile load failed:", err.message);
        logoutAdmin();
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!adminProfile) return null;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar adminProfile={adminProfile} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: "100vh",
          bgcolor: "background.default",
          background: (theme) => theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(108,99,255,0.12), transparent 38%), linear-gradient(180deg, #0b1020 0%, #10182a 100%)"
            : "linear-gradient(135deg, rgba(108,99,255,0.08), transparent 38%), linear-gradient(180deg, #f7f8fc 0%, #eef1f8 100%)",
          transition: "background 180ms ease",
        }}
      >
        {children || <Outlet context={{ adminProfile }} />}
      </Box>
    </Box>
  );
};

export default AdminLayout;
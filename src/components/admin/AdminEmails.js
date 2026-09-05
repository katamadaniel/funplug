import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import EmailInbox from "./EmailInbox/EmailInbox";
import EmailComposer from "./EmailComposer/EmailComposer";
import SignupInvitationComposer from "./SignupInvitationComposer/SignupInvitationComposer";
import TemplateManager from "./TemplateManager/TemplateManager";

const AdminEmails = () => {
  const [tabValue, setTabValue] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleComposerSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setTabValue(0);
  };

  const handleInvitationSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setTabValue(0);
  };

  const handleInboxRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100vh", bgcolor: "background.default", background: "linear-gradient(135deg, rgba(108,99,255,0.08), transparent 38%)" }}>
      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 2, bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(18,26,45,0.76)" : "rgba(255,255,255,0.78)", backdropFilter: "blur(18px)", border: 1, borderColor: "divider" }} elevation={0}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label=" Inbox" />
          <Tab label=" Compose Email" />
          <Tab label=" Invite Users" />
          <Tab label=" Email Templates" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {/* Inbox Tab */}
        {tabValue === 0 && (
          <EmailInbox key={refreshKey} onRefresh={handleInboxRefresh} />
        )}

        {/* Compose Tab */}
        {tabValue === 1 && (
          <EmailComposer key={refreshKey} onSuccess={handleComposerSuccess} />
        )}

        {/* Signup Invitation Tab */}
        {tabValue === 2 && (
          <SignupInvitationComposer key={refreshKey} onSuccess={handleInvitationSuccess} />
        )}

        {/* Templates Tab */}
        {tabValue === 3 && (
          <TemplateManager key={refreshKey} />
        )}
      </Box>
    </Box>
  );
};

export default AdminEmails;
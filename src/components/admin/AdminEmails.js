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
    <Box p={2}>
      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 2 }}>
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
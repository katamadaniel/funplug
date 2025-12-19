import React, { useContext, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Badge,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Drawer,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MicIcon from "@mui/icons-material/Mic";
import BuildIcon from "@mui/icons-material/Build";
import { format } from "date-fns";
import { NotificationContext } from "./contexts/NotificationContext";

const CATEGORY_CONFIG = {
  ticketPurchase: {
    label: "Tickets",
    icon: <ConfirmationNumberIcon />,
  },
  venueBooking: {
    label: "Venues",
    icon: <LocationOnIcon />,
  },
  performanceBooking: {
    label: "Performance",
    icon: <MicIcon />,
  },
  serviceBooking: {
    label: "Services",
    icon: <BuildIcon />,
  },
};

const Notifications = () => {
  const { notifications, unseenCount, markAsSeen, markAllAsSeen } =
    useContext(NotificationContext);

  const [activeTab, setActiveTab] = useState("ticketPurchase");
  const [selected, setSelected] = useState(null);

  const grouped = useMemo(() => {
    const groups = {};
    Object.keys(CATEGORY_CONFIG).forEach((key) => (groups[key] = []));
    notifications.forEach((n) => {
      if (groups[n.type]) groups[n.type].push(n);
    });
    return groups;
  }, [notifications]);

  const unseenByType = (type) =>
    grouped[type]?.filter((n) => !n.seen).length || 0;

  const openDetails = (n) => {
    setSelected(n);
    if (!n.seen) markAsSeen(n);
  };

  return (
    <Box maxWidth="900px" mx="auto" px={2} py={4}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Notifications
        {unseenCount > 0 && (
          <Chip
            label={`${unseenCount} new`}
            color="error"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      {/* CATEGORY TABS */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Chip
          label="Mark all as read"
          clickable
          onClick={() => markAllAsSeen(activeTab)}
          disabled={unseenByType(activeTab) === 0}
        />
      </Box>
       
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <Tab
            key={key}
            value={key}
            icon={
              <Badge
                badgeContent={unseenByType(key)}
                color="error"
                invisible={unseenByType(key) === 0}
              >
                {cfg.icon}
              </Badge>
            }
            label={cfg.label}
          />
        ))}
      </Tabs>

      {/* NOTIFICATION LIST */}
      <List>
        {grouped[activeTab]?.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={6}>
            No {CATEGORY_CONFIG[activeTab].label.toLowerCase()} notifications
            yet.
          </Typography>
        ) : (
          grouped[activeTab]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((n) => (
              <ListItemButton
                key={n._id}
                onClick={() => openDetails(n)}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: n.seen
                    ? "background.paper"
                    : "action.selected",
                }}
              >
                <ListItemText
                  primary={
                    <Typography fontWeight={n.seen ? 500 : 700}>
                      {n.message}
                    </Typography>
                  }
                  secondary={format(new Date(n.date), "PPpp")}
                />
                {!n.seen && <Chip label="NEW" color="primary" size="small" />}
              </ListItemButton>
            ))
        )}
      </List>

      {/* DETAILS DRAWER */}
      <Drawer
        anchor="right"
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 3 } }}
      >
        {selected && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                Notification Details
              </Typography>
              <IconButton onClick={() => setSelected(null)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Typography mb={2}>{selected.message}</Typography>

            <Typography variant="caption" color="text.secondary">
              {format(new Date(selected.date), "PPpp")}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* TYPE-SPECIFIC DETAILS */}
            <Stack spacing={1}>
              {Object.entries(selected.details || {}).map(([k, v]) => (
                <Typography key={k}>
                  <strong>{k.replace(/([A-Z])/g, " $1")}:</strong> {String(v)}
                </Typography>
              ))}
            </Stack>
          </>
        )}
      </Drawer>
    </Box>
  );
};

export default Notifications;

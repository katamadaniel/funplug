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
  Paper,
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

  const formatDetailKey = (key) => {
    // Custom display names for booking-related keys
    const keyMap = {
      bookingType: "Booking Type",
      startDate: "Start Date",
      endDate: "End Date",
      bookingDate: "Booking Date",
      from: "From",
      to: "To",
    };
    if (keyMap[key]) return keyMap[key];
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDetailValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("date") || lowerKey.includes("createdat")) {
      return format(new Date(value), "EEEE, MMM d, yyyy");
    }

    if (lowerKey.includes("amount") || lowerKey === "total") {
      return `Ksh. ${Number(value).toFixed(2)}`;
    }

    if (lowerKey === "duration") {
      if (typeof value === "number") {
        if (value % 24 === 0 && value >= 24) {
          return `${value / 24} day(s) (${value} hrs)`;
        }
        if (value > 24) {
          const days = Math.floor(value / 24);
          const hrs = value % 24;
          return `${days} day(s) ${hrs} hr(s) (${value} hrs)`;
        }
        return `${value} hrs`;
      }
      return String(value);
    }

    if (lowerKey === "startdate") {
      return format(new Date(value), "EEEE, MMM d, yyyy");
    }

    if (lowerKey === "enddate") {
      return format(new Date(value), "EEEE, MMM d, yyyy");
    }

    if (lowerKey === "from" || lowerKey === "to") {
      return String(value);
    }

    if (lowerKey === "bookingtype") {
      return value === "multiple" ? "Multiple Days" : "Single Day";
    }

    return String(value);
  };

  const openDetails = (n) => {
    setSelected(n);
    if (!n.seen) markAsSeen(n);
  };

  return (
    <Box maxWidth="900px" mx="auto" px={2} py={4}>
      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(18,26,45,0.78)" : "rgba(255,255,255,0.82)", border: 1, borderColor: "divider", backdropFilter: "blur(16px)" }} elevation={0}>
        <Typography variant="h6" fontWeight={800}>Stay on top of your activity</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Booking confirmations, ticket activity, and service updates appear here. Open a notification to review its details, then use the related booking or purchase area to follow up.
        </Typography>
      </Paper>
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
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flex: 1 }}
        >
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

        <Chip
          label="Mark all as read"
          clickable
          onClick={() => markAllAsSeen(activeTab)}
          disabled={unseenByType(activeTab) === 0}
          sx={{ mt: { xs: 1, sm: 0 }, ml: { sm: 2 } }}
        />
      </Box>

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
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
              <Stack spacing={1}>
                {Object.entries(selected.details || {}).map(([k, v]) => (
                  <Box
                    key={k}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography color="text.secondary" sx={{ mr: 1, fontWeight: 600 }}>
                      {formatDetailKey(k)}:
                    </Typography>
                    <Typography sx={{ textAlign: "right", wordBreak: "break-word" }}>
                      {formatDetailValue(k, v)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </>
        )}
      </Drawer>
    </Box>
  );
};

export default Notifications;

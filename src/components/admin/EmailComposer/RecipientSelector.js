import React, { useState, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Paper,
  Stack,
  Chip,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { searchUsers, getAllUserEmails } from "../../../services/adminService";

const RecipientSelector = ({ selectedRecipients, onRecipientsChange, disabled = false }) => {
  const [tabValue, setTabValue] = useState(0);

  // Manual Entry Tab
  const [manualInput, setManualInput] = useState(selectedRecipients.join(", "));

  // User Search Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState([]);

  // Bulk Selection Tab
  const [allUsers, setAllUsers] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [allEmails, setAllEmails] = useState([]);

  // Validation state
  const [validationErrors, setValidationErrors] = useState([]);

  const validateEmails = useCallback((emailArray) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = [];

    emailArray.forEach((email, index) => {
      if (!emailRegex.test(email.toLowerCase().trim())) {
        errors.push(`Invalid email at position ${index + 1}: ${email}`);
      }
    });

    return errors;
  }, []);

  // --- MANUAL ENTRY TAB ---
  const handleManualChange = (e) => {
    const input = e.target.value;
    setManualInput(input);

    // Parse and validate emails
    const emails = input
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    const errors = validateEmails(emails);
    setValidationErrors(errors);

    if (errors.length === 0) {
      // Remove duplicates
      const uniqueEmails = [...new Set(emails)];
      onRecipientsChange(uniqueEmails);
    }
  };

  // --- USER SEARCH TAB ---
  const handleSearchChange = async (query) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await searchUsers(query, 15);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("User search failed:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    const email = user.email.toLowerCase();

    const isSelected = searchedUsers.some((u) => u._id === user._id);

    let updated = isSelected
      ? searchedUsers.filter((u) => u._id !== user._id)
      : [...searchedUsers, user];

    setSearchedUsers(updated);

    // Update recipients with selected emails
    const emails = updated.map((u) => u.email);
    onRecipientsChange(emails);
  };

  const isUserSelected = (userId) => {
    return searchedUsers.some((u) => u._id === userId);
  };

  // --- BULK SELECTION TAB ---
  const handleOpenBulkDialog = async () => {
    setBulkLoading(true);
    try {
      const res = await getAllUserEmails();
      setAllEmails(res.data || []);
      setBulkDialog(true);
    } catch (err) {
      console.error("Failed to fetch user emails:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSelectAll = () => {
    onRecipientsChange(allEmails);
  };

  const handleDeselectAll = () => {
    onRecipientsChange([]);
  };

  const handleBulkConfirm = () => {
    setBulkDialog(false);
  };

  // --- RECIPIENT DISPLAY ---
  const displayRecipients = selectedRecipients.slice(0, 5);
  const hasMore = selectedRecipients.length > 5;

  return (
    <Box>
      {/* Recipient Count and Preview */}
      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>
          Recipients ({selectedRecipients.length})
        </Typography>

        {selectedRecipients.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {displayRecipients.map((recipient) => (
              <Chip
                key={recipient}
                label={recipient}
                size="small"
                onDelete={() => {
                  const updated = selectedRecipients.filter((r) => r !== recipient);
                  onRecipientsChange(updated);
                }}
              />
            ))}

            {hasMore && <Chip label={`+${selectedRecipients.length - 5} more`} size="small" />}
          </Stack>
        )}

        {validationErrors.length > 0 && (
          <Box mt={1}>
            {validationErrors.map((error, i) => (
              <Typography key={i} variant="caption" color="error" display="block">
                {error}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 1 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="Manual Entry" />
          <Tab label="Search Users" />
          <Tab label="Bulk Selection" />
        </Tabs>

        <Box p={2}>
          {/* TAB 0: MANUAL ENTRY */}
          {tabValue === 0 && (
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Paste email addresses separated by commas or newlines&#10;example@funplug.net, another@funplug.net"
              value={manualInput}
              onChange={handleManualChange}
              disabled={disabled}
              error={validationErrors.length > 0}
              helperText={validationErrors.length > 0 ? "Fix errors above" : ""}
            />
          )}

          {/* TAB 1: USER SEARCH */}
          {tabValue === 1 && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Search by email, name, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={disabled}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchLoading && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
              />

              {searchResults.length > 0 && (
                <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto" }}>
                  <List>
                    {searchResults.map((user) => (
                      <ListItem key={user._id} disablePadding>
                        <ListItemButton
                          onClick={() => handleSelectUser(user)}
                          dense
                        >
                          <Checkbox
                            edge="start"
                            checked={isUserSelected(user._id)}
                            tabIndex={-1}
                            disableRipple
                          />
                          <ListItemText
                            primary={user.name}
                            secondary={user.email}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {searchQuery.length > 0 && searchResults.length === 0 && !searchLoading && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No users found
                </Typography>
              )}
            </Stack>
          )}

          {/* TAB 2: BULK SELECTION */}
          {tabValue === 2 && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Select predefined groups or all users for bulk email sending.
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleOpenBulkDialog}
                  disabled={disabled || bulkLoading}
                >
                  {bulkLoading ? "Loading..." : "Select from All Users"}
                </Button>

                {selectedRecipients.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeselectAll}
                  >
                    Clear Selection
                  </Button>
                )}
              </Stack>

              {selectedRecipients.length > 0 && (
                <Typography variant="body2" color="success.main">
                  {selectedRecipients.length} recipient(s) selected
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Paper>

      {/* BULK SELECTION DIALOG */}
      <Dialog open={bulkDialog} onClose={handleBulkConfirm} fullWidth maxWidth="sm">
        <DialogTitle>Bulk User Selection</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSelectAll}
              >
                Select All ({allEmails.length})
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={handleDeselectAll}
              >
                Deselect All
              </Button>
            </Stack>

            {selectedRecipients.length > 0 && (
              <Typography variant="body2">
                {selectedRecipients.length} of {allEmails.length} selected
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleBulkConfirm}>Confirm Selection</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecipientSelector;

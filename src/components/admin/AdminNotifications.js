import React, { useState, useEffect } from 'react';
import { Typography, Button, Drawer, List, ListItem, ListItemText, TextField, Switch, Box } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AdminNotifications = () => {
  const [problemReports, setProblemReports] = useState([]);
  const [supportChats, setSupportChats] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [selectedTab, setSelectedTab] = useState('problemReports');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch usernames for problem reports and support chats
  const fetchUsernames = async (userIds) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/get-usernames`, { userIds });
      setUserDetails(response.data);  // {userId: 'username'}
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Fetch Problem Reports
  const fetchProblemReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/report/problem`);
      setProblemReports(response.data);

      // Fetch the usernames for the associated userIds
      const userIds = [...new Set(response.data.map((report) => report.userId))];
      fetchUsernames(userIds);
    } catch (error) {
      console.error('Error fetching problem reports:', error);
    }
  };

  // Fetch Support Chats and Group by User
  const fetchSupportChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/support/chat`);
      const chatsGroupedByUser = groupChatsByUser(response.data);
      setSupportChats(chatsGroupedByUser);

      // Fetch the usernames for the associated userIds
      const userIds = Object.keys(chatsGroupedByUser);
      fetchUsernames(userIds);
    } catch (error) {
      console.error('Error fetching support chats:', error);
    }
  };

  // Helper function to group chats by user
  const groupChatsByUser = (chats) => {
    return chats.reduce((groupedChats, chat) => {
      if (!groupedChats[chat.userId]) {
        groupedChats[chat.userId] = [];
      }
      groupedChats[chat.userId].push(chat);
      return groupedChats;
    }, {});
  };

  // Toggle Problem Report Resolved Status
  const handleToggleResolved = async (reportId, currentStatus) => {
    try {
      await axios.put(`${API_URL}/api/report/problem/${reportId}`, {
        resolved: !currentStatus,
      });
      fetchProblemReports(); // Refresh after update
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  // Admin Send Response to Support Chat
  const handleSendResponse = async () => {
    try {
      await axios.post(`${API_URL}/api/support/chat/reply`, {
        userId: selectedUserId,
        message: adminMessage,
      });
      fetchSupportChats(); // Refresh after sending a message
      setAdminMessage(''); // Clear input field
    } catch (error) {
      console.error('Error sending admin message:', error);
    }
  };

  // Open the drawer with data
  const openDrawer = (userId, tab) => {
    setSelectedUserId(userId);
    setSelectedTab(tab);
    setDrawerOpen(true);
  };

  useEffect(() => {
    fetchProblemReports();
    fetchSupportChats();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Manage Notifications
      </Typography>

      {/* Row with Buttons for Problem Reports and Support Chats */}
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Button
          onClick={() => setSelectedTab('problemReports')}
          variant="contained"
          style={{ width: '48%' }}
        >
          Problem Reports
        </Button>
        <Button
          onClick={() => setSelectedTab('supportChats')}
          variant="contained"
          style={{ width: '48%' }}
        >
          Support Chats
        </Button>
      </Box>

      {selectedTab === 'problemReports' && (
        <div>
          <Typography variant="h5">Problem Reports</Typography>
          <Typography variant="h6" color="primary">Unresolved</Typography>
          <List>
            {problemReports.filter((report) => !report.resolved).map((report) => (
              <ListItem key={report._id} button onClick={() => openDrawer(report.userId, 'problemReports')}>
                <ListItemText
                  primary={<strong>{`User: ${userDetails[report.userId] || report.userId}`}</strong>}
                  secondary={<span>{`Issue: ${report.problemDescription}`}</span>}
                />
                <Switch
                  checked={report.resolved}
                  onChange={() => handleToggleResolved(report._id, report.resolved)}
                  name="resolved"
                  color="primary"
                />
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" color="primary">Resolved</Typography>
          <List>
            {problemReports.filter((report) => report.resolved).map((report) => (
              <ListItem key={report._id} button onClick={() => openDrawer(report.userId, 'problemReports')}>
                <ListItemText
                  primary={<strong>{`User: ${userDetails[report.userId] || report.userId}`}</strong>}
                  secondary={<span>{`Issue: ${report.problemDescription}`}</span>}
                />
                <Switch
                  checked={report.resolved}
                  onChange={() => handleToggleResolved(report._id, report.resolved)}
                  name="resolved"
                  color="primary"
                />
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {selectedTab === 'supportChats' && (
        <div>
          <Typography variant="h5">Support Chats</Typography>
          <List>
            {Object.keys(supportChats).map((userId) => (
              <ListItem key={userId} button onClick={() => openDrawer(userId, 'supportChats')}>
                <ListItemText
                  primary={<strong>{`User: ${userDetails[userId] || userId}`}</strong>}
                  secondary={<span>{`Last Message: ${supportChats[userId][supportChats[userId].length - 1].message}`}</span>}
                />
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {/* Drawer for Chat or Problem Report */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div style={{ width: 350, padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedTab === 'problemReports' && selectedUserId && (
            <div>
              <Typography variant="h6">Problem Report Details</Typography>
              {problemReports
                .filter((report) => report.userId === selectedUserId)
                .map((report) => (
                  <div key={report._id}>
                    <Typography variant="body1">{report.problemDescription}</Typography>
                    <Switch
                      checked={report.resolved}
                      onChange={() => handleToggleResolved(report._id, report.resolved)}
                      name="resolved"
                      color="primary"
                    />
                    <Typography variant="body2">
                      {report.resolved ? 'Resolved' : 'Unresolved'}
                    </Typography>
                  </div>
                ))}
            </div>
          )}

          {selectedTab === 'supportChats' && selectedUserId && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6">Support Chat</Typography>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {supportChats[selectedUserId].map((chat) => (
                  <Typography key={chat._id} variant="body1">
                    {chat.isAdminReply ? 'Admin: ' : 'User: '} {chat.message}
                  </Typography>
                ))}
              </div>
              <TextField
                label="Reply to User"
                variant="outlined"
                fullWidth
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                style={{ marginTop: '10px' }}
              />
              <Button
                onClick={handleSendResponse}
                variant="contained"
                color="primary"
                style={{ marginTop: '10px', alignSelf: 'flex-end' }}
              >
                Send Response
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default AdminNotifications;

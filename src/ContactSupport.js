import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;
const SUPPORT_API_URL = `${API_URL}/api/support/chat/`;

const ContactSupport = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Assuming the user ID is stored in localStorage after login
  const userId = localStorage.getItem('userId');

  // Function to fetch chat history
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${SUPPORT_API_URL}${userId}`);
      setChatHistory(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  // Function to send a message to support
  const handleContactSupport = async () => {
    if (!message) {
      alert('Please enter a message.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/support/chat`, {
        userId, // Send the logged-in user's ID
        message,
      });

      if (response.status === 201) {
        setMessage(''); // Clear the input field after sending the message
        fetchChatHistory(); // Fetch the updated chat history
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error contacting support:', error);
      alert('Error contacting support');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
    // Set an interval to refresh chat every few seconds
    const interval = setInterval(fetchChatHistory, 5000); // Fetch chat every 5 seconds
    return () => clearInterval(interval); // Clear the interval on unmount
  }, []);

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Contact Support
      </Typography>
      <Paper variant="outlined" style={{ height: '300px', overflowY: 'scroll', marginBottom: '16px', padding: '8px' }}>
        {chatHistory.length > 0 ? (
          <List>
            {chatHistory.map((chat, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={<strong>{chat.isAdminReply ? 'Admin' : 'You'}</strong>}
                    secondary={
                      <>
                        <Typography variant="body2" color="textPrimary">
                          {chat.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(chat.sentAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < chatHistory.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No messages yet. Start the conversation!
          </Typography>
        )}
      </Paper>
      <TextField
        label="Your message"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here"
      />
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          sx={{ display: 'block', margin: '20px auto' }}
          onClick={handleContactSupport}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </Box>
    </Container>
  );
};

export default ContactSupport;

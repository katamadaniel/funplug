import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { getComplianceReport } from '../../services/policyService';
import PolicyVersionControl from './PolicyVersionControl';
import PolicyComplianceReport from './PolicyComplianceReport';
import PolicyUpdateSchedule from './PolicyUpdateSchedule';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`policy-tabpanel-${index}`}
      aria-labelledby={`policy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PolicyManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch compliance report which contains acknowledgment stats
      const response = await getComplianceReport();
      // Transform data into stats format if needed
      if (response.data && Array.isArray(response.data)) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Legal Documents Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage legal documents, track compliance, and schedule policy reviews
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {stats.map((stat) => (
            <Card key={stat._id}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat._id === 'privacy-policy' && 'Privacy Policy'}
                  {stat._id === 'terms-of-service' && 'Terms of Service'}
                  {stat._id === 'user-agreement' && 'User Agreement'}
                </Typography>
                <Typography variant="h6">
                  {stat.totalAcknowledgments} Acknowledgments
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.uniqueUserCount} Unique Users
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="policy management tabs"
            sx={{ bgcolor: '#f5f5f5' }}
          >
            <Tab label="Version Control" id="policy-tab-0" />
            <Tab label="Update Schedule" id="policy-tab-1" />
            <Tab label="Compliance Reports" id="policy-tab-2" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <PolicyVersionControl onSuccess={() => setSuccess('Version updated successfully')} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <PolicyUpdateSchedule onSuccess={() => setSuccess('Schedule updated successfully')} />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <PolicyComplianceReport />
          </TabPanel>
        </Box>
      </Card>
    </Container>
  );
}

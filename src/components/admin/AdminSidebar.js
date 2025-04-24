import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <Box
    sx={{
      width: collapsed ? 70 : 250, // Sidebar width based on collapse state
      bgcolor: 'background.paper',
      height: '100vh',
      transition: 'width 0.3s ease', // Smooth transition for width change
      overflow: 'hidden', // Prevent content overflow when collapsed
    }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          borderBottom: '1px solid #ddd',
          display: collapsed ? 'none' : 'block', // Hide logo when collapsed
        }}
      >
        <img src={`${process.env.PUBLIC_URL}/FunPlug.png`} alt="Logo" style={{ width: '100px' }} />
      </Box>

      {/* Sidebar Items */}
      <List>
        <ListItem button component={Link} to="dashboard">
          <ListItemIcon>
            <DashboardIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
        </ListItem>

        <ListItem button component={Link} to="admins">
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary="Admins" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
        </ListItem>

        <ListItem button component={Link} to="users">
          <ListItemIcon>
            <PeopleIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary="Users" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
        </ListItem>

        <ListItem button component={Link} to="events">
          <ListItemIcon>
            <EventIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary="Events" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
        </ListItem>

        <ListItem button component={Link} to="venues">
          <ListItemIcon>
            <LocationOnIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary="Venues" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
        </ListItem>

        <ListItem button component={Link} to="notifications">
          <ListItemIcon>
            <NotificationsIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary="Notifications" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
        </ListItem>

        <ListItem button component={Link} to="emails">
          <ListItemIcon>
            <EmailIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary="Emails" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
        </ListItem>

        <ListItem button component={Link} to="invoices">
          <ListItemIcon>
            <ReceiptIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary="Invoices" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
        </ListItem>
      </List>

      {/* Bottom Options */}
      <Box sx={{ mt: 'auto' }}>
        <Divider />

        {/* Settings */}
        <List>
          <ListItem button component={Link} to="settings">
            <ListItemIcon>
              <SettingsIcon fontSize="large" />
            </ListItemIcon>
            <ListItemText primary="Settings" sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
          </ListItem>

          {/* Collapse Button */}
          <ListItem button onClick={toggleCollapse}>
            <ListItemIcon>
              {collapsed ? <ExpandMoreIcon fontSize="large" /> : <ExpandLessIcon fontSize="large" />}
            </ListItemIcon>
            <ListItemText primary={collapsed ? 'Expand' : 'Collapse'} sx={{ display: collapsed ? 'none' : 'block', fontSize: '1rem' }} />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default AdminSidebar;

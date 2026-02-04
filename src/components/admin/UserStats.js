import React, { useContext } from 'react';
import { UsersContext } from '../../contexts/UsersContext';
import {
  Box,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let current = 0;
    const step = value / 40;

    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

const TrendChart = ({ title, data, xKey }) => (

<Paper sx={{ p: 2 }}>
    <Typography variant="subtitle1" mb={1}>
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#1976d2"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  </Paper>
);

const UserStats = () => {
  const {
    totalUsers = 0,
    dailyActiveUsers = 0,
    weeklyActiveUsers = 0,
    monthlyActiveUsers = 0,
    dailyTrend,
    weeklyTrend,
    monthlyTrend,
    highestSellingUsers,
    loading,
    error,
  } = useContext(UsersContext) || {};

if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* ===== KPIs ===== */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption">Total Users</Typography>
            <Typography variant="h4">
              <AnimatedNumber value={totalUsers} />
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption">Daily Active Users</Typography>
            <Typography variant="h4">
              <AnimatedNumber value={dailyActiveUsers} />
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption">Weekly Active Users</Typography>
            <Typography variant="h4">
              <AnimatedNumber value={weeklyActiveUsers} />
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption">Monthly Active Users</Typography>
            <Typography variant="h4">
              <AnimatedNumber value={monthlyActiveUsers} />
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ===== Trends (Horizontal Layout) ===== */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={4}>
            <TrendChart
              title="Daily Activity Trend"
              data={dailyTrend}
              xKey="date"
            />
        </Grid>
        <Grid item xs={12} md={4}>
            <TrendChart
              title="Weekly Activity Trend"
              data={weeklyTrend}
              xKey="week"
            />
        </Grid>
        <Grid item xs={12} md={4}>
            <TrendChart
              title="Monthly Activity Trend"
              data={monthlyTrend}
              xKey="month"
            />
        </Grid>
      </Grid>

      {/* ===== Highest Selling Users ===== */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" mb={2}>
          Highest Selling Creators
        </Typography>

        {!highestSellingUsers.length ? (
          <Typography variant="caption">No data available</Typography>
        ) : (
          <List>
          {highestSellingUsers.map((user, index) => (
            <ListItem key={user._id}>
              <ListItemText
                primary={`${index + 1}. ${user.username} (${user.category})`}
                secondary={`Tickets: ${user.tickets} | Venues: ${user.venueBookings} | Performances: ${user.performanceBookings} | Services: ${user.serviceBookings}`}
              />
            </ListItem>
          ))}
        </List>
        )}
      </Paper>
    </Box>
  );
};

export default UserStats;

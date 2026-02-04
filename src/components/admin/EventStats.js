import React, { useContext, useMemo, useState } from 'react';
import { EventsContext } from '../../contexts/EventsContext';
import {
  Typography,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  TableBody,
  TableHead,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const EVENT_CATEGORY_COLORS = {
  'social-event': '#1976d2',
  'corporate-event': '#9c27b0',
  'community-event': '#2e7d32',
  'food-and-drinks-event': '#ef6c00',
  festival: '#6a1b9a',
  performance: '#d32f2f',
  'virtual-event': '#0288d1',
  'outdoor-event': '#388e3c',
  'kids-event': '#fbc02d',
  default: '#607d8b',
};

const shadeColor = (hex, percent) => {
  let f = parseInt(hex.slice(1), 16);
  let t = percent < 0 ? 0 : 255;
  let p = Math.abs(percent);
  let R = f >> 16;
  let G = (f >> 8) & 0x00ff;
  let B = f & 0x0000ff;

  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
};

  const EventStats = () => {
    const {
      highestSellingEvents,
      eventCategoryTicketSales,
      loading,
      error,
    } = useContext(EventsContext);

  const [metric, setMetric] = useState('tickets'); // tickets | revenue
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const chartData = useMemo(() => {
    if (!eventCategoryTicketSales?.length) return [];

    return eventCategoryTicketSales.map(cat => {
      const total =
        metric === 'tickets' ? cat.totalTickets : cat.totalRevenue;

      return {
        category: cat.category,
        ...cat.subCategories.reduce((acc, sc) => {
          const value =
            metric === 'tickets' ? sc.tickets : sc.revenue;

          acc[sc.subCategory] = Number(
            ((value / total) * 100).toFixed(1)
          );
          return acc;
        }, {}),
      };
    });
  }, [eventCategoryTicketSales, metric]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                Category Performance (% Contribution)
              </Typography>

              <ToggleButtonGroup
                value={metric}
                exclusive
                onChange={(_, v) => v && setMetric(v)}
                size="small"
              >
                <ToggleButton value="tickets">Tickets %</ToggleButton>
                <ToggleButton value="revenue">Revenue %</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis unit="%" />
                <Tooltip formatter={v => `${v}%`} />

                {eventCategoryTicketSales.flatMap(cat =>
                  cat.subCategories.map((sc, i) => (
                    <Bar
                      key={`${cat.category}-${sc.subCategory}`}
                      dataKey={sc.subCategory}
                      stackId={cat.category}
                      fill={shadeColor(
                        EVENT_CATEGORY_COLORS[cat.category] ||
                          EVENT_CATEGORY_COLORS.default,
                        i * 0.15
                      )}
                      onClick={() => {
                        setActiveCategory(cat);
                        setOpen(true);
                      }}
                    />
                  ))
                )}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ===== Table ===== */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" mb={1}>
            Top 10 Highest Selling Events
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Event Title</TableCell>
                  <TableCell align="right">Regular</TableCell>
                  <TableCell align="right">VIP</TableCell>
                  <TableCell align="right">VVIP</TableCell>
                  <TableCell align="right">Revenue (KES)</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {highestSellingEvents.map(event => (
                  <TableRow key={event.eventId}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell align="right">
                      {event.totalRegularTickets}
                    </TableCell>
                    <TableCell align="right">
                      {event.totalVipTickets}
                    </TableCell>
                    <TableCell align="right">
                      {event.totalVvipTickets}
                    </TableCell>
                    <TableCell align="right">
                      {event.totalRevenue?.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {activeCategory?.category} –{' '}
          {metric === 'tickets'
            ? 'Ticket Share'
            : 'Revenue Share'}
        </DialogTitle>

        <DialogContent>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={activeCategory?.subCategories || []}
                dataKey={metric === 'tickets' ? 'tickets' : 'revenue'}
                nameKey="subCategory"
                outerRadius={110}
                label
              >
                {activeCategory?.subCategories.map((_, i) => (
                  <Cell
                    key={i}
                    fill={shadeColor(
                      EVENT_CATEGORY_COLORS[activeCategory.category] ||
                        EVENT_CATEGORY_COLORS.default,
                      i * 0.15
                    )}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EventStats;

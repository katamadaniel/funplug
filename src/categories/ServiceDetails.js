import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
} from "@mui/material";

import ServiceCard from "./ServiceCard";
import ServiceDetailsModal from "../ServiceDetailsModal";
import ServiceBookingFormModal from "../ServiceBookingFormModal";

const API_URL = process.env.REACT_APP_API_URL;
const SERVICES_API = `${API_URL}/api/services`;
const USERS_API = `${API_URL}/api/users`;

const ServiceDetails = () => {
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [selectedService, setSelectedService] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [srvRes, usersRes] = await Promise.all([
          axios.get(SERVICES_API),
          axios.get(USERS_API),
        ]);

        if (!mounted) return;

        const validUsers = new Set(usersRes.data.map((u) => u._id));
        setServices(srvRes.data.filter((s) => validUsers.has(s.userId)));
        setUsers(usersRes.data);
      } catch (err) {
        console.error("ServiceDetails load error:", err);
      } finally {
        mounted && setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  const countries = useMemo(
    () => [...new Set(services.map((s) => s.country).filter(Boolean))].sort(),
    [services]
  );

  const cities = useMemo(() => {
    const filtered = services.filter((s) =>
      countryFilter ? s.country === countryFilter : true
    );
    return [...new Set(filtered.map((s) => s.city).filter(Boolean))].sort();
  }, [services, countryFilter]);

  const grouped = useMemo(() => {
    return services
      .filter((s) => {
        if (countryFilter && s.country !== countryFilter) return false;
        if (cityFilter && s.city !== cityFilter) return false;
        return true;
      })
      .reduce((acc, cur) => {
        const key = cur.serviceType || "Other";
        acc[key] = acc[key] || [];
        acc[key].push(cur);
        return acc;
      }, {});
  }, [services, countryFilter, cityFilter]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        Services — Browse by service type
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={countryFilter}
            label="Country"
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setCityFilter("");
            }}
          >
            <MenuItem value="">All</MenuItem>
            {countries.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>City</InputLabel>
          <Select
            value={cityFilter}
            label="City"
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {cities.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip label={`Total: ${services.length}`} />
      </Box>

      {/* Cards */}
      {Object.keys(grouped).length === 0 ? (
        <Typography>No services found.</Typography>
      ) : (
        Object.entries(grouped).map(([type, list]) => (
          <Box key={type} mb={4}>
            <Typography variant="h6" mb={1}>
              {type} ({list.length})
            </Typography>

            <Grid container spacing={2}>
              {list.map((s) => (
                <Grid item xs={12} sm={6} md={4} key={s._id}>
                  <ServiceCard
                    service={s}
                    onView={() => {
                      setSelectedService(s);
                      setDetailsOpen(true);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* Details Modal */}
      {selectedService && (
        <ServiceDetailsModal
          open={detailsOpen}
          user={users.find(u => u._id === selectedService.userId)}
          service={selectedService}
          onClose={() => setDetailsOpen(false)}
          onBookService={() => {
            setDetailsOpen(false);
            setBookingOpen(true);
          }}
        />
      )}

      {/* Booking Modal */}
      {selectedService && (
        <ServiceBookingFormModal
          open={bookingOpen}
          service={selectedService}
          onClose={() => {
            setBookingOpen(false);
            setSelectedService(null);
          }}
        />
      )}
    </Box>
  );
};

export default ServiceDetails;

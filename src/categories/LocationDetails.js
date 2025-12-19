import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from "@mui/material";
import VenueCard from "./VenueCard";
import VenueDetailsModal from "../VenueDetailsModal";
import VenueBookingFormModal from "../VenueBookingFormModal";

const API_URL = process.env.REACT_APP_API_URL;
const VENUES_API = `${API_URL}/api/venues`;
const USERS_API = `${API_URL}/api/users`;

const LocationDetails = () => {
  const [venues, setVenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [venuesRes, usersRes] = await Promise.all([
          axios.get(VENUES_API),
          axios.get(USERS_API),
        ]);

        if (!mounted) return;

        const validUserIds = new Set(usersRes.data.map((u) => u._id));
        const filteredVenues = venuesRes.data.filter((v) =>
          validUserIds.has(v.userId)
        );

        setVenues(filteredVenues);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("LocationDetails load error:", err);
      } finally {
        mounted && setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  const countries = useMemo(() => {
    return [...new Set(venues.map((v) => v.country).filter(Boolean))].sort();
  }, [venues]);

  const cities = useMemo(() => {
    const filtered = venues.filter((v) =>
      countryFilter ? v.country === countryFilter : true
    );
    return [...new Set(filtered.map((v) => v.city).filter(Boolean))].sort();
  }, [venues, countryFilter]);

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      if (countryFilter && v.country !== countryFilter) return false;
      if (cityFilter && v.city !== cityFilter) return false;
      return true;
    });
  }, [venues, countryFilter, cityFilter]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        Venues — Browse by location
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
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
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
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" gap={1} alignItems="center">
          <Chip label={`Total: ${filteredVenues.length}`} />
          {countryFilter && <Chip label={countryFilter} />}
          {cityFilter && <Chip label={cityFilter} />}
        </Box>
      </Box>

      {/* Cards */}
      {filteredVenues.length === 0 ? (
        <Typography>No venues found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredVenues.map((venue) => (
            <Grid item xs={12} sm={6} md={4} key={venue._id}>
              <VenueCard
                venue={venue}
                onView={() => {
                  setSelectedVenue(venue);
                  setDetailsOpen(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Details Modal */}
      {selectedVenue && (
        <VenueDetailsModal
          open={detailsOpen}
          user={users.find(u => u._id === selectedVenue.userId)}
          venue={selectedVenue}
          onClose={() => setDetailsOpen(false)}
          onBookVenue={() => {
            setDetailsOpen(false);
            setBookingOpen(true);
          }}
        />
      )}

      {/* Booking Modal */}
      {selectedVenue && (
        <VenueBookingFormModal
          open={bookingOpen}
          venue={selectedVenue}
          onClose={() => {
            setBookingOpen(false);
            setSelectedVenue(null);
          }}
        />
      )}
    </Box>
  );
};

export default LocationDetails;

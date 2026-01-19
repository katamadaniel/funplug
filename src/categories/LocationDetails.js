import React, { useEffect, useMemo, useState } from "react";
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
import { fetchActiveVenues } from "../services/venuesService";
import { fetchUsers } from "../services/userService";
import GroupedPaginatedSection from "./GroupedPaginatedSection";

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
        const [venues, users] = await Promise.all([
          fetchActiveVenues(),
          fetchUsers(),
        ]);

        if (!mounted) return;

        const validUserIds = new Set(users.map(u => u._id));
        setVenues(venues.filter(v => validUserIds.has(v.userId)));
        setUsers(users);
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

  const grouped = useMemo(() => {
    return venues.filter((v) => {
      if (countryFilter && v.country !== countryFilter) return false;
      if (cityFilter && v.city !== cityFilter) return false;
      return true;
    })
    .reduce((acc, venue) => {
      const key = venue.venueType || "Other";
      acc[key] = acc[key] || [];
      acc[key].push(venue);
      return acc;
    }, {});
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
        Venues — Browse by venue type
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

        <Chip label={`Total: ${venues.length}`} />
      </Box>

      {/* Cards */}
      {Object.keys(grouped).length === 0 ? (
        <Typography>No venues found.</Typography>
      ) : (
        Object.entries(grouped).map(([venueType, venues]) => (
          <GroupedPaginatedSection
            key={venueType}
            title={venueType}
            items={venues}
            renderCard={(v) => (
              <Grid item xs={12} sm={6} md={4} key={v._id}>
                <VenueCard
                  venue={v}
                  onView={() => {
                    setSelectedVenue(v);
                    setDetailsOpen(true);
                  }}
                />
              </Grid>
            )}
          />
        ))
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

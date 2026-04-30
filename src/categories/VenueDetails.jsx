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
import ListingDetailsModal from "../ListingDetailsModal";
import VenueBookingFormModal from "../VenueBookingFormModal";
import { fetchActiveVenues } from "../services/venuesService";
import GroupedPaginatedSection from "./GroupedPaginatedSection";

const VenueDetails = () => {
  const [venues, setVenues] = useState([]);
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
        const venues = await fetchActiveVenues();

        if (!mounted) return;

        setVenues(venues.filter(v => v.userSnapshot?._id));
      } catch (err) {
        console.error("Venue details load error:", err);
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

  const handleSelectVenue = (venue) => {
    setSelectedVenue(venue);
    setBookingOpen(false); // ensure booking modal is closed
    setDetailsOpen(true);   // open listing modal first
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedVenue(null);
  };

  const handleProceedToBooking = () => {
    setDetailsOpen(false);

    // allow Listing modal to unmount first before booking opens
    setTimeout(() => {
      setBookingOpen(true);
    }, 150);
  };

  const handleCloseBooking = () => {
    setBookingOpen(false);
    setSelectedVenue(null);
  };

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
                  onView={() => handleSelectVenue(v)}
                />
              </Grid>
            )}
          />
        ))
      )}

      {/* Details Modal */}
      {selectedVenue && detailsOpen && (
        <ListingDetailsModal
          open={detailsOpen}
          type="venue"
          data={selectedVenue}
          onClose={handleCloseDetails}
          onAction={handleProceedToBooking}
        />
      )}

      {/* Booking Modal */}
      {selectedVenue && bookingOpen && (
        <VenueBookingFormModal
          open={bookingOpen}
          venue={selectedVenue}
          onClose={handleCloseBooking}
        />
      )}
    </Box>
  );
};

export default VenueDetails;

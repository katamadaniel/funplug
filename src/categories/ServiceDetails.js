import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";

import ServiceCard from "./ServiceCard";
import ListingDetailsModal from "../ListingDetailsModal";
import ServiceBookingFormModal from "../ServiceBookingFormModal";
import { fetchActiveServices } from "../services/serviceService";
import GroupedPaginatedSection from "./GroupedPaginatedSection";
import ScreenLoader from "../components/ScreenLoader";

const ServiceDetails = () => {
  const [services, setServices] = useState([]);
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
        const services = await fetchActiveServices();

        if (!mounted) return;

        setServices(services.filter(s => s.userSnapshot?._id));
      } catch (err) {
        console.error("Service details load error:", err);
      } finally {
        mounted && setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  const countries = useMemo(
    () =>
      [...new Set(services.map((s) => s.country).filter(Boolean))].sort(),
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
      .reduce((acc, service) => {
        const key = service.serviceType || "Other";
        acc[key] = acc[key] || [];
        acc[key].push(service);
        return acc;
      }, {});
  }, [services, countryFilter, cityFilter]);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setBookingOpen(false); // ensure booking modal is closed
    setDetailsOpen(true);   // open listing modal first
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedService(null);
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
    setSelectedService(null);
  };

  if (loading)
    return (
      <ScreenLoader
        open={true}
        text="Loading Services"
        subText="Fetching services by type..."
      />
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
        Object.entries(grouped).map(([serviceType, services]) => (
          <GroupedPaginatedSection
            key={serviceType}
            title={serviceType}
            items={services}
            renderCard={(s) => (
              <Grid item xs={12} sm={6} md={4} key={s._id}>
                <ServiceCard
                  service={s}
                  onView={() => handleSelectService(s)}
                />
              </Grid>
            )}
          />
        ))
      )}

      {selectedService && detailsOpen && (
        <ListingDetailsModal
          open={detailsOpen}
          type="service"
          data={selectedService}
          onClose={handleCloseDetails}
          onAction={handleProceedToBooking}
        />
      )}

      {selectedService && bookingOpen && (
        <ServiceBookingFormModal
          open={bookingOpen}
          service={selectedService}
          onClose={handleCloseBooking}
        />
      )}
    </Box>
  );
};

export default ServiceDetails;

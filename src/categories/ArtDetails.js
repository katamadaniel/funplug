import React, { useEffect, useMemo, useState } from "react";
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
import PerformanceCard from "./PerformanceCard";
import PerformanceDetailsModal from "../PerformanceDetailsModal";
import PerformanceBookingFormModal from "../PerformanceBookingFormModal";
import { fetchActiveCards } from "../services/performanceService";
import GroupedPaginatedSection from "./GroupedPaginatedSection";

const ArtDetails = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

useEffect(() => {
  let mounted = true;

  const load = async () => {
    try {
      const performances = await fetchActiveCards();

      if (!mounted) return;

      setPerformances(performances.filter(p => p.userSnapshot?._id));
    } catch (err) {
      console.error("ArtDetails load error:", err);
    } finally {
      mounted && setLoading(false);
    }
  };

  load();
  return () => (mounted = false);
}, []);

  const countries = useMemo(
    () => [...new Set(performances.map((p) => p.country).filter(Boolean))],
    [performances]
  );

  const cities = useMemo(() => {
    const filtered = performances.filter((p) =>
      countryFilter ? p.country === countryFilter : true
    );
    return [...new Set(filtered.map((p) => p.city).filter(Boolean))];
  }, [performances, countryFilter]);

  const grouped = useMemo(() => {
    return performances
      .filter((p) => {
        if (countryFilter && p.country !== countryFilter) return false;
        if (cityFilter && p.city !== cityFilter) return false;
        return true;
      })
      .reduce((acc, cur) => {
        const key = cur.artType || "Other";
        acc[key] = acc[key] || [];
        acc[key].push(cur);
        return acc;
      }, {});
  }, [performances, countryFilter, cityFilter]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        Entertainment — Browse by art type
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
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip label={`Total: ${performances.length}`} />
      </Box>

      {/* Cards */}
      {Object.keys(grouped).length === 0 ? (
        <Typography>No entertainment found.</Typography>
      ) : (
        Object.entries(grouped).map(([artType, cards]) => (
          <GroupedPaginatedSection
            key={artType}
            title={artType}
            items={cards}
            renderCard={(p) => (
              <Grid item xs={12} sm={6} md={4} key={p._id}>
                <PerformanceCard
                  performance={p}
                  onView={() => {
                    setSelectedPerformance(p);
                    setDetailsOpen(true);
                  }}
                />
              </Grid>
            )}
          />
        ))
      )}

      {selectedPerformance && (
        <PerformanceDetailsModal
          open={detailsOpen}
          performance={selectedPerformance}
          onClose={() => setDetailsOpen(false)}
          onBookPerformance={() => {
            setDetailsOpen(false);
            setBookingOpen(true);
          }}
        />
      )}

      {selectedPerformance && (
        <PerformanceBookingFormModal
          open={bookingOpen}
          performance={selectedPerformance}
          onClose={() => {
            setBookingOpen(false);
            setSelectedPerformance(null);
          }}
        />
      )}
    </Box>
  );
};

export default ArtDetails;

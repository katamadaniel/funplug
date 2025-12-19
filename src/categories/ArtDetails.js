import React, { useEffect, useMemo, useState } from "react";
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
import PerformanceCard from "./PerformanceCard";
import PerformanceDetailsModal from "../PerformanceDetailsModal";
import PerformanceBookingFormModal from "../PerformanceBookingFormModal";

const API_URL = process.env.REACT_APP_API_URL;
const PERFORMANCES_API = `${API_URL}/api/performances`;
const USERS_API = `${API_URL}/api/users`;

const ArtDetails = () => {
  const [performances, setPerformances] = useState([]);
  const [users, setUsers] = useState([]);
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
        const [perfRes, usersRes] = await Promise.all([
          axios.get(PERFORMANCES_API),
          axios.get(USERS_API),
        ]);

        if (!mounted) return;

        const validUserIds = new Set(usersRes.data.map((u) => u._id));
        setPerformances(
          perfRes.data.filter((p) => validUserIds.has(p.userId))
        );
        setUsers(usersRes.data);
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
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip label={`Total: ${performances.length}`} />
      </Box>

      {Object.keys(grouped).map((artType) => (
        <Box key={artType} mb={4}>
          <Typography variant="h6" mb={1}>
            {artType}
          </Typography>

          <Grid container spacing={2}>
            {grouped[artType].map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p._id}>
                <PerformanceCard
                  performance={p}
                  onView={() => {
                    setSelectedPerformance(p);
                    setDetailsOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {selectedPerformance && (
        <PerformanceDetailsModal
          open={detailsOpen}
          user={users.find(u => u._id === selectedPerformance.userId)}
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

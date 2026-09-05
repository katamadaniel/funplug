import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import UserProfileCarousel from "./UserProfileCarousel";
import ListingDetailsModal from "./ListingDetailsModal";
import TicketPurchase from "./TicketPurchase";
import VenueBookingFormModal from "./VenueBookingFormModal";
import PerformanceBookingFormModal from "./PerformanceBookingFormModal";
import ServiceBookingFormModal from "./ServiceBookingFormModal";

import {
  useUserLocation,
  useLocationContext,
  inferCityFromIP,
} from "./contexts/LocationContext"; 

import { fetchRecommendations } from "./services/recommendationService";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CelebrationIcon from "@mui/icons-material/Celebration";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupsIcon from "@mui/icons-material/Groups";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PlaceIcon from "@mui/icons-material/Place";
import SearchIcon from "@mui/icons-material/Search";

import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Stack,
  Chip,
  Paper,
  InputAdornment,
  Skeleton,
} from "@mui/material";

const EVENTS_PER_PAGE = 4;
const VENUES_PER_PAGE = 4;
const PERFORMANCES_PER_PAGE = 4;
const SERVICES_PER_PAGE = 4;

function HomeSkeleton() {
  return (
    <Box aria-busy="true" sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 2, md: 3 } }}>
      <Box maxWidth="1280px" mx="auto" px={{ xs: 1.25, sm: 2, md: 3 }}>
        <Skeleton variant="rounded" height={330} sx={{ borderRadius: { xs: 3, md: 4 } }} />
        <Skeleton variant="rounded" height={150} sx={{ mt: 3, borderRadius: 3 }} />
        <Skeleton variant="rounded" height={180} sx={{ mt: 3, borderRadius: 3 }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={280} sx={{ flex: 1, minWidth: 0, borderRadius: 3 }} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function PaginationControls({ page, setPage, totalItems, perPage, onPrevNext }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const handlePrev = () => {
    if (page > 1) {
      setPage((p) => p - 1);
      onPrevNext?.("prev");
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((p) => p + 1);
      onPrevNext?.("next");
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={1} mb={3}>
      <IconButton onClick={handlePrev} disabled={page === 1}>
        <ArrowBackIcon aria-hidden="true" />
      </IconButton>
      <Typography variant="body2">
        Page {page} of {totalPages}
      </Typography>
      <IconButton onClick={handleNext} disabled={page === totalPages} aria-label="Next page">
        <ArrowForwardIcon aria-hidden="true" />
      </IconButton>
    </Box>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters and pagination state
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const [currentEventPage, setCurrentEventPage] = useState(1);
  const [currentVenuePage, setCurrentVenuePage] = useState(1);
  const [currentPerformancePage, setCurrentPerformancePage] = useState(1);
  const [currentServicePage, setCurrentServicePage] = useState(1);

  // Selection & modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isVenueModalOpen, setVenueModalOpen] = useState(false);
  const [isVenueBookingModalOpen, setVenueBookingModalOpen] = useState(false);
  const [isPerformanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [isPerformanceBookingModalOpen, setPerformanceBookingModalOpen] = useState(false);
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [isServiceBookingModalOpen, setServiceBookingModalOpen] = useState(false);

  // refs for scrolling to top per section
  const eventsRef = useRef(null);
  const venuesRef = useRef(null);
  const performancesRef = useRef(null);
  const servicesRef = useRef(null);

  const userLocation = useUserLocation();

  const {
    userCity,
    setUserCity,
    userCountry,
    setUserCountry,
    setUserLocation,
  } = useLocationContext();

  const buildLocationParams = useCallback(() => {
    if (userLocation?.lat && userLocation?.lng) {
      return {
        lat: userLocation.lat,
        lng: userLocation.lng,
      };
    }

    if (userCity) return { city: userCity };
    if (userCountry) return { country: userCountry };

    return {};
  }, [userLocation, userCity, userCountry]);

  useEffect(() => {
    if (!userLocation && !userCity) {
      inferCityFromIP().then((loc) => {
        if (!loc) return;

        if (!userCity) setUserCity(loc.city);
        if (!userCountry) setUserCountry(loc.country);

        if (!userLocation && loc.lat && loc.lng) {
          setUserLocation({ lat: loc.lat, lng: loc.lng });
        }
      });
    }
  }, [
    userLocation,
    userCity,
    userCountry,
    setUserCity,
    setUserCountry,
    setUserLocation,
  ]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = buildLocationParams();

    try {
      const [
        eventsRes,
        venuesRes,
        performancesRes,
        servicesRes,
      ] = await Promise.all([
        fetchRecommendations("events", { ...params, limit: 50 }),
        fetchRecommendations("venues", { ...params, limit: 50 }),
        fetchRecommendations("performances", { ...params, limit: 50 }),
        fetchRecommendations("services", { ...params, limit: 50 }),
      ]);

      // Events: keep only future events
      const safeEvents = (eventsRes?.data || []).filter((e) => {
        if (!e?.date) return true;
        return new Date(e.date) >= new Date();
      });

      setEvents(safeEvents);
      setVenues(venuesRes?.data || []);
      setPerformances(performancesRes?.data || []);
      setServices(servicesRes?.data || []);
    } catch (err) {
      console.error("[Loading error]", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [buildLocationParams]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Basic tag extraction from items (returns unique tags)
  const tags = useMemo(() => {
    const setTags = new Set();

    const push = (str) => {
      if (!str) return;
      str
        .toString()
        .split(/[,\|\/]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((t) => setTags.add(t));
    };

    events.forEach((e) => {
      push(e.ticketType);
      push(e.category);
      push(e.city);
      push(e.category);
    });

    venues.forEach((v) => {
      push(v.country);
      push(v.city);
      push (v.venueType);
    });

    performances.forEach((p) => {
      push(p.country);
      push(p.city);
      push(p.artType);
    });

    services.forEach((s) => {
      push(s.country);
      push(s.city);
      push(s.serviceType);
    });

    return Array.from(setTags).slice(0, 15);
  }, [events, venues, performances, services]);

  // Filtering logic
  const filterByTagAndSearch = useCallback(
    (items) => {
      return (items || []).filter((item) => {
        if (selectedTag) {
          const haystack = [
            item.category,
            item.ticketType,
            item.serviceType,
            item.venueType,
            item.artType,
            item.city,
            item.country,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(selectedTag.toLowerCase())) return false;
        }

        if (searchText) {
          const hay = [
            item.title,
            item.name,
            item.category,
            item.venueType,
            item.serviceType,
            item.artType,
            item.city,
            item.country,
            item.venue,
            item.ticketType,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!hay.includes(searchText.toLowerCase())) return false;
        }

        return true;
      });
    },
    [selectedTag, searchText]
  );

  const filteredEvents = useMemo(
    () => filterByTagAndSearch(events),
    [events, filterByTagAndSearch]
  );

  const filteredVenues = useMemo(
    () => filterByTagAndSearch(venues),
    [venues, filterByTagAndSearch]
  );

  const filteredPerformances = useMemo(
    () => filterByTagAndSearch(performances),
    [performances, filterByTagAndSearch]
  );

  const filteredServices = useMemo(
    () => filterByTagAndSearch(services),
    [services, filterByTagAndSearch]
  );

  // paginated slices
  const paginatedEvents = useMemo(() => {
    const start = (currentEventPage - 1) * EVENTS_PER_PAGE;
    return filteredEvents.slice(start, start + EVENTS_PER_PAGE);
  }, [filteredEvents, currentEventPage]);

  const paginatedVenues = useMemo(() => {
    const start = (currentVenuePage - 1) * VENUES_PER_PAGE;
    return filteredVenues.slice(start, start + VENUES_PER_PAGE);
  }, [filteredVenues, currentVenuePage]);

  const paginatedPerformances = useMemo(() => {
    const start = (currentPerformancePage - 1) * PERFORMANCES_PER_PAGE;
    return filteredPerformances.slice(start, start + PERFORMANCES_PER_PAGE);
  }, [filteredPerformances, currentPerformancePage]);

  const paginatedServices = useMemo(() => {
    const start = (currentServicePage - 1) * SERVICES_PER_PAGE;
    return filteredServices.slice(start, start + SERVICES_PER_PAGE);
  }, [filteredServices, currentServicePage]);

  // handlers
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleViewVenueDetails = (venue) => {
    setSelectedVenue(venue);
    setVenueModalOpen(true);
  };

  const handleViewPerformance = (card) => {
    setSelectedPerformance(card);
    setPerformanceModalOpen(true);
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setServiceModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSelectedVenue(null);
    setSelectedPerformance(null);
    setSelectedService(null);

    setTicketModalOpen(false);
    setVenueModalOpen(false);
    setVenueBookingModalOpen(false);
    setPerformanceModalOpen(false);
    setPerformanceBookingModalOpen(false);
    setServiceBookingModalOpen(false);
    setServiceModalOpen(false);
  };

  const handleBuyTicket = (ev) => {
    setSelectedEvent(ev);
    setTicketModalOpen(true);
  };

  const handleBookVenue = (venue) => {
    setSelectedVenue(venue);
    setVenueBookingModalOpen(true);
  };

  const handleBookPerformance = (perf) => {
    setSelectedPerformance(perf);
    setPerformanceBookingModalOpen(true);
  };

  const handleBookService = (svc) => {
    setSelectedService(svc);
    setServiceBookingModalOpen(true);
  };

  const handleSectionNav = (sectionRef) => () => {
    if (!sectionRef?.current) return;
    sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const quickActions = [
    {
      label: "Discover events",
      description: "See what's happening now",
      icon: <EventAvailableIcon fontSize="small" />,
      ref: eventsRef,
      accent: "#7c93ff",
    },
    {
      label: "Plan an event",
      description: "Build a fresh experience",
      icon: <CelebrationIcon fontSize="small" />,
      ref: servicesRef,
      accent: "#ff8f4d",
      action: () => navigate("/plan-event"),
    },
    {
      label: "Book venues",
      description: "Lock in the perfect space",
      icon: <PlaceIcon fontSize="small" />,
      ref: venuesRef,
      accent: "#34c759",
    },
    {
      label: "Hire entertainers",
      description: "Bring the energy in",
      icon: <MusicNoteIcon fontSize="small" />,
      ref: performancesRef,
      accent: "#a16df7",
    },
    {
      label: "Hire vendors",
      description: "Cover every detail",
      icon: <BuildCircleIcon fontSize="small" />,
      ref: servicesRef,
      accent: "#20c7d6",
    },
  ];

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", background: "linear-gradient(180deg, rgba(108,99,255,0.08) 0%, transparent 38%)", py: { xs: 2, md: 3 } }}>
      <Box maxWidth="1280px" margin="0 auto" px={{ xs: 1.25, sm: 2, md: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: { xs: 3, md: 4 },
            background: "linear-gradient(135deg, #140f2d 0%, #2a1b5c 45%, #6c3df7 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 32%)",
            }}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ position: "relative", zIndex: 1 }}>
            <Box flex={1}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <AutoAwesomeIcon fontSize="small" />
                <Typography variant="overline" sx={{ letterSpacing: "0.28em", opacity: 0.9 }}>
                  FunPlug OS
                </Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.05, mb: 1.2 }}>
                What are you planning today?
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 560, color: "rgba(255,255,255,0.82)", mb: 2.5 }}>
                Discover events, launch your own experience, book a venue, hire entertainers, and bring vendors together in one living feed.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSectionNav(eventsRef)}
                  sx={{
                    bgcolor: "white",
                    color: "#2a1b5c",
                    borderRadius: "999px",
                    px: 2.4,
                    py: 1,
                    textTransform: "none",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                    "&:hover": { bgcolor: "#f4eeff" },
                  }}
                >
                  Start exploring
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/plan-event")}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.32)",
                    borderRadius: "999px",
                    px: 2.4,
                    py: 1,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.12)",
                    },
                  }}
                >
                  Launch a plan
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={1.5} sx={{ flex: 1 }}>
              {quickActions.map((action) => (
                <Grid item xs={12} sm={6} key={action.label}>
                  <Card
                    onClick={action.action || (() => action.ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }))}
                    role="button"
                    tabIndex={0}
                    aria-label={action.label}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        (action.action || (() => action.ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })))();
                      }
                    }}
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "rgba(255,255,255,0.12)",
                      color: "white",
                      backdropFilter: "blur(16px)",
                      cursor: "pointer",
                      transition: "transform 160ms ease, box-shadow 160ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 14px 32px rgba(0,0,0,0.18)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: action.accent,
                          color: "white",
                          mb: 1.2,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {action.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", mt: 0.4 }}>
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid rgba(15,23,42,0.08)",
            background: (theme) => theme.palette.mode === "dark" ? "rgba(18,26,45,0.78)" : "rgba(255,255,255,0.78)",
            backdropFilter: "blur(18px)",
          }}
        >
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="h6">Search the network</Typography>
                <Typography variant="body2" color="text.secondary">
                  Filter across events, venues, entertainment, and vendors without leaving the page.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`${filteredEvents.length} events`} size="small" color="primary" />
                <Chip label={`${filteredVenues.length} venues`} size="small" />
                <Chip label={`${filteredPerformances.length} performers`} size="small" />
                <Chip label={`${filteredServices.length} vendors`} size="small" />
              </Stack>
            </Stack>

            <TextField
              aria-label="Search events, venues, performances, and services"
              placeholder="Search events, venues, performances, services..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentEventPage(1);
                setCurrentVenuePage(1);
                setCurrentPerformancePage(1);
                setCurrentServicePage(1);
              }}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label="All"
                clickable
                color={selectedTag === "" ? "primary" : "default"}
                onClick={() => setSelectedTag("")}
              />
              {tags.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  clickable
                  onClick={() => {
                    setSelectedTag(t);
                    setCurrentEventPage(1);
                    setCurrentVenuePage(1);
                    setCurrentPerformancePage(1);
                    setCurrentServicePage(1);
                  }}
                  color={selectedTag === t ? "primary" : "default"}
                  sx={{ textTransform: "capitalize" }}
                />
              ))}
            </Box>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid rgba(15,23,42,0.08)",
            background: (theme) => theme.palette.mode === "dark" ? "linear-gradient(135deg, rgba(18,26,45,0.92), rgba(39,29,76,0.78))" : "linear-gradient(135deg, #ffffff 0%, #f8f5ff 100%)",
            backdropFilter: "blur(18px)",
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
            <Box>
              <Typography variant="h6">Community pulse</Typography>
              <Typography variant="body2" color="text.secondary">
                A live view of the people and listings shaping the week ahead.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip icon={<GroupsIcon />} label="Creators online" size="small" />
              <Chip icon={<AutoAwesomeIcon />} label="Fresh listings" size="small" />
            </Stack>
          </Stack>
          <Box mt={2}>
            <UserProfileCarousel />
          </Box>
        </Paper>

        <Box mt={4} ref={eventsRef}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2.5}>
              <Box>
                <Typography variant="h6">Live events</Typography>
                <Typography variant="body2" color="text.secondary">
                  Moments people are already planning around you.
                </Typography>
              </Box>
              <Button size="small" onClick={handleSectionNav(eventsRef)}>
                Jump to top
              </Button>
            </Stack>

            {filteredEvents.length === 0 ? (
              <Typography color="text.secondary">No upcoming events found.</Typography>
            ) : (
              <>
                <Grid container spacing={2} alignItems="stretch">
                  {paginatedEvents.map((event) => (
                    <Grid item xs={12} sm={6} md={3} key={event._id}>
                      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, overflow: "hidden", border: "1px solid rgba(15,23,42,0.08)", transition: "transform 160ms ease, box-shadow 160ms ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 28px rgba(15,23,42,0.08)" } }}>
                        <Box sx={{ position: "relative" }}>
                          <CardMedia component="img" height="170" image={event.image || "/default-event.jpg"} alt={event.title} loading="lazy" />
                          {(userLocation || userCity || userCountry) && (
                            <Chip
                              label={userLocation ? "Near you" : userCity ? `In ${userCity}` : `In ${userCountry}`}
                              size="small"
                              sx={{ position: "absolute", top: 12, left: 12, bgcolor: "rgba(20,15,45,0.8)", color: "white" }}
                            />
                          )}
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.category} • {event.city}, {event.country}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.2 }}>
                            <Chip label={event.ticketType || "Ticketed"} size="small" />
                            {event.city && <Chip label={event.city} size="small" />}
                          </Stack>
                        </CardContent>
                        <Box p={1.5} pt={0} display="flex" gap={1} justifyContent="space-between">
                          <Button size="small" onClick={() => handleViewDetails(event)} sx={{ textTransform: "none" }}>
                            Preview
                          </Button>
                          <Button size="small" variant="contained" onClick={() => handleBuyTicket(event)} sx={{ borderRadius: "999px", textTransform: "none" }}>
                            Buy ticket
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <PaginationControls
                  page={currentEventPage}
                  setPage={setCurrentEventPage}
                  totalItems={filteredEvents.length}
                  perPage={EVENTS_PER_PAGE}
                  onPrevNext={handleSectionNav(eventsRef)}
                />
              </>
            )}
          </Paper>
        </Box>

        <Box mt={4} ref={venuesRef}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2.5}>
              <Box>
                <Typography variant="h6">Venue studio</Typography>
                <Typography variant="body2" color="text.secondary">
                  Flexible spaces built for big ideas.
                </Typography>
              </Box>
              <Button size="small" onClick={handleSectionNav(venuesRef)}>
                Open venues
              </Button>
            </Stack>

            {filteredVenues.length === 0 ? (
              <Typography color="text.secondary">No venue listings available.</Typography>
            ) : (
              <>
                <Grid container spacing={2}>
                  {paginatedVenues.map((venue) => (
                    <Grid item xs={12} sm={6} md={3} key={venue._id}>
                      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, overflow: "hidden", border: "1px solid rgba(15,23,42,0.08)", transition: "transform 160ms ease, box-shadow 160ms ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 28px rgba(15,23,42,0.08)" } }}>
                        <Box sx={{ position: "relative" }}>
                          <CardMedia component="img" height="170" image={venue.images?.[0]?.url || "/default-venue.jpg"} alt={venue.name} loading="lazy" />
                          {(userLocation || userCity || userCountry) && (
                            <Chip label={userLocation ? "Near you" : userCity ? `In ${userCity}` : `In ${userCountry}`} size="small" sx={{ position: "absolute", top: 12, left: 12, bgcolor: "rgba(20,15,45,0.8)", color: "white" }} />
                          )}
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                            {venue.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {venue.venueType} • {venue.city}, {venue.country}
                          </Typography>
                        </CardContent>
                        <Box p={1.5} pt={0} display="flex" gap={1} justifyContent="space-between">
                          <Button size="small" onClick={() => handleViewVenueDetails(venue)} sx={{ textTransform: "none" }}>
                            Explore
                          </Button>
                          <Button size="small" variant="contained" onClick={() => handleBookVenue(venue)} sx={{ borderRadius: "999px", textTransform: "none" }}>
                            Book
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <PaginationControls
                  page={currentVenuePage}
                  setPage={setCurrentVenuePage}
                  totalItems={filteredVenues.length}
                  perPage={VENUES_PER_PAGE}
                  onPrevNext={handleSectionNav(venuesRef)}
                />
              </>
            )}
          </Paper>
        </Box>

        <Box mt={4} ref={performancesRef}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2.5}>
              <Box>
                <Typography variant="h6">Entertainment roster</Typography>
                <Typography variant="body2" color="text.secondary">
                  Performers and creators ready to show up.
                </Typography>
              </Box>
              <Button size="small" onClick={handleSectionNav(performancesRef)}>
                Browse talent
              </Button>
            </Stack>

            {filteredPerformances.length === 0 ? (
              <Typography color="text.secondary">No entertainment listings available.</Typography>
            ) : (
              <>
                <Grid container spacing={2}>
                  {paginatedPerformances.map((card) => (
                    <Grid item xs={12} sm={6} md={3} key={card._id}>
                      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, overflow: "hidden", border: "1px solid rgba(15,23,42,0.08)", transition: "transform 160ms ease, box-shadow 160ms ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 28px rgba(15,23,42,0.08)" } }}>
                        <Box sx={{ position: "relative" }}>
                          <CardMedia component="img" height="170" image={card.images?.[0]?.url || "/default-perf.jpg"} alt={card.name} loading="lazy" />
                          {(userLocation || userCity || userCountry) && (
                            <Chip label={userLocation ? "Near you" : userCity ? `In ${userCity}` : `In ${userCountry}`} size="small" sx={{ position: "absolute", top: 12, left: 12, bgcolor: "rgba(20,15,45,0.8)", color: "white" }} />
                          )}
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                            {card.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.artType} • {card.city}, {card.country}
                          </Typography>
                        </CardContent>
                        <Box p={1.5} pt={0} display="flex" gap={1} justifyContent="space-between">
                          <Button size="small" onClick={() => handleViewPerformance(card)} sx={{ textTransform: "none" }}>
                            View profile
                          </Button>
                          <Button size="small" variant="contained" onClick={() => handleBookPerformance(card)} sx={{ borderRadius: "999px", textTransform: "none" }}>
                            Book
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <PaginationControls
                  page={currentPerformancePage}
                  setPage={setCurrentPerformancePage}
                  totalItems={filteredPerformances.length}
                  perPage={PERFORMANCES_PER_PAGE}
                  onPrevNext={handleSectionNav(performancesRef)}
                />
              </>
            )}
          </Paper>
        </Box>

        <Box mt={4} ref={servicesRef}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2.5}>
              <Box>
                <Typography variant="h6">Services & vendors</Typography>
                <Typography variant="body2" color="text.secondary">
                  The support layer that turns a plan into an experience.
                </Typography>
              </Box>
              <Button size="small" onClick={handleSectionNav(servicesRef)}>
                View vendors
              </Button>
            </Stack>

            {filteredServices.length === 0 ? (
              <Typography color="text.secondary">No service listings available.</Typography>
            ) : (
              <>
                <Grid container spacing={2}>
                  {paginatedServices.map((service) => (
                    <Grid item xs={12} sm={6} md={3} key={service._id}>
                      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, overflow: "hidden", border: "1px solid rgba(15,23,42,0.08)", transition: "transform 160ms ease, box-shadow 160ms ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 28px rgba(15,23,42,0.08)" } }}>
                        <Box sx={{ position: "relative" }}>
                          <CardMedia component="img" height="170" image={service.images?.[0]?.url || "/default-service.jpg"} alt={service.name} loading="lazy" />
                          {(userLocation || userCity || userCountry) && (
                            <Chip label={userLocation ? "Near you" : userCity ? `In ${userCity}` : `In ${userCountry}`} size="small" sx={{ position: "absolute", top: 12, left: 12, bgcolor: "rgba(20,15,45,0.8)", color: "white" }} />
                          )}
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                            {service.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.serviceType} • {service.city}, {service.country}
                          </Typography>
                        </CardContent>
                        <Box p={1.5} pt={0} display="flex" gap={1} justifyContent="space-between">
                          <Button size="small" onClick={() => handleViewService(service)} sx={{ textTransform: "none" }}>
                            View service
                          </Button>
                          <Button size="small" variant="contained" onClick={() => handleBookService(service)} sx={{ borderRadius: "999px", textTransform: "none" }}>
                            Book
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <PaginationControls
                  page={currentServicePage}
                  setPage={setCurrentServicePage}
                  totalItems={filteredServices.length}
                  perPage={SERVICES_PER_PAGE}
                  onPrevNext={handleSectionNav(servicesRef)}
                />
              </>
            )}
          </Paper>
        </Box>

        {selectedEvent && (
          <ListingDetailsModal
            open={!!selectedEvent}
            type="event"
            data={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onAction={() => handleBuyTicket(selectedEvent)}
          />
        )}

        {isTicketModalOpen && selectedEvent && (
          <TicketPurchase
            event={selectedEvent}
            open={isTicketModalOpen}
            onClose={handleCloseModal}
          />
        )}

        {isVenueModalOpen && selectedVenue && (
          <ListingDetailsModal
            open={!!selectedVenue}
            type="venue"
            data={selectedVenue}
            onClose={() => setSelectedVenue(null)}
            onAction={() => handleBookVenue(selectedVenue)}
          />
        )}

        {isVenueBookingModalOpen && selectedVenue && (
          <VenueBookingFormModal
            venue={selectedVenue}
            open={isVenueBookingModalOpen}
            onClose={handleCloseModal}
          />
        )}

        {isPerformanceModalOpen && selectedPerformance && (
          <ListingDetailsModal
            open={!!selectedPerformance}
            type="performance"
            data={selectedPerformance}
            onClose={() => setSelectedPerformance(null)}
            onAction={() => handleBookPerformance(selectedPerformance)}
          />
        )}

        {isPerformanceBookingModalOpen && selectedPerformance && (
          <PerformanceBookingFormModal
            performance={selectedPerformance}
            open={isPerformanceBookingModalOpen}
            onClose={handleCloseModal}
          />
        )}

        {isServiceModalOpen && selectedService && (
          <ListingDetailsModal
            open={!!selectedService}
            type="service"
            data={selectedService}
            onClose={() => setSelectedService(null)}
            onAction={() => handleBookService(selectedService)}
          />
        )}

        {isServiceBookingModalOpen && selectedService && (
          <ServiceBookingFormModal
            service={selectedService}
            open={isServiceBookingModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </Box>
    </Box>
  );
};

export default Home;
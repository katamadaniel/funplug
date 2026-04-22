import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

import UserProfileCarousel from "./UserProfileCarousel";
import EventModal from "./EventModal";
import TicketPurchase from "./TicketPurchase";
import VenueDetailsModal from "./VenueDetailsModal";
import VenueBookingFormModal from "./VenueBookingFormModal";
import PerformanceDetailsModal from "./PerformanceDetailsModal";
import PerformanceBookingFormModal from "./PerformanceBookingFormModal";
import ServiceDetailsModal from "./ServiceDetailsModal";
import ServiceBookingFormModal from "./ServiceBookingFormModal";

import {
  useUserLocation,
  useLocationContext,
  inferCityFromIP,
} from "./contexts/LocationContext";

import { fetchRecommendations } from "./services/recommendationService";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  IconButton,
  Skeleton,
  TextField,
  Stack,
  Chip,
} from "@mui/material";

const EVENTS_PER_PAGE = 4;
const VENUES_PER_PAGE = 4;
const PERFORMANCES_PER_PAGE = 4;
const SERVICES_PER_PAGE = 4;

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
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="body2">
        Page {page} of {totalPages}
      </Typography>
      <IconButton onClick={handleNext} disabled={page === totalPages}>
        <ArrowForwardIcon />
      </IconButton>
    </Box>
  );
}

const Home = () => {
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
      push(e.city);
      push(e.category || "Event");
    });

    venues.forEach((v) => {
      push(v.country);
      push(v.city || "Venue");
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

  if (loading) {
    return (
      <Grid container spacing={2} sx={{ p: 2 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <Card>
              <Skeleton variant="rectangular" height={160} />
              <CardContent>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
                <Skeleton width="80%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 1, sm: 2, md: 3 }} maxWidth="1200px" margin="0 auto">
      {/* Top area: tags + search */}
      <Stack spacing={2}>
        <Typography variant="h6">Explore</Typography>

        <TextField
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

      {/* User profiles carousel */}
      <Box mt={3}>
          <UserProfileCarousel />
      </Box>

      {/* EVENTS */}
      <Box mt={4} ref={eventsRef}>
        <Typography variant="h6" gutterBottom>
          Upcoming Events
        </Typography>

        {filteredEvents.length === 0 ? (
          <Typography>No upcoming events found.</Typography>
        ) : (
          <>
            <Grid container spacing={2} alignItems="stretch">
              {paginatedEvents.map((event) => (
                <Grid item xs={12} sm={6} md={3} key={event._id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={event.image || "/default-event.jpg"}
                      alt={event.title}
                      loading="lazy"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      {(userLocation || userCity || userCountry) && (
                        <Chip
                          label={
                            userLocation
                              ? "Near you"
                              : userCity
                              ? `In ${userCity}`
                              : `In ${userCountry}`
                          }
                          size="small"
                        />
                      )}

                      <Typography variant="subtitle1" gutterBottom>
                        {event.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {event.description}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Venue: {event.venue}
                      </Typography>
                    </CardContent>

                    <Box p={1} display="flex" gap={1} justifyContent="space-between">
                      <Button size="small" onClick={() => handleViewDetails(event)}>
                        View Details
                      </Button>
                      <Button size="small" variant="contained" onClick={() => handleBuyTicket(event)}>
                        Buy Ticket
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
      </Box>

      {/* VENUES */}
      <Box mt={4} ref={venuesRef}>
        <Typography variant="h6" gutterBottom>
          Available Venues
        </Typography>

        {filteredVenues.length === 0 ? (
          <Typography>No venue listings available.</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedVenues.map((venue) => (
                <Grid item xs={12} sm={6} md={3} key={venue._id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={venue.images?.[0]?.url || "/default-venue.jpg"}
                      alt={venue.name}
                      loading="lazy"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      {(userLocation || userCity || userCountry) && (
                        <Chip
                          label={
                            userLocation
                              ? "Near you"
                              : userCity
                              ? `In ${userCity}`
                              : `In ${userCountry}`
                          }
                          size="small"
                        />
                      )}

                      <Typography variant="subtitle1">{venue.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {venue.city}, {venue.country}
                      </Typography>
                    </CardContent>

                    <Box p={1} display="flex" gap={1} justifyContent="space-between">
                      <Button size="small" onClick={() => handleViewVenueDetails(venue)}>
                        Explore Venue
                      </Button>
                      <Button size="small" variant="contained" onClick={() => handleBookVenue(venue)}>
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
      </Box>

      {/* PERFORMANCES */}
      <Box mt={4} ref={performancesRef}>
        <Typography variant="h6" gutterBottom>
          Entertainment
        </Typography>

        {filteredPerformances.length === 0 ? (
          <Typography>No entertainment listings available.</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedPerformances.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card._id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={card.images?.[0]?.url || "/default-perf.jpg"}
                      alt={card.name}
                      loading="lazy"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      {(userLocation || userCity || userCountry) && (
                        <Chip
                          label={
                            userLocation
                              ? "Near you"
                              : userCity
                              ? `In ${userCity}`
                              : `In ${userCountry}`
                          }
                          size="small"
                        />
                      )}

                      <Typography variant="subtitle1">{card.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.artType} — {card.city}
                      </Typography>
                    </CardContent>

                    <Box p={1} display="flex" gap={1} justifyContent="space-between">
                      <Button size="small" onClick={() => handleViewPerformance(card)}>
                        View Card
                      </Button>
                      <Button size="small" variant="contained" onClick={() => handleBookPerformance(card)}>
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
      </Box>

      {/* SERVICES */}
      <Box mt={4} ref={servicesRef}>
        <Typography variant="h6" gutterBottom>
          Services & Vendors
        </Typography>

        {filteredServices.length === 0 ? (
          <Typography>No service listings available.</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedServices.map((service) => (
                <Grid item xs={12} sm={6} md={3} key={service._id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={service.images?.[0]?.url || "/default-service.jpg"}
                      alt={service.serviceType}
                      loading="lazy"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      {(userLocation || userCity || userCountry) && (
                        <Chip
                          label={
                            userLocation
                              ? "Near you"
                              : userCity
                              ? `In ${userCity}`
                              : `In ${userCountry}`
                          }
                          size="small"
                        />
                      )}

                      <Typography variant="subtitle1">{service.serviceType}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.city}, {service.country}
                      </Typography>
                    </CardContent>

                    <Box p={1} display="flex" gap={1} justifyContent="space-between">
                      <Button size="small" onClick={() => handleViewService(service)}>
                        View Service
                      </Button>
                      <Button size="small" variant="contained" onClick={() => handleBookService(service)}>
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
      </Box>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onBuyTicket={() => handleBuyTicket(selectedEvent)}
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
        <VenueDetailsModal
          venue={selectedVenue}
          onClose={handleCloseModal}
          onBookVenue={() => handleBookVenue(selectedVenue)}
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
        <PerformanceDetailsModal
          performance={selectedPerformance}
          onClose={handleCloseModal}
          onBookPerformance={() => handleBookPerformance(selectedPerformance)}
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
        <ServiceDetailsModal
          service={selectedService}
          onClose={handleCloseModal}
          onBookService={() => handleBookService(selectedService)}
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
  );
};

export default Home;
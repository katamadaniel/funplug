import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useCache } from "./contexts/CacheContext";
import UserProfileCarousel from "./UserProfileCarousel";
import EventModal from "./EventModal";
import TicketPurchase from "./TicketPurchase";
import VenueDetailsModal from "./VenueDetailsModal";
import VenueBookingFormModal from "./VenueBookingFormModal";
import PerformanceDetailsModal from "./PerformanceDetailsModal";
import PerformanceBookingFormModal from "./PerformanceBookingFormModal";
import ServiceDetailsModal from "./ServiceDetailsModal";
import ServiceBookingFormModal from "./ServiceBookingFormModal";
import { useUserLocation, useLocationContext, inferCityFromIP } from "./contexts/LocationContext";
import { fetchUsers } from "./services/userService";
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
      <Typography variant="body2">Page {page} of {totalPages}</Typography>
      <IconButton onClick={handleNext} disabled={page === totalPages}>
        <ArrowForwardIcon />
      </IconButton>
    </Box>
  );
}

const Home = () => {
  const { getFromCache, addToCache } = useCache();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
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

  // Selection & modal state (reused from your previous code)
  const [selectedUser, setSelectedUser] = useState(null);
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

const buildLocationParams = () => {
  if (userLocation?.lat && userLocation?.lng) {
    return {
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius: 100,
    };
  }

  if (userCity) return { city: userCity };
  if (userCountry) return { country: userCountry };

  return {};
};

useEffect(() => {
  if (!userLocation && !userCity) {
    inferCityFromIP().then((loc) => {
      if (!loc) return;

      if (!userCity) setUserCity(loc.city);
      if (!userCountry) setUserCountry(loc.country);

      // Only set GPS if user hasn't already allowed it
      if (!userLocation && loc.lat && loc.lng) {
        setUserLocation({ lat: loc.lat, lng: loc.lng });
      }
    });
  }
}, [userLocation, userCity, userCountry, setUserCity, setUserCountry, setUserLocation]);


    // fetch
const loadAll = useCallback(async () => {
  setLoading(true);
  const params = buildLocationParams();

  try {
    /* ---------- CACHE ---------- */
    const cached = {
      users: getFromCache("users"),
      events: getFromCache("events"),
      venues: getFromCache("venues"),
      performances: getFromCache("performances"),
      services: getFromCache("services"),
    };

    if (cached.users) setUsers(cached.users);
    if (cached.events) setEvents(cached.events);
    if (cached.venues) setVenues(cached.venues);
    if (cached.performances) setPerformances(cached.performances);
    if (cached.services) setServices(cached.services);

    if (Object.values(cached).every(Boolean)) return;

    /* ---------- FETCH ---------- */
  const [
    usersData,
    eventsRes,
    venuesRes,
    performancesRes,
    servicesRes,
  ] = await Promise.all([
    cached.users ?? fetchUsers(),

    cached.events
      ? Promise.resolve({ data: cached.events })
      : fetchRecommendations("events", { ...params, limit: 50 }),

    cached.venues
      ? Promise.resolve({ data: cached.venues })
      : fetchRecommendations("venues", { ...params, limit: 50 }),

    cached.performances
      ? Promise.resolve({ data: cached.performances })
      : fetchRecommendations("performances", { ...params, limit: 50 }),

    cached.services
      ? Promise.resolve({ data: cached.services })
      : fetchRecommendations("services", { ...params, limit: 50 }),
  ]);

    /* ---------- USERS ---------- */
    if (!cached.users) {
      addToCache("users", usersData, 10 * 60 * 1000);
      setUsers(usersData);
    }

    const validUserIds = new Set(usersData.map(u => u._id));

    /* ---------- FILTERED CONTENT ---------- */
    const filterByValidUser = (items = []) =>
      items.filter(i => validUserIds.has(i.userId));

    if (!cached.events) {
      const filtered = filterByValidUser(eventsRes.data)
        .filter(e => new Date(e.date) >= new Date());
      addToCache("events", filtered, 2 * 60 * 1000);
      setEvents(filtered);
    }

    if (!cached.venues) {
      const filtered = filterByValidUser(venuesRes.data);
      addToCache("venues", filtered, 5 * 60 * 1000);
      setVenues(filtered);
    }

    if (!cached.performances) {
      const filtered = filterByValidUser(performancesRes.data);
      addToCache("performances", filtered, 5 * 60 * 1000);
      setPerformances(filtered);
    }

    if (!cached.services) {
      const filtered = filterByValidUser(servicesRes.data);
      addToCache("services", filtered, 5 * 60 * 1000);
      setServices(filtered);
    }

  } catch (err) {
    console.error(err);
    setError("Failed to load recommendations");
  } finally {
    setLoading(false);
  }
}, [userLocation, userCity, userCountry, getFromCache, addToCache]);

useEffect(() => {
  loadAll();
}, [loadAll]);


  // Basic tag extraction from items (returns unique tags)
  const tags = useMemo(() => {
    const setTags = new Set();
    const push = (str) => { if (str) str.toString().split(/[,\|\/]/).map(s => s.trim()).filter(Boolean).forEach(t => setTags.add(t)); };

    events.forEach(e => { push(e.ticketType); push(e.city); push(e.category || "Event"); });
    venues.forEach(v => { push(v.country); push(v.city || "Venue"); });
    performances.forEach(p => {push(p.country); push(p.city); push(p.artType); });
    services.forEach(s => {push(s.country); push(s.city); push(s.serviceType); });

    return Array.from(setTags).slice(0, 15); // cap tags
  }, [events, venues, performances, services]);

  // Filtering logic
  const filterByTagAndSearch = useCallback((items, type) => {
    return items.filter(item => {
      // Tag filter: check relevant fields
      if (selectedTag) {
        const haystack = [
          item.category, item.ticketType, item.serviceType, item.artType,
          item.city, item.country,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(selectedTag.toLowerCase())) return false;
      }

      // Search text
      if (searchText) {
        const hay = [
          item.title, item.name, item.serviceType, item.artType,
          item.city, item.country, item.venue, item.ticketType
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(searchText.toLowerCase())) return false;
      }
      return true;
    });
  }, [selectedTag, searchText]);

  const filteredEvents = useMemo(() => filterByTagAndSearch(events, "event"), [events, filterByTagAndSearch]);
  const filteredVenues = useMemo(() => filterByTagAndSearch(venues, "venue"), [venues, filterByTagAndSearch]);
  const filteredPerformances = useMemo(() => filterByTagAndSearch(performances, "performance"), [performances, filterByTagAndSearch]);
  const filteredServices = useMemo(() => filterByTagAndSearch(services, "service"), [services, filterByTagAndSearch]);

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

  // helpers to open modals (keeping your previous handlers)
  const handleViewDetails = (event) => {
    const user = users.find(u => u._id === event.userId);
    setSelectedEvent(event);
    setSelectedUser(user);
  };

  const handleViewVenueDetails = (venue) => {
    const user = users.find(u => u._id === venue.userId);
    setSelectedVenue(venue);
    setSelectedUser(user);
    setVenueModalOpen(true);
  };

  const handleViewPerformance = (card) => {
    const user = users.find(u => u._id === card.userId);
    setSelectedPerformance(card);
    setSelectedUser(user);
    setPerformanceModalOpen(true);
  };

  const handleViewService = (service) => {
    const user = users.find(u => u._id === service.userId);
    setSelectedService(service);
    setSelectedUser(user);
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

  // Scroll-to-top behavior for each section (called by PaginationControls via onPrevNext)
  const handleSectionNav = (sectionRef) => (direction) => {
    if (!sectionRef?.current) return;
    sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    // small timeout ensures page number changed before scroll if needed
    // we already call scroll after setPage in PaginationControls
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
    return <Box p={2}><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box p={{ xs: 1, sm: 2, md: 3 }} maxWidth="1200px" margin="0 auto">
      {/* Top area: tags + search */}
      <Stack spacing={2}>
        <Typography variant="h6">Explore</Typography>
        <TextField
          placeholder="Search events, venues, performances, services..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setCurrentEventPage(1); setCurrentVenuePage(1); setCurrentPerformancePage(1); setCurrentServicePage(1); }}
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
                // reset pages to first
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
        <Typography variant="h6" gutterBottom>User Profiles</Typography>
        {users.length > 0 ? <UserProfileCarousel users={users} /> : <Typography>No user profiles found.</Typography>}
      </Box>

      {/* EVENTS */}
      <Box mt={4} ref={eventsRef}>
        <Typography variant="h6" gutterBottom>Upcoming Events</Typography>
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
                      <Typography variant="subtitle1" gutterBottom>{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{event.description}</Typography>
                      <Typography variant="caption" color="text.secondary">Venue: {event.venue}</Typography>
                    </CardContent>
                    <Box p={1} display="flex" gap={1} justifyContent="space-between">
                      <Button size="small" onClick={() => handleViewDetails(event)}>View Details</Button>
                      <Button size="small" variant="contained" onClick={() => handleBuyTicket(event)}>Buy Ticket</Button>
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
        <Typography variant="h6" gutterBottom>Available Venues</Typography>
        {filteredVenues.length === 0 ? (
          <Typography>No venue listings available.</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedVenues.map((venue) => (
                <Grid item xs={12} sm={6} md={3} key={venue._id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia component="img" height="160" image={venue.images?.[0]?.url || "/default-venue.jpg"} alt={venue.name}/>
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
                      <Typography variant="body2" color="text.secondary">{venue.city}, {venue.country}</Typography>
                    </CardContent>
                    <Box p={1} display="flex" gap={1} justifyContent="space-between">
                      <Button size="small" onClick={() => handleViewVenueDetails(venue)}>Explore Venue</Button>
                      <Button size="small" variant="contained" onClick={() => handleBookVenue(venue)}>Book</Button>
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
        <Typography variant="h6" gutterBottom>Entertainment</Typography>
        {filteredPerformances.length === 0 ? (
          <Typography>No entertainment listings available.</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedPerformances.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card._id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia component="img" height="160" image={card.images?.[0]?.url || "/default-perf.jpg"} alt={card.name}/>
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
                      <Typography variant="body2" color="text.secondary">{card.artType} — {card.city}</Typography>
                    </CardContent>
                    <Box p={1} display="flex" gap={1} justifyContent="space-between">
                      <Button size="small" onClick={() => handleViewPerformance(card)}>View Card</Button>
                      <Button size="small" variant="contained" onClick={() => handleBookPerformance(card)}>Book</Button>
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
        <Typography variant="h6" gutterBottom>Services & Vendors</Typography>
        {filteredServices.length === 0 ? (
          <Typography>No service listings available.</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedServices.map((service) => (
                <Grid item xs={12} sm={6} md={3} key={service._id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia component="img" height="160" image={service.images?.[0]?.url || "/default-service.jpg"} alt={service.serviceType}/>
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
                      <Typography variant="body2" color="text.secondary">{service.city}, {service.country}</Typography>
                    </CardContent>
                    <Box p={1} display="flex" gap={1} justifyContent="space-between">
                      <Button size="small" onClick={() => handleViewService(service)}>View Service</Button>
                      <Button size="small" variant="contained" onClick={() => handleBookService(service)}>Book</Button>
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

      {selectedEvent &&(
        <EventModal
         event={selectedEvent} 
         user={selectedUser} 
         onClose={handleCloseModal} 
         onBuyTicket={() => handleBuyTicket(selectedEvent)} />
      )}

      {isTicketModalOpen && selectedEvent && (
        <TicketPurchase
         event={selectedEvent} 
         open={isTicketModalOpen} 
         onClose={handleCloseModal} />
      )}

      {isVenueModalOpen && selectedVenue && (
        <VenueDetailsModal
         venue={selectedVenue} 
         user={selectedUser} 
         onClose={handleCloseModal} 
         onBookVenue={() => handleBookVenue(selectedVenue)} />
      )}

      {isVenueBookingModalOpen && selectedVenue && (
        <VenueBookingFormModal
         venue={selectedVenue} 
         open={isVenueBookingModalOpen} 
         onClose={handleCloseModal} />
      )}

      {isPerformanceModalOpen && selectedPerformance && (
        <PerformanceDetailsModal
         performance={selectedPerformance} 
         user={selectedUser} 
         onClose={handleCloseModal} 
         onBookPerformance={() => handleBookPerformance(selectedPerformance)} />
      )}

      {isPerformanceBookingModalOpen && selectedPerformance && (
        <PerformanceBookingFormModal
         performance={selectedPerformance} 
         open={isPerformanceBookingModalOpen} 
         onClose={handleCloseModal} />
      )}

      {isServiceModalOpen && selectedService && (
        <ServiceDetailsModal
         service={selectedService} 
         user={selectedUser} 
         onClose={handleCloseModal} 
         onBookService={() => handleBookService(selectedService)} />
      )}

      {isServiceBookingModalOpen && selectedService && (
        <ServiceBookingFormModal
         service={selectedService} 
         open={isServiceBookingModalOpen} 
         onClose={handleCloseModal} />
      )}
    </Box>
  );
};

export default Home;
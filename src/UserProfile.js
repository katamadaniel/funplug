import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Avatar,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Collapse,
  IconButton,
  Divider,
  TextField,
  Rating,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShareIcon from "@mui/icons-material/Share";
import LanguageIcon from "@mui/icons-material/Language";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getAvatarUrl } from "./utils/avatar";

// These are your existing components — keep imports as-is or update names/paths
import EventModal from "./EventModal";
import TicketPurchase from "./TicketPurchase";
import VenueDetailsModal from "./VenueDetailsModal";
import VenueBookingFormModal from "./VenueBookingFormModal";
import PerformanceDetailsModal from "./PerformanceDetailsModal";
import PerformanceBookingFormModal from "./PerformanceBookingFormModal";
import ServiceDetailsModal from "./ServiceDetailsModal";
import ServiceBookingFormModal from "./ServiceBookingFormModal";

const API_URL = process.env.REACT_APP_API_URL;

const UserProfile = () => {
  const { id } = useParams();
  const contentRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFollowOpen, setIsFollowOpen] = useState(false);
  const [followName, setFollowName] = useState("");
  const [followEmail, setFollowEmail] = useState("");
  const [followerCount, setFollowerCount] = useState(0);

  const [averageRating, setAverageRating] = useState(0);
  const [canReview, setCanReview] = useState(false);
 
  const [user, setUser] = useState(null);

  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [services, setServices] = useState([]);

  const [tabIndex, setTabIndex] = useState(0);
  const [showBiography, setShowBiography] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isVenueModalOpen, setVenueModalOpen] = useState(false);
  const [isVenueBookingOpen, setVenueBookingOpen] = useState(false);

  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [isPerformanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [isPerformanceBookingOpen, setPerformanceBookingOpen] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [isServiceBookingOpen, setServiceBookingOpen] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/search/user/${id}`);
        if (cancelled) return;

        // Expecting { user, events, venues, performances, services }
        const payload = res.data || {};
        if (!payload.user) {
          setError("User not found");
          setLoading(false);
          return;
        }
        setUser(payload.user);
        setEvents(Array.isArray(payload.events) ? payload.events : []);
        setVenues(Array.isArray(payload.venues) ? payload.venues : []);
        setPerformances(Array.isArray(payload.performances) ? payload.performances : []);
        setServices(Array.isArray(payload.services) ? payload.services : []);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err?.response?.data?.message || "Failed to fetch profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();

    // fetch reviews as a separate call
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews/user/${id}`);
      const { reviews = [], averageRating = 0, canReview = false } = res.data;

      setReviews(reviews);
      setAverageRating(averageRating);
      setCanReview(canReview);
    } catch (err) {
      setReviews([]);
      setAverageRating(0);
      setCanReview(false);
    }
  };

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [id]);

useEffect(() => {
  axios.post(`${API_URL}/api/users/profile-view/${id}`);
}, [id]);

useEffect(() => {
    // scroll top of content when tab changes (keeps user card visible)
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [tabIndex]);

  // Helpers
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
  const pastEvents = events.filter((e) => new Date(e.date) < now).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  // Sort ascending for other lists (earliest/lowest first)
  const sortedVenues = [...venues].sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
  const sortedPerformances = [...performances].sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
  const sortedServices = [...services].sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));

  // Tab labels dynamic based on availability
  const tabs = [
    { key: "profile", label: "Profile", show: true },
    { key: "events", label: `Events (${events.length})`, show: events.length > 0 },
    { key: "venues", label: `Venues (${venues.length})`, show: venues.length > 0 },
    { key: "performances", label: `Rate Cards (${performances.length})`, show: performances.length > 0 },
    { key: "services", label: `Services (${services.length})`, show: services.length > 0 },
  ].filter(t => t.show);

  // Actions
  const handleTabChange = (e, newValue) => {
    setTabIndex(newValue);
  };

  const fetchFollowerCount = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/users/followers/count/${user._id}`
      );
      setFollowerCount(res.data.followerCount);
    } catch (err) {
      console.error("Error fetching follower count");
    }
  };

  useEffect(() => {
    if (user) fetchFollowerCount();
  }, [user]);

  const handleFollowSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/users/follow/${id}`, {
        name: followName,
        email: followEmail,
      });
      setFollowName("");
      setFollowEmail("");
      setIsFollowOpen(false);
      fetchFollowerCount();
      alert("Successfully followed!");
    } catch (err) {
      alert("Subscription failed.");
    }
  };


  // Reviews handling (GET/POST)
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews/user/${id}`);
      const { reviews = [], averageRating = 0, canReview = false } = res.data;

      setReviews(reviews);
      setAverageRating(averageRating);
      setCanReview(canReview);
    } catch (err) {
      setReviews([]);
      setAverageRating(0);
      setCanReview(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!reviewText.trim()) return;

    setReviewLoading(true);
    setReviewError(null);

    try {
      await axios.post(`${API_URL}/api/reviews`, {
        userId: id,
        rating: reviewRating,
        text: reviewText.trim(),

        // Guest verification
        name: reviewerName,
        email,
        phone,
      });

      setReviewText("");
      setReviewerName("");
      setEmail("");
      setPhone("");
      setReviewRating(5);

      await fetchReviews();
    } catch (err) {
      setReviewError(
        err?.response?.data?.message ||
        "You can only review after attending this event or booking."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // Item click handlers open modals and pass selected item
  const openEvent = (ev) => { setSelectedEvent(ev); };
  const openTicket = (ev) => { setSelectedEvent(ev); setTicketModalOpen(true); };
  const openVenue = (v) => { setSelectedVenue(v); setVenueModalOpen(true); };
  const openVenueBook = (v) => { setSelectedVenue(v); setVenueBookingOpen(true); };
  const openPerformance = (p) => { setSelectedPerformance(p); setPerformanceModalOpen(true); };
  const openPerfBook = (p) => { setSelectedPerformance(p); setPerformanceBookingOpen(true); };
  const openService = (s) => { setSelectedService(s); setServiceModalOpen(true); };
  const openServiceBook = (s) => { setSelectedService(s); setServiceBookingOpen(true); };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="240px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user) {
    return <Alert severity="info">User not found</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, pt: 2 }}>
      {/* Top sticky profile card */}
      <Paper
        ref={contentRef}
        elevation={3}
        sx={{
          position: "sticky",
          top: 12,
          zIndex: 50,
          p: 2,
          mb: 2,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Avatar
          src={getAvatarUrl(user)}
          alt={user.username}
          sx={{ width: { xs: 80, md: 120 }, height: { xs: 80, md: 120 } }}
        />
        <Box flex={1} minWidth={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={1}>
            <Box minWidth={0}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h5" noWrap>
                  {user.username}
                </Typography>

                {user.isVerified && (
                  <VerifiedIcon
                    fontSize="small"
                    color="primary"
                    titleAccess="Verified profile"
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={averageRating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({reviews.length} reviews)
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.category} 
                {(user.location?.city || user.location?.country) && (
                  <Typography variant="body2" color="text.secondary">
                    {user.location?.city}{user.location?.country ? `, ${user.location.country}` : ""}
                  </Typography>
                )}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {followerCount} Followers
              </Typography>
              <Box>
                      {/* FOLLOW FORM */}
                {isFollowOpen && (
                  <Box component="form" onSubmit={handleFollowSubmit} sx={{ mb: 3 }}>
                    <Stack spacing={2}>
                      <TextField
                        label="Your Name"
                        value={followName}
                        onChange={(e) => setFollowName(e.target.value)}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Your Email"
                        value={followEmail}
                        onChange={(e) => setFollowEmail(e.target.value)}
                        fullWidth
                        required
                      />

                      <Button type="submit" variant="contained">
                        Subscribe
                      </Button>
                    </Stack>

                    <Divider sx={{ mt: 3 }} />
                  </Box>
                )}
              </Box>
              <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                <Chip label={`${events.length} Events`} size="small" />
                <Chip label={`${venues.length} Venues`} size="small" />
                <Chip label={`${performances.length} Rate Cards`} size="small" />
                <Chip label={`${services.length} Services`} size="small" />
              </Box>
            </Box>

            <Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsFollowOpen(!isFollowOpen)}
              >
                {isFollowOpen ? "Cancel" : "Follow"}
              </Button>
              <Button
                size="small"
                startIcon={<ShareIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Profile link copied!");
                }}
              >
                Share
              </Button>
            </Box>
            
          </Stack>

          {/* Biography & small intro in header */}
          {user.shortIntro && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {user.shortIntro}
            </Typography>
          )}
          <Stack direction="row" spacing={1} mt={1}>
            {user.website && (
              <IconButton href={user.website} target="_blank">
                <LanguageIcon />
              </IconButton>
            )}
            {user.socialLinks?.instagram && (
              <IconButton href={user.socialLinks.instagram} target="_blank">
                <InstagramIcon />
              </IconButton>
            )}
            {user.socialLinks?.twitter && (
              <IconButton href={user.socialLinks.twitter} target="_blank">
                <TwitterIcon />
              </IconButton>
            )}
            {user.socialLinks?.facebook && (
              <IconButton href={user.socialLinks.facebook} target="_blank">
                <FacebookIcon />
              </IconButton>
            )}
            {user.socialLinks?.linkedin && (
              <IconButton href={user.socialLinks.linkedin} target="_blank">
                <LinkedInIcon />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabs.map((t, i) => (
            <Tab key={t.key} label={t.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Tab panels */}
      <Box>
        {/* PROFILE TAB */}
        {tabIndex === 0 && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Profile</Typography>

                  {/* Biography (collapsible) */}
                  {user.biography && (
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">Biography</Typography>
                        <IconButton size="small" onClick={() => setShowBiography(v => !v)}>
                          {showBiography ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Stack>
                      <Collapse in={showBiography}>
                        <Typography variant="body2" sx={{ mt: 1 }}>{user.biography}</Typography>
                      </Collapse>
                    </Box>
                  )}
                </Paper>

                {/* Reviews */}
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="h6">Reviews</Typography>

                    {/* Average rating */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Rating value={averageRating} precision={0.5} readOnly />
                      <Typography variant="body2" color="text.secondary">
                        ({reviews.length} reviews)
                      </Typography>
                    </Stack>
                  </Stack>

                  {!canReview && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Reviews are only allowed after the event or booking is completed.
                    </Alert>
                  )}

                  {canReview && (
                    <Box component="form" onSubmit={submitReview} sx={{ mt: 2 }}>
                      <Stack spacing={2}>
                        <TextField
                          label="Your Name"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          required
                        />

                        <TextField
                          label="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />

                        <TextField
                          label="Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />

                        <TextField
                          multiline
                          minRows={3}
                          placeholder="Write your review..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          required
                        />

                        <Rating
                          value={reviewRating}
                          onChange={(e, v) => setReviewRating(v)}
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={reviewLoading}
                        >
                          {reviewLoading ? "Submitting..." : "Submit Review"}
                        </Button>

                        {reviewError && <Alert severity="error">{reviewError}</Alert>}
                      </Stack>
                    </Box>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <List>
                    {reviews.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No reviews yet.
                      </Typography>
                    )}

                    {reviews.map((r) => (
                      <ListItem key={r._id} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {r.authorName?.charAt(0) || "U"}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle2">
                                {r.authorName || "Anonymous"}
                              </Typography>
                              <Rating value={r.rating} readOnly size="small" />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          }
                          secondary={r.text}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Sidebar: contact / quick info */}
                <Paper sx={{ p: 2 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography variant="body2">
                    {user.location?.city || ""}{user.location?.country ? `, ${user.location.country}` : ""}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={() => window.location = `mailto:${user.email}`}>Email</Button>
                    {user.phone && <Button variant="outlined" size="small" href={`tel:${user.phone}`}>Call</Button>}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* EVENTS TAB */}
        {tabIndex === 1 && (
          <Box>
            <Stack spacing={2}>
              <Typography variant="h6">Upcoming Events</Typography>
              {upcomingEvents.length === 0 && <Typography>No upcoming events.</Typography>}
              <Grid container spacing={2}>
                {upcomingEvents.map(ev => (
                  <Grid item xs={12} sm={6} md={4} key={ev._id}>
                    <Card>
                      {ev.image && <CardMedia component="img" height="160" image={ev.image} alt={ev.title} />}
                      <CardContent>
                        <Typography variant="subtitle1">{ev.title}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>{ev.description}</Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {new Date(ev.date).toLocaleDateString()} • {ev.startTime}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => openEvent(ev)}>Details</Button>
                        <Button size="small" onClick={() => openTicket(ev)}>Buy Ticket</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Past Events</Typography>
                  <IconButton onClick={() => setShowPastEvents(s => !s)}>
                    {showPastEvents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Stack>
                <Collapse in={showPastEvents}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {pastEvents.length === 0 && <Typography>No past events.</Typography>}
                    {pastEvents.map(ev => (
                      <Grid item xs={12} sm={6} md={4} key={ev._id}>
                        <Card>
                          {ev.image && <CardMedia component="img" height="140" image={ev.image} alt={ev.title} />}
                          <CardContent>
                            <Typography variant="subtitle1">{ev.title}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>{ev.description}</Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              {new Date(ev.date).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Collapse>
              </Box>
            </Stack>
          </Box>
        )}

        {/* VENUES TAB */}
        {tabIndex === 2 && (
          <Box>
            <Grid container spacing={2}>
              {sortedVenues.length === 0 && <Typography>No venues.</Typography>}
              {sortedVenues.map(v => (
                <Grid item xs={12} sm={6} md={4} key={v._id}>
                  <Card>
                    {v.images?.[0]?.url && <CardMedia component="img" height="140" image={v.images[0].url} alt={v.name} />}
                    <CardContent>
                      <Typography variant="subtitle1">{v.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{v.city}, {v.country}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>Ksh. {v.charges}/hr</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => openVenue(v)}>Explore</Button>
                      <Button size="small" onClick={() => openVenueBook(v)}>Book</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* PERFORMANCES Tab */}
        {tabIndex === 3 && (
          <Box>
            <Grid container spacing={2}>
              {sortedPerformances.length === 0 && <Typography>No rate cards.</Typography>}
              {sortedPerformances.map(p => (
                <Grid item xs={12} sm={6} md={4} key={p._id}>
                  <Card>
                    {p.images?.[0]?.url && <CardMedia component="img" height="140" image={p.images[0].url} alt={p.name} />}
                    <CardContent>
                      <Typography variant="subtitle1">{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{p.artType}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>Ksh. {p.charges}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => openPerformance(p)}>View</Button>
                      <Button size="small" onClick={() => openPerfBook(p)}>Book</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* SERVICES Tab */}
        {tabIndex === 4 && (
          <Box>
            <Grid container spacing={2}>
              {sortedServices.length === 0 && <Typography>No services.</Typography>}
              {sortedServices.map(s => (
                <Grid item xs={12} sm={6} md={4} key={s._id}>
                  <Card>
                    {s.images?.[0]?.url && <CardMedia component="img" height="140" image={s.images[0].url} alt={s.serviceType} />}
                    <CardContent>
                      <Typography variant="subtitle1">{s.serviceType}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{s.city}, {s.country}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>Ksh. {s.charges}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => openService(s)}>View</Button>
                      <Button size="small" onClick={() => openServiceBook(s)}>Book</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Modals */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
          onBuyTicket={() => setTicketModalOpen(true)}
        />
      )}

      {isTicketModalOpen && selectedEvent && (
        <TicketPurchase
          event={selectedEvent}
          open={isTicketModalOpen}
          onClose={() => { setSelectedEvent(false); setTicketModalOpen(false); }}
        />
      )}

      {isVenueModalOpen && selectedVenue && (
        <VenueDetailsModal
          venue={selectedVenue}
          user={user}
          onClose={() => setVenueModalOpen(false)}
          onBookVenue={() => setVenueBookingOpen(true)}
        />
      )}

      {isVenueBookingOpen && selectedVenue && (
        <VenueBookingFormModal
          venue={selectedVenue}
          open={isVenueBookingOpen}
          onClose={() => { setVenueModalOpen(false); setVenueBookingOpen(false); }}
        />
      )}

      {isPerformanceModalOpen && selectedPerformance && (
        <PerformanceDetailsModal
          performance={selectedPerformance}
          user={user}
          onClose={() => setPerformanceModalOpen(false)}
          onBookPerformance={() => setPerformanceBookingOpen(true)}
        />
      )}

      {isPerformanceBookingOpen && selectedPerformance && (
        <PerformanceBookingFormModal
          performance={selectedPerformance}
          open={isPerformanceBookingOpen}
          onClose={() => { setPerformanceModalOpen(false); setPerformanceBookingOpen(false); }}
        />
      )}

      {isServiceModalOpen && selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          user={user}
          onClose={() => setServiceModalOpen(false)}
          onBookService={() => setServiceBookingOpen(true)}
        />
      )}

      {isServiceBookingOpen && selectedService && (
        <ServiceBookingFormModal
          service={selectedService}
          open={isServiceBookingOpen}
          onClose={() => { setServiceModalOpen(false); setServiceBookingOpen(false); }}
        />
      )}
    </Box>
  );
};

export default UserProfile;

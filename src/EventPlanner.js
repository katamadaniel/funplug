import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AutoAwesome,
  ArrowBack,
  CalendarMonth,
  CheckCircle,
  Groups,
  LocationOn,
  Place,
  Payments,
  Schedule,
  Search,
  Tune,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { fetchRecommendations } from "./services/recommendationService";
import VenueBookingFormModal from "./VenueBookingFormModal";
import PerformanceBookingFormModal from "./PerformanceBookingFormModal";
import ServiceBookingFormModal from "./ServiceBookingFormModal";

const initialForm = {
  eventType: "",
  budget: "",
  guests: "",
  location: "",
  date: "",
};

const eventTypes = ["Wedding", "Birthday", "Corporate event", "Concert", "Festival", "Private party", "Other"];

const getName = (item) => item?.name || item?.title || "Recommended option";
const getImage = (item, fallback) => item?.image || item?.images?.[0]?.url || fallback;
const getPlace = (item, fallback) => [item?.city, item?.country].filter(Boolean).join(", ") || fallback;

function estimateBudget(budget, guests, eventType) {
  const amount = Number(budget);
  const guestCount = Number(guests);
  if (!amount || !guestCount) return "Add your budget and guest count for an estimate.";

  const venue = Math.round(amount * 0.35);
  const talent = Math.round(amount * 0.2);
  const vendors = Math.round(amount * 0.3);
  const buffer = amount - venue - talent - vendors;
  return `${eventType || "Your event"}: ${venue.toLocaleString()} venue • ${talent.toLocaleString()} entertainment • ${vendors.toLocaleString()} vendors • ${Math.max(buffer, 0).toLocaleString()} buffer`;
}

function PlannerRecommendation({ item, type, onBook }) {
  const fallback = type === "venue" ? "/default-venue.jpg" : type === "performance" ? "/default-perf.jpg" : "/default-service.jpg";
  const actionLabel = type === "venue" ? "Book venue" : type === "performance" ? "Book entertainer" : "Book vendor";

  return (
    <Card sx={{ height: "100%", borderRadius: 3, overflow: "hidden", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <CardMedia component="img" height="145" image={getImage(item, fallback)} alt={getName(item)} loading="lazy" />
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} noWrap>{getName(item)}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {item?.venueType || item?.artType || item?.serviceType || "Marketplace listing"} • {getPlace(item, "Location flexible")}
        </Typography>
        <Button size="small" variant="contained" onClick={() => onBook(item)} sx={{ borderRadius: "999px", textTransform: "none" }}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

const EventPlanner = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState({ type: "", item: null });

  const budgetSummary = useMemo(
    () => estimateBudget(form.budget, form.guests, form.eventType),
    [form.budget, form.guests, form.eventType]
  );

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const generatePlan = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const params = {
        city: form.location,
        limit: 12,
        category: form.eventType,
      };
      const [venues, performances, services] = await Promise.all([
        fetchRecommendations("venues", params),
        fetchRecommendations("performances", params),
        fetchRecommendations("services", params),
      ]);

      setPlan({
        venues: venues?.data || [],
        performances: performances?.data || [],
        services: services?.data || [],
      });
    } catch (requestError) {
      console.error("[Planner generation error]", requestError);
      setError("We could not load live marketplace matches. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const openBooking = (type, item) => setBooking({ type, item });
  const closeBooking = () => setBooking({ type: "", item: null });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", background: "linear-gradient(180deg, rgba(108,99,255,0.08) 0%, transparent 42%)", py: { xs: 2, md: 4 } }}>
      <Box maxWidth="1180px" mx="auto" px={{ xs: 1.5, md: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/")} sx={{ mb: 2, textTransform: "none" }}>
          Back to FunPlug
        </Button>

        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ height: "100%", p: { xs: 2.5, md: 4 }, borderRadius: 4, color: "white", background: "linear-gradient(145deg, #140f2d 0%, #382071 55%, #7545f5 100%)" }}>
              <Stack spacing={2.5}>
                <Chip icon={<AutoAwesome />} label="AI-assisted event planner" sx={{ alignSelf: "flex-start", color: "white", bgcolor: "rgba(255,255,255,0.14)" }} />
                <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.04 }}>
                  Make the plan feel easy.
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.78)" }}>
                  Tell us the shape of your event. FunPlug will assemble the venue, people, services, budget, and rhythm to get it moving.
                </Typography>
                <Stack spacing={1.5} sx={{ pt: 1 }}>
                  {[
                    [<Tune />, "Built around your brief"],
                    [<Search />, "Matched to the marketplace"],
                    [<CheckCircle />, "Ready to book when you are"],
                  ].map(([icon, text]) => (
                    <Stack direction="row" spacing={1.2} alignItems="center" key={text}>
                      {icon}
                      <Typography variant="body2">{text}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper component="form" onSubmit={generatePlan} elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
              <Stack spacing={2.2}>
                <Box>
                  <Typography variant="h5" fontWeight={800}>Start with the essentials</Typography>
                  <Typography color="text.secondary">Five inputs. One event blueprint.</Typography>
                </Box>
                <TextField select required label="Event type" value={form.eventType} onChange={updateField("eventType")} fullWidth>
                  {eventTypes.map((type) => <MenuItem value={type} key={type}>{type}</MenuItem>)}
                </TextField>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField required label="Budget" type="number" value={form.budget} onChange={updateField("budget")} fullWidth InputProps={{ startAdornment: <Payments sx={{ mr: 1, color: "text.secondary" }} /> }} helperText="Use your local currency amount" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required label="Guests" type="number" value={form.guests} onChange={updateField("guests")} fullWidth InputProps={{ startAdornment: <Groups sx={{ mr: 1, color: "text.secondary" }} /> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required label="Location" placeholder="City or area" value={form.location} onChange={updateField("location")} fullWidth InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: "text.secondary" }} /> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField required label="Date" type="date" value={form.date} onChange={updateField("date")} fullWidth InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <CalendarMonth sx={{ mr: 1, color: "text.secondary" }} /> }} />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" size="large" disabled={loading} endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />} sx={{ borderRadius: "999px", py: 1.2, textTransform: "none", fontWeight: 700 }}>
                  {loading ? "Building your plan..." : "Generate my event plan"}
                </Button>
                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {plan && (
          <Stack spacing={3} mt={3}>
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: "#fff8e9", border: "1px solid #f4dfab" }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Your event blueprint</Typography>
                  <Typography variant="h4" fontWeight={800}>{form.eventType} in {form.location}</Typography>
                  <Typography color="text.secondary">{form.date} • {form.guests} guests • budget {Number(form.budget).toLocaleString()}</Typography>
                </Box>
                <Chip icon={<Payments />} label={budgetSummary} sx={{ height: "auto", py: 1, maxWidth: { xs: "100%", md: 430 }, whiteSpace: "normal", "& .MuiChip-label": { display: "block", whiteSpace: "normal" } }} />
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}><Place color="primary" /><Box><Typography variant="h6" fontWeight={800}>Recommended venue</Typography><Typography variant="body2" color="text.secondary">A space sized for your guest list and location.</Typography></Box></Stack>
              <Grid container spacing={2}>{(plan.venues.length ? plan.venues.slice(0, 3) : [{}]).map((item, index) => item._id ? <Grid item xs={12} sm={6} md={4} key={item._id}><PlannerRecommendation item={item} type="venue" onBook={(selected) => openBooking("venue", selected)} /></Grid> : <Grid item xs={12} key={`venue-empty-${index}`}><Alert severity="info">No live venue matches yet. Try a nearby city or broaden the location.</Alert></Grid>)}</Grid>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ height: "100%", p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}><AutoAwesome color="secondary" /><Box><Typography variant="h6" fontWeight={800}>Recommended entertainers</Typography><Typography variant="body2" color="text.secondary">Set the energy for the room.</Typography></Box></Stack>
                  <Stack spacing={1.5}>{(plan.performances.length ? plan.performances.slice(0, 3) : [{}]).map((item, index) => item._id ? <PlannerRecommendation item={item} type="performance" onBook={(selected) => openBooking("performance", selected)} key={item._id} /> : <Alert severity="info" key={`performance-empty-${index}`}>No live entertainer matches found for this brief.</Alert>)}</Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ height: "100%", p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}><Payments color="success" /><Box><Typography variant="h6" fontWeight={800}>Recommended vendors</Typography><Typography variant="body2" color="text.secondary">Bring the important details to life.</Typography></Box></Stack>
                  <Stack spacing={1.5}>{(plan.services.length ? plan.services.slice(0, 3) : [{}]).map((item, index) => item._id ? <PlannerRecommendation item={item} type="service" onBook={(selected) => openBooking("service", selected)} key={item._id} /> : <Alert severity="info" key={`service-empty-${index}`}>No live vendor matches found for this brief.</Alert>)}</Stack>
                </Paper>
              </Grid>
            </Grid>

            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: "#14102d", color: "white" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}><Schedule /><Box><Typography variant="h6" fontWeight={800}>Suggested timeline</Typography><Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>A simple rhythm for {form.eventType.toLowerCase()} day.</Typography></Box></Stack>
              <Grid container spacing={2}>
                {["4–8 weeks before", "1–2 weeks before", "Event week", "Event day"].map((label, index) => <Grid item xs={12} sm={6} md={3} key={label}><Box sx={{ p: 2, height: "100%", borderRadius: 3, bgcolor: "rgba(255,255,255,0.09)" }}><Typography variant="overline" sx={{ color: "#bda9ff" }}>{label}</Typography><Typography variant="body2" sx={{ mt: 1 }}>{["Confirm your venue, vendors, and entertainment.", "Lock guest details and payment milestones.", "Share the run sheet and confirm arrival times.", "Welcome guests, enjoy the moment, and let the team run it."][index]}</Typography></Box></Grid>)}
              </Grid>
            </Paper>
          </Stack>
        )}
      </Box>

      {booking.type === "venue" && <VenueBookingFormModal venue={booking.item} open onClose={closeBooking} />}
      {booking.type === "performance" && <PerformanceBookingFormModal performance={booking.item} open onClose={closeBooking} />}
      {booking.type === "service" && <ServiceBookingFormModal service={booking.item} open onClose={closeBooking} />}
    </Box>
  );
};

export default EventPlanner;

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Avatar,
  Skeleton,
  Box,
  Button,
} from "@mui/material";

import { useSearch } from "./contexts/SearchContext";
import EventModal from "./EventModal";
import TicketPurchase from "./TicketPurchase";
import VenueDetailsModal from "./VenueDetailsModal";
import VenueBookingFormModal from "./VenueBookingFormModal";
import PerformanceDetailsModal from "./PerformanceDetailsModal";
import PerformanceBookingFormModal from "./PerformanceBookingFormModal";
import ServiceDetailsModal from "./ServiceDetailsModal";
import ServiceBookingFormModal from "./ServiceBookingFormModal";

import axios from "axios";
import { getAvatarUrl } from "./utils/avatar";

const API_URL = process.env.REACT_APP_API_URL;
const USERS_API_URL = `${API_URL}/api/users`;

const FILTER_TAGS = [
  { label: "All", value: "all" },
  { label: "Users", value: "user" },
  { label: "Events", value: "event" },
  { label: "Venues", value: "venue" },
  { label: "Entertainment", value: "performance" },
  { label: "Services", value: "service" },
];

const isFutureDate = (date) => {
  if (!date) return false;
  return new Date(date).getTime() > Date.now();
};

const SearchResults = ({ results, onViewProfile }) => {
  const { searchQuery } = useSearch();

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleImageError = (e) => {
      e.target.onerror = null;
    e.target.src = process.env.REACT_APP_AVATAR_URL;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(USERS_API_URL);
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  //QUERY & FILTER LOGIC
  const query = searchQuery.toLowerCase();

  const filteredResults = results
    .filter((item) => {
      // TAG FILTER
      if (filter !== "all" && item.type !== filter) return false;

      // TEXT SEARCH
      if (!JSON.stringify(item).toLowerCase().includes(query)) return false;

      // FUTURE EVENTS ONLY
      if (item.type === "event") {
        const eventDate = item.date || item.startDate;
        if (!isFutureDate(eventDate)) return false;
      }

      return true;
    });

  const grouped = {
    user: filteredResults.filter(r => r.type === "user"),
    event: filteredResults.filter(r => r.type === "event"),
    venue: filteredResults.filter(r => r.type === "venue"),
    performance: filteredResults.filter(r => r.type === "performance"),
    service: filteredResults.filter(r => r.type === "service"),
  };

  if (loading)
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

  return (
    <Box sx={{ p: 2 }}>
      
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {FILTER_TAGS.map(tag => (
          <Chip
            key={tag.value}
            label={tag.label}
            color={filter === tag.value ? "primary" : "default"}
            onClick={() => setFilter(tag.value)}
          />
        ))}
      </Box>

      {Object.keys(grouped).map(type => {
        const list = grouped[type];
        if (!list.length) return null;

        return (
          <Box key={type} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </Typography>

            <Grid container spacing={2}>
              {list.map((item, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Card sx={{ cursor: "pointer" }} onClick={() => setSelected(item)}>
                    {/* USER CARD */}
                    {item.type === "user" ? (
                      <CardContent sx={{ textAlign: "center" }}>
                        <Avatar
                          src={getAvatarUrl(item)}
                          onError={handleImageError}
                          sx={{ width: 100, height: 100, margin: "auto", mb: 1 }}
                        />
                        <Typography variant="h6">{item.username}</Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile(item._id);
                          }}
                        >
                          View Profile
                        </Button>
                      </CardContent>
                    ) : (
                      // MEDIA CARD (Event/Venue/Service/Performance)
                      <>
                        <CardMedia
                          component="img"
                          image={item.image || item.images?.[0]?.url}
                          height="160"
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.title || item.name}
                          </Typography>
                          <Typography variant="body2">
                            {item.description || item.location}
                          </Typography>
                        </CardContent>
                      </>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      {/* ===================== MODALS ======================= */}

      {selected?.type === "event"  && !selected?.modal && (
        <EventModal
          event={selected}
          user={users.find(u => u._id === selected.userId)}
          onBuyTicket={() => setSelected({ ...selected, modal: "ticket" })}
          onClose={() => setSelected(null)}
        />
      )}

      {selected?.modal === "ticket" && (
        <TicketPurchase
         event={selected} 
         open={selected?.modal === "ticket"}
         onClose={() => setSelected(null)} />
      )}

      {selected?.type === "venue" && !selected?.modal && (
        <VenueDetailsModal
          venue={selected}
          user={users.find(u => u._id === selected.userId)}
          onBookVenue={() => setSelected({ ...selected, modal: "venue-book" })}
          onClose={() => setSelected(null)}
        />
      )}

      {selected?.modal === "venue-book" && (
        <VenueBookingFormModal
         venue={selected}
         open={selected?.modal === "venue-book"}
         onClose={() => setSelected(null)} />
      )}

      {selected?.type === "performance" && !selected?.modal && (
        <PerformanceDetailsModal
          performance={selected}
          user={users.find(u => u._id === selected.userId)}
          onBookPerformance={() => setSelected({ ...selected, modal: "performance-book" })}
          onClose={() => setSelected(null)}
        />
      )}

      {selected?.modal === "performance-book"&& (
        <PerformanceBookingFormModal
         performance={selected}
         open={selected?.modal === "performance-book"} 
         onClose={() => setSelected(null)} />
      )}

      {selected?.type === "service" && !selected?.modal && (
        <ServiceDetailsModal
          service={selected}
          user={users.find(u => u._id === selected.userId)}
          onBookService={() => setSelected({ ...selected, modal: "service-book" })}
          onClose={() => setSelected(null)}
        />
      )}

      {selected?.modal === "service-book" && (
        <ServiceBookingFormModal
         service={selected}
         open={selected?.modal === "service-book"}
         onClose={() => setSelected(null)} />
      )}
    </Box>
  );
};

export default SearchResults;

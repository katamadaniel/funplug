import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, CircularProgress, Box
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import EventCard from "./EventCard";
import EventModal from "../EventModal";
import TicketPurchase from "../TicketPurchase";

const API_URL = process.env.REACT_APP_API_URL;

const CategoryDetails = () => {
  const { category } = useParams();

  const [groupedEvents, setGroupedEvents] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users`),
          axios.get(`${API_URL}/api/events/category/${category}`)
        ]);

        setUsers(usersRes.data);
        setGroupedEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleSelectEvent = (event) => {
    const user = users.find(u => u._id === event.userId);
    setSelectedUser(user || {});
    setSelectedEvent(event);
    setModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {Object.entries(groupedEvents).map(([subCategory, events]) => (
        <Accordion defaultExpanded key={subCategory} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{subCategory}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {events.map((ev) => (
                <EventCard key={ev._id} event={ev} onView={() => handleSelectEvent(ev)} />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {selectedEvent && (
        <EventModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          event={selectedEvent}
          user={selectedUser}
          onBuyTicket={() => { setModalOpen(false); setPurchaseOpen(true); }}
        />
      )}

      {selectedEvent && (
        <TicketPurchase
          open={purchaseOpen}
          event={selectedEvent}
          onClose={() => { setPurchaseOpen(false); setSelectedEvent(null); }}
        />
      )}
    </Box>
  );
};

export default CategoryDetails;

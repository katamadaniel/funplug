import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Pagination,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import EventCard from "./EventCard";
import ListingDetailsModal from "../ListingDetailsModal";
import TicketPurchase from "../TicketPurchase";
import ScreenLoader from "../components/ScreenLoader";

const API_URL = process.env.REACT_APP_API_URL;
const EVENTS_API_URL = `${API_URL}/api/events`;
const CATEGORY_API_URL = `${EVENTS_API_URL}/category`;
const ITEMS_PER_PAGE = 8;

const EventDetails = () => {
  const { category } = useParams();

  const [groupedEvents, setGroupedEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const eventsRes = await axios.get(`${CATEGORY_API_URL}/${category}`);
        setGroupedEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setPurchaseOpen(false); // ensure purchase modal is closed
    setDetailsOpen(true);   // open listing modal first
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEvent(null);
  };

  const handleProceedToPurchase = () => {
    setDetailsOpen(false);

    // allow Listing modal to unmount first before purchase opens
    setTimeout(() => {
      setPurchaseOpen(true);
    }, 150);
  };

  const handleClosePurchase = () => {
    setPurchaseOpen(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <ScreenLoader
        open={true}
        text="Loading Events"
        subText="Fetching events by category..."
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {Object.keys(groupedEvents).length === 0 ? (
        <Typography>No events found.</Typography>
      ) : (
        Object.entries(groupedEvents).map(([subCategory, events]) => {
          const page = pagination[subCategory] || 1;
          const pageCount = Math.ceil(events.length / ITEMS_PER_PAGE);
          const paginatedEvents = events.slice(
            (page - 1) * ITEMS_PER_PAGE,
            page * ITEMS_PER_PAGE
          );

          return (
            <Accordion defaultExpanded key={subCategory} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{subCategory} ({events.length})</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Box>
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    }}
                  >
                    {paginatedEvents.map((ev) => (
                      <EventCard
                        key={ev._id}
                        event={ev}
                        onView={() => handleSelectEvent(ev)}
                      />
                    ))}
                  </Grid>

                  {pageCount > 1 && (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(_, newPage) =>
                          setPagination({
                            ...pagination,
                            [subCategory]: newPage,
                          })
                        }
                      />
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      {/* STEP 1: DETAILS MODAL */}
      {selectedEvent && detailsOpen && (
        <ListingDetailsModal
          open={detailsOpen}
          type="event"
          data={selectedEvent}
          onClose={handleCloseDetails}
          onAction={handleProceedToPurchase}
        />
      )}

      {/* STEP 2: PURCHASE MODAL */}
      {selectedEvent && purchaseOpen && (
        <TicketPurchase
          open={purchaseOpen}
          event={selectedEvent}
          onClose={handleClosePurchase}
        />
      )}
    </Box>
  );
};

export default EventDetails;
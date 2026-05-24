import React from "react";
import { Card, CardMedia, CardContent, Typography, Stack, Button } from "@mui/material";

const EventCard = ({ event, onView }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardMedia
      component="img"
      height="160"
      image={event.image || "/default-event.jpg"}
    />
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6">{event.title}</Typography>
      <Typography variant="body2">{event.venue}</Typography>
      <Typography variant="body2">
        {event.eventDates?.length > 0
          ? `${new Date(event.eventDates[0].date).toLocaleDateString()} • ${event.eventDates[0].startTime}`
          : `${new Date(event.date).toLocaleDateString()} • ${event.startTime}`}
        {event.eventDates?.length > 1 ? ` (+${event.eventDates.length - 1} more)` : ''}
      </Typography>
    </CardContent>
      <Stack direction="row" spacing={1} sx={{ p: 1 }}>
      <Button fullWidth sx={{ mt: 1 }} onClick={onView} variant="contained">
        View Details
      </Button>
      </Stack>
  </Card>
);

export default EventCard;

import React from "react";
import { Card, CardMedia, CardContent, Typography, Button } from "@mui/material";

const EventCard = ({ event, onView }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardMedia
      component="img"
      height="160"
      image={event.image || "/default-event.jpg"}
    />
    <CardContent>
      <Typography variant="h6">{event.title}</Typography>
      <Typography variant="body2">{event.venue}</Typography>
      <Typography variant="body2">
        {new Date(event.date).toLocaleDateString()} • {event.startTime}
      </Typography>
    </CardContent>
      <Button fullWidth sx={{ mt: 1 }} onClick={onView} variant="contained">
        View Details
      </Button>
  </Card>
);

export default EventCard;

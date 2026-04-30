// VenueCard.js
import React from "react";
import { Card, CardMedia, CardContent, Typography, Button, Stack } from "@mui/material";

const VenueCard = ({ venue, onView }) => (
  <Card sx={{ borderRadius: 2,display: "flex", flexDirection: "column", height: "100%"  }}>
    <CardMedia
      component="img"
      height="160"
      image={venue.images?.[0]?.url || "/default-venue.jpg"}
      sx={{ objectFit: "cover" }}
    />
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6">{venue.name}</Typography>
      <Typography variant="body2" color="text.secondary">{venue.city}, {venue.country}</Typography>
    </CardContent>
      <Stack direction="row" spacing={1} sx={{ p: 1 }}>
        <Button size="small" variant="contained" fullWidth onClick={onView}>Explore</Button>
      </Stack>
  </Card>
);

export default VenueCard;

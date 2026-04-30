// ServiceCard.js
import React from "react";
import { Card, CardMedia, CardContent, Typography, Button, Stack } from "@mui/material";

const ServiceCard = ({ service, onView }) => {
  return (
    <Card sx={{ borderRadius: 2, display: "flex", flexDirection: "column", height: "100%" }}>
      <CardMedia
        component="img"
        height="160"
        image={service.images?.[0]?.url || "/default-service.jpg"}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{service.serviceType}</Typography>
        <Typography variant="body2" color="text.secondary">{service.city}, {service.country}</Typography>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ p: 1 }}>
        <Button size="small" variant="contained" fullWidth onClick={onView}>Book / View</Button>
      </Stack>
    </Card>
  );
};

export default ServiceCard;

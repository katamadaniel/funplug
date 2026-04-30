// PerformanceCard.js
import React from "react";
import { Card, CardMedia, CardContent, Typography, Button, Stack } from "@mui/material";

const PerformanceCard = ({ performance, onView }) => {
  return (
    <Card sx={{ borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        height="160"
        image={performance.images?.[0]?.url || "/default-performance.jpg"}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{performance.name}</Typography>
        <Typography variant="body2" color="text.secondary">{performance.artType} — {performance.city}, {performance.country}</Typography>
      </CardContent>
      <Stack direction="row" spacing={1} sx={{ p: 1 }}>
        <Button size="small" variant="contained" fullWidth onClick={onView}>Book / View</Button>
      </Stack>
    </Card>
  );
};

export default PerformanceCard;

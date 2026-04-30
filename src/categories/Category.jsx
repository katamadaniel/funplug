import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardMedia, CardContent, Typography, CardActionArea } from "@mui/material";
import { categories } from "./categories";

export default function Category() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: 3,
        display: "grid",
        gap: 3,
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      }}
    >
      {categories.map((category) => (
        <Card key={category.slug} sx={{ borderRadius: 3 }}>
          <CardActionArea
            sx={{ cursor: "pointer", borderRadius: 3 }}
            onClick={() => navigate(`/category/${category.slug}`)}
          >
            <CardMedia
              component="img"
              height="160"
              image={category.image}
              alt={category.name}
              loading="lazy"
            />
            <CardContent>
              <Typography variant="h6">{category.name}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}

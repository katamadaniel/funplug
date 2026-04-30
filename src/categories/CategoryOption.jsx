import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActionArea,
} from "@mui/material";
import { eventCategories } from "./eventCategories";

const CategoryOption = () => {
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
      {eventCategories.map((cat) => (
        <Card key={cat.slug} sx={{ borderRadius: 3 }}>
          <CardActionArea
            sx={{ borderRadius: 3 }}
            onClick={() => navigate(`/category/events/${cat.slug}`)}
          >
            <CardMedia
              component="img"
              height="160"
              image={cat.image}
              alt={cat.name}
              loading="lazy"
            />
            <CardContent>
              <Typography variant="h6">{cat.name}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default CategoryOption;

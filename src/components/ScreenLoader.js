import React from "react";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

const ScreenLoader = ({
  open,
  text = "Processing...",
  subText = "Please wait a moment",
}) => {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 999,
        bgcolor: "rgba(0,0,0,0.65)",
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          px: 4,
          py: 3,
          borderRadius: 3,
          boxShadow: 6,
          minWidth: 280,
          textAlign: "center",
        }}
      >
        <CircularProgress size={48} thickness={4} />

        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
          {text}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subText}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default ScreenLoader;
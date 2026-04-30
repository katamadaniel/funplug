import React from "react";
import { Backdrop, Box, LinearProgress, Typography } from "@mui/material";

const UploadProgressModal = ({ open, progress = 0, text = "Uploading..." }) => {
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
          minWidth: 320,
          maxWidth: 420,
          width: "90%",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {text}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Please wait while we upload your media.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
          {progress}%
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default UploadProgressModal;
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  Box,
  Avatar,
  Tooltip,
  Button,
  Stack,
  Chip,
  Fade,
  Divider,
  Modal,
  Paper
} from "@mui/material";

import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

import axios from "axios";
import { getAvatarUrl } from "./utils/avatar";

const API_URL = process.env.REACT_APP_API_URL;

const VenueDetailsModal = ({ venue, user, open, onClose, onBookVenue }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFollowOpen, setIsFollowOpen] = useState(false);
  const [fullImage, setFullImage] = useState(null);

  const [followName, setFollowName] = useState("");
  const [followEmail, setFollowEmail] = useState("");
  const [followerCount, setFollowerCount] = useState(0);

    const handleImageError = (e) => {
    e.target.src = process.env.REACT_APP_AVATAR_URL;
  };
  const shareUrl = window.location.href;
  const shareText = `Check out this performer: ${venue.artType}!`;

  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText
  )}%20${encodeURIComponent(shareUrl)}`;

  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  const fetchFollowerCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/followers/count/${user._id}`);
      setFollowerCount(res.data.followerCount);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) fetchFollowerCount();
  }, [user]);

  const handleFollowSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/users/follow/${user._id}`, {
        name: followName,
        email: followEmail,
      });

      setFollowName("");
      setFollowEmail("");
      setIsFollowOpen(false);
      fetchFollowerCount();
      alert("Successfully followed!");
    } catch (err) {
      console.error(err);
      alert("Subscription failed.");
    }
  };

  return (
    <>
          {/* SHARE MODAL */}
      <Modal open={isShareOpen} onClose={() => setIsShareOpen(false)}>
        <Fade in={isShareOpen}>
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              p: 3,
              width: 320,
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Share Venue
            </Typography>

            <Stack direction="row" spacing={3} justifyContent="center">
              <a href={whatsappShare} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon fontSize="large" color="success" />
              </a>

              <a href={facebookShare} target="_blank" rel="noopener noreferrer">
                <FacebookIcon fontSize="large" color="primary" />
              </a>

              <a href={twitterShare} target="_blank" rel="noopener noreferrer">
                <TwitterIcon fontSize="large" color="primary" />
              </a>
            </Stack>
          </Paper>
        </Fade>
      </Modal>


      {/* MAIN MODAL */}
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            {/* USER INFO */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={getAvatarUrl(user)} 
                sx={{ width: 60, height: 60 }}
                onError={handleImageError} />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user?.username || "Unknown User"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {followerCount} Followers
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsFollowOpen(!isFollowOpen)}
              >
                {isFollowOpen ? "Cancel" : "Follow"}
              </Button>
            </Stack>

            {/* SHARE + CLOSE */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Share venue">
                <IconButton onClick={() => setIsShareOpen(true)}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>

              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>

          {/* ---------------- FOLLOW FORM ---------------- */}
          {isFollowOpen && (
            <Box component="form" onSubmit={handleFollowSubmit} sx={{ mb: 3 }}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={followName}
                  onChange={(e) => setFollowName(e.target.value)}
                  required
                />
                <TextField
                  label="Email"
                  value={followEmail}
                  onChange={(e) => setFollowEmail(e.target.value)}
                  required
                />

                <Button type="submit" variant="contained">
                  Subscribe
                </Button>
              </Stack>

              <Divider sx={{ mt: 3 }} />
            </Box>
          )}

          {/* HEADER TEXT */}
          <Typography variant="h5">{venue.name}</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {venue.city}, {venue.country}
          </Typography>

          {/* CAROUSEL */}
          <Box position="relative">
            <Carousel
              autoPlay={true}
              navButtonsAlwaysVisible
              height="350px"
              indicators={true}
              showThumbs={false}
            >
              {venue.images.map((img, i) => (
                <Box
                  key={i}
                  sx={{
                    height: 350,
                    backgroundImage: `url(${img.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 2
                  }}
                  onClick={() => setFullImage(img.url)}
                />
              ))}
            </Carousel>

            {/* FULLSCREEN BUTTON */}
            <IconButton
              onClick={() => setFullImage(venue.images[0].url)}
              sx={{ position: "absolute", top: 10, right: 10, bgcolor: "rgba(0,0,0,0.4)" }}
            >
              <FullscreenIcon sx={{ color: "white" }} />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ---------------- VENUE DETAILS ---------------- */}
          <Stack spacing={1}>
            <Typography>
              <strong>Size:</strong> {venue.size} sq ft
            </Typography>
            <Typography>
              <strong>Capacity:</strong> {venue.capacity} people
            </Typography>
            <Typography>
              <strong>Status:</strong>{" "}
              <Chip
                label={venue.bookingStatus}
                color={venue.bookingStatus === "closed" ? "error" : "success"}
              />
            </Typography>
            <Typography>
              <strong>Duration:</strong> {venue.bookingDuration} hours
            </Typography>
            <Typography>
              <strong>Charges:</strong> Ksh. {venue.charges}/hour
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions >
          <Button
            variant="contained"
            disabled={venue.bookingStatus === "closed"}
            onClick={onBookVenue}
          >
            Book Venue
          </Button>
        </DialogActions>
      </Dialog>

      {/* FULLSCREEN IMAGE VIEWER */}
      <Modal open={!!fullImage} onClose={() => setFullImage(null)}>
        <Box
          sx={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.9)"
          }}
        >
          <img src={fullImage} alt="" style={{ maxHeight: "90%", maxWidth: "90%" }} />
          <IconButton
            onClick={() => setFullImage(null)}
            sx={{ position: "absolute", top: 20, right: 20, color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>
    </>
  );
};

export default VenueDetailsModal;

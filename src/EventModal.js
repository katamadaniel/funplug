import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Box,
  Stack,
  TextField,
  Divider,
  Fade,
  Modal,
  Paper
} from "@mui/material";

import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import CloseIcon from "@mui/icons-material/Close";

import axios from "axios";
import { getAvatarUrl } from "./utils/avatar";

const API_URL = process.env.REACT_APP_API_URL;

const EventModal = ({ event, user, onClose, onBuyTicket }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFollowOpen, setIsFollowOpen] = useState(false);
  const [followName, setFollowName] = useState("");
  const [followEmail, setFollowEmail] = useState("");
  const [followerCount, setFollowerCount] = useState(0);

  const isRegularSoldOut = event.regularTicketsRemaining <= 0;
  const isVipSoldOut = event.vipTicketsRemaining <= 0;
  const isVvipSoldOut = event.vvipTicketsRemaining <= 0;
  const isFreeSoldOut = event.freeTicketsRemaining <= 0;

  const allPaidOptionsSoldOut =
    event.ticketType === "paid" &&
    (!event.regularPrice || isRegularSoldOut) &&
    (!event.vipPrice || isVipSoldOut) &&
    (!event.vvipPrice || isVvipSoldOut);

  const isBuyDisabled =
    (event.ticketType === "paid" && allPaidOptionsSoldOut) ||
    (event.ticketType === "free" && isFreeSoldOut);

  const handleImageError = (e) => {
    e.target.src = process.env.REACT_APP_AVATAR_URL;
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this event: ${event.title} at ${event.venue}!`;

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
      const res = await axios.get(
        `${API_URL}/api/users/followers/count/${user._id}`
      );
      setFollowerCount(res.data.followerCount);
    } catch (err) {
      console.error("Error fetching follower count");
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
              Share Event
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
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            {/* USER INFO */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={getAvatarUrl(user)} sx={{ width: 60, height: 60 }} onError={handleImageError} />
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
              <Tooltip title="Share event">
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
          {/* FOLLOW FORM */}
          {isFollowOpen && (
            <Box component="form" onSubmit={handleFollowSubmit} sx={{ mb: 3 }}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={followName}
                  onChange={(e) => setFollowName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  value={followEmail}
                  onChange={(e) => setFollowEmail(e.target.value)}
                  fullWidth
                  required
                />

                <Button type="submit" variant="contained">
                  Subscribe
                </Button>
              </Stack>

              <Divider sx={{ mt: 3 }} />
            </Box>
          )}

          {/* EVENT INFO */}
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            {event.title}
          </Typography>

          <Typography>
            <strong>Venue:</strong> {event.venue}
          </Typography>
          <Typography>
            <strong>Date:</strong>{" "}
            {new Date(event.date).toLocaleDateString()}
          </Typography>
          <Typography>
            <strong>Starts:</strong> {event.startTime}
          </Typography>
          <Typography>
            <strong>Ends:</strong> {event.endTime}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            <strong>Description:</strong> {event.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* TICKET OPTIONS */}
          <Typography variant="h6" fontWeight={600}>
            Tickets
          </Typography>

          <Box sx={{ mt: 1 }}>
            {event.ticketType === "paid" && (
              <Stack spacing={1}>
                {event.regularPrice && (
                  <TicketRow
                    label="Regular"
                    soldOut={isRegularSoldOut}
                    price={event.regularPrice}
                  />
                )}
                {event.vipPrice && (
                  <TicketRow
                    label="VIP"
                    soldOut={isVipSoldOut}
                    price={event.vipPrice}
                  />
                )}
                {event.vvipPrice && (
                  <TicketRow
                    label="VVIP"
                    soldOut={isVvipSoldOut}
                    price={event.vvipPrice}
                  />
                )}
              </Stack>
            )}

            {event.ticketType === "free" && (
              <TicketRow
                label="Free Ticket"
                soldOut={isFreeSoldOut}
                price={"Free"}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{justifyContent: 'center'}} >
          <Button
            variant="contained"
            disabled={isBuyDisabled}
            onClick={onBuyTicket}
          >
            {isBuyDisabled ? "Tickets Sold Out" : "Buy Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventModal;

/* SMALL HELPER COMPONENT FOR TICKET ROWS */
const TicketRow = ({ label, soldOut, price }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    sx={{
      p: 1.2,
      borderRadius: 2,
      bgcolor: "grey.100",
    }}
  >
    <Typography>{label}</Typography>

    <Typography
      sx={{
        color: soldOut ? "red" : "green",
        fontWeight: 600,
      }}
    >
      {soldOut ? "Sold Out" : `Ksh. ${price}`}
    </Typography>
  </Stack>
);
